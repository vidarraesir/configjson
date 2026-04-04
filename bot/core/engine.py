"""Copy trading engine - monitors a target trader and mirrors their trades."""

import logging
import time
from dataclasses import dataclass, field

from bot.api.clob_client import TradingClient
from bot.api.data_api import DataApiClient
from bot.api.gamma_api import GammaApiClient
from bot.core.config import Config

logger = logging.getLogger(__name__)


@dataclass
class TradeRecord:
    """Record of a trade we've already processed."""
    trade_id: str
    market: str
    side: str
    size: float
    price: float
    timestamp: str


class CopyTradingEngine:
    """Main engine that polls a target trader's activity and copies trades."""

    def __init__(self, config: Config):
        self.config = config
        self.data_api = DataApiClient(config.data_url)
        self.gamma_api = GammaApiClient(config.gamma_url)
        self.trading_client = TradingClient(config)

        # Track which trades we've already processed to avoid duplicates
        self.processed_trades: set[str] = set()
        self.trade_history: list[TradeRecord] = []
        self.running = False

    def start(self):
        """Start the copy trading loop."""
        logger.info("=" * 60)
        logger.info("Polymarket Copy Trading Bot")
        logger.info("=" * 60)
        logger.info("Target trader: %s", self.config.target_trader)
        logger.info("Copy ratio:    %.0f%%", self.config.copy_ratio * 100)
        logger.info("Max trade:     $%.2f", self.config.max_trade_size)
        logger.info("Min trade:     $%.2f", self.config.min_trade_size)
        logger.info("Poll interval: %ds", self.config.poll_interval)
        logger.info("Dry run:       %s", self.config.dry_run)
        logger.info("Slippage:      %.1f%%", self.config.slippage * 100)
        logger.info("=" * 60)

        if not self.config.dry_run:
            self.trading_client.authenticate()

        # Load initial trades so we don't copy old history
        self._initialize_trade_history()

        self.running = True
        logger.info("Bot started. Monitoring trades...")

        while self.running:
            try:
                self._poll_and_copy()
            except KeyboardInterrupt:
                logger.info("Shutting down...")
                self.running = False
                break
            except Exception as e:
                logger.error("Error during poll cycle: %s", e, exc_info=True)

            time.sleep(self.config.poll_interval)

        self._shutdown()

    def stop(self):
        """Stop the copy trading loop."""
        self.running = False

    def _initialize_trade_history(self):
        """Load existing trades to avoid re-copying old positions."""
        logger.info("Loading existing trade history for target trader...")
        try:
            trades = self.data_api.get_trades(
                user=self.config.target_trader,
                limit=100,
            )
            for trade in trades:
                trade_id = self._get_trade_id(trade)
                self.processed_trades.add(trade_id)

            logger.info(
                "Loaded %d existing trades (will be skipped).",
                len(self.processed_trades),
            )
        except Exception as e:
            logger.warning("Could not load trade history: %s", e)

    def _poll_and_copy(self):
        """Single poll cycle: check for new trades and copy them."""
        trades = self.data_api.get_trades(
            user=self.config.target_trader,
            limit=20,
        )

        new_trades = []
        for trade in trades:
            trade_id = self._get_trade_id(trade)
            if trade_id not in self.processed_trades:
                new_trades.append(trade)
                self.processed_trades.add(trade_id)

        if not new_trades:
            return

        logger.info("Found %d new trade(s) to copy!", len(new_trades))

        for trade in new_trades:
            self._copy_trade(trade)

    def _copy_trade(self, trade: dict):
        """Copy a single trade from the target trader."""
        try:
            side = trade.get("side", "").upper()
            asset = trade.get("asset", "")
            market = trade.get("market", "")
            original_size = float(trade.get("size", 0))
            price = float(trade.get("price", 0))
            outcome = trade.get("outcome", "")

            # Calculate our position size
            copy_size = original_size * self.config.copy_ratio
            trade_value = copy_size * price

            # Apply size limits
            if trade_value < self.config.min_trade_size:
                logger.info(
                    "Skipping trade (too small): %s %s %.2f @ %.4f ($%.2f < $%.2f min)",
                    side, outcome, copy_size, price, trade_value, self.config.min_trade_size,
                )
                return

            if trade_value > self.config.max_trade_size:
                # Scale down to max trade size
                copy_size = self.config.max_trade_size / price
                trade_value = self.config.max_trade_size
                logger.info("Capped trade to max size: $%.2f", trade_value)

            # Try to get market info for logging
            market_name = market
            try:
                market_info = self.gamma_api.get_market(market)
                market_name = market_info.get("question", market)
            except Exception:
                pass

            logger.info("-" * 50)
            logger.info("COPYING TRADE:")
            logger.info("  Market:   %s", market_name)
            logger.info("  Outcome:  %s", outcome)
            logger.info("  Side:     %s", side)
            logger.info("  Original: %.2f tokens @ $%.4f", original_size, price)
            logger.info("  Our size: %.2f tokens @ ~$%.4f ($%.2f)", copy_size, price, trade_value)

            if self.config.dry_run:
                logger.info("  [DRY RUN] Trade NOT executed.")
            else:
                result = self.trading_client.place_market_order(
                    token_id=asset,
                    side=side,
                    size=round(copy_size, 2),
                )
                logger.info("  Order result: %s", result)

            # Record the trade
            self.trade_history.append(TradeRecord(
                trade_id=self._get_trade_id(trade),
                market=market,
                side=side,
                size=copy_size,
                price=price,
                timestamp=trade.get("timestamp", ""),
            ))

        except Exception as e:
            logger.error("Failed to copy trade: %s", e, exc_info=True)

    def _get_trade_id(self, trade: dict) -> str:
        """Generate a unique ID for a trade to avoid duplicates."""
        return (
            trade.get("id", "")
            or f"{trade.get('transactionHash', '')}_{trade.get('asset', '')}_{trade.get('timestamp', '')}"
        )

    def get_stats(self) -> dict:
        """Get bot statistics."""
        total_value = sum(t.size * t.price for t in self.trade_history)
        return {
            "total_trades_copied": len(self.trade_history),
            "total_value_traded": round(total_value, 2),
            "trades_monitored": len(self.processed_trades),
            "target_trader": self.config.target_trader,
            "dry_run": self.config.dry_run,
        }

    def _shutdown(self):
        """Clean shutdown."""
        stats = self.get_stats()
        logger.info("=" * 60)
        logger.info("Bot stopped. Session stats:")
        logger.info("  Trades copied:  %d", stats["total_trades_copied"])
        logger.info("  Total value:    $%.2f", stats["total_value_traded"])
        logger.info("=" * 60)
        self.data_api.close()
        self.gamma_api.close()
