"""
Bull Put Spread (Credit Put Spread)
=====================================
Sell OTM put + buy lower-strike put.
Profit when underlying stays flat or rises (bullish-neutral bias).

Entry: Bullish bias signal (price above 20-day MA), IV rank > 25%
Exit:  60% profit, 150% loss, or 5 DTE
"""
import logging
import uuid
from typing import Optional

from src.engine.options_math import bs_price, delta_to_strike
from src.strategies.base import BaseStrategy, MarketSnapshot, StrategyConfig
from src.engine.paper_trader import PaperTrader

logger = logging.getLogger(__name__)
RISK_FREE = 0.05


class BullPutSpreadStrategy(BaseStrategy):
    name = "bull_put_spread"

    def __init__(self, config: StrategyConfig, paper_trader: PaperTrader):
        super().__init__(config, paper_trader)
        self.delta_short = float(self.params.get("delta_short", 0.30))
        self.delta_long = float(self.params.get("delta_long", 0.15))
        self.dte_entry = int(self.params.get("dte_entry", 21))
        self.dte_exit = int(self.params.get("dte_exit", 5))
        self.profit_target = float(self.params.get("profit_target", 0.60))
        self.stop_loss = float(self.params.get("stop_loss", 1.5))

    async def evaluate(self, snapshot: MarketSnapshot) -> bool:
        """Bullish signal: price above 20-day SMA and IV sufficient for credit."""
        prices = snapshot.prices
        if len(prices) < 20:
            return False
        sma20 = sum(prices[-20:]) / 20
        return snapshot.spot > sma20 and snapshot.iv >= 0.15

    async def enter(self, snapshot: MarketSnapshot) -> Optional[str]:
        S = snapshot.spot
        iv = snapshot.iv
        T = self._dte_to_years(self.dte_entry)
        expiry = self._next_expiry(self.dte_entry)
        group_id = str(uuid.uuid4())

        K_short = delta_to_strike(S, T, RISK_FREE, iv, self.delta_short, "put")
        K_long = delta_to_strike(S, T, RISK_FREE, iv, self.delta_long, "put")

        if K_long >= K_short:
            logger.debug("Bull Put Spread: invalid strikes, skipping %s", snapshot.symbol)
            return None

        price_short = bs_price(S, K_short, T, RISK_FREE, iv, "put")
        price_long = bs_price(S, K_long, T, RISK_FREE, iv, "put")

        net_credit = price_short - price_long
        if net_credit <= 0:
            return None

        volume = 1.0
        sl_short = price_short * (1 + self.stop_loss)
        tp_short = price_short * (1 - self.profit_target)

        await self.paper.open_position(
            strategy=self.name, symbol=snapshot.symbol,
            option_type="put", direction="short",
            strike=round(K_short, 2), expiry_date=expiry, dte_entry=self.dte_entry,
            entry_price=price_short, volume=volume, premium_received=price_short,
            sl_price=sl_short, tp_price=tp_short,
            trade_group_id=group_id,
        )
        await self.paper.open_position(
            strategy=self.name, symbol=snapshot.symbol,
            option_type="put", direction="long",
            strike=round(K_long, 2), expiry_date=expiry, dte_entry=self.dte_entry,
            entry_price=price_long, volume=volume,
            trade_group_id=group_id,
        )

        logger.info(
            "Bull Put Spread ENTER | %s | credit=%.4f | K_short=%.2f K_long=%.2f | expiry=%s",
            snapshot.symbol, net_credit, K_short, K_long, expiry
        )
        return group_id


class BearCallSpreadStrategy(BaseStrategy):
    """Bear Call Spread (Credit Call Spread) – mirror of bull put spread."""
    name = "bear_call_spread"

    def __init__(self, config: StrategyConfig, paper_trader: PaperTrader):
        super().__init__(config, paper_trader)
        self.delta_short = float(self.params.get("delta_short", 0.30))
        self.delta_long = float(self.params.get("delta_long", 0.15))
        self.dte_entry = int(self.params.get("dte_entry", 21))
        self.dte_exit = int(self.params.get("dte_exit", 5))
        self.profit_target = float(self.params.get("profit_target", 0.60))
        self.stop_loss = float(self.params.get("stop_loss", 1.5))

    async def evaluate(self, snapshot: MarketSnapshot) -> bool:
        """Bearish signal: price below 20-day SMA."""
        prices = snapshot.prices
        if len(prices) < 20:
            return False
        sma20 = sum(prices[-20:]) / 20
        return snapshot.spot < sma20 and snapshot.iv >= 0.15

    async def enter(self, snapshot: MarketSnapshot) -> Optional[str]:
        S = snapshot.spot
        iv = snapshot.iv
        T = self._dte_to_years(self.dte_entry)
        expiry = self._next_expiry(self.dte_entry)
        group_id = str(uuid.uuid4())

        K_short = delta_to_strike(S, T, RISK_FREE, iv, self.delta_short, "call")
        K_long = delta_to_strike(S, T, RISK_FREE, iv, self.delta_long, "call")

        if K_long <= K_short:
            return None

        price_short = bs_price(S, K_short, T, RISK_FREE, iv, "call")
        price_long = bs_price(S, K_long, T, RISK_FREE, iv, "call")
        net_credit = price_short - price_long
        if net_credit <= 0:
            return None

        volume = 1.0
        await self.paper.open_position(
            strategy=self.name, symbol=snapshot.symbol,
            option_type="call", direction="short",
            strike=round(K_short, 2), expiry_date=expiry, dte_entry=self.dte_entry,
            entry_price=price_short, volume=volume, premium_received=price_short,
            sl_price=price_short * (1 + self.stop_loss),
            tp_price=price_short * (1 - self.profit_target),
            trade_group_id=group_id,
        )
        await self.paper.open_position(
            strategy=self.name, symbol=snapshot.symbol,
            option_type="call", direction="long",
            strike=round(K_long, 2), expiry_date=expiry, dte_entry=self.dte_entry,
            entry_price=price_long, volume=volume,
            trade_group_id=group_id,
        )

        logger.info(
            "Bear Call Spread ENTER | %s | credit=%.4f | K_short=%.2f K_long=%.2f | expiry=%s",
            snapshot.symbol, net_credit, K_short, K_long, expiry
        )
        return group_id
