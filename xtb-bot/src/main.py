"""
XTB Options Bot — Main entry point.

Data source: Yahoo Finance (real prices + real options chains, free, no auth).
- Market open  → paper trading with real prices and real options data
- Market closed → bot sleeps, nothing moves, no fake data
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

from src.api.market_data import get_market_snapshot, get_price_history, SYMBOL_MAP, is_market_open
from src.api.routes import broadcast_update, router, set_app_state
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

UNIVERSE: List[str] = list(SYMBOL_MAP.keys())

INITIAL_CAPITAL  = cfg["paper_trading"]["initial_capital"]
MAX_POS_PCT      = cfg["paper_trading"]["max_position_size"]
LIVE_THRESH      = cfg["paper_trading"]["live_threshold"]
REFRESH_INTERVAL = cfg["dashboard"]["refresh_interval"]   # seconds between ticks

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
    "trader":          None,
    "evaluator":       None,
    "strategies":      [],
    "market_data":     {},
    "backtest_results": [],
    "market_open":     False,
    "data_source":     "yahoo_finance",
}


def _build_strategies(trader: PaperTrader) -> list:
    sc = cfg["strategies"]
    return [
        IronCondorStrategy(   StrategyConfig("iron_condor",      sc.get("iron_condor",      {})), trader),
        BullPutSpreadStrategy(StrategyConfig("bull_put_spread",   sc.get("bull_put_spread",  {})), trader),
        BearCallSpreadStrategy(StrategyConfig("bear_call_spread", sc.get("bear_call_spread", {})), trader),
        CashSecuredPutStrategy(StrategyConfig("cash_secured_put", sc.get("cash_secured_put", {})), trader),
        CoveredCallStrategy(  StrategyConfig("covered_call",     sc.get("covered_call",     {})), trader),
        LongStraddleStrategy( StrategyConfig("long_straddle",    sc.get("long_straddle",    {})), trader),
        ShortStrangleStrategy(StrategyConfig("short_strangle",   sc.get("short_strangle",   {})), trader),
    ]


# ── Backtesting on real historical data ──────────────────────────────────────

async def run_backtest() -> List[Dict]:
    """Run backtests using real Yahoo Finance historical price data."""
    logger.info("=== Backtesting on real Yahoo Finance historical data ===")
    candles_by_symbol: Dict[str, List[Dict]] = {}

    for symbol in UNIVERSE:
        try:
            prices = await get_price_history(symbol, days=500)
            if len(prices) >= 100:
                candles = [
                    {
                        "time":   int(datetime.utcnow().timestamp() * 1000) - (len(prices) - i) * 86_400_000,
                        "close":  p,
                        "open":   p,
                        "high":   p * 1.001,
                        "low":    p * 0.999,
                        "volume": 1000,
                    }
                    for i, p in enumerate(prices)
                ]
                candles_by_symbol[symbol] = candles
                logger.info("  Loaded %d days of real data for %s", len(prices), symbol)
            await asyncio.sleep(0.5)
        except Exception as exc:
            logger.warning("  History load failed for %s: %s", symbol, exc)

    if not candles_by_symbol:
        logger.warning("No historical data available — skipping backtest")
        return []

    bt = Backtester(candles_by_symbol)
    results = bt.run_all()

    logger.info("=== Backtest complete ===")
    for r in results[:5]:
        logger.info("  %-20s %-10s sharpe=%5.2f  win=%4.1f%%  trades=%3d  pnl=%8.2f",
                    r.strategy, r.symbol, r.sharpe, r.win_rate * 100, r.n_trades, r.total_pnl)

    return [r.to_dict() for r in results]


# ── Main trading loop ─────────────────────────────────────────────────────────

async def trading_loop(
    trader: PaperTrader,
    strategies: list,
    evaluator: StrategyEvaluator,
    price_history: Dict[str, List[float]],
):
    """
    Real paper trading loop.
    - When market is OPEN:  fetches real prices, reprices positions, checks signals
    - When market is CLOSED: sleeps 60 s, does nothing, positions don't move
    """
    logger.info("=== Trading loop started (real data only, no simulation) ===")
    iteration = 0

    while True:
        try:
            # ── Check if market is open ──────────────────────────────────────
            market_open = is_market_open()
            state["market_open"] = market_open

            if not market_open:
                if iteration % 12 == 0:   # log once per minute
                    logger.info("Market closed — sleeping. Positions frozen.")
                await broadcast_update({
                    "type":         "market_status",
                    "market_open":  False,
                    "ts":           datetime.utcnow().isoformat(),
                    "portfolio":    trader.summary(),
                    "market":       state["market_data"],
                    "live_strategy": evaluator.live_strategy,
                })
                iteration += 1
                await asyncio.sleep(60)   # check every minute
                continue

            # ── Market is open: fetch real data ──────────────────────────────
            market_prices: Dict[str, float] = {}
            ivs: Dict[str, float] = {}

            for symbol in UNIVERSE:
                snap_data = await get_market_snapshot(symbol)
                if not snap_data:
                    continue

                spot = snap_data["spot"]
                iv   = snap_data["iv"]

                hist = price_history.get(symbol, [])
                if not hist or hist[-1] != spot:
                    hist.append(spot)
                    if len(hist) > 500:
                        hist = hist[-500:]
                    price_history[symbol] = hist

                market_prices[symbol] = spot
                ivs[symbol]           = iv
                state["market_data"][symbol] = {
                    "spot":   spot,
                    "iv":     iv,
                    "bid":    snap_data["bid"],
                    "ask":    snap_data["ask"],
                    "source": "yahoo_finance",
                }

                # Check entry signals every 5 min (60 × 5 s)
                if iteration % 60 == 0:
                    snap = MarketSnapshot(
                        symbol=symbol, spot=spot, iv=iv,
                        prices=hist,
                        bid=snap_data["bid"], ask=snap_data["ask"],
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
                                    logger.info("ENTER %s on %s [%s]",
                                                strategy.name, symbol, group_id[:8])
                        except Exception as exc:
                            logger.debug("Strategy %s/%s: %s", strategy.name, symbol, exc)

                await asyncio.sleep(0.3)

            # ── Reprice open positions with real prices ───────────────────────
            if market_prices:
                await trader.update_positions(market_prices, ivs)

            # ── Push update to dashboard ─────────────────────────────────────
            await broadcast_update({
                "type":          "update",
                "ts":            datetime.utcnow().isoformat(),
                "portfolio":     trader.summary(),
                "market":        state["market_data"],
                "live_strategy": evaluator.live_strategy,
                "market_open":   True,
                "data_source":   "yahoo_finance",
            })

            # ── Check strategy promotion every 5 min ─────────────────────────
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


# ── Startup ───────────────────────────────────────────────────────────────────

@app.on_event("startup")
async def startup():
    logger.info("XTB Options Bot starting — real data only (Yahoo Finance)")
    await init_db()

    max_open = cfg["paper_trading"].get("max_open_positions", 4)
    trader = PaperTrader(
        initial_capital=INITIAL_CAPITAL,
        max_position_pct=MAX_POS_PCT,
        max_open_positions=max_open,
    )
    evaluator = StrategyEvaluator(
        min_sharpe=   LIVE_THRESH["min_sharpe"],
        min_win_rate= LIVE_THRESH["min_win_rate"],
        min_trades=   LIVE_THRESH["min_trades"],
        max_drawdown= LIVE_THRESH["max_drawdown"],
    )
    strategies = _build_strategies(trader)
    state.update({"trader": trader, "evaluator": evaluator, "strategies": strategies})
    set_app_state(state)

    # ── Backtesting on real historical data ──────────────────────────────────
    bt_results = await run_backtest()
    state["backtest_results"] = bt_results
    if bt_results:
        from src.engine.backtester import BacktestResult
        results_obj = [
            BacktestResult(
                strategy=d["strategy"], symbol=d["symbol"],
                n_trades=d["n_trades"], win_rate=d["win_rate"],
                total_pnl=d["total_pnl"], avg_pnl=d["avg_pnl"],
                max_drawdown=d["max_drawdown"], sharpe=d["sharpe"],
                sortino=d["sortino"], profit_factor=d["profit_factor"],
            )
            for d in bt_results
        ]
        await evaluator.incorporate_backtest(results_obj)

    # ── Pre-load price history ────────────────────────────────────────────────
    price_history: Dict[str, List[float]] = {}
    for symbol in UNIVERSE:
        hist = await get_price_history(symbol, days=120)
        if hist:
            price_history[symbol] = hist
        await asyncio.sleep(0.3)

    # ── Start trading loop ────────────────────────────────────────────────────
    asyncio.create_task(trading_loop(trader, strategies, evaluator, price_history))
