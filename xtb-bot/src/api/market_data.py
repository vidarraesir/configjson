"""
Real market data provider using Yahoo Finance (yfinance).
Provides real options chains, spot prices, IV, and historical data
for US stocks and major indices — completely free, no API key needed.

XTB only offers CFDs (not listed options), so we use Yahoo Finance
as the source of truth for real options market data.
"""
import asyncio
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple
from zoneinfo import ZoneInfo

import pandas as pd
import yfinance as yf

from src.engine.options_math import historical_volatility, implied_volatility

logger = logging.getLogger(__name__)

# ── Market hours check ────────────────────────────────────────────────────────

def is_market_open() -> bool:
    """
    Returns True if the US stock market (NYSE/NASDAQ) is currently open.
    Hours: Monday–Friday 09:30–16:00 Eastern Time.
    Does not account for holidays (Yahoo Finance returns no data on those days anyway).
    """
    try:
        et = ZoneInfo("America/New_York")
    except Exception:
        et = ZoneInfo("US/Eastern")
    now = datetime.now(et)
    if now.weekday() >= 5:          # Saturday=5, Sunday=6
        return False
    market_open  = now.replace(hour=9,  minute=30, second=0, microsecond=0)
    market_close = now.replace(hour=16, minute=0,  second=0, microsecond=0)
    return market_open <= now <= market_close


# ── Ticker mapping ────────────────────────────────────────────────────────────
# Maps display names used in the bot to Yahoo Finance tickers
SYMBOL_MAP: Dict[str, str] = {
    # Indices (via ETFs that have liquid options chains)
    "US500":   "SPY",    # S&P 500 ETF
    "DE40":    "EWG",    # Germany ETF (DAX proxy, has options)
    "UK100":   "EWU",    # UK ETF (FTSE proxy, has options)
    # US Stocks (direct tickers)
    "AAPL.US": "AAPL",
    "MSFT.US": "MSFT",
    "AMZN.US": "AMZN",
    "TSLA.US": "TSLA",
    "NVDA.US": "NVDA",
}

# Cache to avoid hammering Yahoo Finance
_price_cache: Dict[str, Tuple[float, datetime]] = {}
_chain_cache: Dict[str, Tuple[pd.DataFrame, datetime]] = {}
_history_cache: Dict[str, Tuple[List[float], datetime]] = {}

PRICE_TTL = 60          # seconds
CHAIN_TTL = 300         # 5 minutes
HISTORY_TTL = 3600      # 1 hour


def _yf_ticker(symbol: str) -> str:
    return SYMBOL_MAP.get(symbol, symbol)


# ── Spot price ────────────────────────────────────────────────────────────────

async def get_spot_price(symbol: str) -> Optional[float]:
    """Get current spot price. Returns None on failure."""
    cached = _price_cache.get(symbol)
    if cached and (datetime.utcnow() - cached[1]).total_seconds() < PRICE_TTL:
        return cached[0]

    ticker = _yf_ticker(symbol)
    try:
        data = await asyncio.to_thread(_fetch_price, ticker)
        if data:
            _price_cache[symbol] = (data, datetime.utcnow())
            return data
    except Exception as exc:
        logger.warning("Price fetch error %s (%s): %s", symbol, ticker, exc)
    return None


def _fetch_price(ticker: str) -> Optional[float]:
    t = yf.Ticker(ticker)
    info = t.fast_info
    price = getattr(info, "last_price", None) or getattr(info, "regularMarketPrice", None)
    if price:
        return float(price)
    # Fallback: last close from 2-day history
    hist = t.history(period="2d")
    if not hist.empty:
        return float(hist["Close"].iloc[-1])
    return None


# ── Historical prices ─────────────────────────────────────────────────────────

async def get_price_history(symbol: str, days: int = 365) -> List[float]:
    """Return list of daily closing prices (oldest first)."""
    cached = _history_cache.get(symbol)
    if cached and (datetime.utcnow() - cached[1]).total_seconds() < HISTORY_TTL:
        return cached[0]

    ticker = _yf_ticker(symbol)
    try:
        prices = await asyncio.to_thread(_fetch_history, ticker, days)
        if prices:
            _history_cache[symbol] = (prices, datetime.utcnow())
            return prices
    except Exception as exc:
        logger.warning("History fetch error %s: %s", symbol, exc)
    return []


def _fetch_history(ticker: str, days: int) -> List[float]:
    t = yf.Ticker(ticker)
    period = f"{min(days, 730)}d"
    hist = t.history(period=period)
    if hist.empty:
        return []
    return [float(p) for p in hist["Close"].tolist()]


# ── Options chain ─────────────────────────────────────────────────────────────

async def get_options_chain(symbol: str) -> Optional[Dict]:
    """
    Return nearest-expiry options chain with real market data.
    Returns dict with keys: expiry, calls (DataFrame), puts (DataFrame), spot, iv
    """
    cached = _chain_cache.get(symbol)
    if cached and (datetime.utcnow() - cached[1]).total_seconds() < CHAIN_TTL:
        return cached[0]

    ticker = _yf_ticker(symbol)
    try:
        chain = await asyncio.to_thread(_fetch_chain, symbol, ticker)
        if chain:
            _chain_cache[symbol] = (chain, datetime.utcnow())
            return chain
    except Exception as exc:
        logger.warning("Options chain error %s (%s): %s", symbol, ticker, exc)
    return None


def _fetch_chain(symbol: str, ticker: str) -> Optional[Dict]:
    t = yf.Ticker(ticker)

    # Get spot price
    spot = _fetch_price(ticker)
    if not spot:
        return None

    # Get available expiry dates
    try:
        expirations = t.options
    except Exception:
        return None
    if not expirations:
        return None

    # Pick expiry ~30 DTE (closest to 30 days out)
    target = datetime.utcnow() + timedelta(days=30)
    best_exp = min(expirations, key=lambda e: abs(
        (datetime.strptime(e, "%Y-%m-%d") - target).days
    ))

    try:
        chain = t.option_chain(best_exp)
    except Exception:
        return None

    calls = chain.calls.copy()
    puts  = chain.puts.copy()

    # Clean up: keep only useful columns, drop empty rows
    cols = ["strike", "bid", "ask", "lastPrice", "impliedVolatility",
            "volume", "openInterest", "inTheMoney"]
    calls = calls[[c for c in cols if c in calls.columns]].dropna(subset=["strike", "bid"])
    puts  = puts[[c  for c in cols if c in puts.columns]].dropna(subset=["strike", "bid"])

    # Filter strikes within ±30% of spot (liquid range)
    calls = calls[(calls["strike"] >= spot * 0.70) & (calls["strike"] <= spot * 1.30)]
    puts  = puts[(puts["strike"]  >= spot * 0.70) & (puts["strike"]  <= spot * 1.30)]

    if calls.empty or puts.empty:
        return None

    # Compute ATM IV (average of near-ATM call and put)
    atm_call = calls.iloc[(calls["strike"] - spot).abs().argsort()[:1]]
    atm_put  = puts.iloc[(puts["strike"]  - spot).abs().argsort()[:1]]
    iv_call  = float(atm_call["impliedVolatility"].values[0]) if "impliedVolatility" in atm_call else 0.20
    iv_put   = float(atm_put["impliedVolatility"].values[0])  if "impliedVolatility" in atm_put  else 0.20
    iv = (iv_call + iv_put) / 2
    if iv <= 0 or iv > 5:
        iv = 0.20

    exp_date = datetime.strptime(best_exp, "%Y-%m-%d")
    dte = max((exp_date - datetime.utcnow()).days, 1)

    logger.info("Chain [%s/%s] spot=%.2f iv=%.1f%% dte=%d calls=%d puts=%d",
                symbol, ticker, spot, iv * 100, dte, len(calls), len(puts))

    return {
        "symbol":  symbol,
        "ticker":  ticker,
        "expiry":  best_exp,
        "dte":     dte,
        "spot":    spot,
        "iv":      iv,
        "calls":   calls,
        "puts":    puts,
    }


# ── Full market snapshot ──────────────────────────────────────────────────────

async def get_market_snapshot(symbol: str) -> Optional[Dict]:
    """
    Returns complete snapshot: spot, iv, price history.
    Uses real options IV when available, falls back to HV.
    """
    spot, history = await asyncio.gather(
        get_spot_price(symbol),
        get_price_history(symbol, days=60),
    )
    if not spot:
        return None

    # Try to get IV from real options chain
    chain = await get_options_chain(symbol)
    if chain:
        iv = chain["iv"]
    elif history and len(history) > 20:
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
        "source":  "yahoo_finance",
        "ts":      datetime.utcnow().isoformat(),
    }


# ── Best option strike selection using real chain ─────────────────────────────

def find_strike_by_delta(
    chain_df: pd.DataFrame,
    target_delta: float,
    option_type: str,
    spot: float,
    T: float,
    iv: float,
    r: float = 0.05,
) -> Optional[float]:
    """
    Find the real listed strike closest to target_delta.
    Uses BS delta calculation on real chain strikes.
    """
    from src.engine.options_math import bs_greeks
    best_strike = None
    best_diff = float("inf")
    for _, row in chain_df.iterrows():
        K = float(row["strike"])
        try:
            g = bs_greeks(spot, K, T, r, iv, option_type)
            diff = abs(abs(g.delta) - target_delta)
            if diff < best_diff:
                best_diff = diff
                best_strike = K
        except Exception:
            continue
    return best_strike


def get_real_premium(chain_df: pd.DataFrame, strike: float, option_type: str) -> float:
    """Get real mid-price (bid+ask)/2 for a given strike from the chain."""
    row = chain_df[chain_df["strike"] == strike]
    if row.empty:
        # Nearest available strike
        idx = (chain_df["strike"] - strike).abs().idxmin()
        row = chain_df.loc[[idx]]
    bid = float(row["bid"].values[0]) if "bid" in row else 0.0
    ask = float(row["ask"].values[0]) if "ask" in row else bid
    mid = (bid + ask) / 2
    return mid if mid > 0 else float(row.get("lastPrice", [0.01]).values[0])
