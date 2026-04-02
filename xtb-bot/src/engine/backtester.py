"""
Backtester
===========
Runs strategies on historical OHLCV data to estimate performance
before committing to paper trading.

Uses simplified BS pricing from historical data + HV as proxy for IV.
"""
import logging
import math
from dataclasses import dataclass, field
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple, Type

from src.engine.options_math import (
    bs_price, delta_to_strike, historical_volatility, Greeks
)
from src.strategies.base import MarketSnapshot

logger = logging.getLogger(__name__)
RISK_FREE = 0.05


@dataclass
class BacktestTrade:
    strategy: str
    symbol: str
    entry_date: str
    exit_date: str
    entry_price: float
    exit_price: float
    direction: str
    option_type: str
    strike: float
    pnl: float
    pnl_pct: float
    reason: str


@dataclass
class BacktestResult:
    strategy: str
    symbol: str
    n_trades: int = 0
    win_rate: float = 0.0
    total_pnl: float = 0.0
    avg_pnl: float = 0.0
    max_drawdown: float = 0.0
    sharpe: float = 0.0
    sortino: float = 0.0
    profit_factor: float = 0.0
    trades: List[BacktestTrade] = field(default_factory=list)
    equity_curve: List[Tuple[str, float]] = field(default_factory=list)

    def to_dict(self) -> Dict:
        return {
            "strategy": self.strategy,
            "symbol": self.symbol,
            "n_trades": self.n_trades,
            "win_rate": round(self.win_rate, 4),
            "total_pnl": round(self.total_pnl, 2),
            "avg_pnl": round(self.avg_pnl, 2),
            "max_drawdown": round(self.max_drawdown, 4),
            "sharpe": round(self.sharpe, 4),
            "sortino": round(self.sortino, 4),
            "profit_factor": round(self.profit_factor, 4),
        }


# ── Strategy simulation helpers ──────────────────────────────────────────────

def _simulate_short_spread(
    candles: List[Dict],
    strategy_name: str,
    symbol: str,
    delta_short: float,
    delta_long: float,
    option_type: str,       # "call" or "put"
    dte_entry: int,
    dte_exit: int,
    profit_target: float,
    stop_loss: float,
    hv_window: int = 20,
) -> BacktestResult:
    """Generic short credit spread backtester."""
    result = BacktestResult(strategy=strategy_name, symbol=symbol)
    prices = [c["close"] for c in candles]
    pnls = []
    equity = 0.0
    peak = 0.0
    min_dd = 0.0

    step = max(1, dte_entry // 2)   # enter every half-cycle

    for i in range(hv_window + dte_entry, len(candles) - dte_entry, step):
        S = prices[i]
        iv = historical_volatility(prices[:i], hv_window)
        if iv <= 0:
            continue

        T = dte_entry / 365.0
        K_s = delta_to_strike(S, T, RISK_FREE, iv, delta_short, option_type)
        K_l = delta_to_strike(S, T, RISK_FREE, iv, delta_long, option_type)

        if option_type == "call" and K_l <= K_s:
            continue
        if option_type == "put" and K_l >= K_s:
            continue

        entry_short = bs_price(S, K_s, T, RISK_FREE, iv, option_type)
        entry_long = bs_price(S, K_l, T, RISK_FREE, iv, option_type)
        net_credit = entry_short - entry_long
        if net_credit <= 0:
            continue

        # Simulate holding until profit target, stop, or DTE exit
        pnl = 0.0
        exit_price_short = 0.0
        exit_date_idx = min(i + dte_entry, len(candles) - 1)
        reason = "expiry"

        for j in range(i + 1, min(i + dte_entry + 1, len(candles))):
            dte_remaining = (i + dte_entry - j)
            S_j = prices[j]
            iv_j = historical_volatility(prices[:j], hv_window)
            T_j = max(dte_remaining, 0) / 365.0

            current_short = bs_price(S_j, K_s, T_j, RISK_FREE, iv_j, option_type)
            current_long = bs_price(S_j, K_l, T_j, RISK_FREE, iv_j, option_type)
            current_spread_value = current_short - current_long

            # Profit target: spread value decayed by profit_target fraction
            if current_spread_value <= net_credit * (1 - profit_target):
                pnl = net_credit - current_spread_value
                exit_date_idx = j
                reason = "profit_target"
                break

            # Stop loss
            if current_spread_value >= net_credit * (1 + stop_loss):
                pnl = net_credit - current_spread_value
                exit_date_idx = j
                reason = "stop_loss"
                break

            # DTE exit
            if dte_remaining <= dte_exit:
                pnl = net_credit - current_spread_value
                exit_date_idx = j
                reason = "dte_exit"
                break
        else:
            # Expired: pnl = net credit if OTM, else loss
            S_exp = prices[exit_date_idx]
            if option_type == "call":
                intrinsic = max(S_exp - K_s, 0) - max(S_exp - K_l, 0)
            else:
                intrinsic = max(K_s - S_exp, 0) - max(K_l - S_exp, 0)
            pnl = net_credit - intrinsic

        pnls.append(pnl)
        equity += pnl
        peak = max(peak, equity)
        dd = (equity - peak) / peak if peak > 0 else 0
        min_dd = min(min_dd, dd)

        entry_date = datetime.utcfromtimestamp(candles[i]["time"] / 1000).strftime("%Y-%m-%d")
        exit_date = datetime.utcfromtimestamp(candles[exit_date_idx]["time"] / 1000).strftime("%Y-%m-%d")
        result.trades.append(BacktestTrade(
            strategy=strategy_name, symbol=symbol,
            entry_date=entry_date, exit_date=exit_date,
            entry_price=net_credit, exit_price=0.0,
            direction="short", option_type=option_type,
            strike=K_s, pnl=round(pnl, 4),
            pnl_pct=round(pnl / net_credit, 4) if net_credit > 0 else 0,
            reason=reason,
        ))
        result.equity_curve.append((entry_date, round(equity, 4)))

    # ── Compute stats ────────────────────────────────────────────────────────
    if not pnls:
        return result

    n = len(pnls)
    wins = sum(1 for p in pnls if p > 0)
    result.n_trades = n
    result.win_rate = wins / n
    result.total_pnl = sum(pnls)
    result.avg_pnl = result.total_pnl / n
    result.max_drawdown = min_dd

    mean = result.avg_pnl
    std = (sum((p - mean) ** 2 for p in pnls) / max(n - 1, 1)) ** 0.5
    result.sharpe = (mean / std) * math.sqrt(252) if std > 0 else 0.0

    # Sortino (downside deviation)
    losses = [p for p in pnls if p < 0]
    if losses:
        down_dev = (sum(p ** 2 for p in losses) / len(losses)) ** 0.5
        result.sortino = (mean / down_dev) * math.sqrt(252) if down_dev > 0 else 0.0
    else:
        result.sortino = float("inf")

    gross_profit = sum(p for p in pnls if p > 0)
    gross_loss = abs(sum(p for p in pnls if p < 0))
    result.profit_factor = gross_profit / gross_loss if gross_loss > 0 else float("inf")

    return result


def _simulate_iron_condor(
    candles: List[Dict],
    symbol: str,
    delta_short: float = 0.20,
    delta_long: float = 0.10,
    dte_entry: int = 30,
    dte_exit: int = 7,
    profit_target: float = 0.50,
    stop_loss: float = 2.0,
) -> BacktestResult:
    """Iron Condor = bull put spread + bear call spread combined."""
    put_result = _simulate_short_spread(
        candles, "iron_condor_put_leg", symbol, delta_short, delta_long,
        "put", dte_entry, dte_exit, profit_target, stop_loss
    )
    call_result = _simulate_short_spread(
        candles, "iron_condor_call_leg", symbol, delta_short, delta_long,
        "call", dte_entry, dte_exit, profit_target, stop_loss
    )

    # Combine pnls (assumes legs traded together)
    combined_pnls = []
    for t_p, t_c in zip(put_result.trades, call_result.trades):
        combined_pnls.append(t_p.pnl + t_c.pnl)

    if not combined_pnls:
        return BacktestResult(strategy="iron_condor", symbol=symbol)

    n = len(combined_pnls)
    wins = sum(1 for p in combined_pnls if p > 0)
    total_pnl = sum(combined_pnls)
    avg_pnl = total_pnl / n
    mean = avg_pnl
    std = (sum((p - mean) ** 2 for p in combined_pnls) / max(n - 1, 1)) ** 0.5
    sharpe = (mean / std) * math.sqrt(252) if std > 0 else 0.0

    equity = 0.0
    peak = 0.0
    min_dd = 0.0
    for p in combined_pnls:
        equity += p
        peak = max(peak, equity)
        dd = (equity - peak) / peak if peak > 0 else 0
        min_dd = min(min_dd, dd)

    gross_profit = sum(p for p in combined_pnls if p > 0)
    gross_loss = abs(sum(p for p in combined_pnls if p < 0))
    pf = gross_profit / gross_loss if gross_loss > 0 else float("inf")

    losses = [p for p in combined_pnls if p < 0]
    down_dev = (sum(p ** 2 for p in losses) / len(losses)) ** 0.5 if losses else 0
    sortino = (mean / down_dev) * math.sqrt(252) if down_dev > 0 else float("inf")

    result = BacktestResult(
        strategy="iron_condor", symbol=symbol,
        n_trades=n, win_rate=wins / n,
        total_pnl=total_pnl, avg_pnl=avg_pnl,
        max_drawdown=min_dd, sharpe=sharpe,
        sortino=sortino, profit_factor=pf,
    )
    return result


class Backtester:
    """Run all strategies on historical data and rank them."""

    def __init__(self, candles_by_symbol: Dict[str, List[Dict]]):
        """
        candles_by_symbol: dict of symbol → list of OHLCV dicts
          Each candle: {time, open, high, low, close, volume}
        """
        self.candles = candles_by_symbol

    def run_all(self) -> List[BacktestResult]:
        results: List[BacktestResult] = []

        strategies = [
            ("iron_condor", self._run_iron_condor),
            ("bull_put_spread", self._run_bull_put_spread),
            ("bear_call_spread", self._run_bear_call_spread),
            ("cash_secured_put", self._run_csp),
            ("short_strangle", self._run_short_strangle),
        ]

        for symbol, candles in self.candles.items():
            if len(candles) < 100:
                logger.warning("Not enough candles for %s (%d), skipping", symbol, len(candles))
                continue
            for name, fn in strategies:
                try:
                    r = fn(candles, symbol)
                    results.append(r)
                    logger.info(
                        "Backtest [%s/%s]: trades=%d win=%.1f%% sharpe=%.2f pnl=%.2f dd=%.1f%%",
                        name, symbol, r.n_trades, r.win_rate * 100,
                        r.sharpe, r.total_pnl, r.max_drawdown * 100
                    )
                except Exception as exc:
                    logger.error("Backtest error %s/%s: %s", name, symbol, exc)

        return sorted(results, key=lambda r: r.sharpe, reverse=True)

    def _run_iron_condor(self, candles, symbol):
        return _simulate_iron_condor(candles, symbol)

    def _run_bull_put_spread(self, candles, symbol):
        return _simulate_short_spread(
            candles, "bull_put_spread", symbol, 0.30, 0.15, "put", 21, 5, 0.60, 1.5
        )

    def _run_bear_call_spread(self, candles, symbol):
        return _simulate_short_spread(
            candles, "bear_call_spread", symbol, 0.30, 0.15, "call", 21, 5, 0.60, 1.5
        )

    def _run_csp(self, candles, symbol):
        return _simulate_short_spread(
            candles, "cash_secured_put", symbol, 0.25, 0.10, "put", 30, 7, 0.50, 2.0
        )

    def _run_short_strangle(self, candles, symbol):
        put_r = _simulate_short_spread(
            candles, "short_strangle_put", symbol, 0.16, 0.05, "put", 45, 14, 0.50, 2.0
        )
        call_r = _simulate_short_spread(
            candles, "short_strangle_call", symbol, 0.16, 0.05, "call", 45, 14, 0.50, 2.0
        )
        pnls = [t_p.pnl + t_c.pnl for t_p, t_c in zip(put_r.trades, call_r.trades)]
        if not pnls:
            return BacktestResult(strategy="short_strangle", symbol=symbol)
        n = len(pnls)
        wins = sum(1 for p in pnls if p > 0)
        total = sum(pnls)
        avg = total / n
        std = (sum((p - avg) ** 2 for p in pnls) / max(n - 1, 1)) ** 0.5
        sharpe = (avg / std) * math.sqrt(252) if std > 0 else 0.0
        gp = sum(p for p in pnls if p > 0)
        gl = abs(sum(p for p in pnls if p < 0))
        equity = 0.0
        peak = 0.0
        min_dd = 0.0
        for p in pnls:
            equity += p
            peak = max(peak, equity)
            dd = (equity - peak) / peak if peak > 0 else 0
            min_dd = min(min_dd, dd)
        return BacktestResult(
            strategy="short_strangle", symbol=symbol,
            n_trades=n, win_rate=wins / n, total_pnl=total, avg_pnl=avg,
            max_drawdown=min_dd, sharpe=sharpe, profit_factor=gp / gl if gl > 0 else float("inf"),
        )
