# XTB Options Bot

Bot de trading de opciones para XTB con dashboard web, paper trading automatizado y evaluación de estrategias.

## Arquitectura

```
xtb-bot/
├── src/
│   ├── api/
│   │   ├── xtb_client.py       # Cliente WebSocket XTB xAPI
│   │   └── routes.py           # FastAPI REST + WebSocket
│   ├── engine/
│   │   ├── options_math.py     # Black-Scholes, Greeks, IV
│   │   ├── paper_trader.py     # Motor de paper trading
│   │   ├── backtester.py       # Backtesting histórico
│   │   └── evaluator.py        # Evaluador y promotor de estrategias
│   ├── strategies/
│   │   ├── iron_condor.py      # Iron Condor
│   │   ├── bull_put_spread.py  # Bull Put Spread + Bear Call Spread
│   │   ├── cash_secured_put.py # Cash-Secured Put + Covered Call
│   │   └── straddle.py         # Long Straddle + Short Strangle
│   ├── models/
│   │   └── db.py               # SQLite (SQLAlchemy async)
│   └── main.py                 # App FastAPI principal
├── dashboard/
│   ├── index.html              # Dashboard web
│   ├── style.css               # Estilos dark mode
│   └── app.js                  # WebSocket + Chart.js
├── config.yaml                 # Configuración completa
├── requirements.txt
└── run.py                      # Punto de entrada
```

## Instalación

```bash
cd xtb-bot
pip install -r requirements.txt
```

## Configuración

Crea un archivo `.env` basado en `.env.example`:

```bash
cp .env.example .env
# Edita .env con tus credenciales XTB
```

```env
XTB_USER=tu_id_cuenta
XTB_PASSWORD=tu_contraseña
XTB_DEMO=true   # true = cuenta demo, false = cuenta real
```

> **Importante**: Usa siempre cuenta DEMO primero. El bot no pasará a cuenta real hasta que una estrategia cumpla todos los umbrales de rentabilidad.

## Arrancar

```bash
python run.py
```

Abre el dashboard en: **http://localhost:8080**

Sin credenciales XTB arranca en modo **SIMULATION** con datos GBM sintéticos.

## Flujo de trabajo

```
1. Arrancar bot (paper trading / simulación)
         │
         ▼
2. Backtesting automático sobre datos históricos (500 días)
         │
         ▼
3. Paper trading simultáneo de todas las estrategias
         │
         ▼
4. Evaluador comprueba cada 5 min si alguna estrategia cumple:
   - Sharpe Ratio ≥ 1.5
   - Win Rate ≥ 55%
   - ≥ 30 trades cerrados
   - Max Drawdown ≥ -15%
         │
         ▼
5. Estrategia ganadora se promueve a LIVE TRADING
   (aparece alerta en dashboard + badge LIVE)
         │
         ▼
6. Bot opera solo con la estrategia ganadora en cuenta real
```

## Estrategias implementadas

| Estrategia | Tipo | Sesgo | Entorno IV |
|---|---|---|---|
| Iron Condor | 4 patas | Neutral | Alto |
| Bull Put Spread | 2 patas | Alcista | Medio-Alto |
| Bear Call Spread | 2 patas | Bajista | Medio-Alto |
| Cash-Secured Put | 1 pata | Alcista | Alto |
| Covered Call | 2 patas | Neutral | Medio |
| Long Straddle | 2 patas | Volátil | Bajo |
| Short Strangle | 2 patas | Neutral | Muy Alto |

## API REST

| Endpoint | Descripción |
|---|---|
| `GET /api/status` | Estado del bot y portfolio |
| `GET /api/portfolio` | Posiciones abiertas y equity |
| `GET /api/trades` | Historial de trades |
| `GET /api/equity` | Curva de equity |
| `GET /api/strategies` | Ranking de estrategias |
| `GET /api/alerts` | Alertas del sistema |
| `GET /api/backtest` | Resultados de backtesting |
| `GET /api/greeks` | Greeks BS en tiempo real |
| `WS  /ws` | Feed en tiempo real (WebSocket) |

## Umbrales de promoción a LIVE

Configurables en `config.yaml`:

```yaml
paper_trading:
  live_threshold:
    min_sharpe: 1.5        # Sharpe mínimo
    min_win_rate: 0.55     # Win rate mínimo (55%)
    min_trades: 30         # Trades mínimos
    max_drawdown: -0.15    # Drawdown máximo permitido (-15%)
```

## Nota legal

Este bot es solo para uso educativo. El trading de opciones conlleva riesgo de pérdida del capital. Usa siempre cuenta demo antes de operar con dinero real.
