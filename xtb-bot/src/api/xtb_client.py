"""
XTB xAPI WebSocket client.
Docs: http://developers.xstore.pro/documentation/
"""
import asyncio
import json
import logging
import ssl
import time
from typing import Any, Callable, Dict, Optional

import websockets
from websockets.exceptions import ConnectionClosed

logger = logging.getLogger(__name__)

# ── Constants ────────────────────────────────────────────────────────────────
DEMO_HOST = "xapi.xtb.com"
REAL_HOST = "xapi.xtb.com"
DEMO_MAIN_PORT = 5124
DEMO_STREAM_PORT = 5125
REAL_MAIN_PORT = 5112
REAL_STREAM_PORT = 5113

CMD_BUY = 0
CMD_SELL = 1
CMD_BUY_LIMIT = 2
CMD_SELL_LIMIT = 3
CMD_BUY_STOP = 4
CMD_SELL_STOP = 5

TRADE_OPEN = 0
TRADE_CLOSE = 2

PERIOD_M1 = 1
PERIOD_M5 = 5
PERIOD_M15 = 15
PERIOD_M30 = 30
PERIOD_H1 = 60
PERIOD_H4 = 240
PERIOD_D1 = 1440
PERIOD_W1 = 10080
PERIOD_MN1 = 43200


class XTBClient:
    """Async XTB xAPI client (main connection)."""

    def __init__(self, user: str, password: str, demo: bool = True):
        self.user = user
        self.password = password
        self.demo = demo
        self._ws: Optional[websockets.WebSocketClientProtocol] = None
        self._stream_ws: Optional[websockets.WebSocketClientProtocol] = None
        self._stream_session_id: Optional[str] = None
        self._connected = False
        self._request_id = 0
        self._stream_callbacks: Dict[str, list[Callable]] = {}

        # SSL: disable verification to avoid issues on Windows with corporate certs
        self._ssl_ctx = ssl.create_default_context()
        self._ssl_ctx.check_hostname = False
        self._ssl_ctx.verify_mode = ssl.CERT_NONE

    @property
    def _host(self) -> str:
        return DEMO_HOST if self.demo else REAL_HOST

    @property
    def _main_port(self) -> int:
        return DEMO_MAIN_PORT if self.demo else REAL_MAIN_PORT

    @property
    def _stream_port(self) -> int:
        return DEMO_STREAM_PORT if self.demo else REAL_STREAM_PORT

    @property
    def _main_url(self) -> str:
        return f"wss://{self._host}:{self._main_port}"

    @property
    def _stream_url(self) -> str:
        return f"wss://{self._host}:{self._stream_port}"

    # ── Connection ───────────────────────────────────────────────────────────

    async def connect(self) -> bool:
        """Connect and authenticate. Tries multiple connection strategies."""
        # Try with SSL disabled verify first (common fix on Windows), then strict
        attempts = [
            {"ssl": self._ssl_ctx, "open_timeout": 15},
            {"ssl": True,          "open_timeout": 15},
        ]
        for kwargs in attempts:
            try:
                logger.info("Connecting to XTB %s at %s", "DEMO" if self.demo else "REAL", self._main_url)
                self._ws = await websockets.connect(
                    self._main_url,
                    ping_interval=None,
                    close_timeout=10,
                    **kwargs,
                )
                resp = await asyncio.wait_for(
                    self._send({"command": "login", "arguments": {"userId": self.user, "password": self.password}}),
                    timeout=15,
                )
                if resp.get("status") is True:
                    self._stream_session_id = resp.get("streamSessionId")
                    self._connected = True
                    logger.info("XTB login successful. StreamSessionId: %s", self._stream_session_id)
                    return True
                logger.error("XTB login failed: %s", resp)
                return False
            except Exception as exc:
                logger.warning("XTB connect attempt failed (%s): %s", kwargs.get("ssl"), exc)
        logger.error("XTB all connection attempts failed")
        return False

    async def disconnect(self) -> None:
        if self._ws:
            try:
                await self._send({"command": "logout"})
            except Exception:
                pass
            await self._ws.close()
        if self._stream_ws:
            await self._stream_ws.close()
        self._connected = False
        logger.info("XTB disconnected.")

    async def _send(self, payload: Dict) -> Dict:
        """Send a command and await its response."""
        if not self._ws:
            raise RuntimeError("Not connected to XTB")
        await self._ws.send(json.dumps(payload))
        raw = await self._ws.recv()
        return json.loads(raw)

    # ── Market data ─────────────────────────────────────────────────────────

    async def get_symbol(self, symbol: str) -> Dict:
        resp = await self._send({"command": "getSymbol", "arguments": {"symbol": symbol}})
        return resp.get("returnData", {})

    async def get_all_symbols(self) -> list[Dict]:
        resp = await self._send({"command": "getAllSymbols"})
        return resp.get("returnData", [])

    async def get_chart_last(self, symbol: str, period: int, start_ms: int) -> list[Dict]:
        """Return OHLCV candles from start_ms (UTC ms) to now."""
        resp = await self._send({
            "command": "getChartLastRequest",
            "arguments": {
                "info": {
                    "period": period,
                    "start": start_ms,
                    "symbol": symbol,
                }
            }
        })
        data = resp.get("returnData", {})
        rate_infos = data.get("rateInfos", [])
        digits = data.get("digits", 5)
        factor = 10 ** digits
        candles = []
        for r in rate_infos:
            candles.append({
                "time": r["ctm"],
                "open": r["open"] / factor,
                "high": (r["open"] + r["high"]) / factor,
                "low": (r["open"] + r["low"]) / factor,
                "close": (r["open"] + r["close"]) / factor,
                "volume": r["vol"],
            })
        return candles

    async def get_tick_prices(self, symbols: list[str], level: int = 0) -> list[Dict]:
        resp = await self._send({
            "command": "getTickPrices",
            "arguments": {
                "level": level,
                "symbols": symbols,
                "timestamp": int(time.time() * 1000),
            }
        })
        return resp.get("returnData", {}).get("quotations", [])

    # ── Account ──────────────────────────────────────────────────────────────

    async def get_balance(self) -> Dict:
        resp = await self._send({"command": "getMarginLevel"})
        return resp.get("returnData", {})

    async def get_trades(self, opened_only: bool = True) -> list[Dict]:
        resp = await self._send({"command": "getTrades", "arguments": {"openedOnly": opened_only}})
        return resp.get("returnData", [])

    async def get_trade_history(self, start_ms: int, end_ms: int = 0) -> list[Dict]:
        resp = await self._send({
            "command": "getTradesHistory",
            "arguments": {"end": end_ms, "start": start_ms}
        })
        return resp.get("returnData", [])

    # ── Trading ──────────────────────────────────────────────────────────────

    async def open_trade(
        self,
        symbol: str,
        cmd: int,
        volume: float,
        price: float,
        sl: float = 0.0,
        tp: float = 0.0,
        comment: str = "",
        expiration: int = 0,
    ) -> Dict:
        """Open a trade. Returns tradeTransactionStatus response."""
        resp = await self._send({
            "command": "tradeTransaction",
            "arguments": {
                "tradeTransInfo": {
                    "cmd": cmd,
                    "customComment": comment,
                    "expiration": expiration,
                    "offset": 0,
                    "order": 0,
                    "price": price,
                    "sl": sl,
                    "symbol": symbol,
                    "tp": tp,
                    "type": TRADE_OPEN,
                    "volume": volume,
                }
            }
        })
        if resp.get("status") is True:
            order_id = resp["returnData"]["order"]
            return await self._check_trade_status(order_id)
        return resp

    async def close_trade(self, order: int, symbol: str, cmd: int, volume: float, price: float) -> Dict:
        close_cmd = CMD_SELL if cmd == CMD_BUY else CMD_BUY
        resp = await self._send({
            "command": "tradeTransaction",
            "arguments": {
                "tradeTransInfo": {
                    "cmd": close_cmd,
                    "customComment": "bot_close",
                    "expiration": 0,
                    "offset": 0,
                    "order": order,
                    "price": price,
                    "sl": 0,
                    "symbol": symbol,
                    "tp": 0,
                    "type": TRADE_CLOSE,
                    "volume": volume,
                }
            }
        })
        if resp.get("status") is True:
            order_id = resp["returnData"]["order"]
            return await self._check_trade_status(order_id)
        return resp

    async def _check_trade_status(self, order: int, retries: int = 10) -> Dict:
        for _ in range(retries):
            await asyncio.sleep(0.5)
            resp = await self._send({"command": "tradeTransactionStatus", "arguments": {"order": order}})
            data = resp.get("returnData", {})
            # requestStatus: 0=error, 1=pending, 3=accepted, 4=rejected
            if data.get("requestStatus") not in (1,):
                return data
        return {"requestStatus": -1, "message": "Timeout waiting for trade status"}

    # ── Streaming ────────────────────────────────────────────────────────────

    async def start_streaming(self, on_tick: Optional[Callable] = None, symbols: Optional[list[str]] = None) -> None:
        """Open streaming connection and subscribe to ticks."""
        if not self._stream_session_id:
            raise RuntimeError("Must be logged in before streaming")
        self._stream_ws = await websockets.connect(
            self._stream_url,
            ssl=self._ssl_ctx,
            ping_interval=30,
        )
        if symbols:
            for sym in symbols:
                await self._stream_ws.send(json.dumps({
                    "command": "getTickPrices",
                    "streamSessionId": self._stream_session_id,
                    "symbol": sym,
                    "minArrivalTime": 1000,
                }))
        asyncio.create_task(self._stream_reader(on_tick))

    async def _stream_reader(self, on_tick: Optional[Callable]) -> None:
        try:
            async for raw in self._stream_ws:
                msg = json.loads(raw)
                command = msg.get("command")
                data = msg.get("data", {})
                if command == "tickPrices" and on_tick:
                    await on_tick(data) if asyncio.iscoroutinefunction(on_tick) else on_tick(data)
        except ConnectionClosed:
            logger.warning("Stream connection closed")
        except Exception as exc:
            logger.error("Stream error: %s", exc)

    # ── Utility ──────────────────────────────────────────────────────────────

    @property
    def is_connected(self) -> bool:
        return self._connected
