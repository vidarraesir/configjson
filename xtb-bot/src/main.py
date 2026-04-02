"""
XTB Options Bot — Main entry point.

Data sources (in priority order):
  1. Yahoo Finance (yfinance) — real market prices + real options chains, FREE, no auth
  2. XTB xAPI — if credentials provided (optional, for live execution only)
  3. GBM simulation — fallback if market is closed

Paper trading runs on real Yahoo Finance data.
When a strategy is promoted to LIVE, it executes via XTB API (optional).
"""
import asyncio
import logging
import os
import time
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional

import yaml
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from src.api.market_data import get_market_snapshot, get_price_history, SYMBOL_MAP
from src.api.routes import broadcast_update, router, set_app_state
from src.api.xtb_client import XTBClient
from src.engine.backtester import Backtester
from src.engine.evaluator import StrategyEvaluator
from src.engine.paper_trader import PaperTrader
from src.models.db import init_db
from src.strategies.base import MarketSnapshot, StrategyConfig
from src.strategies.bull_put_spread import BearCallSpreadStrategy, BullPutSpreadStrategy
from src.strategies.cash_secured_put import CashSecuredPutStrategy, CoveredCallStrategy
from src.strategies.iron_condor import IronCondorStrategy
from src.strategies.straddle import LongStraddleStrategy, ShortStrangleStrategy

# ── Dirs ─────────────────────────────────────────────────────────────────────
_ROOT = Path(__file__).resolve().parent.parent
(_ROOT / "logs").mkdir(parents=True, exist_ok=True)
(_ROOT / "data").mkdir(parents=True, exist_ok=True)

# ── Logging ──────────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler(str(_ROOT / "logs" / "xtb_bot.log")),
    ],
)
logger = logging.getLogger("xtb_bot")

# ── Config ───────────────────────────────────────────────────────────────────
load_dotenv(dotenv_path=_ROOT / ".env")

with open(_ROOT / "config.yaml") as f:
    cfg = yaml.safe_load(f)

XTB_USER     = os.getenv("XTB_USER", "")
XTB_PASSWORD = os.getenv("XTB_PASSWORD", "")
XTB_DEMO     = os.getenv("XTB_DEMO", "true").lower() == "true"

# Only trade symbols that Yahoo Finance supports (US stocks + ETF proxies for indices)
UNIVERSE: List[str] = list(SYMBOL_MAP.keys())

INITIAL_CAPITAL  = cfg["paper_trading"]["initial_capital"]
MAX_POS_PCT      = cfg["paper_trading"]["max_position_size"]
LIVE_THRESH      = cfg["paper_trading"]["live_threshold"]
REFRESH_INTERVAL = cfg["dashboard"]["refresh_interval"]

# ── FastAPI ──────────────────────────────────────────────────────────────────
app = FastAPI(title="XTB Options Bot", version="2.0.0")
app.include_router(router)

_dash = Path(__file__).parent.parent / "dashboard"
app.mount("/static", StaticFiles(directory=str(_dash)), name="static")

@app.get("/")
async def serve_dashboard():
    return FileResponse(str(_dash / "index.html"))

# ── Shared state ─────────────────────────────────────────────────────────────
state: Dict = {
    "xtb": None,
    "trader": None,
    "evaluator": None,
    "strategies": [],
    "market_data": {},
    "backtest_results": [],
    "data_source": "yahoo_finance",
}


def _build_strategies(trader: PaperTrader) -> list:
    sc = cfg["strategies"]
    return [
        IronCondorStrategy(StrategyConfig("iron_condor", sc.get("iron_condor", {})), trader),
        BullPutSpreadStrategy(StrategyConfig("bull_put_spread", sc.get("bull_put_spread", {})), trader),
        BearCallSpreadStrategy(StrategyConfig("bear_call_spread", sc.get("bear_call_spread", {})), trader),
        CashSecuredPutStrategy(StrategyConfig("cash_secured_put", sc.get("cash_secured_put", {})), trader),
        CoveredCallStrategy(StrategyConfig("covered_call", sc.get("covered_call", {})), trader),
        LongStraddleStrategy(StrategyConfig("long_straddle", sc.get("long_straddle", {})), trader),
        ShortStrangleStrategy(StrategyConfig("short_strangle", sc.get("short_strangle", {})), trader),
    ]


# ── Backtesting on real historical data ──────────────────────────────────────

async def run_backtest_yf() -> List[Dict]:
    """Run backtests on real Yahoo Finance historical price data."""
    logger.info("=== Backtesting on real Yahoo Finance data ===")
    candles_by_symbol: Dict[str, List[Dict]] = {}

    for symbol in UNIVERSE:
        try:
            prices = await get_price_history(symbol, days=500)
            if len(prices) >= 100:
                # Convert to candle format expected by backtester
                candles = [
                    {"time": int((datetime.utcnow()).timestamp() * 1000) - (len(prices) - i) * 86400000,
                     "close": p, "open": p, "high": p * 1.001, "low": p * 0.999, "volume": 1000}
                    for i, p in enumerate(prices)
                ]
                candles_by_symbol[symbol] = candles
                logger.info("Loaded %d days history for %s", len(prices), symbol)
            await asyncio.sleep(0.5)  # be polite to Yahoo Finance
        except Exception as exc:
            logger.warning("History load failed for %s: %s", symbol, exc)

    if not candles_by_symbol:
        logger.warning("No historical data for backtesting")
        return []

    bt = Backtester(candles_by_symbol)
    results = bt.run_all()

    logger.info("=== Backtest complete — Top 5 strategies ===")
    for r in results[:5]:
        logger.info("  %-20s %-10s sharpe=%5.2f win=%4.1f%% trades=%3d pnl=%8.2f",
                    r.strategy, r.symbol, r.sharpe, r.win_rate * 100, r.n_trades, r.total_pnl)

    return [r.to_dict() for r in results]


# ── Real-data paper trading loop ─────────────────────────────────────────────

async def yahoo_trading_loop(
    trader: PaperTrader,
    strategies: list,
    evaluator: StrategyEvaluator,
):
    """
    Main paper trading loop using real Yahoo Finance market data.
    - Fetches real spot prices and IV from live options chains
    - Updates positions with real market moves
    - Evaluates entry signals every 5 minutes
    """
    logger.info("=== Paper trading loop started (Yahoo Finance real data) ===")
    price_history: Dict[str, List[float]] = {}
    iteration = 0

    # Pre-load price history for all symbols
    for symbol in UNIVERSE:
        hist = await get_price_history(symbol, days=120)
        if hist:
            price_history[symbol] = hist
            logger.info("Pre-loaded %d days history for %s", len(hist), symbol)
        await asyncio.sleep(0.3)

    while True:
        try:
            market_prices: Dict[str, float] = {}
            ivs: Dict[str, float] = {}

            for symbol in UNIVERSE:
                snap_data = await get_market_snapshot(symbol)
                if not snap_data:
                    logger.debug("No snapshot for %s (market may be closed)", symbol)
                    continue

                spot = snap_data["spot"]
                iv   = snap_data["iv"]

                # Keep rolling price history
                hist = price_history.get(symbol, [])
                if not hist or hist[-1] != spot:
                    hist.append(spot)
                    if len(hist) > 500:
                        hist = hist[-500:]
                    price_history[symbol] = hist

                market_prices[symbol] = spot
                ivs[symbol] = iv
                state["market_data"][symbol] = {
                    "spot":   spot,
                    "iv":     iv,
                    "bid":    snap_data["bid"],
                    "ask":    snap_data["ask"],
                    "source": "yahoo_finance",
                }

                # Check entry signals every ~5 min (60 iterations × 5s)
                if iteration % 60 == 0:
                    snap = MarketSnapshot(
                        symbol=symbol,
                        spot=spot,
                        iv=iv,
                        prices=hist,
                        bid=snap_data["bid"],
                        ask=snap_data["ask"],
                        timestamp=time.time(),
                    )
                    for strategy in strategies:
                        if evaluator.live_strategy and strategy.name != evaluator.live_strategy:
                            continue
                        try:
                            if trader.can_enter(strategy.name, symbol) and await strategy.evaluate(snap):
                                trader.record_entry(strategy.name, symbol)
                                group_id = await strategy.enter(snap)
                                if group_id:
                                    logger.info("ENTER %s on %s [group=%s]",
                                                strategy.name, symbol, group_id[:8])
                        except Exception as exc:
                            logger.debug("Strategy %s/%s error: %s", strategy.name, symbol, exc)

                await asyncio.sleep(0.5)

            # Reprice open positions with real market data
            if market_prices:
                await trader.update_positions(market_prices, ivs)

            # Push real-time update to dashboard
            await broadcast_update({
                "type":          "update",
                "ts":            datetime.utcnow().isoformat(),
                "portfolio":     trader.summary(),
                "market":        state["market_data"],
                "live_strategy": evaluator.live_strategy,
                "data_source":   "yahoo_finance",
            })

            # Every 5 min: check promotion
            if iteration % 60 == 0 and iteration > 0:
                promoted = await evaluator.check_promotion()
                if promoted:
                    logger.info("PROMOTED to LIVE: %s", promoted)
                    await broadcast_update({
                        "type":    "alert",
                        "level":   "success",
                        "message": f"Estrategia '{promoted}' PROMOVIDA a LIVE TRADING!",
                    })

            iteration += 1
            await asyncio.sleep(REFRESH_INTERVAL)

        except asyncio.CancelledError:
            break
        except Exception as exc:
            logger.error("Trading loop error: %s", exc, exc_info=True)
            await asyncio.sleep(15)


# ── GBM fallback (market closed / weekend) ───────────────────────────────────

async def gbm_fallback_loop(
    trader: PaperTrader,
    strategies: list,
    evaluator: StrategyEvaluator,
    seed_prices: Dict[str, float],
):
    """Run GBM simulation when Yahoo Finance returns no data (market closed)."""
    import math, random
    logger.info("Market appears closed — running GBM simulation until data available")

    spots = seed_prices.copy()
    ivs = {s: 0.20 for s in spots}
    history: Dict[str, List[float]] = {s: [v] * 50 for s, v in spots.items()}
    iteration = 0

    while True:
        # Try Yahoo Finance first — switch back when market opens
        if iteration % 120 == 0:   # every 10 min
            test = await get_market_snapshot(list(UNIVERSE)[0])
            if test:
                logger.info("Market data available — switching back to Yahoo Finance")
                asyncio.create_task(yahoo_trading_loop(trader, strategies, evaluator))
                return

        market_prices, iv_map = {}, {}
        for symbol, spot in spots.items():
            sigma = ivs[symbol] / math.sqrt(252 * 78)
            new_spot = spot * math.exp(random.gauss(0, sigma))
            spots[symbol] = new_spot
            history[symbol].append(new_spot)
            if len(history[symbol]) > 200:
                history[symbol] = history[symbol][-200:]
            market_prices[symbol] = new_spot
            iv_map[symbol] = ivs[symbol]
            state["market_data"][symbol] = {
                "spot": round(new_spot, 4), "iv": round(ivs[symbol], 4),
                "bid": round(new_spot * 0.9999, 4), "ask": round(new_spot * 1.0001, 4),
                "source": "simulation",
            }

        if iteration % 60 == 0:
            for strategy in strategies:
                for symbol in list(UNIVERSE)[:3]:   # limit in simulation
                    snap = MarketSnapshot(
                        symbol=symbol, spot=spots[symbol], iv=ivs[symbol],
                        prices=history[symbol],
                        bid=spots[symbol] * 0.9999, ask=spots[symbol] * 1.0001,
                        timestamp=time.time(),
                    )
                    try:
                        if trader.can_enter(strategy.name, symbol) and await strategy.evaluate(snap):
                            trader.record_entry(strategy.name, symbol)
                            await strategy.enter(snap)
                    except Exception:
                        pass

        await trader.update_positions(market_prices, iv_map)
        await broadcast_update({
            "type": "update", "ts": datetime.utcnow().isoformat(),
            "portfolio": trader.summary(), "market": state["market_data"],
            "live_strategy": evaluator.live_strategy, "data_source": "simulation",
        })
        iteration += 1
        await asyncio.sleep(REFRESH_INTERVAL)


# ── Startup ───────────────────────────────────────────────────────────────────

@app.on_event("startup")
async def startup():
    logger.info("XTB Options Bot v2 starting — data source: Yahoo Finance")
    await init_db()

    max_open = cfg["paper_trading"].get("max_open_positions", 4)
    trader = PaperTrader(
        initial_capital=INITIAL_CAPITAL,
        max_position_pct=MAX_POS_PCT,
        max_open_positions=max_open,
    )
    evaluator = StrategyEvaluator(
        min_sharpe=LIVE_THRESH["min_sharpe"],
        min_win_rate=LIVE_THRESH["min_win_rate"],
        min_trades=LIVE_THRESH["min_trades"],
        max_drawdown=LIVE_THRESH["max_drawdown"],
    )
    strategies = _build_strategies(trader)
    state.update({"trader": trader, "evaluator": evaluator, "strategies": strategies})
    set_app_state(state)

    # ── Run backtests on real historical data ────────────────────────────────
    logger.info("Loading real historical data from Yahoo Finance for backtesting...")
    bt_results = await run_backtest_yf()
    state["backtest_results"] = bt_results
    if bt_results:
        await evaluator.incorporate_backtest(
            # Re-create lightweight result objects for the evaluator
            _bt_dicts_to_results(bt_results)
        )

    # ── Start live paper trading with real market data ────────────────────────
    # Quick test: is market open?
    test_snap = await get_market_snapshot("AAPL.US")
    if test_snap:
        logger.info("Yahoo Finance data OK — starting real-data paper trading")
        asyncio.create_task(yahoo_trading_loop(trader, strategies, evaluator))
    else:
        logger.info("No live data (market closed or weekend) — starting GBM simulation")
        seed = {"US500": 5300.0, "DE40": 18200.0, "UK100": 8300.0,
                "AAPL.US": 182.0, "MSFT.US": 415.0, "AMZN.US": 192.0,
                "TSLA.US": 172.0, "NVDA.US": 875.0}
        asyncio.create_task(gbm_fallback_loop(trader, strategies, evaluator, seed))


def _bt_dicts_to_results(dicts: List[Dict]):
    """Convert backtest result dicts back to lightweight objects for evaluator."""
    from src.engine.backtester import BacktestResult
    results = []
    for d in dicts:
        r = BacktestResult(
            strategy=d.get("strategy", ""),
            symbol=d.get("symbol", ""),
            n_trades=d.get("n_trades", 0),
            win_rate=d.get("win_rate", 0),
            total_pnl=d.get("total_pnl", 0),
            avg_pnl=d.get("avg_pnl", 0),
            max_drawdown=d.get("max_drawdown", 0),
            sharpe=d.get("sharpe", 0),
            sortino=d.get("sortino", 0),
            profit_factor=d.get("profit_factor", 0),
        )
        results.append(r)
    return results
