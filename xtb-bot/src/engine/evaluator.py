"""
Strategy Evaluator
===================
Monitors paper trading results and:
1. Determines which strategy is most profitable
2. Promotes a strategy to "live" when thresholds are met
3. Emits alerts and recommendations
"""
import logging
from dataclasses import dataclass
from datetime import datetime
from typing import Dict, List, Optional, Tuple

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.models.db import AsyncSessionLocal, StrategyStats, Alert, Trade, TradeStatus
from src.engine.backtester import BacktestResult

logger = logging.getLogger(__name__)


@dataclass
class LiveCandidate:
    strategy: str
    sharpe: float
    win_rate: float
    n_trades: int
    max_drawdown: float
    total_pnl: float
    score: float


class StrategyEvaluator:
    """
    Periodically evaluates paper trading performance and decides
    whether to promote a strategy to live trading.
    """

    def __init__(
        self,
        min_sharpe: float = 1.5,
        min_win_rate: float = 0.55,
        min_trades: int = 30,
        max_drawdown: float = -0.15,
    ):
        self.min_sharpe = min_sharpe
        self.min_win_rate = min_win_rate
        self.min_trades = min_trades
        self.max_drawdown = max_drawdown
        self.live_strategy: Optional[str] = None

    async def evaluate(self) -> List[LiveCandidate]:
        """Read strategy stats from DB and score them."""
        async with AsyncSessionLocal() as session:
            result = await session.execute(select(StrategyStats))
            all_stats = result.scalars().all()

        candidates = []
        for stats in all_stats:
            if stats.total_trades < 5:
                continue
            # Composite score: Sharpe × win_rate × (1 + max_dd penalty)
            dd_penalty = max(0, 1 + stats.max_drawdown)   # 0–1 scale
            score = stats.sharpe * stats.win_rate * dd_penalty
            candidates.append(LiveCandidate(
                strategy=stats.strategy,
                sharpe=stats.sharpe,
                win_rate=stats.win_rate,
                n_trades=stats.total_trades,
                max_drawdown=stats.max_drawdown,
                total_pnl=stats.total_pnl,
                score=round(score, 4),
            ))

        candidates.sort(key=lambda c: c.score, reverse=True)
        return candidates

    async def check_promotion(self) -> Optional[str]:
        """Return strategy name if it meets live-trading thresholds, else None."""
        candidates = await self.evaluate()
        for c in candidates:
            if (
                c.sharpe >= self.min_sharpe
                and c.win_rate >= self.min_win_rate
                and c.n_trades >= self.min_trades
                and c.max_drawdown >= self.max_drawdown
            ):
                if self.live_strategy != c.strategy:
                    self.live_strategy = c.strategy
                    await self._save_alert(
                        "critical",
                        f"Strategy '{c.strategy}' PROMOTED to LIVE TRADING. "
                        f"Sharpe={c.sharpe:.2f} WinRate={c.win_rate:.1%} "
                        f"Trades={c.n_trades} MaxDD={c.max_drawdown:.1%}"
                    )
                    await self._mark_live(c.strategy)
                    logger.info("PROMOTED: %s to live trading", c.strategy)
                return c.strategy

        if self.live_strategy:
            # Check if live strategy is still performing
            async with AsyncSessionLocal() as session:
                result = await session.execute(
                    select(StrategyStats).where(StrategyStats.strategy == self.live_strategy)
                )
                stats = result.scalar_one_or_none()
                if stats and (stats.sharpe < self.min_sharpe * 0.5 or stats.max_drawdown < self.max_drawdown * 1.5):
                    await self._save_alert(
                        "warning",
                        f"Strategy '{self.live_strategy}' performance degraded. "
                        f"Sharpe={stats.sharpe:.2f} MaxDD={stats.max_drawdown:.1%}. "
                        "Reverting to paper trading."
                    )
                    self.live_strategy = None
                    await self._mark_live(None)

        return None

    async def incorporate_backtest(self, results: List[BacktestResult]) -> None:
        """Seed strategy stats with backtest results for warm start."""
        async with AsyncSessionLocal() as session:
            for r in results:
                existing = await session.execute(
                    select(StrategyStats).where(StrategyStats.strategy == r.strategy)
                )
                stats = existing.scalar_one_or_none()
                if stats is None:
                    stats = StrategyStats(strategy=r.strategy)
                    session.add(stats)
                # Only update if backtest has more data than current live stats
                if r.n_trades > stats.total_trades:
                    stats.total_trades = r.n_trades
                    stats.win_rate = round(r.win_rate, 4)
                    stats.sharpe = round(r.sharpe, 4)
                    stats.max_drawdown = round(r.max_drawdown, 4)
                    stats.total_pnl = round(r.total_pnl, 2)
                    stats.avg_pnl = round(r.avg_pnl, 2)
                    stats.winning_trades = int(r.win_rate * r.n_trades)
                    stats.losing_trades = r.n_trades - stats.winning_trades
                    stats.last_updated = datetime.utcnow()
            await session.commit()

    async def get_leaderboard(self) -> List[Dict]:
        candidates = await self.evaluate()
        return [
            {
                "rank": i + 1,
                "strategy": c.strategy,
                "sharpe": c.sharpe,
                "win_rate": round(c.win_rate * 100, 1),
                "n_trades": c.n_trades,
                "max_drawdown": round(c.max_drawdown * 100, 1),
                "total_pnl": c.total_pnl,
                "score": c.score,
                "is_live": c.strategy == self.live_strategy,
                "meets_threshold": (
                    c.sharpe >= self.min_sharpe
                    and c.win_rate >= self.min_win_rate
                    and c.n_trades >= self.min_trades
                    and c.max_drawdown >= self.max_drawdown
                ),
            }
            for i, c in enumerate(candidates)
        ]

    async def _save_alert(self, level: str, message: str) -> None:
        async with AsyncSessionLocal() as session:
            alert = Alert(level=level, message=message)
            session.add(alert)
            await session.commit()
        logger.info("ALERT [%s]: %s", level.upper(), message)

    async def _mark_live(self, strategy: Optional[str]) -> None:
        async with AsyncSessionLocal() as session:
            # Reset all
            all_stats = await session.execute(select(StrategyStats))
            for stats in all_stats.scalars():
                stats.is_live = stats.strategy == strategy
                if stats.strategy == strategy:
                    stats.promoted_at = datetime.utcnow()
            await session.commit()
