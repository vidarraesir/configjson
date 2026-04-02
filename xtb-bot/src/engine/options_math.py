"""
Options pricing utilities: Black-Scholes, Greeks, IV estimation.
XTB exposes CFD instruments. We use BS model to price synthetic options legs
for paper trading strategy simulation.
"""
import math
from dataclasses import dataclass
from typing import Literal

# scipy optional – fall back to manual erf if not installed
try:
    from scipy.stats import norm as _norm
    def _cdf(x: float) -> float:
        return float(_norm.cdf(x))
    def _pdf(x: float) -> float:
        return float(_norm.pdf(x))
except ImportError:
    def _cdf(x: float) -> float:          # Abramowitz & Stegun approximation
        if x < 0:
            return 1.0 - _cdf(-x)
        k = 1.0 / (1.0 + 0.2316419 * x)
        poly = k * (0.319381530 + k * (-0.356563782 + k * (1.781477937 + k * (-1.821255978 + k * 1.330274429))))
        return 1.0 - _pdf(x) * poly

    def _pdf(x: float) -> float:
        return math.exp(-0.5 * x * x) / math.sqrt(2 * math.pi)


@dataclass
class Greeks:
    delta: float
    gamma: float
    theta: float   # per day
    vega: float    # per 1% IV move
    rho: float


def bs_price(
    S: float,            # spot price
    K: float,            # strike
    T: float,            # time to expiry in years
    r: float,            # risk-free rate (e.g. 0.05)
    sigma: float,        # implied volatility (e.g. 0.20)
    option_type: Literal["call", "put"],
) -> float:
    """Black-Scholes option price."""
    if T <= 0:
        intrinsic = max(S - K, 0) if option_type == "call" else max(K - S, 0)
        return intrinsic
    d1 = (math.log(S / K) + (r + 0.5 * sigma ** 2) * T) / (sigma * math.sqrt(T))
    d2 = d1 - sigma * math.sqrt(T)
    if option_type == "call":
        return S * _cdf(d1) - K * math.exp(-r * T) * _cdf(d2)
    else:
        return K * math.exp(-r * T) * _cdf(-d2) - S * _cdf(-d1)


def bs_greeks(
    S: float,
    K: float,
    T: float,
    r: float,
    sigma: float,
    option_type: Literal["call", "put"],
) -> Greeks:
    if T <= 1e-6:
        return Greeks(delta=1.0 if option_type == "call" else -1.0, gamma=0, theta=0, vega=0, rho=0)

    d1 = (math.log(S / K) + (r + 0.5 * sigma ** 2) * T) / (sigma * math.sqrt(T))
    d2 = d1 - sigma * math.sqrt(T)
    nd1 = _pdf(d1)
    Nd1 = _cdf(d1)
    Nd2 = _cdf(d2)

    if option_type == "call":
        delta = Nd1
        rho = K * T * math.exp(-r * T) * Nd2 / 100
    else:
        delta = Nd1 - 1
        rho = -K * T * math.exp(-r * T) * _cdf(-d2) / 100

    gamma = nd1 / (S * sigma * math.sqrt(T))
    vega = S * nd1 * math.sqrt(T) / 100           # per 1% change in IV
    theta_call = (
        -S * nd1 * sigma / (2 * math.sqrt(T))
        - r * K * math.exp(-r * T) * Nd2
    ) / 365
    if option_type == "call":
        theta = theta_call
    else:
        theta = (
            -S * nd1 * sigma / (2 * math.sqrt(T))
            + r * K * math.exp(-r * T) * _cdf(-d2)
        ) / 365

    return Greeks(delta=delta, gamma=gamma, theta=theta, vega=vega, rho=rho)


def implied_volatility(
    market_price: float,
    S: float,
    K: float,
    T: float,
    r: float,
    option_type: Literal["call", "put"],
    tol: float = 1e-6,
    max_iter: int = 200,
) -> float:
    """Newton-Raphson IV solver."""
    if T <= 0:
        return 0.0
    sigma = 0.30   # initial guess
    for _ in range(max_iter):
        price = bs_price(S, K, T, r, sigma, option_type)
        diff = price - market_price
        if abs(diff) < tol:
            return sigma
        g = bs_greeks(S, K, T, r, sigma, option_type)
        vega = g.vega * 100   # back to raw vega (undo /100)
        if abs(vega) < 1e-10:
            break
        sigma -= diff / vega
        sigma = max(0.001, min(sigma, 5.0))
    return sigma


def delta_to_strike(
    S: float,
    T: float,
    r: float,
    sigma: float,
    target_delta: float,
    option_type: Literal["call", "put"],
) -> float:
    """Find strike for a given absolute delta using binary search."""
    # delta for call: decreases as K increases; for put: increases (abs) as K decreases
    lo, hi = S * 0.3, S * 2.0
    for _ in range(60):
        mid = (lo + hi) / 2
        d = abs(bs_greeks(S, mid, T, r, sigma, option_type).delta)
        if abs(d - target_delta) < 1e-5:
            return mid
        if option_type == "call":
            if d > target_delta:
                lo = mid
            else:
                hi = mid
        else:
            if d < target_delta:
                lo = mid
            else:
                hi = mid
    return (lo + hi) / 2


def historical_volatility(prices: list[float], window: int = 20) -> float:
    """Annualised historical volatility from a list of closing prices."""
    if len(prices) < window + 1:
        return 0.20   # default
    returns = [math.log(prices[i] / prices[i - 1]) for i in range(1, len(prices))]
    recent = returns[-window:]
    mean = sum(recent) / len(recent)
    variance = sum((r - mean) ** 2 for r in recent) / (len(recent) - 1)
    return math.sqrt(variance * 252)
