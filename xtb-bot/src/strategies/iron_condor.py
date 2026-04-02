"""
Iron Condor Strategy
=====================
Sell OTM call spread + OTM put spread simultaneously.
Profit when underlying stays range-bound (low IV environment benefits from premium decay).

Structure:
  - Short call at delta_short_call strike
  - Long call at higher strike (wing)
  - Short put at delta_short_put strike
  - Long put at lower strike (wing)

Entry: DTE ~30, IV Rank > 30%
Exit:  50% profit target, 200% loss, or 7 DTE
"""
import logging
import uuid
from typing import Optional

from src.engine.options_math import bs_price, delta_to_strike
from src.strategies.base import BaseStrategy, MarketSnapshot, StrategyConfig
from src.engine.paper_trader import PaperTrader

logger = logging.getLogger(__name__)
RISK_FREE = 0.05


class IronCondorStrategy(BaseStrategy):
    name = "iron_condor"

    def __init__(self, config: StrategyConfig, paper_trader: PaperTrader):
        super().__init__(config, paper_trader)
        self.delta_short = float(self.params.get("delta_short", 0.20))
        self.delta_long = float(self.params.get("delta_long", 0.10))
        self.dte_entry = int(self.params.get("dte_entry", 30))
        self.dte_exit = int(self.params.get("dte_exit", 7))
        self.profit_target = float(self.params.get("profit_target", 0.50))
        self.stop_loss = float(self.params.get("stop_loss", 2.0))

    async def evaluate(self, snapshot: MarketSnapshot) -> bool:
        """Enter when IV is elevated (good for premium selling) and enough DTE."""
        # Simple IV rank proxy: current IV above 0.20
        return snapshot.iv >= 0.18 and snapshot.spot > 0

    async def enter(self, snapshot: MarketSnapshot) -> Optional[str]:
        S = snapshot.spot
        iv = snapshot.iv
        T = self._dte_to_years(self.dte_entry)
        expiry = self._next_expiry(self.dte_entry)
        group_id = str(uuid.uuid4())

        # ── Call spread ──────────────────────────────────────────────────────
        K_sc = delta_to_strike(S, T, RISK_FREE, iv, self.delta_short, "call")
        K_lc = delta_to_strike(S, T, RISK_FREE, iv, self.delta_long, "call")

        price_sc = bs_price(S, K_sc, T, RISK_FREE, iv, "call")
        price_lc = bs_price(S, K_lc, T, RISK_FREE, iv, "call")

        # ── Put spread ───────────────────────────────────────────────────────
        K_sp = delta_to_strike(S, T, RISK_FREE, iv, self.delta_short, "put")
        K_lp = delta_to_strike(S, T, RISK_FREE, iv, self.delta_long, "put")

        price_sp = bs_price(S, K_sp, T, RISK_FREE, iv, "put")
        price_lp = bs_price(S, K_lp, T, RISK_FREE, iv, "put")

        net_credit = (price_sc - price_lc) + (price_sp - price_lp)
        if net_credit <= 0:
            logger.debug("Iron Condor: negative credit, skipping %s", snapshot.symbol)
            return None

        max_loss = (K_lc - K_sc) - net_credit   # width of spread minus credit
        if max_loss <= 0:
            return None

        volume = 1.0   # 1 contract unit
        sl_price_short = price_sc * (1 + self.stop_loss)
        tp_price_short = price_sc * (1 - self.profit_target)

        # Short call
        await self.paper.open_position(
            strategy=self.name, symbol=snapshot.symbol,
            option_type="call", direction="short",
            strike=round(K_sc, 2), expiry_date=expiry, dte_entry=self.dte_entry,
            entry_price=price_sc, volume=volume, premium_received=price_sc,
            sl_price=sl_price_short, tp_price=tp_price_short,
            trade_group_id=group_id,
        )
        # Long call wing
        await self.paper.open_position(
            strategy=self.name, symbol=snapshot.symbol,
            option_type="call", direction="long",
            strike=round(K_lc, 2), expiry_date=expiry, dte_entry=self.dte_entry,
            entry_price=price_lc, volume=volume,
            trade_group_id=group_id,
        )
        # Short put
        await self.paper.open_position(
            strategy=self.name, symbol=snapshot.symbol,
            option_type="put", direction="short",
            strike=round(K_sp, 2), expiry_date=expiry, dte_entry=self.dte_entry,
            entry_price=price_sp, volume=volume, premium_received=price_sp,
            sl_price=bs_price(S, K_sp, T, RISK_FREE, iv, "put") * (1 + self.stop_loss),
            tp_price=bs_price(S, K_sp, T, RISK_FREE, iv, "put") * (1 - self.profit_target),
            trade_group_id=group_id,
        )
        # Long put wing
        await self.paper.open_position(
            strategy=self.name, symbol=snapshot.symbol,
            option_type="put", direction="long",
            strike=round(K_lp, 2), expiry_date=expiry, dte_entry=self.dte_entry,
            entry_price=price_lp, volume=volume,
            trade_group_id=group_id,
        )

        logger.info(
            "Iron Condor ENTER | %s | credit=%.4f | K_sc=%.2f K_lc=%.2f K_sp=%.2f K_lp=%.2f | expiry=%s",
            snapshot.symbol, net_credit, K_sc, K_lc, K_sp, K_lp, expiry
        )
        return group_id
