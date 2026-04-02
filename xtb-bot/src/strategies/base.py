"""Base class for all options strategies."""
import logging
from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from typing import Dict, List, Optional

from src.engine.options_math import bs_price, bs_greeks, delta_to_strike, historical_volatility, Greeks
from src.engine.paper_trader import PaperTrader

logger = logging.getLogger(__name__)

RISK_FREE_RATE = 0.05


@dataclass
class MarketSnapshot:
    symbol: str
    spot: float
    iv: float            # Implied / historical volatility estimate
    prices: List[float]  # Recent closing prices (for HV calc)
    bid: float = 0.0
    ask: float = 0.0
    timestamp: float = 0.0


@dataclass
class StrategyConfig:
    name: str
    params: Dict = field(default_factory=dict)


class BaseStrategy(ABC):
    """All strategies implement `should_enter`, `generate_legs`, and `should_exit`."""

    name: str = "base"

    def __init__(self, config: StrategyConfig, paper_trader: PaperTrader):
        self.config = config
        self.paper = paper_trader
        self.params = config.params

    @abstractmethod
    async def evaluate(self, snapshot: MarketSnapshot) -> bool:
        """Return True if entry conditions are met."""
        ...

    @abstractmethod
    async def enter(self, snapshot: MarketSnapshot) -> Optional[str]:
        """Open position legs. Returns trade_group_id or None."""
        ...

    def _dte_to_years(self, dte: int) -> float:
        return max(dte, 1) / 365.0

    def _next_expiry(self, dte_target: int) -> str:
        """Return a future expiry date string YYYY-MM-DD ~dte_target days out."""
        from datetime import datetime, timedelta
        target = datetime.utcnow() + timedelta(days=dte_target)
        # Round to Friday (options typically expire Fridays)
        days_ahead = 4 - target.weekday()   # Friday=4
        if days_ahead < 0:
            days_ahead += 7
        expiry = target + timedelta(days=days_ahead)
        return expiry.strftime("%Y-%m-%d")

    def _max_position_value(self) -> float:
        return self.paper.equity * self.paper.max_position_pct
