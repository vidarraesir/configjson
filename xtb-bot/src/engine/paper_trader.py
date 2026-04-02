"""
Paper trading engine.
Simulates options trades without connecting to the live market.
Tracks equity curve, positions, and performance metrics.
"""
import asyncio
import logging
import uuid
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple

from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from src.engine.options_math import bs_price, bs_greeks, historical_volatility
from src.models.db import (
    AsyncSessionLocal, Trade, TradeStatus, OptionType,
    EquityCurve, StrategyStats, Alert
)

logger = logging.getLogger(__name__)

RISK_FREE_RATE = 0.05   # 5% risk-free rate assumption


class PaperPosition:
    """In-memory representation of an open paper position."""

    def __init__(
        self,
        db_id: int,
        strategy: str,
        symbol: str,
        option_type: str,
        direction: str,
        strike: float,
        expiry_date: str,
        dte_entry: int,
        entry_price: float,
        volume: float,
        sl_price: Optional[float],
        tp_price: Optional[float],
        trade_group_id: str,
        premium_received: float = 0.0,
    ):
        self.db_id = db_id
        self.strategy = strategy
        self.symbol = symbol
        self.option_type = option_type
        self.direction = direction
        self.strike = strike
        self.expiry_date = expiry_date
        self.dte_entry = dte_entry
        self.entry_price = entry_price
        self.current_price = entry_price
        self.volume = volume
        self.sl_price = sl_price
        self.tp_price = tp_price
        self.premium_received = premium_received
        self.trade_group_id = trade_group_id
        self.opened_at = datetime.utcnow()

    @property
    def unrealised_pnl(self) -> float:
        multiplier = 1 if self.direction == "long" else -1
        return multiplier * (self.current_price - self.entry_price) * self.volume

    @property
    def dte(self) -> int:
        try:
            exp = datetime.strptime(self.expiry_date, "%Y-%m-%d")
            return max(0, (exp - datetime.utcnow()).days)
        except Exception:
            return 0

    def to_dict(self) -> Dict:
        return {
            "id": self.db_id,
            "strategy": self.strategy,
            "symbol": self.symbol,
            "option_type": self.option_type,
            "direction": self.direction,
            "strike": self.strike,
            "expiry_date": self.expiry_date,
            "dte": self.dte,
            "entry_price": round(self.entry_price, 4),
            "current_price": round(self.current_price, 4),
            "volume": self.volume,
            "premium_received": self.premium_received,
            "unrealised_pnl": round(self.unrealised_pnl, 2),
            "trade_group_id": self.trade_group_id,
            "opened_at": self.opened_at.isoformat(),
        }


class PaperTrader:
    """
    Simulates options trades, tracks equity, and evaluates strategies.
    On each market-data tick, call `update_positions()` to reprice.
    """

    def __init__(
        self,
        initial_capital: float = 10000.0,
        max_position_pct: float = 0.05,
        max_open_positions: int = 10,
    ):
        self.initial_capital = initial_capital
        self.cash = initial_capital
        self.max_position_pct = max_position_pct
        self.max_open_positions = max_open_positions
        self.positions: Dict[int, PaperPosition] = {}   # db_id → position
        self._next_db_id = 1
        self._peak_equity = initial_capital
        self._equity_history: List[Tuple[datetime, float]] = []
        # Cooldown: (strategy, symbol) → last entry datetime
        self._last_entry: Dict[tuple, datetime] = {}
        self._cooldown_hours = 24   # one trade per strategy/symbol per day

    # ── Core position management ─────────────────────────────────────────────

    async def open_position(
        self,
        strategy: str,
        symbol: str,
        option_type: str,       # "call" / "put" / "underlying"
        direction: str,         # "long" / "short"
        strike: float,
        expiry_date: str,       # "YYYY-MM-DD"
        dte_entry: int,
        entry_price: float,
        volume: float,
        sl_price: Optional[float] = None,
        tp_price: Optional[float] = None,
        premium_received: float = 0.0,
        trade_group_id: Optional[str] = None,
    ) -> Optional[PaperPosition]:
        cost = entry_price * volume
        if direction == "long" and cost > self.cash:
            logger.warning("Insufficient paper capital for %s %s", strategy, symbol)
            return None
        if direction == "long":
            self.cash -= cost
        else:
            # Short options: receive premium
            self.cash += premium_received * volume

        if trade_group_id is None:
            trade_group_id = str(uuid.uuid4())

        async with AsyncSessionLocal() as session:
            trade = Trade(
                strategy=strategy,
                symbol=symbol,
                option_type=OptionType(option_type),
                direction=direction,
                strike=strike,
                expiry_date=expiry_date,
                dte_entry=dte_entry,
                entry_price=entry_price,
                volume=volume,
                premium_received=premium_received,
                sl_price=sl_price,
                tp_price=tp_price,
                status=TradeStatus.open,
                trade_group_id=trade_group_id,
            )
            session.add(trade)
            await session.commit()
            await session.refresh(trade)
            db_id = trade.id

        pos = PaperPosition(
            db_id=db_id,
            strategy=strategy,
            symbol=symbol,
            option_type=option_type,
            direction=direction,
            strike=strike,
            expiry_date=expiry_date,
            dte_entry=dte_entry,
            entry_price=entry_price,
            volume=volume,
            sl_price=sl_price,
            tp_price=tp_price,
            premium_received=premium_received,
            trade_group_id=trade_group_id,
        )
        self.positions[db_id] = pos
        logger.info("Paper OPEN | %s | %s %s %s | price=%.4f vol=%.2f", strategy, direction, symbol, option_type, entry_price, volume)
        return pos

    async def close_position(self, db_id: int, exit_price: float, reason: str = "") -> Optional[float]:
        pos = self.positions.pop(db_id, None)
        if pos is None:
            return None

        if pos.direction == "long":
            pnl = (exit_price - pos.entry_price) * pos.volume
            self.cash += exit_price * pos.volume
        else:
            # Short: pnl = premium_received - cost_to_close
            pnl = (pos.premium_received - exit_price) * pos.volume
            self.cash -= exit_price * pos.volume

        pnl_pct = pnl / (pos.entry_price * pos.volume) if pos.entry_price * pos.volume > 0 else 0

        async with AsyncSessionLocal() as session:
            await session.execute(
                update(Trade)
                .where(Trade.id == db_id)
                .values(
                    exit_price=exit_price,
                    pnl=round(pnl, 4),
                    pnl_pct=round(pnl_pct, 4),
                    status=TradeStatus.closed,
                    closed_at=datetime.utcnow(),
                    notes=reason,
                )
            )
            await session.commit()

        logger.info(
            "Paper CLOSE | %s | %s | exit=%.4f pnl=%.2f (%.1f%%) [%s]",
            pos.strategy, pos.symbol, exit_price, pnl, pnl_pct * 100, reason
        )
        await self._update_strategy_stats(pos.strategy)
        return pnl

    # ── Entry guards ─────────────────────────────────────────────────────────

    def can_enter(self, strategy: str, symbol: str) -> bool:
        """Return True if allowed to open a new strategy group."""
        open_groups = {p.trade_group_id for p in self.positions.values()}
        if len(open_groups) >= self.max_open_positions:
            return False
        key = (strategy, symbol)
        last = self._last_entry.get(key)
        if last and (datetime.utcnow() - last).total_seconds() < self._cooldown_hours * 3600:
            return False
        return True

    def record_entry(self, strategy: str, symbol: str) -> None:
        self._last_entry[(strategy, symbol)] = datetime.utcnow()

    # ── Price update & SL/TP checks ──────────────────────────────────────────

    async def update_positions(
        self,
        market_prices: Dict[str, float],     # symbol → spot price
        ivs: Dict[str, float],               # symbol → IV estimate
    ) -> None:
        """Reprice all open positions using BS and check SL/TP/DTE exit rules."""
        to_close: List[Tuple[int, float, str]] = []

        for db_id, pos in list(self.positions.items()):
            spot = market_prices.get(pos.symbol)
            if spot is None:
                continue

            iv = ivs.get(pos.symbol, 0.20)
            T = pos.dte / 365.0

            if pos.option_type in ("call", "put"):
                new_price = bs_price(spot, pos.strike, T, RISK_FREE_RATE, iv, pos.option_type)
            else:
                new_price = spot

            pos.current_price = new_price

            # SL check
            if pos.sl_price is not None:
                if pos.direction == "long" and new_price <= pos.sl_price:
                    to_close.append((db_id, new_price, "stop_loss"))
                elif pos.direction == "short" and new_price >= pos.sl_price:
                    to_close.append((db_id, new_price, "stop_loss"))

            # TP check
            if pos.tp_price is not None:
                if pos.direction == "long" and new_price >= pos.tp_price:
                    to_close.append((db_id, new_price, "take_profit"))
                elif pos.direction == "short" and new_price <= pos.tp_price:
                    to_close.append((db_id, new_price, "take_profit"))

            # DTE exit (configurable per strategy – here default 7 days)
            if pos.dte <= 7 and pos.option_type != "underlying":
                to_close.append((db_id, new_price, "dte_exit"))

        for db_id, price, reason in to_close:
            await self.close_position(db_id, price, reason)

        await self._snapshot_equity()

    # ── Equity & stats ───────────────────────────────────────────────────────

    @property
    def open_pnl(self) -> float:
        return sum(p.unrealised_pnl for p in self.positions.values())

    @property
    def equity(self) -> float:
        return self.cash + self.open_pnl

    @property
    def drawdown(self) -> float:
        if self._peak_equity <= 0:
            return 0.0
        return (self.equity - self._peak_equity) / self._peak_equity

    async def _snapshot_equity(self) -> None:
        eq = self.equity
        self._peak_equity = max(self._peak_equity, eq)
        dd = self.drawdown
        self._equity_history.append((datetime.utcnow(), eq))

        async with AsyncSessionLocal() as session:
            snap = EquityCurve(
                equity=round(eq, 2),
                cash=round(self.cash, 2),
                open_pnl=round(self.open_pnl, 2),
                drawdown=round(dd, 4),
            )
            session.add(snap)
            await session.commit()

    async def _update_strategy_stats(self, strategy: str) -> None:
        async with AsyncSessionLocal() as session:
            result = await session.execute(
                select(Trade).where(
                    Trade.strategy == strategy,
                    Trade.status == TradeStatus.closed,
                )
            )
            trades = result.scalars().all()
            if not trades:
                return

            pnls = [t.pnl for t in trades if t.pnl is not None]
            n = len(pnls)
            wins = sum(1 for p in pnls if p > 0)
            total_pnl = sum(pnls)
            avg_pnl = total_pnl / n if n else 0
            win_rate = wins / n if n else 0

            # Sharpe (simplified – daily pnl assumed)
            if n > 1:
                mean = avg_pnl
                std = (sum((p - mean) ** 2 for p in pnls) / (n - 1)) ** 0.5
                sharpe = (mean / std) * (252 ** 0.5) if std > 0 else 0.0
            else:
                sharpe = 0.0

            # Max drawdown on cumulative pnl series
            cum = 0.0
            peak = 0.0
            max_dd = 0.0
            for p in pnls:
                cum += p
                peak = max(peak, cum)
                dd = (cum - peak) / peak if peak > 0 else 0
                max_dd = min(max_dd, dd)

            result2 = await session.execute(
                select(StrategyStats).where(StrategyStats.strategy == strategy)
            )
            stats = result2.scalar_one_or_none()
            if stats is None:
                stats = StrategyStats(strategy=strategy)
                session.add(stats)

            stats.total_trades = n
            stats.winning_trades = wins
            stats.losing_trades = n - wins
            stats.total_pnl = round(total_pnl, 2)
            stats.avg_pnl = round(avg_pnl, 2)
            stats.win_rate = round(win_rate, 4)
            stats.sharpe = round(sharpe, 4)
            stats.max_drawdown = round(max_dd, 4)
            stats.last_updated = datetime.utcnow()
            await session.commit()

    # ── Summary ──────────────────────────────────────────────────────────────

    def summary(self) -> Dict:
        return {
            "initial_capital": self.initial_capital,
            "cash": round(self.cash, 2),
            "open_pnl": round(self.open_pnl, 2),
            "equity": round(self.equity, 2),
            "total_return_pct": round((self.equity / self.initial_capital - 1) * 100, 2),
            "drawdown_pct": round(self.drawdown * 100, 2),
            "open_positions": len(self.positions),
            "positions": [p.to_dict() for p in self.positions.values()],
        }
