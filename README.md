# Polymarket Copy Trading Bot

Bot que monitorea las operaciones de un trader en [Polymarket](https://polymarket.com) y las replica automáticamente en tu cuenta.

## Características

- **Monitoreo en tiempo real**: Consulta periódicamente las operaciones del trader objetivo
- **Copy ratio configurable**: Copia un porcentaje del tamaño de la operación original
- **Límites de tamaño**: Configura montos mínimos y máximos por operación
- **Modo dry run**: Simula las operaciones sin ejecutarlas (activado por defecto)
- **CLI completa**: Consulta posiciones, historial de trades y ejecuta el bot desde terminal
- **Logging**: Registra toda la actividad en consola y archivo `copytrader.log`

## Requisitos

- Python 3.10+
- Cuenta en Polymarket con fondos (USDC en Polygon)
- Clave privada de tu wallet

## Instalación

```bash
# Clonar e instalar dependencias
pip install -r requirements.txt

# Copiar y configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales
```

## Configuración (.env)

| Variable | Descripción | Default |
|---|---|---|
| `PRIVATE_KEY` | Tu clave privada (Polygon) | *requerido* |
| `PROXY_WALLET` | Tu proxy wallet de Polymarket | - |
| `TARGET_TRADER` | Dirección del trader a copiar | *requerido* |
| `POLL_INTERVAL` | Intervalo de consulta (segundos) | 30 |
| `COPY_RATIO` | Proporción a copiar (0.1 = 10%) | 0.5 |
| `MAX_TRADE_SIZE` | Máximo por operación en USDC | 50.0 |
| `MIN_TRADE_SIZE` | Mínimo por operación en USDC | 1.0 |
| `SLIPPAGE` | Tolerancia de slippage | 0.02 |
| `DRY_RUN` | Modo simulación | true |

### Cómo encontrar las direcciones

- **Tu proxy wallet**: Ve a tu perfil en Polymarket → la dirección está en la URL
- **Trader a copiar**: Ve al perfil del trader en Polymarket → copia su dirección de la URL

## Uso

```bash
# Iniciar el bot en modo simulación (dry run)
python -m bot run

# Iniciar con operaciones reales
python -m bot run --live

# Copiar un trader específico
python -m bot run --target 0x1234...abcd

# Ver posiciones del trader objetivo
python -m bot positions

# Ver últimos trades del trader
python -m bot trades --limit 20

# Modo verbose (debug)
python -m bot -v run
```

## Arquitectura

```
bot/
├── api/
│   ├── clob_client.py   # Cliente CLOB (órdenes, autenticación)
│   ├── data_api.py       # Data API (trades, posiciones)
│   └── gamma_api.py      # Gamma API (info de mercados)
├── core/
│   ├── config.py         # Configuración desde .env
│   └── engine.py         # Motor de copy trading
├── main.py               # Entry point + CLI
└── __main__.py           # python -m bot
```

## APIs de Polymarket utilizadas

| API | URL | Propósito |
|---|---|---|
| Data API | `data-api.polymarket.com` | Monitorear trades y posiciones del target |
| CLOB API | `clob.polymarket.com` | Ejecutar órdenes |
| Gamma API | `gamma-api.polymarket.com` | Metadata de mercados |

## Advertencias

- **Empieza siempre en modo dry run** (`DRY_RUN=true`) para verificar el comportamiento
- **No compartas tu clave privada** con nadie
- **El trading conlleva riesgo** - puedes perder tu capital
- El bot NO garantiza resultados iguales al trader copiado (slippage, timing, liquidez)
- Revisa las [condiciones de uso de Polymarket](https://polymarket.com/tos) antes de usar bots
