"""Polymarket Copy Trading Bot - Entry point."""

import argparse
import logging
import sys

from bot.core.config import Config
from bot.core.engine import CopyTradingEngine


def setup_logging(verbose: bool = False):
    level = logging.DEBUG if verbose else logging.INFO
    logging.basicConfig(
        level=level,
        format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
        handlers=[
            logging.StreamHandler(sys.stdout),
            logging.FileHandler("copytrader.log"),
        ],
    )


def cmd_run(args):
    """Run the copy trading bot."""
    setup_logging(args.verbose)
    config = Config.from_env()

    if args.dry_run is not None:
        config.dry_run = args.dry_run

    if args.target:
        config.target_trader = args.target

    engine = CopyTradingEngine(config)
    engine.start()


def cmd_positions(args):
    """Show target trader's current positions."""
    setup_logging(args.verbose)
    config = Config.from_env()

    if args.target:
        config.target_trader = args.target

    from bot.api.data_api import DataApiClient

    client = DataApiClient(config.data_url)
    positions = client.get_positions(config.target_trader)

    if not positions:
        print(f"No open positions found for {config.target_trader}")
        return

    print(f"\nPositions for {config.target_trader}:")
    print("-" * 80)
    print(f"{'Market':<50} {'Outcome':<8} {'Size':>8} {'Value':>10}")
    print("-" * 80)

    for pos in positions:
        market = pos.get("title", pos.get("market", ""))[:48]
        outcome = pos.get("outcome", "?")
        size = float(pos.get("size", 0))
        value = float(pos.get("currentValue", 0))
        if size > 0:
            print(f"{market:<50} {outcome:<8} {size:>8.2f} ${value:>9.2f}")

    client.close()


def cmd_trades(args):
    """Show target trader's recent trades."""
    setup_logging(args.verbose)
    config = Config.from_env()

    if args.target:
        config.target_trader = args.target

    from bot.api.data_api import DataApiClient

    client = DataApiClient(config.data_url)
    trades = client.get_trades(config.target_trader, limit=args.limit)

    if not trades:
        print(f"No recent trades for {config.target_trader}")
        return

    print(f"\nRecent trades for {config.target_trader}:")
    print("-" * 90)
    print(f"{'Timestamp':<22} {'Side':<6} {'Outcome':<8} {'Size':>8} {'Price':>8} {'Market':<30}")
    print("-" * 90)

    for t in trades:
        ts = t.get("timestamp", "")[:19]
        side = t.get("side", "?")
        outcome = t.get("outcome", "?")
        size = float(t.get("size", 0))
        price = float(t.get("price", 0))
        market = t.get("title", t.get("market", ""))[:28]
        print(f"{ts:<22} {side:<6} {outcome:<8} {size:>8.2f} {price:>8.4f} {market:<30}")

    client.close()


def main():
    parser = argparse.ArgumentParser(
        description="Polymarket Copy Trading Bot",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""\
Examples:
  python -m bot.main run                     # Start bot (dry run by default)
  python -m bot.main run --live              # Start bot with real trades
  python -m bot.main run --target 0xABC...   # Copy a specific trader
  python -m bot.main positions               # Show target's positions
  python -m bot.main trades --limit 20       # Show target's recent trades
""",
    )
    parser.add_argument("-v", "--verbose", action="store_true", help="Enable debug logging")
    parser.add_argument("--target", type=str, help="Override target trader address")

    subparsers = parser.add_subparsers(dest="command", help="Command to run")

    # Run command
    run_parser = subparsers.add_parser("run", help="Start copy trading bot")
    run_parser.add_argument("--live", dest="dry_run", action="store_false", default=None,
                            help="Execute real trades (disables dry run)")
    run_parser.add_argument("--dry-run", dest="dry_run", action="store_true", default=None,
                            help="Simulate trades without executing")
    run_parser.set_defaults(func=cmd_run)

    # Positions command
    pos_parser = subparsers.add_parser("positions", help="View target trader positions")
    pos_parser.set_defaults(func=cmd_positions)

    # Trades command
    trades_parser = subparsers.add_parser("trades", help="View target trader trades")
    trades_parser.add_argument("--limit", type=int, default=10, help="Number of trades to show")
    trades_parser.set_defaults(func=cmd_trades)

    args = parser.parse_args()

    if not args.command:
        parser.print_help()
        sys.exit(1)

    args.func(args)


if __name__ == "__main__":
    main()
