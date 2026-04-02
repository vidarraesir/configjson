"""
XTB xAPI WebSocket client.
Docs: http://developers.xstore.pro/documentation/

Uses aiohttp for WebSocket connections (more robust on Windows + 2FA accounts).
"""
import asyncio
import json
import logging
import ssl
import time
from typing import Any, Callable, Dict, List, Optional

import aiohttp

logger = logging.getLogger(__name__)

# ── Constants ────────────────────────────────────────────────────────────────
DEMO_HOST = "xapi.xtb.com"
REAL_HOST = "xapi.xtb.com"
DEMO_MAIN_PORT  = 5124
DEMO_STREAM_PORT = 5125
REAL_MAIN_PORT  = 5112
REAL_STREAM_PORT = 5113

CMD_BUY       = 0
CMD_SELL      = 1
CMD_BUY_LIMIT = 2
CMD_SELL_LIMIT = 3
CMD_BUY_STOP  = 4
CMD_SELL_STOP = 5

TRADE_OPEN  = 0
TRADE_CLOSE = 2

PERIOD_M1  = 1
PERIOD_M5  = 5
PERIOD_M15 = 15
PERIOD_M30 = 30
PERIOD_H1  = 60
PERIOD_H4  = 240
PERIOD_D1  = 1440
PERIOD_W1  = 10080
PERIOD_MN1 = 43200


def _make_ssl() -> ssl.SSLContext:
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE
    return ctx


class XTBClient:
    """Async XTB xAPI client using aiohttp WebSockets."""

    def __init__(self, user: str, password: str, demo: bool = True):
        self.user = user
        self.password = password
        self.demo = demo
        self._session: Optional[aiohttp.ClientSession] = None
        self._ws: Optional[aiohttp.ClientWebSocketResponse] = None
        self._stream_ws: Optional[aiohttp.ClientWebSocketResponse] = None
        self._stream_session_id: Optional[str] = None
        self._connected = False
        self._ssl = _make_ssl()
        self._lock = asyncio.Lock()

    # ── URLs ─────────────────────────────────────────────────────────────────

    @property
    def _main_url(self) -> str:
        port = DEMO_MAIN_PORT if self.demo else REAL_MAIN_PORT
        return f"wss://{DEMO_HOST}:{port}"

    @property
    def _stream_url(self) -> str:
        port = DEMO_STREAM_PORT if self.demo else REAL_STREAM_PORT
        return f"wss://{DEMO_HOST}:{port}"

    # ── Connection ────────────────────────────────────────────────────────────

    async def connect(self) -> bool:
        """Connect and authenticate via aiohttp WebSocket."""
        mode = "DEMO" if self.demo else "REAL"
        logger.info("Connecting to XTB %s at %s", mode, self._main_url)

        # Create a new aiohttp session with permissive SSL
        connector = aiohttp.TCPConnector(ssl=self._ssl)
        self._session = aiohttp.ClientSession(connector=connector)

        try:
            self._ws = await self._session.ws_connect(
                self._main_url,
                ssl=self._ssl,
                heartbeat=30,
                timeout=aiohttp.ClientTimeout(total=20, connect=10),
            )
        except Exception as exc:
            logger.error("WebSocket connect failed: %s", exc)
            await self._cleanup_session()
            return False

        # Login
        try:
            resp = await self._send({
                "command": "login",
                "arguments": {"userId": self.user, "password": self.password},
            })
        except Exception as exc:
            logger.error("Login send failed: %s", exc)
            await self._cleanup_session()
            return False

        if resp.get("status") is True:
            self._stream_session_id = resp.get("streamSessionId")
            self._connected = True
            logger.info("XTB login successful. StreamSessionId: %s", self._stream_session_id)
            return True

        err_code = resp.get("errorCode", "")
        err_desc = resp.get("errorDescr", str(resp))
        logger.error("XTB login failed [%s]: %s", err_code, err_desc)
        await self._cleanup_session()
        return False

    async def _cleanup_session(self):
        if self._ws and not self._ws.closed:
            await self._ws.close()
        if self._session and not self._session.closed:
            await self._session.close()
        self._connected = False

    async def disconnect(self) -> None:
        try:
            await self._send({"command": "logout"})
        except Exception:
            pass
        await self._cleanup_session()
        logger.info("XTB disconnected.")

    # ── Send / receive ────────────────────────────────────────────────────────

    async def _send(self, payload: Dict) -> Dict:
        if not self._ws:
            raise RuntimeError("Not connected to XTB")
        async with self._lock:
            await self._ws.send_str(json.dumps(payload))
            msg = await asyncio.wait_for(self._ws.receive(), timeout=15)
        if msg.type == aiohttp.WSMsgType.TEXT:
            return json.loads(msg.data)
        if msg.type == aiohttp.WSMsgType.ERROR:
            raise RuntimeError(f"WS error: {msg.data}")
        if msg.type in (aiohttp.WSMsgType.CLOSE, aiohttp.WSMsgType.CLOSED):
            self._connected = False
            raise RuntimeError("WS connection closed")
        return {}

    # ── Market data ───────────────────────────────────────────────────────────

    async def get_symbol(self, symbol: str) -> Dict:
        resp = await self._send({"command": "getSymbol", "arguments": {"symbol": symbol}})
        return resp.get("returnData", {})

    async def get_all_symbols(self) -> List[Dict]:
        resp = await self._send({"command": "getAllSymbols"})
        return resp.get("returnData", [])

    async def get_chart_last(self, symbol: str, period: int, start_ms: int) -> List[Dict]:
        """Return OHLCV candles from start_ms (UTC ms) to now."""
        resp = await self._send({
            "command": "getChartLastRequest",
            "arguments": {
                "info": {"period": period, "start": start_ms, "symbol": symbol}
            }
        })
        data = resp.get("returnData", {})
        rate_infos = data.get("rateInfos", [])
        digits = data.get("digits", 5)
        factor = 10 ** digits
        candles = []
        for r in rate_infos:
            candles.append({
                "time":   r["ctm"],
                "open":   r["open"] / factor,
                "high":   (r["open"] + r["high"])  / factor,
                "low":    (r["open"] + r["low"])   / factor,
                "close":  (r["open"] + r["close"]) / factor,
                "volume": r["vol"],
            })
        return candles

    async def get_tick_prices(self, symbols: List[str], level: int = 0) -> List[Dict]:
        resp = await self._send({
            "command": "getTickPrices",
            "arguments": {
                "level": level,
                "symbols": symbols,
                "timestamp": int(time.time() * 1000),
            }
        })
        return resp.get("returnData", {}).get("quotations", [])

    # ── Account ───────────────────────────────────────────────────────────────

    async def get_balance(self) -> Dict:
        resp = await self._send({"command": "getMarginLevel"})
        return resp.get("returnData", {})

    async def get_trades(self, opened_only: bool = True) -> List[Dict]:
        resp = await self._send({"command": "getTrades", "arguments": {"openedOnly": opened_only}})
        return resp.get("returnData", [])

    async def get_trade_history(self, start_ms: int, end_ms: int = 0) -> List[Dict]:
        resp = await self._send({
            "command": "getTradesHistory",
            "arguments": {"end": end_ms, "start": start_ms}
        })
        return resp.get("returnData", [])

    # ── Trading ───────────────────────────────────────────────────────────────

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
        resp = await self._send({
            "command": "tradeTransaction",
            "arguments": {
                "tradeTransInfo": {
                    "cmd": cmd, "customComment": comment,
                    "expiration": expiration, "offset": 0, "order": 0,
                    "price": price, "sl": sl, "symbol": symbol,
                    "tp": tp, "type": TRADE_OPEN, "volume": volume,
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
                    "cmd": close_cmd, "customComment": "bot_close",
                    "expiration": 0, "offset": 0, "order": order,
                    "price": price, "sl": 0, "symbol": symbol,
                    "tp": 0, "type": TRADE_CLOSE, "volume": volume,
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
            resp = await self._send({
                "command": "tradeTransactionStatus",
                "arguments": {"order": order}
            })
            data = resp.get("returnData", {})
            if data.get("requestStatus") not in (1,):
                return data
        return {"requestStatus": -1, "message": "Timeout waiting for trade status"}

    # ── Streaming (optional) ──────────────────────────────────────────────────

    async def start_streaming(
        self,
        on_tick: Optional[Callable] = None,
        symbols: Optional[List[str]] = None,
    ) -> None:
        if not self._stream_session_id:
            raise RuntimeError("Must be logged in before streaming")
        stream_session = self._session or aiohttp.ClientSession(
            connector=aiohttp.TCPConnector(ssl=self._ssl)
        )
        self._stream_ws = await stream_session.ws_connect(
            self._stream_url, ssl=self._ssl, heartbeat=30,
        )
        if symbols:
            for sym in symbols:
                await self._stream_ws.send_str(json.dumps({
                    "command": "getTickPrices",
                    "streamSessionId": self._stream_session_id,
                    "symbol": sym,
                    "minArrivalTime": 1000,
                }))
        asyncio.create_task(self._stream_reader(on_tick))

    async def _stream_reader(self, on_tick: Optional[Callable]) -> None:
        try:
            async for msg in self._stream_ws:
                if msg.type == aiohttp.WSMsgType.TEXT:
                    data = json.loads(msg.data)
                    if data.get("command") == "tickPrices" and on_tick:
                        tick = data.get("data", {})
                        if asyncio.iscoroutinefunction(on_tick):
                            await on_tick(tick)
                        else:
                            on_tick(tick)
                elif msg.type in (aiohttp.WSMsgType.CLOSE, aiohttp.WSMsgType.ERROR):
                    break
        except Exception as exc:
            logger.warning("Stream error: %s", exc)

    # ── Utility ───────────────────────────────────────────────────────────────

    @property
    def is_connected(self) -> bool:
        return self._connected
