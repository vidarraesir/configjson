"""
Cash-Secured Put
=================
Sell OTM put with capital reserved to buy shares if assigned.
Classic income strategy with defined downside.

Entry: Bullish on underlying, IV rank elevated
Exit:  50% profit, 200% loss, or 7 DTE
"""
import logging
import uuid
from typing import Optional

from src.engine.options_math import bs_price, delta_to_strike
from src.strategies.base import BaseStrategy, MarketSnapshot, StrategyConfig
from src.engine.paper_trader import PaperTrader

logger = logging.getLogger(__name__)
RISK_FREE = 0.05


class CashSecuredPutStrategy(BaseStrategy):
    name = "cash_secured_put"

    def __init__(self, config: StrategyConfig, paper_trader: PaperTrader):
        super().__init__(config, paper_trader)
        self.delta = float(self.params.get("delta", 0.25))
        self.dte_entry = int(self.params.get("dte_entry", 30))
        self.dte_exit = int(self.params.get("dte_exit", 7))
        self.profit_target = float(self.params.get("profit_target", 0.50))
        self.stop_loss = float(self.params.get("stop_loss", 2.0))

    async def evaluate(self, snapshot: MarketSnapshot) -> bool:
        prices = snapshot.prices
        if len(prices) < 50:
            return False
        sma50 = sum(prices[-50:]) / 50
        return snapshot.spot > sma50 and snapshot.iv >= 0.18

    async def enter(self, snapshot: MarketSnapshot) -> Optional[str]:
        S = snapshot.spot
        iv = snapshot.iv
        T = self._dte_to_years(self.dte_entry)
        expiry = self._next_expiry(self.dte_entry)
        group_id = str(uuid.uuid4())

        K = delta_to_strike(S, T, RISK_FREE, iv, self.delta, "put")
        price = bs_price(S, K, T, RISK_FREE, iv, "put")

        # Reserve cash for assignment
        reserved = K   # full strike reserved
        if reserved > self.paper.cash:
            logger.debug("CSP: insufficient capital for %s", snapshot.symbol)
            return None

        await self.paper.open_position(
            strategy=self.name, symbol=snapshot.symbol,
            option_type="put", direction="short",
            strike=round(K, 2), expiry_date=expiry, dte_entry=self.dte_entry,
            entry_price=price, volume=1.0, premium_received=price,
            sl_price=price * (1 + self.stop_loss),
            tp_price=price * (1 - self.profit_target),
            trade_group_id=group_id,
        )

        logger.info(
            "Cash-Secured Put ENTER | %s | premium=%.4f | K=%.2f | expiry=%s",
            snapshot.symbol, price, K, expiry
        )
        return group_id


class CoveredCallStrategy(BaseStrategy):
    """
    Covered Call
    =============
    Own underlying, sell OTM call to generate income.
    Limits upside but earns premium.
    """
    name = "covered_call"

    def __init__(self, config: StrategyConfig, paper_trader: PaperTrader):
        super().__init__(config, paper_trader)
        self.delta = float(self.params.get("delta", 0.30))
        self.dte_entry = int(self.params.get("dte_entry", 30))
        self.dte_exit = int(self.params.get("dte_exit", 7))
        self.profit_target = float(self.params.get("profit_target", 0.50))

    async def evaluate(self, snapshot: MarketSnapshot) -> bool:
        # Only trade if we have underlying position (simplified: check if enough capital)
        return snapshot.iv >= 0.15 and self.paper.equity > snapshot.spot

    async def enter(self, snapshot: MarketSnapshot) -> Optional[str]:
        S = snapshot.spot
        iv = snapshot.iv
        T = self._dte_to_years(self.dte_entry)
        expiry = self._next_expiry(self.dte_entry)
        group_id = str(uuid.uuid4())

        # "Buy" underlying
        await self.paper.open_position(
            strategy=self.name, symbol=snapshot.symbol,
            option_type="underlying", direction="long",
            strike=S, expiry_date=expiry, dte_entry=self.dte_entry,
            entry_price=S, volume=1.0,
            trade_group_id=group_id,
        )

        # Sell OTM call
        K = delta_to_strike(S, T, RISK_FREE, iv, self.delta, "call")
        price = bs_price(S, K, T, RISK_FREE, iv, "call")

        await self.paper.open_position(
            strategy=self.name, symbol=snapshot.symbol,
            option_type="call", direction="short",
            strike=round(K, 2), expiry_date=expiry, dte_entry=self.dte_entry,
            entry_price=price, volume=1.0, premium_received=price,
            tp_price=price * (1 - self.profit_target),
            trade_group_id=group_id,
        )

        logger.info(
            "Covered Call ENTER | %s | call_premium=%.4f | K=%.2f | expiry=%s",
            snapshot.symbol, price, K, expiry
        )
        return group_id
