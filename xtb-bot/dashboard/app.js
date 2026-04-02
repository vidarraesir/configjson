/* ─── XTB Options Bot Dashboard ──────────────────────────────────────────── */
'use strict';

const API = '';   // same origin
let equityChart = null;
let equityLabels = [];
let equityData = [];
let ws = null;
let reconnectTimer = null;

// ─── Utilities ──────────────────────────────────────────────────────────────

const $ = id => document.getElementById(id);

function fmt(n, decimals = 2, prefix = '') {
  if (n == null || isNaN(n)) return '—';
  return prefix + Number(n).toLocaleString('es-ES', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

function fmtPct(n) {
  if (n == null || isNaN(n)) return '—';
  const s = (n >= 0 ? '+' : '') + Number(n).toFixed(2) + '%';
  return s;
}

function colorClass(n) {
  if (n == null) return '';
  return n > 0 ? 'positive' : n < 0 ? 'negative' : 'neutral';
}

function stratBadge(name, isLive) {
  const cls = isLive ? 'strategy-badge live-strat' : 'strategy-badge';
  const label = name.replace(/_/g, ' ');
  return `<span class="${cls}">${isLive ? '● ' : ''}${label}</span>`;
}

function clockTick() {
  const now = new Date();
  $('clock').textContent = now.toLocaleTimeString('es-ES');
}

setInterval(clockTick, 1000);
clockTick();

// ─── Equity Chart (Chart.js) ────────────────────────────────────────────────

function initChart() {
  const ctx = $('equity-chart').getContext('2d');
  equityChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: equityLabels,
      datasets: [{
        label: 'Equity',
        data: equityData,
        borderColor: '#58a6ff',
        backgroundColor: 'rgba(88,166,255,0.08)',
        borderWidth: 2,
        pointRadius: 0,
        fill: true,
        tension: 0.3,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      animation: { duration: 300 },
      plugins: {
        legend: { display: false },
        tooltip: {
          mode: 'index',
          intersect: false,
          backgroundColor: '#21262d',
          borderColor: '#30363d',
          borderWidth: 1,
          titleColor: '#8b949e',
          bodyColor: '#c9d1d9',
        }
      },
      scales: {
        x: {
          grid: { color: 'rgba(48,54,61,0.5)' },
          ticks: { color: '#8b949e', maxTicksLimit: 8, font: { family: 'monospace', size: 11 } }
        },
        y: {
          grid: { color: 'rgba(48,54,61,0.5)' },
          ticks: {
            color: '#8b949e',
            font: { family: 'monospace', size: 11 },
            callback: v => '€' + v.toLocaleString('es-ES')
          }
        }
      }
    }
  });
}

function updateChart(ts, equity) {
  const label = new Date(ts).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  equityLabels.push(label);
  equityData.push(equity);
  if (equityLabels.length > 200) {
    equityLabels.shift();
    equityData.shift();
  }
  equityChart.update('none');
}

// ─── Portfolio KPIs ─────────────────────────────────────────────────────────

function renderPortfolio(p) {
  if (!p) return;

  $('val-equity').textContent = fmt(p.equity, 2, '€');
  $('val-equity').className = 'kpi-value';

  const ret = p.total_return_pct;
  $('val-return').textContent = fmtPct(ret);
  $('val-return').className = 'kpi-sub ' + colorClass(ret);

  $('val-cash').textContent = fmt(p.cash, 2, '€');

  const opnl = p.open_pnl;
  $('val-opnl').textContent = fmt(opnl, 2, '€');
  $('val-opnl').className = 'kpi-value ' + colorClass(opnl);

  const dd = p.drawdown_pct;
  $('val-dd').textContent = fmtPct(dd);
  $('val-dd').className = 'kpi-value ' + (dd < -5 ? 'negative' : dd < 0 ? 'neutral' : 'positive');

  $('val-positions').textContent = p.open_positions ?? 0;

  // Positions table
  const positions = p.positions || [];
  const tbody = $('positions-body');
  if (positions.length === 0) {
    tbody.innerHTML = '<tr><td colspan="10" class="empty">Sin posiciones abiertas</td></tr>';
  } else {
    tbody.innerHTML = positions.map(pos => {
      const pnl = pos.unrealised_pnl;
      return `<tr>
        <td>${stratBadge(pos.strategy, false)}</td>
        <td>${pos.symbol}</td>
        <td>${pos.option_type}</td>
        <td class="${pos.direction === 'long' ? 'dir-long' : 'dir-short'}">${pos.direction.toUpperCase()}</td>
        <td>${fmt(pos.strike, 2)}</td>
        <td>${pos.expiry_date}</td>
        <td>${pos.dte}</td>
        <td>${fmt(pos.entry_price, 4)}</td>
        <td>${fmt(pos.current_price, 4)}</td>
        <td class="${colorClass(pnl)}">${fmt(pnl, 2, '€')}</td>
      </tr>`;
    }).join('');
  }
}

// ─── Market grid ─────────────────────────────────────────────────────────────

function renderMarket(market) {
  if (!market) return;
  const grid = $('market-grid');
  grid.innerHTML = Object.entries(market).map(([sym, d]) => `
    <div class="market-card">
      <div class="market-symbol">${sym}</div>
      <div class="market-price">${fmt(d.spot, d.spot > 100 ? 2 : 4)}</div>
      <div class="market-meta">Bid: ${fmt(d.bid, 4)} / Ask: ${fmt(d.ask, 4)}</div>
      <div class="market-iv">IV: ${d.iv ? (d.iv * 100).toFixed(1) + '%' : '—'}</div>
    </div>
  `).join('');
}

// ─── Leaderboard ─────────────────────────────────────────────────────────────

async function fetchLeaderboard() {
  try {
    const res = await fetch(`${API}/api/strategies`);
    const data = await res.json();
    const tbody = $('leaderboard-body');
    if (!data.length) {
      tbody.innerHTML = '<tr><td colspan="8" class="empty">Sin datos aún...</td></tr>';
      return;
    }
    tbody.innerHTML = data.map(s => {
      const rowCls = s.meets_threshold ? 'meets-threshold' : '';
      return `<tr class="${rowCls}">
        <td>${s.rank}</td>
        <td>${stratBadge(s.strategy, s.is_live)}</td>
        <td class="${s.sharpe > 1.5 ? 'positive' : s.sharpe > 0 ? '' : 'negative'}">${fmt(s.sharpe, 2)}</td>
        <td class="${s.win_rate > 55 ? 'positive' : ''}">${fmt(s.win_rate, 1)}%</td>
        <td>${s.n_trades}</td>
        <td class="${s.max_drawdown < -15 ? 'negative' : ''}">${fmt(s.max_drawdown, 1)}%</td>
        <td class="${colorClass(s.total_pnl)}">${fmt(s.total_pnl, 2, '€')}</td>
        <td>${s.is_live ? '<span style="color:var(--green);font-weight:700">● LIVE</span>' : s.meets_threshold ? '<span style="color:var(--yellow)">✓ Listo</span>' : '<span style="color:var(--text-dim)">Paper</span>'}</td>
      </tr>`;
    }).join('');
  } catch (e) {
    console.error('Leaderboard fetch error', e);
  }
}

// ─── Trade history ────────────────────────────────────────────────────────────

async function fetchTrades() {
  try {
    const res = await fetch(`${API}/api/trades?status=closed&limit=30`);
    const trades = await res.json();
    const tbody = $('trades-body');
    if (!trades.length) {
      tbody.innerHTML = '<tr><td colspan="9" class="empty">Sin trades cerrados</td></tr>';
      return;
    }
    tbody.innerHTML = trades.map(t => {
      const pnl = t.pnl;
      return `<tr>
        <td>${t.closed_at ? new Date(t.closed_at).toLocaleDateString('es-ES') : '—'}</td>
        <td>${stratBadge(t.strategy, false)}</td>
        <td>${t.symbol}</td>
        <td class="${t.direction === 'long' ? 'dir-long' : 'dir-short'}">${(t.direction || '').toUpperCase()}</td>
        <td>${fmt(t.strike, 2)}</td>
        <td>${fmt(t.entry_price, 4)}</td>
        <td>${fmt(t.exit_price, 4)}</td>
        <td class="${colorClass(pnl)}">${fmt(pnl, 2, '€')}</td>
        <td style="color:var(--text-dim)">${t.notes || '—'}</td>
      </tr>`;
    }).join('');
  } catch (e) {
    console.error('Trades fetch error', e);
  }
}

// ─── Alerts ──────────────────────────────────────────────────────────────────

async function fetchAlerts() {
  try {
    const res = await fetch(`${API}/api/alerts?limit=20`);
    const alerts = await res.json();
    const list = $('alerts-list');
    if (!alerts.length) {
      list.innerHTML = '<div class="empty">Sin alertas</div>';
      return;
    }
    list.innerHTML = alerts.map(a => `
      <div class="alert-item ${a.level}">
        <div class="alert-time">${new Date(a.ts).toLocaleString('es-ES')}</div>
        <div>${a.message}</div>
      </div>
    `).join('');
  } catch (e) {
    console.error('Alerts fetch error', e);
  }
}

// ─── Backtest results ────────────────────────────────────────────────────────

async function fetchBacktest() {
  try {
    const res = await fetch(`${API}/api/backtest`);
    const results = await res.json();
    const tbody = $('backtest-body');
    if (!results.length) {
      tbody.innerHTML = '<tr><td colspan="9" class="empty">Backtesting en progreso o sin datos históricos...</td></tr>';
      return;
    }
    tbody.innerHTML = results.map(r => `<tr>
      <td>${stratBadge(r.strategy, false)}</td>
      <td>${r.symbol || '—'}</td>
      <td>${r.n_trades}</td>
      <td class="${r.win_rate > 0.55 ? 'positive' : ''}">${fmt(r.win_rate * 100, 1)}%</td>
      <td class="${r.sharpe > 1.5 ? 'positive' : r.sharpe > 0 ? '' : 'negative'}">${fmt(r.sharpe, 2)}</td>
      <td>${fmt(r.sortino, 2)}</td>
      <td class="${r.max_drawdown < -0.15 ? 'negative' : ''}">${fmt(r.max_drawdown * 100, 1)}%</td>
      <td>${r.profit_factor > 1e6 ? '∞' : fmt(r.profit_factor, 2)}</td>
      <td class="${colorClass(r.total_pnl)}">${fmt(r.total_pnl, 2)}</td>
    </tr>`).join('');
  } catch (e) {
    console.error('Backtest fetch error', e);
  }
}

// ─── Live strategy indicator ──────────────────────────────────────────────────

function updateLiveStrategy(liveStrategy, mode) {
  const el = $('val-live');
  const badge = $('mode-badge');

  if (liveStrategy) {
    el.textContent = liveStrategy.replace(/_/g, ' ').toUpperCase();
    el.className = 'kpi-value positive';
    badge.textContent = 'LIVE';
    badge.className = 'badge live';
  } else {
    el.textContent = mode === 'simulation' ? 'Simulación' : 'Paper trading';
    el.className = 'kpi-value neutral';
    badge.textContent = mode === 'simulation' ? 'SIMULATION' : 'PAPER';
    badge.className = 'badge';
  }
}

// ─── Alert bar ────────────────────────────────────────────────────────────────

function showAlertBar(message, level = 'success') {
  const bar = $('alert-bar');
  bar.textContent = message;
  bar.className = `alert-bar ${level}`;
  setTimeout(() => { bar.className = 'alert-bar hidden'; }, 8000);
}

// ─── WebSocket ────────────────────────────────────────────────────────────────

function connectWS() {
  const proto = location.protocol === 'https:' ? 'wss' : 'ws';
  ws = new WebSocket(`${proto}://${location.host}/ws`);

  ws.onopen = () => {
    console.log('WS connected');
    $('conn-dot').className = 'live-dot connected';
    $('conn-label').textContent = 'Conectado';
    if (reconnectTimer) { clearTimeout(reconnectTimer); reconnectTimer = null; }
  };

  ws.onmessage = evt => {
    try {
      const msg = JSON.parse(evt.data);
      if (msg.type === 'update') {
        renderPortfolio(msg.portfolio);
        renderMarket(msg.market);
        updateLiveStrategy(msg.live_strategy, msg.mode);
        if (msg.portfolio?.equity && msg.ts) {
          updateChart(msg.ts, msg.portfolio.equity);
        }
      } else if (msg.type === 'alert') {
        showAlertBar(msg.message, msg.level || 'info');
        fetchAlerts();
      }
    } catch (e) {
      console.error('WS parse error', e);
    }
  };

  ws.onerror = () => {
    $('conn-dot').className = 'live-dot disconnected';
    $('conn-label').textContent = 'Error';
  };

  ws.onclose = () => {
    $('conn-dot').className = 'live-dot disconnected';
    $('conn-label').textContent = 'Reconectando...';
    reconnectTimer = setTimeout(connectWS, 3000);
  };
}

// ─── Polling fallback for slow-changing data ──────────────────────────────────

function startPolling() {
  fetchLeaderboard();
  fetchTrades();
  fetchAlerts();
  fetchBacktest();

  setInterval(fetchLeaderboard, 30_000);
  setInterval(fetchTrades, 15_000);
  setInterval(fetchAlerts, 20_000);
  setInterval(fetchBacktest, 60_000);
}

// ─── Boot ─────────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', async () => {
  initChart();

  // Load initial equity curve from REST
  try {
    const res = await fetch(`${API}/api/equity?limit=100`);
    const rows = await res.json();
    rows.forEach(r => {
      equityLabels.push(new Date(r.ts).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }));
      equityData.push(r.equity);
    });
    equityChart.update();
  } catch (e) { /* no data yet */ }

  // Load initial portfolio
  try {
    const res = await fetch(`${API}/api/status`);
    const status = await res.json();
    renderPortfolio(status.portfolio);
    updateLiveStrategy(status.live_strategy);
  } catch (e) { /* offline */ }

  connectWS();
  startPolling();
});
