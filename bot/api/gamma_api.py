"""Polymarket Gamma API client for market discovery."""

import logging

import httpx

logger = logging.getLogger(__name__)


class GammaApiClient:
    """Client for Polymarket Gamma API (market metadata, no auth)."""

    def __init__(self, base_url: str = "https://gamma-api.polymarket.com"):
        self.base_url = base_url.rstrip("/")
        self.http = httpx.Client(timeout=30, headers={"Accept": "application/json"})

    def get_market(self, condition_id: str) -> dict:
        """Get market details by condition ID."""
        resp = self.http.get(f"{self.base_url}/markets/{condition_id}")
        resp.raise_for_status()
        return resp.json()

    def search_markets(self, query: str, limit: int = 10) -> list[dict]:
        """Search markets by keyword."""
        params = {"query": query, "limit": limit}
        resp = self.http.get(f"{self.base_url}/markets", params=params)
        resp.raise_for_status()
        return resp.json()

    def get_event(self, event_id: str) -> dict:
        """Get event details."""
        resp = self.http.get(f"{self.base_url}/events/{event_id}")
        resp.raise_for_status()
        return resp.json()

    def close(self):
        self.http.close()
