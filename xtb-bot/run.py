#!/usr/bin/env python3
"""
Entry point for the XTB Options Bot.

Usage:
  python run.py                    # Start with default config (port 8080)
  python run.py --port 9090        # Custom port
  python run.py --host 127.0.0.1   # Localhost only
  python run.py --reload           # Dev mode with auto-reload
"""
import argparse
import os
import sys
from pathlib import Path

# Ensure project root is on the path
sys.path.insert(0, str(Path(__file__).parent))

import uvicorn


def main():
    parser = argparse.ArgumentParser(description="XTB Options Bot")
    parser.add_argument("--host", default="0.0.0.0")
    parser.add_argument("--port", type=int, default=8080)
    parser.add_argument("--reload", action="store_true")
    parser.add_argument("--log-level", default="info")
    args = parser.parse_args()

    print(f"""
╔══════════════════════════════════════════════════════════╗
║          XTB Options Bot  ─  Paper Trading Mode          ║
╠══════════════════════════════════════════════════════════╣
║  Dashboard : http://{args.host}:{args.port:<5}                    ║
║  API docs  : http://{args.host}:{args.port}/docs               ║
╠══════════════════════════════════════════════════════════╣
║  Set XTB_USER and XTB_PASSWORD in .env to connect       ║
║  Without credentials: OFFLINE SIMULATION mode           ║
╚══════════════════════════════════════════════════════════╝
""")

    uvicorn.run(
        "src.main:app",
        host=args.host,
        port=args.port,
        reload=args.reload,
        log_level=args.log_level,
    )


if __name__ == "__main__":
    main()
