"""
Diagnóstico de conexión XTB.
Ejecuta: python diagnose.py
"""
import asyncio
import json
import os
import ssl
import sys
from pathlib import Path

# Cargar .env manualmente
env_file = Path(__file__).parent / ".env"
if env_file.exists():
    for line in env_file.read_text().splitlines():
        line = line.strip()
        if line and not line.startswith("#") and "=" in line:
            k, v = line.split("=", 1)
            os.environ.setdefault(k.strip(), v.strip())

USER = os.getenv("XTB_USER", "")
PASSWORD = os.getenv("XTB_PASSWORD", "")
DEMO = os.getenv("XTB_DEMO", "true").lower() == "true"

PORT = 5124 if DEMO else 5112
URL = f"wss://xapi.xtb.com:{PORT}"
MODE = "DEMO" if DEMO else "REAL"

print(f"\n{'='*55}")
print(f"  XTB Connection Diagnostic")
print(f"{'='*55}")
print(f"  User   : {USER}")
print(f"  Mode   : {MODE}")
print(f"  URL    : {URL}")
print(f"{'='*55}\n")

if not USER or not PASSWORD:
    print("ERROR: XTB_USER o XTB_PASSWORD no encontrados en .env")
    sys.exit(1)


async def test_aiohttp():
    import aiohttp
    print("[1] Probando conexión con aiohttp...")
    ssl_ctx = ssl.create_default_context()
    ssl_ctx.check_hostname = False
    ssl_ctx.verify_mode = ssl.CERT_NONE
    connector = aiohttp.TCPConnector(ssl=ssl_ctx)
    try:
        async with aiohttp.ClientSession(connector=connector) as session:
            ws = await session.ws_connect(URL, ssl=ssl_ctx, timeout=aiohttp.ClientTimeout(total=15))
            print("    WebSocket conectado OK")

            payload = json.dumps({
                "command": "login",
                "arguments": {"userId": USER, "password": PASSWORD}
            })
            await ws.send_str(payload)
            msg = await asyncio.wait_for(ws.receive(), timeout=10)
            if msg.type == aiohttp.WSMsgType.TEXT:
                resp = json.loads(msg.data)
                print(f"    Respuesta del servidor: {json.dumps(resp, indent=2)}")
                if resp.get("status") is True:
                    print("\n  ✓ LOGIN EXITOSO — La conexión funciona correctamente!")
                else:
                    code = resp.get("errorCode", "")
                    desc = resp.get("errorDescr", "")
                    print(f"\n  ✗ Login rechazado: [{code}] {desc}")
                    if "BE001" in code:
                        print("    → Contraseña incorrecta")
                    elif "BE002" in code:
                        print("    → Usuario no encontrado")
                    elif "2FA" in desc.upper() or "TWO" in desc.upper():
                        print("    → 2FA requerido — necesitas desactivarlo para la API")
            else:
                print(f"    Tipo de mensaje inesperado: {msg.type} — {msg.data}")
            await ws.close()
    except Exception as e:
        print(f"    ERROR: {e}")


async def test_websockets():
    print("\n[2] Probando conexión con websockets...")
    try:
        import websockets
        ssl_ctx = ssl.create_default_context()
        ssl_ctx.check_hostname = False
        ssl_ctx.verify_mode = ssl.CERT_NONE
        async with websockets.connect(URL, ssl=ssl_ctx) as ws:
            print("    WebSocket conectado OK")
            await ws.send(json.dumps({
                "command": "login",
                "arguments": {"userId": USER, "password": PASSWORD}
            }))
            resp = json.loads(await asyncio.wait_for(ws.recv(), timeout=10))
            print(f"    Respuesta: {json.dumps(resp, indent=2)}")
            if resp.get("status"):
                print("  ✓ LOGIN EXITOSO con websockets lib")
    except Exception as e:
        print(f"    ERROR: {e}")


async def main():
    await test_aiohttp()
    await test_websockets()
    print(f"\n{'='*55}\n")

asyncio.run(main())
