// =============================================================
// DELE B2 - Motor de la aplicación.
// =============================================================

(function () {
  'use strict';

  const D = window.DELE_DATA;

  // ---------- Utilidades DOM ----------
  const $  = (sel) => document.querySelector(sel);
  const $$ = (sel) => Array.from(document.querySelectorAll(sel));
  const el = (tag, attrs = {}, ...children) => {
    const n = document.createElement(tag);
    Object.entries(attrs).forEach(([k, v]) => {
      if (k === 'class') n.className = v;
      else if (k === 'html') n.innerHTML = v;
      else if (k.startsWith('on') && typeof v === 'function') n.addEventListener(k.slice(2), v);
      else if (v !== null && v !== undefined) n.setAttribute(k, v);
    });
    children.flat().forEach((c) => {
      if (c == null) return;
      n.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
    });
    return n;
  };
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
  const shuffle = (arr) => {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };

  // ---------- Navegación entre pantallas ----------
  const screens = () => $$('.screen');
  function show(id) {
    screens().forEach((s) => s.classList.toggle('active', s.id === id));
    window.scrollTo(0, 0);
  }
  window.goHome = () => {
    show('homeScreen');
    $$('.tab').forEach((t) => t.classList.toggle('active', t.dataset.screen === 'homeScreen'));
    refreshStats();
  };

  // ---------- Progreso en localStorage ----------
  const KEY = 'dele-b2-progress';
  function loadProgress() {
    try {
      return JSON.parse(localStorage.getItem(KEY)) || {
        totalQ: 0, correct: 0, lastDay: null, streak: 0, byMode: {}
      };
    } catch (e) {
      return { totalQ: 0, correct: 0, lastDay: null, streak: 0, byMode: {} };
    }
  }
  function saveProgress(p) { localStorage.setItem(KEY, JSON.stringify(p)); }
  function recordAnswer(ok, mode) {
    const p = loadProgress();
    p.totalQ += 1;
    if (ok) p.correct += 1;
    p.byMode[mode] = p.byMode[mode] || { q: 0, c: 0 };
    p.byMode[mode].q += 1;
    if (ok) p.byMode[mode].c += 1;
    updateStreak(p);
    saveProgress(p);
  }
  function updateStreak(p) {
    const today = new Date().toISOString().slice(0, 10);
    if (p.lastDay === today) return;
    if (!p.lastDay) { p.streak = 1; p.lastDay = today; return; }
    const prev = new Date(p.lastDay);
    const diff = Math.round((Date.now() - prev.getTime()) / 86400000);
    p.streak = diff === 1 ? p.streak + 1 : 1;
    p.lastDay = today;
  }
  function refreshStats() {
    const p = loadProgress();
    const acc = p.totalQ ? Math.round((p.correct / p.totalQ) * 100) : 0;
    const qEl = $('#statQuestions'); if (qEl) qEl.textContent = p.totalQ;
    const aEl = $('#statAccuracy');  if (aEl) aEl.textContent = acc + '%';
    const sEl = $('#statStreak');    if (sEl) sEl.textContent = p.streak || 0;
  }

  // ---------- Tema claro/oscuro ----------
  const themeBtn = $('#themeBtn');
  const resetBtn = $('#resetBtn');
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark') document.documentElement.setAttribute('data-theme', 'dark');
  themeBtn && themeBtn.addEventListener('click', () => {
    const cur = document.documentElement.getAttribute('data-theme');
    const next = cur === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
  });
  resetBtn && resetBtn.addEventListener('click', () => {
    if (confirm('¿Reiniciar todo el progreso guardado?')) {
      localStorage.removeItem(KEY);
      refreshStats();
    }
  });

  // ---------- Pestañas inferiores ----------
  $$('.tab').forEach((tab) => {
    tab.addEventListener('click', () => {
      $$('.tab').forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');
      if (tab.dataset.screen) show(tab.dataset.screen);
      else if (tab.dataset.action) routeAction(tab.dataset.action, tab.dataset.task);
    });
  });

  // ---------- Enrutado por data-action ----------
  $$('[data-action]').forEach((el) => {
    el.addEventListener('click', () => {
      routeAction(el.dataset.action, el.dataset.task);
    });
  });

  function routeAction(action, task) {
    // Las funciones concretas se enganchan en sub-tandas siguientes.
    const handler = window._deleHandlers[action];
    if (typeof handler === 'function') handler(task);
    else alert('Esta sección estará disponible en breve.');
  }

  // Exponemos para añadir handlers desde otros bloques.
  window._deleHandlers = {};
  window._dele = { D, el, esc, shuffle, show, recordAnswer, loadProgress, refreshStats };

  // ---------- Inicialización ----------
  refreshStats();

  // Aviso de instalación en iOS si no está en modo standalone.
  const isIos = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  const isStandalone = window.navigator.standalone === true;
  if (isIos && !isStandalone && !sessionStorage.getItem('iosHintShown')) {
    sessionStorage.setItem('iosHintShown', '1');
    setTimeout(() => {
      const hero = $('#homeScreen .hero');
      if (!hero) return;
      const hint = el('div', { class: 'tip-box', style: 'margin-top:14px' },
        el('strong', {}, 'Instálala en tu iPhone:'),
        ' pulsa el botón Compartir en Safari y elige "Añadir a pantalla de inicio" para usarla como una app.'
      );
      hero.appendChild(hint);
    }, 400);
  }
})();
