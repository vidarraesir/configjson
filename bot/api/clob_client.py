"""Wrapper around py-clob-client for order placement on Polymarket."""

import logging

from py_clob_client.client import ClobClient
from py_clob_client.clob_types import OrderArgs, OrderType

from bot.core.config import Config

logger = logging.getLogger(__name__)


class TradingClient:
    """Authenticated CLOB client for placing and managing orders."""

    def __init__(self, config: Config):
        self.config = config
        self.client = ClobClient(
            config.clob_url,
            key=config.private_key,
            chain_id=config.chain_id,
            signature_type=config.signature_type,
            funder=config.proxy_wallet or None,
        )
        self._authenticated = False

    def authenticate(self):
        """Derive or create API credentials and set them on the client."""
        logger.info("Deriving API credentials...")
        creds = self.client.create_or_derive_api_creds()
        self.client.set_api_creds(creds)
        self._authenticated = True
        logger.info("Authenticated successfully.")

    def get_orderbook(self, token_id: str) -> dict:
        """Get the order book for a specific token."""
        return self.client.get_order_book(token_id)

    def get_midpoint(self, token_id: str) -> float:
        """Get the midpoint price for a token."""
        midpoint = self.client.get_midpoint(token_id)
        return float(midpoint)

    def get_last_trade_price(self, token_id: str) -> float:
        """Get last trade price for a token."""
        price = self.client.get_last_trade_price(token_id)
        return float(price)

    def place_market_order(
        self,
        token_id: str,
        side: str,
        size: float,
    ) -> dict:
        """Place a market order (FOK - Fill or Kill).

        Args:
            token_id: The condition token ID for the outcome.
            side: "BUY" or "SELL".
            size: Amount in outcome tokens.
        """
        if not self._authenticated:
            self.authenticate()

        # Get current price for market order
        midpoint = self.get_midpoint(token_id)

        # Apply slippage
        if side.upper() == "BUY":
            price = min(midpoint * (1 + self.config.slippage), 0.99)
        else:
            price = max(midpoint * (1 - self.config.slippage), 0.01)

        price = round(price, 2)

        order_args = OrderArgs(
            price=price,
            size=size,
            side=side.upper(),
            token_id=token_id,
        )

        logger.info(
            "Placing %s order: token=%s size=%.2f price=%.4f",
            side,
            token_id[:16] + "...",
            size,
            price,
        )

        signed_order = self.client.create_and_post_order(order_args)
        logger.info("Order placed: %s", signed_order)
        return signed_order

    def place_limit_order(
        self,
        token_id: str,
        side: str,
        size: float,
        price: float,
    ) -> dict:
        """Place a limit order (GTC - Good Till Cancel).

        Args:
            token_id: The condition token ID.
            side: "BUY" or "SELL".
            size: Amount in outcome tokens.
            price: Limit price (0.01 - 0.99).
        """
        if not self._authenticated:
            self.authenticate()

        price = round(max(0.01, min(0.99, price)), 2)

        order_args = OrderArgs(
            price=price,
            size=size,
            side=side.upper(),
            token_id=token_id,
        )

        signed_order = self.client.create_and_post_order(order_args)
        logger.info("Limit order placed: %s", signed_order)
        return signed_order

    def cancel_order(self, order_id: str) -> dict:
        """Cancel an open order."""
        return self.client.cancel(order_id)

    def get_open_orders(self, market: str | None = None) -> list:
        """Get all open orders, optionally filtered by market."""
        if market:
            return self.client.get_orders(market=market)
        return self.client.get_orders()
