"""
XTB Options Bot — Main entry point.

Start order:
1. Initialise DB
2. Connect to XTB (demo)
3. Run backtests on available historical data
4. Seed evaluator with backtest results
5. Start paper trading loop
6. Start FastAPI server (dashboard + REST API)
"""
import asyncio
import logging
import os
import time
from datetime import datetime, timedelta
from pathlib import Path
from typing import Dict, List, Optional

import uvicorn
import yaml
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from src.api.routes import router, set_app_state, broadcast_update
from src.api.xtb_client import XTBClient, PERIOD_D1
from src.engine.backtester import Backtester
from src.engine.evaluator import StrategyEvaluator
from src.engine.options_math import historical_volatility
from src.engine.paper_trader import PaperTrader
from src.models.db import init_db
from src.strategies.base import MarketSnapshot, StrategyConfig
from src.strategies.iron_condor import IronCondorStrategy
from src.strategies.bull_put_spread import BullPutSpreadStrategy, BearCallSpreadStrategy
from src.strategies.cash_secured_put import CashSecuredPutStrategy, CoveredCallStrategy
from src.strategies.straddle import LongStraddleStrategy, ShortStrangleStrategy

# ── Dirs (Windows + Linux compatible) ────────────────────────────────────────
_ROOT = Path(__file__).resolve().parent.parent
(_ROOT / "logs").mkdir(parents=True, exist_ok=True)
(_ROOT / "data").mkdir(parents=True, exist_ok=True)

# ── Logging ───────────────────────────────────────────────────────────────────
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

XTB_USER = os.getenv("XTB_USER", "")
XTB_PASSWORD = os.getenv("XTB_PASSWORD", "")
XTB_DEMO = os.getenv("XTB_DEMO", "true").lower() == "true"

UNIVERSE: List[str] = (
    cfg["universe"]["indices"] + cfg["universe"]["stocks"]
)
INITIAL_CAPITAL = cfg["paper_trading"]["initial_capital"]
MAX_POS_PCT = cfg["paper_trading"]["max_position_size"]
LIVE_THRESH = cfg["paper_trading"]["live_threshold"]
DASHBOARD_PORT = cfg["dashboard"]["port"]
REFRESH_INTERVAL = cfg["dashboard"]["refresh_interval"]

# ── FastAPI app ───────────────────────────────────────────────────────────────
app = FastAPI(title="XTB Options Bot", version="1.0.0")
app.include_router(router)

dashboard_dir = Path(__file__).parent.parent / "dashboard"
app.mount("/static", StaticFiles(directory=str(dashboard_dir)), name="static")


@app.get("/")
async def serve_dashboard():
    return FileResponse(str(dashboard_dir / "index.html"))


# ── State ─────────────────────────────────────────────────────────────────────
state: Dict = {
    "xtb": None,
    "trader": None,
    "evaluator": None,
    "strategies": [],
    "market_data": {},
    "backtest_results": [],
}


def _build_strategies(trader: PaperTrader) -> list:
    strat_cfg = cfg["strategies"]
    return [
        IronCondorStrategy(StrategyConfig("iron_condor", strat_cfg.get("iron_condor", {})), trader),
        BullPutSpreadStrategy(StrategyConfig("bull_put_spread", strat_cfg.get("bull_put_spread", {})), trader),
        BearCallSpreadStrategy(StrategyConfig("bear_call_spread", strat_cfg.get("bear_call_spread", {})), trader),
        CashSecuredPutStrategy(StrategyConfig("cash_secured_put", strat_cfg.get("cash_secured_put", {})), trader),
        CoveredCallStrategy(StrategyConfig("covered_call", strat_cfg.get("covered_call", {})), trader),
        LongStraddleStrategy(StrategyConfig("long_straddle", strat_cfg.get("long_straddle", {})), trader),
        ShortStrangleStrategy(StrategyConfig("short_strangle", strat_cfg.get("short_strangle", {})), trader),
    ]


# ── Market data helpers ───────────────────────────────────────────────────────

async def _fetch_historical(xtb: XTBClient, symbol: str, days: int = 365) -> List[Dict]:
    start_ms = int((datetime.utcnow() - timedelta(days=days)).timestamp() * 1000)
    try:
        candles = await xtb.get_chart_last(symbol, PERIOD_D1, start_ms)
        logger.info("Fetched %d daily candles for %s", len(candles), symbol)
        return candles
    except Exception as exc:
        logger.error("Failed to fetch history for %s: %s", symbol, exc)
        return []


async def _fetch_tick(xtb: XTBClient, symbol: str) -> Optional[Dict]:
    try:
        ticks = await xtb.get_tick_prices([symbol])
        if ticks:
            return {"ask": ticks[0].get("ask", 0), "bid": ticks[0].get("bid", 0)}
    except Exception as exc:
        logger.warning("Tick fetch error %s: %s", symbol, exc)
    return None


def _build_snapshot(symbol: str, candles: List[Dict], bid: float, ask: float) -> MarketSnapshot:
    prices = [c["close"] for c in candles]
    spot = (bid + ask) / 2 if bid > 0 and ask > 0 else (prices[-1] if prices else 0)
    iv = historical_volatility(prices, window=min(20, len(prices) - 1)) if len(prices) > 2 else 0.20
    return MarketSnapshot(
        symbol=symbol,
        spot=spot,
        iv=iv,
        prices=prices,
        bid=bid,
        ask=ask,
        timestamp=time.time(),
    )


# ── Core loops ────────────────────────────────────────────────────────────────

async def run_backtest(xtb: XTBClient) -> List[Dict]:
    logger.info("=== Running backtests on historical data ===")
    candles_by_symbol = {}
    for symbol in UNIVERSE:
        candles = await _fetch_historical(xtb, symbol, days=500)
        if len(candles) >= 100:
            candles_by_symbol[symbol] = candles
        await asyncio.sleep(0.5)   # rate limit

    if not candles_by_symbol:
        logger.warning("No historical data available for backtesting")
        return []

    bt = Backtester(candles_by_symbol)
    results = bt.run_all()
    logger.info("=== Backtest complete. Top strategies ===")
    for r in results[:5]:
        logger.info("  %s/%s | sharpe=%.2f win=%.1f%% trades=%d pnl=%.2f",
                    r.strategy, r.symbol, r.sharpe, r.win_rate * 100, r.n_trades, r.total_pnl)

    return [r.to_dict() for r in results]


async def paper_trading_loop(
    xtb: XTBClient,
    trader: PaperTrader,
    strategies: list,
    evaluator: StrategyEvaluator,
    candles_cache: Dict[str, List[Dict]],
):
    """Main loop: fetch prices → update positions → evaluate signals → check promotion."""
    logger.info("=== Paper trading loop started ===")
    iteration = 0

    while True:
        try:
            market_prices: Dict[str, float] = {}
            ivs: Dict[str, float] = {}

            for symbol in UNIVERSE:
                candles = candles_cache.get(symbol, [])
                tick = await _fetch_tick(xtb, symbol)
                if tick is None:
                    continue

                snap = _build_snapshot(symbol, candles, tick["bid"], tick["ask"])
                state["market_data"][symbol] = {"spot": snap.spot, "iv": snap.iv, "bid": snap.bid, "ask": snap.ask}
                market_prices[symbol] = snap.spot
                ivs[symbol] = snap.iv

                # Update candle cache with latest price
                if candles:
                    candles[-1]["close"] = snap.spot
                else:
                    candles_cache[symbol] = [{"time": int(time.time() * 1000), "close": snap.spot,
                                              "open": snap.spot, "high": snap.spot, "low": snap.spot, "volume": 0}]

                # Every 6th iteration (≈30 min at 5s interval): check entry signals
                if iteration % 6 == 0:
                    for strategy in strategies:
                        # In live mode, only run the promoted strategy
                        if evaluator.live_strategy and strategy.name != evaluator.live_strategy:
                            continue
                        try:
                            if trader.can_enter(strategy.name, symbol) and await strategy.evaluate(snap):
                                trader.record_entry(strategy.name, symbol)
                                group_id = await strategy.enter(snap)
                                if group_id:
                                    logger.info("Signal: %s entered %s [group=%s]", strategy.name, symbol, group_id[:8])
                        except Exception as exc:
                            logger.error("Strategy %s error: %s", strategy.name, exc)

                await asyncio.sleep(0.2)

            # Reprice and check SL/TP
            await trader.update_positions(market_prices, ivs)

            # Broadcast real-time update to dashboard
            await broadcast_update({
                "type": "update",
                "ts": datetime.utcnow().isoformat(),
                "portfolio": trader.summary(),
                "market": state["market_data"],
                "live_strategy": evaluator.live_strategy,
            })

            # Every 60 iterations (≈5 min): check strategy promotion
            if iteration % 60 == 0:
                promoted = await evaluator.check_promotion()
                if promoted:
                    logger.info("Live strategy: %s", promoted)
                    await broadcast_update({
                        "type": "alert",
                        "level": "success",
                        "message": f"Strategy '{promoted}' promoted to LIVE TRADING!",
                    })

            iteration += 1
            await asyncio.sleep(REFRESH_INTERVAL)

        except asyncio.CancelledError:
            break
        except Exception as exc:
            logger.error("Loop error: %s", exc, exc_info=True)
            await asyncio.sleep(10)


async def reconnect_loop(xtb: XTBClient):
    """Keep XTB connection alive."""
    while True:
        if not xtb.is_connected:
            logger.info("Reconnecting to XTB...")
            await xtb.connect()
        await asyncio.sleep(60)


# ── Startup ───────────────────────────────────────────────────────────────────

@app.on_event("startup")
async def startup():
    logger.info("XTB Options Bot starting...")
    await init_db()

    max_open = cfg["paper_trading"].get("max_open_positions", 10)
    trader = PaperTrader(initial_capital=INITIAL_CAPITAL, max_position_pct=MAX_POS_PCT, max_open_positions=max_open)
    evaluator = StrategyEvaluator(
        min_sharpe=LIVE_THRESH["min_sharpe"],
        min_win_rate=LIVE_THRESH["min_win_rate"],
        min_trades=LIVE_THRESH["min_trades"],
        max_drawdown=LIVE_THRESH["max_drawdown"],
    )
    strategies = _build_strategies(trader)

    state.update({
        "trader": trader,
        "evaluator": evaluator,
        "strategies": strategies,
    })
    set_app_state(state)

    candles_cache: Dict[str, List[Dict]] = {}

    if XTB_USER and XTB_PASSWORD:
        logger.info("XTB credentials found: user=%s demo=%s", XTB_USER, XTB_DEMO)
        xtb = XTBClient(XTB_USER, XTB_PASSWORD, demo=XTB_DEMO)
        connected = await xtb.connect()
        if connected:
            state["xtb"] = xtb

            # Pre-load history
            for symbol in UNIVERSE:
                candles = await _fetch_historical(xtb, symbol, days=500)
                if candles:
                    candles_cache[symbol] = candles
                await asyncio.sleep(0.3)

            # Backtest
            bt_results = await run_backtest(xtb)
            state["backtest_results"] = bt_results

            # Seed evaluator
            from src.engine.backtester import Backtester, BacktestResult
            # Parse dicts back for incorporaton (simplified)

            # Start loops
            asyncio.create_task(reconnect_loop(xtb))
            asyncio.create_task(
                paper_trading_loop(xtb, trader, strategies, evaluator, candles_cache)
            )
        else:
            logger.warning("XTB connection failed — running in DEMO OFFLINE mode")
            _start_offline_simulation(trader, strategies, evaluator, candles_cache)
    else:
        logger.warning("No XTB credentials — running OFFLINE SIMULATION mode")
        _start_offline_simulation(trader, strategies, evaluator, candles_cache)


def _start_offline_simulation(trader, strategies, evaluator, candles_cache):
    """Run a synthetic market simulation when XTB credentials are absent."""
    asyncio.create_task(offline_simulation_loop(trader, strategies, evaluator))


async def offline_simulation_loop(trader: PaperTrader, strategies: list, evaluator: StrategyEvaluator):
    """
    Simulate market data with GBM (Geometric Brownian Motion) for demo/testing.
    Allows full strategy evaluation without real XTB credentials.
    """
    import random
    import math

    logger.info("=== Offline simulation mode ===")
    spots = {
        "US500": 5000.0,
        "DE40": 18000.0,
        "UK100": 8200.0,
        "AAPL.US": 180.0,
        "MSFT.US": 420.0,
        "AMZN.US": 195.0,
        "TSLA.US": 175.0,
        "NVDA.US": 900.0,
    }
    ivs = {s: random.uniform(0.15, 0.35) for s in spots}
    price_history: Dict[str, List[float]] = {s: [v] * 50 for s, v in spots.items()}
    iteration = 0

    while True:
        market_prices = {}
        iv_map = {}

        for symbol, spot in spots.items():
            # GBM step
            mu = 0.0001
            sigma = ivs[symbol] / math.sqrt(252 * 6.5 * 12)   # intraday vol
            rand = random.gauss(0, 1)
            new_spot = spot * math.exp((mu - 0.5 * sigma ** 2) + sigma * rand)
            spots[symbol] = new_spot
            price_history[symbol].append(new_spot)
            if len(price_history[symbol]) > 500:
                price_history[symbol] = price_history[symbol][-500:]

            # Slowly drift IV
            ivs[symbol] = max(0.10, min(0.60, ivs[symbol] + random.gauss(0, 0.001)))

            market_prices[symbol] = new_spot
            iv_map[symbol] = ivs[symbol]
            state["market_data"][symbol] = {
                "spot": round(new_spot, 4),
                "iv": round(ivs[symbol], 4),
                "bid": round(new_spot * 0.9999, 4),
                "ask": round(new_spot * 1.0001, 4),
            }

        # Check strategy entries every 10 iterations
        if iteration % 10 == 0:
            for strategy in strategies:
                if evaluator.live_strategy and strategy.name != evaluator.live_strategy:
                    continue
                for symbol in UNIVERSE:
                    prices = price_history.get(symbol, [])
                    if not prices:
                        continue
                    snap = MarketSnapshot(
                        symbol=symbol,
                        spot=spots.get(symbol, 100),
                        iv=ivs.get(symbol, 0.20),
                        prices=prices,
                        bid=spots.get(symbol, 100) * 0.9999,
                        ask=spots.get(symbol, 100) * 1.0001,
                        timestamp=time.time(),
                    )
                    try:
                        if trader.can_enter(strategy.name, symbol) and await strategy.evaluate(snap):
                            trader.record_entry(strategy.name, symbol)
                            await strategy.enter(snap)
                    except Exception as exc:
                        logger.debug("Strategy %s error: %s", strategy.name, exc)

        await trader.update_positions(market_prices, iv_map)

        await broadcast_update({
            "type": "update",
            "ts": datetime.utcnow().isoformat(),
            "portfolio": trader.summary(),
            "market": state["market_data"],
            "live_strategy": evaluator.live_strategy,
            "mode": "simulation",
        })

        if iteration % 100 == 0:
            promoted = await evaluator.check_promotion()
            if promoted:
                await broadcast_update({
                    "type": "alert",
                    "level": "success",
                    "message": f"Strategy '{promoted}' promoted to LIVE!",
                })

        iteration += 1
        await asyncio.sleep(REFRESH_INTERVAL)
