"""
Real market data provider.

Sources (tried in order):
  1. Yahoo Finance v8 JSON API  — direct HTTP, no library, real-time prices + options chains
  2. Stooq                      — historical EOD data via pandas_datareader, very reliable
  3. Nothing                    — if market is closed or all sources fail, returns None

No API keys needed. No yfinance library (broken in 0.2.x).
"""
import asyncio
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple
from zoneinfo import ZoneInfo

import aiohttp
import pandas as pd

from src.engine.options_math import historical_volatility

logger = logging.getLogger(__name__)

# ── Market hours (NYSE/NASDAQ) ────────────────────────────────────────────────

def is_market_open() -> bool:
    """Mon–Fri 09:30–16:00 Eastern Time."""
    try:
        et = ZoneInfo("America/New_York")
    except Exception:
        et = ZoneInfo("US/Eastern")
    now = datetime.now(et)
    if now.weekday() >= 5:
        return False
    open_t  = now.replace(hour=9,  minute=30, second=0, microsecond=0)
    close_t = now.replace(hour=16, minute=0,  second=0, microsecond=0)
    return open_t <= now <= close_t


# ── Symbol mapping ────────────────────────────────────────────────────────────

SYMBOL_MAP: Dict[str, str] = {
    "US500":   "SPY",    # S&P 500 ETF — has listed options
    "DE40":    "EWG",    # Germany ETF
    "UK100":   "EWU",    # UK ETF
    "AAPL.US": "AAPL",
    "MSFT.US": "MSFT",
    "AMZN.US": "AMZN",
    "TSLA.US": "TSLA",
    "NVDA.US": "NVDA",
}

def _yf(symbol: str) -> str:
    return SYMBOL_MAP.get(symbol, symbol)


# ── Cache ─────────────────────────────────────────────────────────────────────

_price_cache:   Dict[str, Tuple[float, datetime]]      = {}
_history_cache: Dict[str, Tuple[List[float], datetime]] = {}
_chain_cache:   Dict[str, Tuple[Dict, datetime]]        = {}

PRICE_TTL   = 60
HISTORY_TTL = 3600
CHAIN_TTL   = 300

_YF_HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                  "AppleWebKit/537.36 (KHTML, like Gecko) "
                  "Chrome/120.0.0.0 Safari/537.36",
    "Accept": "application/json",
    "Accept-Language": "en-US,en;q=0.9",
}


# ── Spot price ────────────────────────────────────────────────────────────────

async def get_spot_price(symbol: str) -> Optional[float]:
    cached = _price_cache.get(symbol)
    if cached and (datetime.utcnow() - cached[1]).total_seconds() < PRICE_TTL:
        return cached[0]

    ticker = _yf(symbol)

    # Try sources in order until one works
    for fetch_fn in [
        lambda t: _fetch_price_yf(t, host="query1"),
        lambda t: _fetch_price_yf(t, host="query2"),
        lambda t: _fetch_price_fmp(t),
    ]:
        price = await fetch_fn(ticker)
        if price:
            _price_cache[symbol] = (price, datetime.utcnow())
            logger.info("Price %s = %.4f", symbol, price)
            return price

    logger.warning("All price sources failed for %s", symbol)
    return None


async def _fetch_price_yf(ticker: str, host: str = "query1") -> Optional[float]:
    """Direct Yahoo Finance v8 chart API — no yfinance library."""
    url = f"https://{host}.finance.yahoo.com/v8/finance/chart/{ticker}"
    params = {"interval": "1m", "range": "1d"}
    try:
        async with aiohttp.ClientSession(headers=_YF_HEADERS) as session:
            async with session.get(url, params=params, timeout=aiohttp.ClientTimeout(total=10)) as resp:
                if resp.status != 200:
                    return None
                data = await resp.json(content_type=None)
                result = data.get("chart", {}).get("result", [])
                if not result:
                    return None
                meta = result[0].get("meta", {})
                price = meta.get("regularMarketPrice") or meta.get("previousClose")
                return float(price) if price else None
    except Exception as exc:
        logger.debug("YF(%s) price error %s: %s", host, ticker, exc)
        return None


async def _fetch_price_fmp(ticker: str) -> Optional[float]:
    """Financial Modeling Prep — free endpoint, no API key for basic quotes."""
    url = f"https://financialmodelingprep.com/api/v3/quote-short/{ticker}"
    params = {"apikey": "demo"}
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(url, params=params, timeout=aiohttp.ClientTimeout(total=10)) as resp:
                if resp.status != 200:
                    return None
                data = await resp.json(content_type=None)
                if data and isinstance(data, list) and data[0].get("price"):
                    return float(data[0]["price"])
                return None
    except Exception as exc:
        logger.debug("FMP price error %s: %s", ticker, exc)
        return None


# ── Historical prices ─────────────────────────────────────────────────────────

async def get_price_history(symbol: str, days: int = 365) -> List[float]:
    cached = _history_cache.get(symbol)
    if cached and (datetime.utcnow() - cached[1]).total_seconds() < HISTORY_TTL:
        return cached[0]

    ticker = _yf(symbol)

    for fetch_fn in [
        lambda t: _fetch_history_yf(t, days, host="query1"),
        lambda t: _fetch_history_yf(t, days, host="query2"),
        lambda t: _fetch_history_stooq(t, days),
    ]:
        prices = await fetch_fn(ticker)
        if prices:
            _history_cache[symbol] = (prices, datetime.utcnow())
            logger.info("History loaded for %s: %d days", symbol, len(prices))
            return prices

    logger.warning("All history sources failed for %s", symbol)
    return []


async def _fetch_history_yf(ticker: str, days: int, host: str = "query1") -> List[float]:
    """Fetch daily close prices from Yahoo Finance v8 API."""
    url = f"https://{host}.finance.yahoo.com/v8/finance/chart/{ticker}"
    params = {"interval": "1d", "range": f"{min(days, 730)}d"}
    try:
        async with aiohttp.ClientSession(headers=_YF_HEADERS) as session:
            async with session.get(url, params=params, timeout=aiohttp.ClientTimeout(total=15)) as resp:
                if resp.status != 200:
                    return []
                data = await resp.json(content_type=None)
                result = data.get("chart", {}).get("result", [])
                if not result:
                    return []
                closes = result[0].get("indicators", {}).get("quote", [{}])[0].get("close", [])
                return [float(c) for c in closes if c is not None]
    except Exception as exc:
        logger.debug("YF history error %s: %s", ticker, exc)
        return []


async def _fetch_history_stooq(ticker: str, days: int) -> List[float]:
    """Fallback: fetch daily closes from Stooq (no API key needed)."""
    # Stooq uses lowercase tickers with .us suffix for US stocks
    stooq_ticker = ticker.lower()
    if not any(stooq_ticker.endswith(x) for x in [".us", ".uk", ".de", ".jp"]):
        stooq_ticker = stooq_ticker + ".us"
    url = f"https://stooq.com/q/d/l/?s={stooq_ticker}&i=d"
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(url, timeout=aiohttp.ClientTimeout(total=15)) as resp:
                if resp.status != 200:
                    return []
                text = await resp.text()
                lines = [l for l in text.strip().split("\n") if l and not l.startswith("Date")]
                prices = []
                for line in lines[-days:]:
                    parts = line.split(",")
                    if len(parts) >= 5:
                        try:
                            prices.append(float(parts[4]))  # Close column
                        except ValueError:
                            pass
                return prices
    except Exception as exc:
        logger.debug("Stooq history error %s: %s", ticker, exc)
        return []


# ── Options chain ─────────────────────────────────────────────────────────────

async def get_options_chain(symbol: str) -> Optional[Dict]:
    cached = _chain_cache.get(symbol)
    if cached and (datetime.utcnow() - cached[1]).total_seconds() < CHAIN_TTL:
        return cached[0]

    ticker = _yf(symbol)
    chain = await _fetch_chain_yf(symbol, ticker)
    if chain:
        _chain_cache[symbol] = (chain, datetime.utcnow())
    return chain


async def _fetch_chain_yf(symbol: str, ticker: str) -> Optional[Dict]:
    """Fetch options chain from Yahoo Finance v7 options API."""
    # Step 1: get available expiry dates
    url = f"https://query1.finance.yahoo.com/v7/finance/options/{ticker}"
    try:
        async with aiohttp.ClientSession(headers=_YF_HEADERS) as session:
            async with session.get(url, timeout=aiohttp.ClientTimeout(total=10)) as resp:
                if resp.status != 200:
                    return None
                data = await resp.json(content_type=None)

        opt_data = data.get("optionChain", {}).get("result", [])
        if not opt_data:
            return None

        expirations = opt_data[0].get("expirationDates", [])
        spot = opt_data[0].get("quote", {}).get("regularMarketPrice")
        if not spot or not expirations:
            return None

        # Pick expiry closest to 30 DTE
        target_ts = (datetime.utcnow() + timedelta(days=30)).timestamp()
        best_exp_ts = min(expirations, key=lambda t: abs(t - target_ts))
        exp_date = datetime.utcfromtimestamp(best_exp_ts).strftime("%Y-%m-%d")
        dte = max((datetime.utcfromtimestamp(best_exp_ts) - datetime.utcnow()).days, 1)

        # Step 2: fetch the actual chain for that expiry
        async with aiohttp.ClientSession(headers=_YF_HEADERS) as session:
            async with session.get(
                url,
                params={"date": int(best_exp_ts)},
                timeout=aiohttp.ClientTimeout(total=10),
            ) as resp2:
                if resp2.status != 200:
                    return None
                data2 = await resp2.json(content_type=None)

        chain_result = data2.get("optionChain", {}).get("result", [])
        if not chain_result:
            return None

        options = chain_result[0].get("options", [{}])[0]
        raw_calls = options.get("calls", [])
        raw_puts  = options.get("puts",  [])

        if not raw_calls or not raw_puts:
            return None

        def to_df(rows):
            df = pd.DataFrame(rows)[["strike", "bid", "ask", "lastPrice",
                                      "impliedVolatility", "volume", "openInterest"]]
            df = df.dropna(subset=["strike", "bid"])
            df = df[(df["strike"] >= float(spot) * 0.70) & (df["strike"] <= float(spot) * 1.30)]
            return df

        calls_df = to_df(raw_calls)
        puts_df  = to_df(raw_puts)

        if calls_df.empty or puts_df.empty:
            return None

        # ATM IV
        atm_c = calls_df.iloc[(calls_df["strike"] - float(spot)).abs().argsort()[:1]]
        atm_p = puts_df.iloc[(puts_df["strike"]   - float(spot)).abs().argsort()[:1]]
        iv_c  = float(atm_c["impliedVolatility"].values[0]) if "impliedVolatility" in atm_c else 0.20
        iv_p  = float(atm_p["impliedVolatility"].values[0]) if "impliedVolatility" in atm_p else 0.20
        iv = (iv_c + iv_p) / 2
        if iv <= 0 or iv > 5:
            iv = 0.20

        logger.info("Options chain [%s] spot=%.2f iv=%.1f%% dte=%d calls=%d puts=%d",
                    symbol, spot, iv * 100, dte, len(calls_df), len(puts_df))
        return {
            "symbol": symbol, "ticker": ticker,
            "expiry": exp_date, "dte": dte,
            "spot": float(spot), "iv": iv,
            "calls": calls_df, "puts": puts_df,
        }

    except Exception as exc:
        logger.debug("Options chain error %s: %s", symbol, exc)
        return None


# ── Full market snapshot ──────────────────────────────────────────────────────

async def get_market_snapshot(symbol: str) -> Optional[Dict]:
    """Returns spot, iv, history. Uses real options IV when available."""
    spot, history = await asyncio.gather(
        get_spot_price(symbol),
        get_price_history(symbol, days=60),
    )
    if not spot:
        return None

    chain = await get_options_chain(symbol)
    if chain and chain.get("iv"):
        iv = chain["iv"]
    elif len(history) > 20:
        iv = historical_volatility(history, window=20)
    else:
        iv = 0.20

    return {
        "symbol":  symbol,
        "spot":    round(spot, 4),
        "iv":      round(iv, 4),
        "bid":     round(spot * 0.9999, 4),
        "ask":     round(spot * 1.0001, 4),
        "history": history,
        "chain":   chain,
        "source":  "yahoo_finance_direct",
        "ts":      datetime.utcnow().isoformat(),
    }


# ── Strike selection helpers ──────────────────────────────────────────────────

def find_strike_by_delta(chain_df, target_delta, option_type, spot, T, iv, r=0.05):
    from src.engine.options_math import bs_greeks
    best_strike, best_diff = None, float("inf")
    for _, row in chain_df.iterrows():
        K = float(row["strike"])
        try:
            g = bs_greeks(spot, K, T, r, iv, option_type)
            diff = abs(abs(g.delta) - target_delta)
            if diff < best_diff:
                best_diff, best_strike = diff, K
        except Exception:
            continue
    return best_strike


def get_real_premium(chain_df, strike, option_type):
    row = chain_df[chain_df["strike"] == strike]
    if row.empty:
        idx = (chain_df["strike"] - strike).abs().idxmin()
        row = chain_df.loc[[idx]]
    bid = float(row["bid"].values[0]) if "bid" in row else 0.0
    ask = float(row["ask"].values[0]) if "ask" in row else bid
    mid = (bid + ask) / 2
    return mid if mid > 0 else float(row.get("lastPrice", [0.01]).values[0])
