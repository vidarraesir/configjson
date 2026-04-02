"""
Long Straddle & Short Strangle
================================
Long Straddle: Buy ATM call + put. Profits from big moves in either direction.
Short Strangle: Sell OTM call + put. Profits from low-volatility range-bound movement.

Long Straddle entry: Low IV (cheap options), expect big move (earnings/events)
Short Strangle entry: High IV, range-bound expectation
"""
import logging
import uuid
from typing import Optional

from src.engine.options_math import bs_price, delta_to_strike
from src.strategies.base import BaseStrategy, MarketSnapshot, StrategyConfig
from src.engine.paper_trader import PaperTrader

logger = logging.getLogger(__name__)
RISK_FREE = 0.05


class LongStraddleStrategy(BaseStrategy):
    name = "long_straddle"

    def __init__(self, config: StrategyConfig, paper_trader: PaperTrader):
        super().__init__(config, paper_trader)
        self.dte_entry = int(self.params.get("dte_entry", 14))
        self.dte_exit = int(self.params.get("dte_exit", 3))
        self.profit_target = float(self.params.get("profit_target", 0.30))
        self.stop_loss = float(self.params.get("stop_loss", -0.50))

    async def evaluate(self, snapshot: MarketSnapshot) -> bool:
        """Enter when IV is relatively low (cheap options)."""
        return snapshot.iv <= 0.22 and snapshot.spot > 0

    async def enter(self, snapshot: MarketSnapshot) -> Optional[str]:
        S = snapshot.spot
        iv = snapshot.iv
        T = self._dte_to_years(self.dte_entry)
        expiry = self._next_expiry(self.dte_entry)
        group_id = str(uuid.uuid4())

        # ATM straddle: strike = current spot
        K = round(S, 2)
        call_price = bs_price(S, K, T, RISK_FREE, iv, "call")
        put_price = bs_price(S, K, T, RISK_FREE, iv, "put")
        total_debit = call_price + put_price

        tp = total_debit * (1 + self.profit_target)
        sl = total_debit * (1 + self.stop_loss)   # stop_loss is negative

        await self.paper.open_position(
            strategy=self.name, symbol=snapshot.symbol,
            option_type="call", direction="long",
            strike=K, expiry_date=expiry, dte_entry=self.dte_entry,
            entry_price=call_price, volume=1.0,
            tp_price=tp, sl_price=sl,
            trade_group_id=group_id,
        )
        await self.paper.open_position(
            strategy=self.name, symbol=snapshot.symbol,
            option_type="put", direction="long",
            strike=K, expiry_date=expiry, dte_entry=self.dte_entry,
            entry_price=put_price, volume=1.0,
            tp_price=tp, sl_price=sl,
            trade_group_id=group_id,
        )

        logger.info(
            "Long Straddle ENTER | %s | debit=%.4f | K=%.2f | expiry=%s",
            snapshot.symbol, total_debit, K, expiry
        )
        return group_id


class ShortStrangleStrategy(BaseStrategy):
    name = "short_strangle"

    def __init__(self, config: StrategyConfig, paper_trader: PaperTrader):
        super().__init__(config, paper_trader)
        self.delta_call = float(self.params.get("delta_call", 0.16))
        self.delta_put = float(self.params.get("delta_put", 0.16))
        self.dte_entry = int(self.params.get("dte_entry", 45))
        self.dte_exit = int(self.params.get("dte_exit", 14))
        self.profit_target = float(self.params.get("profit_target", 0.50))
        self.stop_loss = float(self.params.get("stop_loss", 2.0))

    async def evaluate(self, snapshot: MarketSnapshot) -> bool:
        """Enter when IV is high (rich premium environment)."""
        return snapshot.iv >= 0.25 and snapshot.spot > 0

    async def enter(self, snapshot: MarketSnapshot) -> Optional[str]:
        S = snapshot.spot
        iv = snapshot.iv
        T = self._dte_to_years(self.dte_entry)
        expiry = self._next_expiry(self.dte_entry)
        group_id = str(uuid.uuid4())

        K_call = delta_to_strike(S, T, RISK_FREE, iv, self.delta_call, "call")
        K_put = delta_to_strike(S, T, RISK_FREE, iv, self.delta_put, "put")

        call_price = bs_price(S, K_call, T, RISK_FREE, iv, "call")
        put_price = bs_price(S, K_put, T, RISK_FREE, iv, "put")
        total_credit = call_price + put_price

        await self.paper.open_position(
            strategy=self.name, symbol=snapshot.symbol,
            option_type="call", direction="short",
            strike=round(K_call, 2), expiry_date=expiry, dte_entry=self.dte_entry,
            entry_price=call_price, volume=1.0, premium_received=call_price,
            sl_price=call_price * (1 + self.stop_loss),
            tp_price=call_price * (1 - self.profit_target),
            trade_group_id=group_id,
        )
        await self.paper.open_position(
            strategy=self.name, symbol=snapshot.symbol,
            option_type="put", direction="short",
            strike=round(K_put, 2), expiry_date=expiry, dte_entry=self.dte_entry,
            entry_price=put_price, volume=1.0, premium_received=put_price,
            sl_price=put_price * (1 + self.stop_loss),
            tp_price=put_price * (1 - self.profit_target),
            trade_group_id=group_id,
        )

        logger.info(
            "Short Strangle ENTER | %s | credit=%.4f | K_call=%.2f K_put=%.2f | expiry=%s",
            snapshot.symbol, total_credit, K_call, K_put, expiry
        )
        return group_id
