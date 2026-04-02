"""
Diagnóstico completo: conectividad de fuentes de datos + XTB API.
Ejecuta: python diagnose.py
"""
import asyncio
import json
import os
import ssl
import sys
from pathlib import Path

# Cargar .env
env_file = Path(__file__).parent / ".env"
if env_file.exists():
    for line in env_file.read_text().splitlines():
        line = line.strip()
        if line and not line.startswith("#") and "=" in line:
            k, v = line.split("=", 1)
            os.environ.setdefault(k.strip(), v.strip())

import aiohttp

print(f"\n{'='*60}")
print("  XTB Options Bot — Diagnóstico de conectividad")
print(f"{'='*60}\n")


async def test_url(session, name, url, params=None):
    try:
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0",
        }
        async with session.get(url, params=params, headers=headers,
                               timeout=aiohttp.ClientTimeout(total=8)) as r:
            text = await r.text()
            if r.status == 200 and len(text) > 10:
                print(f"  ✓ {name:<35} HTTP {r.status}  ({len(text)} bytes)")
                return True
            print(f"  ✗ {name:<35} HTTP {r.status}  (vacío)")
            return False
    except Exception as e:
        print(f"  ✗ {name:<35} ERROR: {e}")
        return False


async def test_data_sources():
    print("[1] Fuentes de datos de mercado:")
    async with aiohttp.ClientSession() as s:
        ok1 = await test_url(s, "Yahoo Finance query1 (precio)",
            "https://query1.finance.yahoo.com/v8/finance/chart/AAPL",
            {"interval": "1m", "range": "1d"})
        ok2 = await test_url(s, "Yahoo Finance query2 (precio)",
            "https://query2.finance.yahoo.com/v8/finance/chart/AAPL",
            {"interval": "1m", "range": "1d"})
        ok3 = await test_url(s, "Yahoo Finance opciones",
            "https://query1.finance.yahoo.com/v7/finance/options/AAPL")
        ok4 = await test_url(s, "Stooq histórico",
            "https://stooq.com/q/d/l/?s=aapl.us&i=d")
        ok5 = await test_url(s, "FMP quote-short",
            "https://financialmodelingprep.com/api/v3/quote-short/AAPL",
            {"apikey": "demo"})

    if any([ok1, ok2, ok3, ok4, ok5]):
        print("\n  → Al menos una fuente de datos funciona ✓")
    else:
        print("\n  → NINGUNA fuente accesible. Comprueba tu conexión a internet.")


async def test_xtb():
    USER     = os.getenv("XTB_USER", "")
    PASSWORD = os.getenv("XTB_PASSWORD", "")
    DEMO     = os.getenv("XTB_DEMO", "true").lower() == "true"

    print(f"\n[2] Conexión XTB (opcional — solo para ejecución live):")
    if not USER or not PASSWORD:
        print("  — Sin credenciales en .env (modo paper trading puro)")
        return

    PORT = 5124 if DEMO else 5112
    MODE = "DEMO" if DEMO else "REAL"
    URL  = f"wss://xapi.xtb.com:{PORT}"
    print(f"  User={USER}  Mode={MODE}  URL={URL}")

    ssl_ctx = ssl.create_default_context()
    ssl_ctx.check_hostname = False
    ssl_ctx.verify_mode = ssl.CERT_NONE

    try:
        connector = aiohttp.TCPConnector(ssl=ssl_ctx)
        async with aiohttp.ClientSession(connector=connector) as session:
            ws = await session.ws_connect(URL, ssl=ssl_ctx, timeout=aiohttp.ClientTimeout(total=10))
            await ws.send_str(json.dumps({
                "command": "login",
                "arguments": {"userId": USER, "password": PASSWORD}
            }))
            msg = await asyncio.wait_for(ws.receive(), timeout=8)
            if msg.type == aiohttp.WSMsgType.TEXT:
                resp = json.loads(msg.data)
                if resp.get("status") is True:
                    print(f"  ✓ XTB login OK — StreamSessionId: {resp.get('streamSessionId','')[:12]}...")
                else:
                    code = resp.get("errorCode", "")
                    desc = resp.get("errorDescr", str(resp))
                    print(f"  ✗ XTB login rechazado [{code}]: {desc}")
                    if "BE001" in code:
                        print("    → Contraseña incorrecta")
                    if "2FA" in desc.upper() or "TWO" in desc.upper():
                        print("    → 2FA bloquea la API")
            await ws.close()
    except Exception as e:
        print(f"  ✗ XTB conexión fallida: {e}")


async def main():
    await test_data_sources()
    await test_xtb()
    print(f"\n{'='*60}\n")


asyncio.run(main())
