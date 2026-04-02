"""
FastAPI REST + WebSocket routes.
"""
import asyncio
import json
import logging
from datetime import datetime
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, Depends, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.responses import FileResponse
from sqlalchemy import select, desc

from src.models.db import (
    AsyncSessionLocal, Trade, TradeStatus, EquityCurve, StrategyStats, Alert
)

logger = logging.getLogger(__name__)
router = APIRouter()

# Injected by main.py
_app_state: Dict[str, Any] = {}


def set_app_state(state: Dict[str, Any]) -> None:
    _app_state.update(state)


# ── WebSocket manager ────────────────────────────────────────────────────────

class ConnectionManager:
    def __init__(self):
        self.active: List[WebSocket] = []

    async def connect(self, ws: WebSocket) -> None:
        await ws.accept()
        self.active.append(ws)

    def disconnect(self, ws: WebSocket) -> None:
        self.active.remove(ws) if ws in self.active else None

    async def broadcast(self, data: Dict) -> None:
        dead = []
        for ws in self.active:
            try:
                await ws.send_json(data)
            except Exception:
                dead.append(ws)
        for ws in dead:
            self.disconnect(ws)


ws_manager = ConnectionManager()


# ── Endpoints ────────────────────────────────────────────────────────────────

@router.get("/api/status")
async def get_status():
    trader = _app_state.get("trader")
    evaluator = _app_state.get("evaluator")
    xtb = _app_state.get("xtb")
    return {
        "timestamp": datetime.utcnow().isoformat(),
        "xtb_connected": xtb.is_connected if xtb else False,
        "paper_trading": True,
        "live_strategy": evaluator.live_strategy if evaluator else None,
        "portfolio": trader.summary() if trader else {},
    }


@router.get("/api/portfolio")
async def get_portfolio():
    trader = _app_state.get("trader")
    if not trader:
        raise HTTPException(status_code=503, detail="Trader not initialised")
    return trader.summary()


@router.get("/api/trades")
async def get_trades(status: Optional[str] = None, strategy: Optional[str] = None, limit: int = 100):
    async with AsyncSessionLocal() as session:
        q = select(Trade).order_by(desc(Trade.opened_at)).limit(limit)
        if status:
            q = q.where(Trade.status == TradeStatus(status))
        if strategy:
            q = q.where(Trade.strategy == strategy)
        result = await session.execute(q)
        trades = result.scalars().all()
    return [
        {
            "id": t.id,
            "strategy": t.strategy,
            "symbol": t.symbol,
            "option_type": t.option_type,
            "direction": t.direction,
            "strike": t.strike,
            "expiry_date": t.expiry_date,
            "entry_price": t.entry_price,
            "exit_price": t.exit_price,
            "volume": t.volume,
            "pnl": t.pnl,
            "pnl_pct": t.pnl_pct,
            "status": t.status,
            "opened_at": t.opened_at.isoformat() if t.opened_at else None,
            "closed_at": t.closed_at.isoformat() if t.closed_at else None,
            "notes": t.notes,
            "trade_group_id": t.trade_group_id,
        }
        for t in trades
    ]


@router.get("/api/equity")
async def get_equity(limit: int = 500):
    async with AsyncSessionLocal() as session:
        result = await session.execute(
            select(EquityCurve).order_by(desc(EquityCurve.ts)).limit(limit)
        )
        rows = result.scalars().all()
    rows = list(reversed(rows))
    return [
        {
            "ts": r.ts.isoformat(),
            "equity": r.equity,
            "cash": r.cash,
            "open_pnl": r.open_pnl,
            "drawdown": r.drawdown,
        }
        for r in rows
    ]


@router.get("/api/strategies")
async def get_strategies():
    evaluator = _app_state.get("evaluator")
    if not evaluator:
        raise HTTPException(status_code=503, detail="Evaluator not initialised")
    return await evaluator.get_leaderboard()


@router.get("/api/alerts")
async def get_alerts(unacked_only: bool = False, limit: int = 50):
    async with AsyncSessionLocal() as session:
        q = select(Alert).order_by(desc(Alert.ts)).limit(limit)
        if unacked_only:
            q = q.where(Alert.acknowledged == False)
        result = await session.execute(q)
        alerts = result.scalars().all()
    return [
        {
            "id": a.id,
            "ts": a.ts.isoformat(),
            "level": a.level,
            "message": a.message,
            "acknowledged": a.acknowledged,
        }
        for a in alerts
    ]


@router.post("/api/alerts/{alert_id}/ack")
async def ack_alert(alert_id: int):
    from sqlalchemy import update
    async with AsyncSessionLocal() as session:
        await session.execute(
            update(Alert).where(Alert.id == alert_id).values(acknowledged=True)
        )
        await session.commit()
    return {"ok": True}


@router.get("/api/backtest")
async def get_backtest_results():
    return _app_state.get("backtest_results", [])


@router.get("/api/greeks")
async def get_greeks(symbol: str, strike: float, expiry_date: str, option_type: str):
    """Compute live BS Greeks for a given option."""
    from src.engine.options_math import bs_greeks
    market_data = _app_state.get("market_data", {})
    snap = market_data.get(symbol)
    if not snap:
        raise HTTPException(status_code=404, detail=f"No market data for {symbol}")

    try:
        exp = datetime.strptime(expiry_date, "%Y-%m-%d")
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid expiry_date format, use YYYY-MM-DD")

    T = max((exp - datetime.utcnow()).days, 0) / 365.0
    g = bs_greeks(snap["spot"], strike, T, 0.05, snap["iv"], option_type)
    return {
        "symbol": symbol, "strike": strike, "expiry_date": expiry_date,
        "option_type": option_type, "spot": snap["spot"], "iv": snap["iv"],
        "delta": round(g.delta, 4), "gamma": round(g.gamma, 6),
        "theta": round(g.theta, 4), "vega": round(g.vega, 4), "rho": round(g.rho, 4),
    }


# ── WebSocket feed ────────────────────────────────────────────────────────────

@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await ws_manager.connect(websocket)
    try:
        while True:
            # Keep connection alive, push updates from broadcast()
            await asyncio.sleep(30)
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket)


async def broadcast_update(data: Dict) -> None:
    await ws_manager.broadcast(data)
