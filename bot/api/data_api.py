"""Polymarket Data API client for tracking trader activity and positions."""

import logging
from dataclasses import dataclass

import httpx

logger = logging.getLogger(__name__)


@dataclass
class Trade:
    id: str
    market: str
    asset: str
    side: str  # "BUY" or "SELL"
    size: float
    price: float
    timestamp: str
    outcome: str  # "Yes" or "No"
    transaction_hash: str


@dataclass
class Position:
    market: str
    asset: str
    outcome: str
    size: float
    avg_price: float
    current_value: float


class DataApiClient:
    """Client for Polymarket Data API (read-only, no auth required)."""

    def __init__(self, base_url: str = "https://data-api.polymarket.com"):
        self.base_url = base_url.rstrip("/")
        self.http = httpx.Client(timeout=30, headers={"Accept": "application/json"})

    def get_trades(
        self,
        user: str,
        limit: int = 50,
        offset: int = 0,
        market: str | None = None,
    ) -> list[dict]:
        """Fetch recent trades for a user address."""
        params: dict = {
            "user": user.lower(),
            "limit": limit,
            "offset": offset,
        }
        if market:
            params["market"] = market

        resp = self.http.get(f"{self.base_url}/trades", params=params)
        resp.raise_for_status()
        return resp.json()

    def get_activity(
        self,
        user: str,
        limit: int = 50,
        offset: int = 0,
        activity_type: str | None = None,
    ) -> list[dict]:
        """Fetch on-chain activity (trades, splits, merges, redemptions)."""
        params: dict = {
            "user": user.lower(),
            "limit": limit,
            "offset": offset,
        }
        if activity_type:
            params["type"] = activity_type

        resp = self.http.get(f"{self.base_url}/activity", params=params)
        resp.raise_for_status()
        return resp.json()

    def get_positions(
        self,
        user: str,
        market: str | None = None,
    ) -> list[dict]:
        """Fetch current open positions for a user."""
        params: dict = {"user": user.lower()}
        if market:
            params["market"] = market

        resp = self.http.get(f"{self.base_url}/positions", params=params)
        resp.raise_for_status()
        return resp.json()

    def get_portfolio_value(self, user: str) -> dict:
        """Fetch total portfolio value in USD."""
        params = {"user": user.lower()}
        resp = self.http.get(f"{self.base_url}/value", params=params)
        resp.raise_for_status()
        return resp.json()

    def close(self):
        self.http.close()
