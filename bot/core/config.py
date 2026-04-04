"""Bot configuration loaded from environment variables."""

import os
from dataclasses import dataclass

from dotenv import load_dotenv

load_dotenv()


@dataclass
class Config:
    private_key: str
    proxy_wallet: str
    target_trader: str
    poll_interval: int = 30
    copy_ratio: float = 0.5
    max_trade_size: float = 50.0
    min_trade_size: float = 1.0
    slippage: float = 0.02
    chain_id: int = 137
    signature_type: int = 0
    dry_run: bool = True

    # API base URLs
    clob_url: str = "https://clob.polymarket.com"
    data_url: str = "https://data-api.polymarket.com"
    gamma_url: str = "https://gamma-api.polymarket.com"

    @classmethod
    def from_env(cls) -> "Config":
        private_key = os.environ.get("PRIVATE_KEY", "")
        if not private_key:
            raise ValueError("PRIVATE_KEY environment variable is required")

        proxy_wallet = os.environ.get("PROXY_WALLET", "")
        target_trader = os.environ.get("TARGET_TRADER", "")
        if not target_trader:
            raise ValueError("TARGET_TRADER environment variable is required")

        return cls(
            private_key=private_key,
            proxy_wallet=proxy_wallet,
            target_trader=target_trader,
            poll_interval=int(os.environ.get("POLL_INTERVAL", "30")),
            copy_ratio=float(os.environ.get("COPY_RATIO", "0.5")),
            max_trade_size=float(os.environ.get("MAX_TRADE_SIZE", "50.0")),
            min_trade_size=float(os.environ.get("MIN_TRADE_SIZE", "1.0")),
            slippage=float(os.environ.get("SLIPPAGE", "0.02")),
            chain_id=int(os.environ.get("CHAIN_ID", "137")),
            signature_type=int(os.environ.get("SIGNATURE_TYPE", "0")),
            dry_run=os.environ.get("DRY_RUN", "true").lower() == "true",
        )
