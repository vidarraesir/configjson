// =============================================================
// DELE B2 - Motor de la aplicación.
// =============================================================

(function () {
  'use strict';

  const D = window.DELE_DATA;
  const tr = (k, vars) => window.t(k, vars);

  // Re-render de la vista dinámica actual al cambiar de idioma.
  let activeRerender = null;

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
    activeRerender = null;
    show('homeScreen');
    $$('.tab').forEach((tab) => tab.classList.toggle('active', tab.dataset.screen === 'homeScreen'));
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
  const DAILY_GOAL = 20;

  // ---------- Cuenta atrás para el examen ----------
  const EXAM_DATE = new Date(2026, 9, 16); // 16 de octubre de 2026 (mes 0-indexado)
  function updateCountdown() {
    const numEl = $('#countdownNum');
    const lblEl = $('#countdownLbl');
    if (!numEl || !lblEl) return;
    const now = new Date();
    const todayMid = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const days = Math.round((EXAM_DATE - todayMid) / 86400000);
    const sub = (txt) => '<br><span class="sub">' + txt + '</span>';
    if (days > 1) {
      numEl.textContent = days;
      numEl.style.fontSize = '40px';
      lblEl.innerHTML = tr('cd_days_label') + sub(tr('cd_weeks_sub', { n: Math.round(days / 7) }));
    } else if (days === 1) {
      numEl.textContent = '1';
      numEl.style.fontSize = '40px';
      lblEl.innerHTML = tr('cd_one_label') + sub(tr('cd_one_sub'));
    } else if (days === 0) {
      numEl.textContent = tr('cd_today_num');
      numEl.style.fontSize = '22px';
      lblEl.innerHTML = tr('cd_today_label') + sub(tr('cd_today_sub'));
    } else {
      numEl.textContent = '🎉';
      numEl.style.fontSize = '30px';
      lblEl.innerHTML = tr('cd_past_label') + sub(tr('cd_past_sub'));
    }
  }
  function recordAnswer(ok, mode) {
    const p = loadProgress();
    p.totalQ += 1;
    if (ok) p.correct += 1;
    p.byMode[mode] = p.byMode[mode] || { q: 0, c: 0 };
    p.byMode[mode].q += 1;
    if (ok) p.byMode[mode].c += 1;
    const today = new Date().toISOString().slice(0, 10);
    p.days = p.days || {};
    p.days[today] = (p.days[today] || 0) + 1;
    updateStreak(p);
    saveProgress(p);
    refreshStats();
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
    // Meta diaria
    const today = new Date().toISOString().slice(0, 10);
    const hoy = (p.days && p.days[today]) || 0;
    const goalTxt = $('#dailyGoalText');
    const goalBar = $('#dailyGoalBar');
    if (goalTxt) {
      goalTxt.textContent = hoy >= DAILY_GOAL
        ? tr('goal_done', { n: hoy })
        : tr('goal_progress', { n: hoy, g: DAILY_GOAL });
    }
    if (goalBar) goalBar.style.width = Math.min(100, (hoy / DAILY_GOAL) * 100) + '%';
    updateCountdown();
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
    if (confirm(tr('reset_confirm'))) {
      localStorage.removeItem(KEY);
      refreshStats();
    }
  });

  // ---------- Interruptor de idioma ----------
  const langBtn = $('#langBtn');
  langBtn && langBtn.addEventListener('click', () => window.toggleLang());
  // Al cambiar de idioma: refresca stats/contador y vuelve a pintar la
  // vista dinámica activa (si la hay) en el nuevo idioma.
  window._deleOnLangChange = () => {
    refreshStats();
    if (typeof activeRerender === 'function') activeRerender();
  };

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
    else alert(tr('soon'));
  }

  // Exponemos para añadir handlers desde otros bloques.
  window._deleHandlers = {};
  window._dele = { D, el, esc, shuffle, show, recordAnswer, loadProgress, refreshStats };

  // =============================================================
  // MOTOR DE QUIZ (opción múltiple, relacionar, huecos)
  // =============================================================

  let quizState = null;
  function startQuiz({ title, mode, items, timerSec = 0 }) {
    activeRerender = null; // en un quiz, cambiar idioma no debe reiniciarlo
    quizState = {
      title, mode, items,
      idx: 0,
      correct: 0,
      answered: [],
      startedAt: Date.now(),
      timerSec,
      timerId: null
    };
    $('#quizTitle').textContent = title;
    const timerEl = $('#quizTimer');
    if (timerSec > 0) {
      timerEl.style.display = '';
      startTimer(timerSec);
    } else {
      timerEl.style.display = 'none';
    }
    show('quizScreen');
    renderCurrentItem();
  }

  function startTimer(totalSec) {
    const end = Date.now() + totalSec * 1000;
    const el = $('#quizTimer');
    clearInterval(quizState.timerId);
    const tick = () => {
      const remain = Math.max(0, Math.round((end - Date.now()) / 1000));
      const m = String(Math.floor(remain / 60)).padStart(2, '0');
      const s = String(remain % 60).padStart(2, '0');
      el.textContent = m + ':' + s;
      el.classList.toggle('warn', remain < 120 && remain >= 30);
      el.classList.toggle('bad', remain < 30);
      if (remain <= 0) {
        clearInterval(quizState.timerId);
        finishQuiz(tr('time_up'));
      }
    };
    tick();
    quizState.timerId = setInterval(tick, 500);
  }

  function updateProgress() {
    const total = quizState.items.length;
    const cur = Math.min(quizState.idx + 1, total);
    $('#quizProgress').textContent = cur + ' / ' + total;
    const pct = (cur / total) * 100;
    $('#progressBar').style.width = pct + '%';
  }

  function renderCurrentItem() {
    updateProgress();
    const item = quizState.items[quizState.idx];
    const container = $('#quizContent');
    container.innerHTML = '';
    if (!item) return finishQuiz();

    if (item.type === 'mc') renderMC(container, item);
    else if (item.type === 'match') renderMatch(container, item);
    else if (item.type === 'cloze') renderCloze(container, item);
    else container.appendChild(el('p', {}, 'Tipo de pregunta no reconocido.'));
  }

  // ------- Material de apoyo (texto o transcripción) junto a la pregunta -------
  // Siempre visible en la misma página, pero plegable para quien prefiera ocultarlo.
  function appendSupportMaterial(card, item) {
    if (item.reading) {
      const det = el('details', { class: 'audio-placeholder', open: '' });
      det.appendChild(el('summary', {}, tr('support_reading')));
      det.appendChild(el('div', { class: 'reading-text', style: 'margin-top:10px' }, item.reading));
      card.appendChild(det);
    }
    if (item.transcript) {
      const det = el('details', { class: 'audio-placeholder', open: '' });
      det.appendChild(el('summary', {}, tr('support_audio')));
      det.appendChild(el('div', { class: 'transcript' }, item.transcript));
      card.appendChild(det);
    }
  }

  // ------- Opción múltiple (a/b/c) -------
  function renderMC(container, item) {
    const card = el('div', { class: 'question-card' });
    appendSupportMaterial(card, item);
    card.appendChild(el('p', { class: 'question-text' }, item.q));
    const optsBox = el('div');
    card.appendChild(optsBox);
    const feedback = el('div');
    card.appendChild(feedback);
    container.appendChild(card);

    let selected = null;
    let answered = false;
    item.opciones.forEach((op, i) => {
      const btn = el('button', { class: 'option' },
        el('span', { class: 'option-letter' }, 'abc'[i] || String(i + 1)),
        el('span', {}, stripPrefix(op))
      );
      btn.addEventListener('click', () => {
        if (answered) return;
        selected = i;
        $$('.option', optsBox).forEach((b) => b.classList.remove('selected'));
        btn.classList.add('selected');
      });
      optsBox.appendChild(btn);
    });

    const confirm = el('button', { class: 'btn' }, tr('check'));
    const next = el('button', { class: 'btn ghost' }, tr('next'));
    next.style.display = 'none';
    card.appendChild(confirm);
    card.appendChild(next);

    confirm.addEventListener('click', () => {
      if (selected === null) return alert(tr('pick_first'));
      answered = true;
      confirm.style.display = 'none';
      next.style.display = '';
      const buttons = $$('.option', optsBox);
      buttons.forEach((b, i) => {
        b.disabled = true;
        if (i === item.correcta) b.classList.add('correct');
        else if (i === selected) b.classList.add('wrong');
      });
      const ok = selected === item.correcta;
      if (ok) quizState.correct += 1;
      recordAnswer(ok, quizState.mode);
      feedback.innerHTML = '';
      feedback.appendChild(el('div', { class: 'feedback ' + (ok ? 'ok' : 'bad') }, ok ? tr('correct') : tr('incorrect')));
      if (item.explicacion) {
        feedback.appendChild(el('div', { class: 'feedback-explain' }, el('strong', {}, tr('explanation')), document.createTextNode(item.explicacion)));
      }
    });
    next.addEventListener('click', nextItem);
  }

  function stripPrefix(opt) {
    // Quita "a) " / "b) " al principio para que no se duplique con la letra de color.
    return String(opt).replace(/^\s*[a-cA-C]\)\s*/, '');
  }

  // ------- Relacionar (matching: afirmación -> texto A/B/C/D) -------
  function renderMatch(container, item) {
    const card = el('div', { class: 'question-card' });
    appendSupportMaterial(card, item);
    card.appendChild(el('p', { class: 'question-text' },
      el('strong', {}, tr('afirmacion')),
      document.createTextNode(item.afirmacion)
    ));
    const opts = item.choices;
    const optsBox = el('div');
    card.appendChild(optsBox);
    const feedback = el('div');
    card.appendChild(feedback);

    let selected = null;
    let answered = false;
    opts.forEach((label, i) => {
      const btn = el('button', { class: 'option' },
        el('span', { class: 'option-letter' }, label.letter),
        el('span', {}, label.text)
      );
      btn.addEventListener('click', () => {
        if (answered) return;
        selected = label.letter;
        $$('.option', optsBox).forEach((b) => b.classList.remove('selected'));
        btn.classList.add('selected');
      });
      optsBox.appendChild(btn);
    });

    const confirm = el('button', { class: 'btn' }, tr('check'));
    const next = el('button', { class: 'btn ghost' }, tr('next'));
    next.style.display = 'none';
    card.appendChild(confirm);
    card.appendChild(next);
    container.appendChild(card);

    confirm.addEventListener('click', () => {
      if (selected === null) return alert(tr('pick_one'));
      answered = true;
      confirm.style.display = 'none';
      next.style.display = '';
      const buttons = $$('.option', optsBox);
      buttons.forEach((b, i) => {
        b.disabled = true;
        if (opts[i].letter === item.correcta) b.classList.add('correct');
        else if (opts[i].letter === selected) b.classList.add('wrong');
      });
      const ok = selected === item.correcta;
      if (ok) quizState.correct += 1;
      recordAnswer(ok, quizState.mode);
      feedback.innerHTML = '';
      feedback.appendChild(el('div', { class: 'feedback ' + (ok ? 'ok' : 'bad') }, ok ? tr('correct') : tr('incorrect')));
      if (item.explicacion) {
        feedback.appendChild(el('div', { class: 'feedback-explain' }, el('strong', {}, tr('explanation')), document.createTextNode(item.explicacion)));
      }
    });
    next.addEventListener('click', nextItem);
  }

  // ------- Huecos (cloze con opciones por hueco) -------
  // Usamos el mismo renderMC porque estructuralmente cada hueco es mc,
  // pero con el contexto del texto mostrado arriba.
  function renderCloze(container, item) {
    // item = { textContext, q, opciones, correcta, explicacion }
    renderMC(container, { ...item, reading: item.textContext, type: 'mc' });
  }

  function nextItem() {
    if (quizState.idx >= quizState.items.length - 1) {
      finishQuiz();
    } else {
      quizState.idx += 1;
      renderCurrentItem();
    }
  }

  function finishQuiz(msg) {
    clearInterval(quizState.timerId);
    const total = quizState.items.length;
    const correct = quizState.correct;
    const wrong = total - correct;
    const pct = Math.round((correct / total) * 100);
    $('#resultScore').textContent = pct + '%';
    const labels = [
      [90, 'res_l_90'], [75, 'res_l_75'], [60, 'res_l_60'], [40, 'res_l_40'], [0, 'res_l_0']
    ];
    const label = tr(labels.find(([m]) => pct >= m)[1]);
    $('#resultLabel').textContent = msg ? msg + ' ' + label : label;
    $('#resCorrect').textContent = correct;
    $('#resWrong').textContent = wrong;
    $('#resTotal').textContent = total;
    $('#resultFeedback').innerHTML = '';
    show('resultScreen');
  }
  window.repeatQuiz = () => {
    if (quizState) startQuiz({ title: quizState.title, mode: quizState.mode, items: quizState.items, timerSec: quizState.timerSec });
  };

  // ---------- Handlers de lectura (usan el motor de quiz) ----------
  window._deleHandlers.reading = (task) => {
    if (task === 't1') startReadingT1();
    else if (task === 't2') startReadingT2();
    else if (task === 't3') startReadingT3();
    else if (task === 't4') startReadingT4();
  };

  function startReadingT1() {
    // Cada texto genera 6 items mc con su reading adjunto.
    const items = [];
    D.reading.t1.forEach((text) => {
      text.preguntas.forEach((p, i) => {
        items.push({
          type: 'mc',
          reading: text.texto,
          q: p.q,
          opciones: p.opciones,
          correcta: p.correcta,
          explicacion: p.explicacion
        });
      });
    });
    startQuiz({ title: tr('qt_r1'), mode: 'r1', items });
  }

  function startReadingT2() {
    // Cada afirmación se convierte en item match con los 4 textos.
    const items = [];
    D.reading.t2.forEach((set) => {
      set.afirmaciones.forEach((af, idx) => {
        items.push({
          type: 'match',
          reading: renderT2Texts(set.textos),
          afirmacion: af.texto,
          choices: set.textos.map((t) => ({ letter: t.letra, text: t.nombre })),
          correcta: af.correcta,
          explicacion: af.explicacion
        });
      });
    });
    // Los textos se muestran con detalles plegables en cada item.
    startQuiz({ title: tr('qt_r2'), mode: 'r2', items });
  }
  function renderT2Texts(textos) {
    return textos.map((t) => `[${t.letra}] ${t.nombre}\n${t.contenido}`).join('\n\n');
  }

  function startReadingT3() {
    const items = [];
    D.reading.t3.forEach((set) => {
      const frags = set.fragmentos;
      set.huecos.forEach((h, idx) => {
        items.push({
          type: 'mc',
          reading: set.texto,
          q: 'Elija el fragmento que encaja en el hueco [' + h.n + ']:',
          opciones: frags.map((f) => f.letra + ') ' + f.texto),
          correcta: frags.findIndex((f) => f.letra === h.correcta),
          explicacion: h.explicacion
        });
      });
    });
    startQuiz({ title: tr('qt_r3'), mode: 'r3', items });
  }

  function startReadingT4() {
    const items = [];
    D.reading.t4.forEach((set) => {
      set.huecos.forEach((h, idx) => {
        items.push({
          type: 'mc',
          reading: set.textoHtml,
          q: 'Hueco [' + h.n + ']: elija la opción correcta.',
          opciones: h.opciones,
          correcta: h.correcta,
          explicacion: h.explicacion
        });
      });
    });
    startQuiz({ title: tr('qt_r4'), mode: 'r4', items });
  }

  // ---------- Handlers de audición ----------
  window._deleHandlers.listening = (task) => {
    if (task === 't1') startListeningT1();
    else if (task === 't2') startListeningT2();
    else if (task === 't3') startListeningT3();
    else if (task === 't4') startListeningT4();
    else if (task === 't5') startListeningT5();
  };

  function startListeningT2() {
    const items = [];
    D.listening.t2.forEach((set) => {
      const choices = [
        { letter: 'A', text: set.hablantes[0] },
        { letter: 'B', text: set.hablantes[1] },
        { letter: 'C', text: tr('ninguno') }
      ];
      set.enunciados.forEach((e) => {
        items.push({
          type: 'match',
          transcript: set.transcripcion,
          afirmacion: e.n + '. ' + e.texto + tr('quien_dice'),
          choices,
          correcta: e.correcta,
          explicacion: e.explicacion
        });
      });
    });
    startQuiz({ title: tr('qt_a2'), mode: 'a2', items });
  }

  function startListeningT4() {
    const items = [];
    D.listening.t4.forEach((set) => {
      const choices = set.enunciados.map((e) => ({ letter: e.letra, text: e.texto }));
      set.soluciones.forEach((sol) => {
        const persona = set.personas.find((p) => p.n === sol.n);
        items.push({
          type: 'match',
          transcript: '[' + persona.nombre + ']\n' + persona.transcripcion,
          afirmacion: '¿Qué enunciado resume lo que dice la ' + persona.nombre.toLowerCase() + '? (3 enunciados sobran en total)',
          choices,
          correcta: sol.correcta,
          explicacion: sol.explicacion
        });
      });
    });
    startQuiz({ title: tr('qt_a4'), mode: 'a4', items });
  }

  function startListeningT1() {
    const items = D.listening.t1.map((m) => ({
      type: 'mc',
      transcript: '[' + m.tipo + ']\n' + m.transcripcion,
      q: m.pregunta,
      opciones: m.opciones,
      correcta: m.correcta,
      explicacion: m.explicacion
    }));
    startQuiz({ title: tr('qt_a1'), mode: 'a1', items });
  }
  function startListeningT3() {
    const items = [];
    D.listening.t3.forEach((e) => {
      e.preguntas.forEach((p, i) => {
        items.push({
          type: 'mc',
          transcript: e.transcripcion,
          q: p.q,
          opciones: p.opciones,
          correcta: p.correcta,
          explicacion: p.explicacion
        });
      });
    });
    startQuiz({ title: tr('qt_a3'), mode: 'a3', items });
  }
  function startListeningT5() {
    const items = [];
    D.listening.t5.forEach((e) => {
      e.preguntas.forEach((p, i) => {
        items.push({
          type: 'mc',
          transcript: e.transcripcion,
          q: p.q,
          opciones: p.opciones,
          correcta: p.correcta,
          explicacion: p.explicacion
        });
      });
    });
    startQuiz({ title: tr('qt_a5'), mode: 'a5', items });
  }

  // =============================================================
  // FLASHCARDS (vocabulario)
  // =============================================================

  let flashState = null;
  const DIFF_KEY = 'dele-b2-flash-difficult';
  function loadDifficult() {
    try { return JSON.parse(localStorage.getItem(DIFF_KEY)) || {}; } catch (e) { return {}; }
  }
  function saveDifficult(d) { localStorage.setItem(DIFF_KEY, JSON.stringify(d)); }
  function cardKey(c) { return c.palabra || c.expresion || c.conector || c.inf || ''; }

  function startFlashcards(cards, title = 'Vocabulario', onlyDifficult = false) {
    activeRerender = null; // en flashcards, cambiar idioma no debe reiniciarlas
    const diffs = loadDifficult()[title] || [];
    let deck = cards;
    if (onlyDifficult) {
      deck = cards.filter((c) => diffs.includes(cardKey(c)));
      if (!deck.length) { alert(tr('no_hard')); return; }
    }
    // Las difíciles primero: repetirlas más es la base del repaso eficaz.
    const hard = deck.filter((c) => diffs.includes(cardKey(c)));
    const rest = deck.filter((c) => !diffs.includes(cardKey(c)));
    flashState = { cards: shuffle(hard).concat(shuffle(rest)), allCards: cards, idx: 0, flipped: false, title };
    $('#flashCategory').textContent = title;
    show('flashScreen');
    renderFlash();
  }

  function markCard(difficult) {
    const s = flashState;
    const key = cardKey(s.cards[s.idx]);
    const all = loadDifficult();
    const list = all[s.title] || [];
    if (difficult && !list.includes(key)) list.push(key);
    if (!difficult) {
      const i = list.indexOf(key);
      if (i >= 0) list.splice(i, 1);
    }
    all[s.title] = list;
    saveDifficult(all);
    window.flashNext();
  }

  function renderFlash() {
    const s = flashState;
    if (!s) return;
    const diffs = loadDifficult()[s.title] || [];
    $('#flashProgress').textContent = (s.idx + 1) + ' / ' + s.cards.length +
      (diffs.length ? tr('flash_progress_hard') + diffs.length : '');
    $('#flashProgressBar').style.width = (((s.idx + 1) / s.cards.length) * 100) + '%';
    const c = s.cards[s.idx];
    const box = $('#flashCardContainer');
    box.innerHTML = '';
    const card = el('div', { class: 'flashcard' });
    card.appendChild(el('div', { class: 'flashcard-type' }, c.categoria || c.funcion || c.tipo || (c.inf ? 'verbo' : 'B2')));
    card.appendChild(el('div', { class: 'flashcard-word' }, c.palabra || c.expresion || c.conector || c.inf));
    if (s.flipped) {
      if (c.traduccion) card.appendChild(el('div', { class: 'flashcard-translation' }, c.traduccion));
      if (c.ua) card.appendChild(el('div', { class: 'flashcard-translation' }, c.ua));
      if (c.significado) card.appendChild(el('div', { class: 'flashcard-example' }, c.significado));
      if (c.formas) card.appendChild(el('div', { class: 'flashcard-example', style: 'font-style:normal;font-weight:600;margin-bottom:8px' }, c.formas));
      if (c.funcion && c.conector) card.appendChild(el('div', { class: 'flashcard-example' }, 'Función: ' + c.funcion));
      if (c.ejemplo) card.appendChild(el('div', { class: 'flashcard-example' }, '"' + c.ejemplo + '"'));
    } else {
      card.appendChild(el('div', { class: 'flashcard-hint' }, tr('flash_hint')));
    }
    card.addEventListener('click', () => {
      s.flipped = !s.flipped;
      renderFlash();
    });
    box.appendChild(card);

    if (s.flipped) {
      const row = el('div', { class: 'nav-buttons' });
      const hardBtn = el('button', { class: 'btn secondary' }, tr('flash_hard'));
      const okBtn = el('button', { class: 'btn' }, tr('flash_know'));
      hardBtn.addEventListener('click', () => markCard(true));
      okBtn.addEventListener('click', () => markCard(false));
      row.appendChild(hardBtn);
      row.appendChild(okBtn);
      box.appendChild(row);
    } else {
      const diffCount = (loadDifficult()[s.title] || []).length;
      if (diffCount && s.allCards) {
        const rev = el('button', { class: 'btn ghost', style: 'margin-top:10px' }, tr('flash_review_hard', { n: diffCount }));
        rev.addEventListener('click', () => startFlashcards(s.allCards, s.title, true));
        box.appendChild(rev);
      }
    }
  }
  window.flashNext = () => {
    if (!flashState) return;
    flashState.idx = (flashState.idx + 1) % flashState.cards.length;
    flashState.flipped = false;
    renderFlash();
  };
  window.flashPrev = () => {
    if (!flashState) return;
    flashState.idx = (flashState.idx - 1 + flashState.cards.length) % flashState.cards.length;
    flashState.flipped = false;
    renderFlash();
  };
  window.flashShuffle = () => {
    if (!flashState) return;
    flashState.cards = shuffle(flashState.cards);
    flashState.idx = 0;
    flashState.flipped = false;
    renderFlash();
  };

  window._deleHandlers.flashcards = () => startFlashcards(D.vocab, 'Vocabulario B2');
  window._deleHandlers.idioms     = () => startFlashcards(D.idioms, 'Expresiones y modismos');
  window._deleHandlers.connectors = () => startFlashcards(D.connectors, 'Conectores discursivos');
  window._deleHandlers.verbflash  = () => startFlashcards(D.verbs, 'Verbos clave');

  // ---------- Mazos temáticos (listas de Yana, con ucraniano) ----------
  window._deleHandlers.serEstar = () => startFlashcards(D.serEstarExpr, 'Frases con SER y ESTAR');

  // Genera un quiz de opción múltiple a partir de un mazo {palabra, traduccion}.
  // Mezcla dos direcciones: reconocer el significado (ES→UA) y producir la
  // palabra (UA→ES). Los distractores salen del mismo mazo y se deduplican por
  // la respuesta, de modo que nunca hay dos opciones correctas.
  function buildVocabQuiz(cards, n) {
    const pool = cards.filter((c) => c.palabra && c.traduccion);
    if (pool.length < 3) return [];
    const count = Math.min(n, pool.length);
    return shuffle(pool).slice(0, count).map((c, i) => {
      const askMeaning = i % 2 === 0; // alterna dirección
      const answerKey = askMeaning ? 'traduccion' : 'palabra';
      const correct = c[answerKey];
      const distractores = [];
      for (const o of shuffle(pool)) {
        if (o[answerKey] === correct) continue;
        if (distractores.includes(o[answerKey])) continue;
        distractores.push(o[answerKey]);
        if (distractores.length === 2) break;
      }
      const opciones = shuffle([correct].concat(distractores));
      return {
        type: 'mc',
        q: askMeaning
          ? '¿Qué significa «' + c.palabra + '»?'
          : '¿Qué palabra o expresión significa «' + c.traduccion + '»?',
        opciones,
        correcta: opciones.indexOf(correct),
        explicacion: c.palabra + ' — ' + c.traduccion
      };
    });
  }

  function startVocabQuiz(cards, title, n) {
    const items = buildVocabQuiz(cards, n || 15);
    if (!items.length) { alert(tr('ab_too_small')); return; }
    startQuiz({ title: title, mode: 'vocab-quiz', items });
  }

  // Reúne TODO el vocabulario disponible como pares {es, ua}.
  function uaEsPool() {
    const pool = [];
    (D.articleDecks || []).forEach((d) => d.cards.forEach((c) => {
      if (c.palabra && c.traduccion) pool.push({ es: c.palabra, ua: c.traduccion });
    }));
    (D.vocab || []).forEach((c) => { if (c.palabra && c.traduccion) pool.push({ es: c.palabra, ua: c.traduccion }); });
    (D.verbs || []).forEach((v) => { if (v.inf && v.ua) pool.push({ es: v.inf, ua: v.ua }); });
    return pool;
  }

  // Quiz UA→ES con 4 opciones. La palabra ucraniana es la pregunta y hay
  // que elegir la española correcta entre cuatro. Los distractores tienen un
  // significado ucraniano DISTINTO al de la pregunta (para que no haya dos
  // respuestas válidas cuando dos palabras comparten traducción) y palabras
  // españolas diferentes entre sí.
  function buildUaToEsQuiz(pool, n) {
    const clean = pool.filter((x) => x.es && x.ua);
    if (clean.length < 4) return [];
    const count = Math.min(n, clean.length);
    return shuffle(clean).slice(0, count).map((item) => {
      const correct = item.es;
      const distr = [];
      for (const o of shuffle(clean)) {
        if (o.es === correct) continue;
        if (o.ua === item.ua) continue;      // mismo significado → no vale como distractor
        if (distr.includes(o.es)) continue;  // sin españolas repetidas
        distr.push(o.es);
        if (distr.length === 3) break;
      }
      const opciones = shuffle([correct].concat(distr));
      return {
        type: 'mc',
        q: item.ua,
        opciones,
        correcta: opciones.indexOf(correct),
        explicacion: item.es + ' — ' + item.ua
      };
    });
  }

  window._deleHandlers.uaEsQuiz = () => {
    const items = buildUaToEsQuiz(uaEsPool(), 30);
    if (!items.length) { alert(tr('ab_too_small')); return; }
    startQuiz({ title: tr('qt_uaes'), mode: 'ua-es', items });
  };

  // Navegador de vocabulario de artículos (escalable: crece con cada lista nueva)
  window._deleHandlers.articleBrowser = () => {
    activeRerender = window._deleHandlers.articleBrowser;
    $('#listingTitle').textContent = tr('title_articles');
    const c = $('#listingContent');
    c.innerHTML = '';
    const total = D.articleDecks.reduce((s, d) => s + d.cards.length, 0);
    c.appendChild(el('div', { class: 'tip-box' },
      el('strong', {}, tr('ab_intro_strong')),
      tr('ab_intro_rest', { n: total })
    ));
    // Quiz mixto de TODO el vocabulario de artículos
    const mix = el('button', { class: 'btn' }, tr('ab_mixed'));
    mix.addEventListener('click', () => {
      const todo = D.articleDecks.reduce((acc, d) => acc.concat(d.cards), []);
      startVocabQuiz(todo, tr('qt_vocab_mixed'), 20);
    });
    c.appendChild(mix);
    D.articleDecks.forEach((deck) => {
      const box = el('div', { class: 'list-item' });
      box.appendChild(el('h4', { style: 'margin:0' }, deck.emoji + ' ' + deck.titulo));
      box.appendChild(el('p', { style: 'margin:2px 0 8px 0' }, tr('ab_words', { n: deck.cards.length })));
      const row = el('div', { class: 'nav-buttons', style: 'margin-top:0' });
      const fBtn = el('button', { class: 'btn ghost' }, tr('ab_cards'));
      const qBtn = el('button', { class: 'btn secondary' }, tr('ab_quiz'));
      fBtn.addEventListener('click', () => startFlashcards(deck.cards, deck.emoji + ' ' + deck.titulo));
      qBtn.addEventListener('click', () => startVocabQuiz(deck.cards, tr('qt_vocab_prefix') + deck.titulo, 15));
      row.appendChild(fBtn);
      row.appendChild(qBtn);
      box.appendChild(row);
      c.appendChild(box);
    });
    show('listingScreen');
  };

  // Quiz de SER y ESTAR: reconocer el significado de cada frase hecha
  window._deleHandlers.serEstarQuiz = () => {
    const pool = D.serEstarExpr;
    const items = shuffle(pool).slice(0, Math.min(12, pool.length)).map((e) => {
      const distractores = shuffle(pool.filter((o) => o !== e)).slice(0, 2).map((o) => o.significado);
      const opciones = shuffle([e.significado].concat(distractores));
      return {
        type: 'mc',
        q: '¿Qué significa "' + e.expresion + '"?',
        opciones,
        correcta: opciones.indexOf(e.significado),
        explicacion: e.expresion + ' — ' + e.significado + ' · ' + e.traduccion
      };
    });
    startQuiz({ title: tr('qt_serestar'), mode: 'serestar', items });
  };

  // Nota de uso: TENDENCIA (calco frecuente + colocaciones útiles)
  window._deleHandlers.tendencia = () => {
    activeRerender = window._deleHandlers.tendencia;
    $('#listingTitle').textContent = tr('title_tendencia');
    const c = $('#listingContent');
    c.innerHTML = '';
    D.usageNotes.forEach((n) => {
      const box = el('div', { class: 'list-item' });
      box.appendChild(el('h4', { style: 'margin:0 0 6px 0' }, n.palabra));
      box.appendChild(el('div', { class: 'feedback bad', style: 'margin:0 0 6px 0' }, '❌ ' + n.error));
      const alt = el('div', { class: 'feedback ok', style: 'margin:0 0 8px 0' });
      n.alternativas.forEach((a) => alt.appendChild(el('div', {}, '✓ ' + a)));
      box.appendChild(alt);
      box.appendChild(el('p', { style: 'margin:0' }, n.definicion));
      c.appendChild(box);
      n.colocaciones.forEach((col) => {
        const cb = el('div', { class: 'list-item' });
        cb.appendChild(el('h4', { style: 'margin:0' }, col.forma + ' — ' + col.ua));
        cb.appendChild(el('div', { class: 'writing-prompt', style: 'margin:6px 0 0 0' },
          el('div', {}, col.ejemplo),
          el('div', { style: 'color:var(--muted);font-size:13px;margin-top:2px' }, col.ejemploUa)
        ));
        c.appendChild(cb);
      });
    });
    show('listingScreen');
  };

  // ---------- Sinónimos de TENER (pantalla de referencia) ----------
  window._deleHandlers.tenerSyn = () => {
    activeRerender = window._deleHandlers.tenerSyn;
    $('#listingTitle').textContent = tr('title_tener');
    const c = $('#listingContent');
    c.innerHTML = '';
    c.appendChild(el('div', { class: 'tip-box' },
      el('strong', {}, tr('tn_level_strong')),
      tr('tn_level_rest')
    ));
    D.tenerSyn.forEach((v) => {
      const box = el('div', { class: 'list-item' });
      box.appendChild(el('h4', {}, v.verbo + ' — ' + v.ua));
      box.appendChild(el('p', { style: 'margin:2px 0 8px 0' }, v.uso));
      box.appendChild(el('div', { class: 'writing-prompt', style: 'margin:0' },
        el('div', {}, v.ejemplo),
        el('div', { style: 'color:var(--muted);font-size:13px;margin-top:2px' }, v.ejemploUa)
      ));
      c.appendChild(box);
    });
    show('listingScreen');
  };

  // =============================================================
  // TIEMPOS VERBALES (guía) Y VERBOS
  // =============================================================

  window._deleHandlers.tenses = () => {
    activeRerender = window._deleHandlers.tenses;
    $('#listingTitle').textContent = tr('title_tenses');
    const c = $('#listingContent');
    c.innerHTML = '';
    c.appendChild(el('div', { class: 'tip-box' },
      el('strong', {}, tr('tn_how_strong')),
      tr('tn_how_rest')
    ));
    const practicar = el('button', { class: 'btn' }, tr('tn_practice'));
    practicar.addEventListener('click', () => window._deleHandlers.conjugation());
    c.appendChild(practicar);
    D.tenses.forEach((tense) => {
      const box = el('div', { class: 'list-item', style: 'margin-top:12px' });
      box.appendChild(el('h4', {}, tense.nombre));
      box.appendChild(el('p', { style: 'color:var(--red);font-weight:600;margin:2px 0 8px 0' }, tense.ua));
      box.appendChild(el('p', { style: 'font-size:13px;margin:0 0 8px 0' }, el('strong', {}, tr('tn_formation')), document.createTextNode(tense.formacion)));
      const usos = el('div', { class: 'checklist' });
      tense.usos.forEach((u) => usos.appendChild(el('div', { class: 'checklist-item' }, u)));
      box.appendChild(usos);
      tense.ejemplos.forEach((e) => {
        box.appendChild(el('div', { class: 'writing-prompt', style: 'margin-top:8px;margin-bottom:0' },
          el('div', {}, e.es),
          el('div', { style: 'color:var(--muted);font-size:13px;margin-top:2px' }, e.ua)
        ));
      });
      if (tense.truco) {
        box.appendChild(el('div', { class: 'tip-box', style: 'margin-bottom:0' }, el('strong', {}, tr('tn_trick')), document.createTextNode(tense.truco)));
      }
      c.appendChild(box);
    });
    show('listingScreen');
  };

  window._deleHandlers.verbs = () => {
    activeRerender = window._deleHandlers.verbs;
    $('#listingTitle').textContent = tr('title_verbs');
    const c = $('#listingContent');
    c.innerHTML = '';
    c.appendChild(el('div', { class: 'tip-box' },
      el('strong', {}, tr('vb_forms_strong')),
      tr('vb_forms_rest')
    ));
    const row = el('div', { class: 'nav-buttons' });
    const fBtn = el('button', { class: 'btn' }, tr('vb_study_flash'));
    const qBtn = el('button', { class: 'btn secondary' }, tr('vb_quiz'));
    fBtn.addEventListener('click', () => window._deleHandlers.verbflash());
    qBtn.addEventListener('click', () => window._deleHandlers.conjugation());
    row.appendChild(fBtn); row.appendChild(qBtn);
    c.appendChild(row);
    D.verbs.forEach((v) => {
      const box = el('div', { class: 'list-item' });
      box.appendChild(el('h4', {}, v.inf + ' — ' + v.ua));
      box.appendChild(el('p', { style: 'font-weight:600' }, v.formas));
      box.appendChild(el('p', { style: 'font-style:italic' }, '"' + v.ejemplo + '"'));
      c.appendChild(box);
    });
    show('listingScreen');
  };

  // Quiz de conjugación: preguntas fijas + preguntas generadas de los verbos
  function buildVerbFormQuestions(n) {
    const SLOTS = [
      { idx: 1, key: 'slot_indef' },
      { idx: 2, key: 'slot_subj' },
      { idx: 3, key: 'slot_part' }
    ];
    const verbs = shuffle(D.verbs).slice(0, n);
    return verbs.map((v) => {
      const slot = SLOTS[Math.floor(Math.random() * SLOTS.length)];
      const parts = v.formas.split(' · ');
      const correct = parts[slot.idx];
      const others = shuffle(D.verbs.filter((o) => o !== v)).slice(0, 2)
        .map((o) => o.formas.split(' · ')[slot.idx]);
      const opts = shuffle([correct].concat(others));
      return {
        type: 'mc',
        q: tr('conj_q', { inf: v.inf, ua: v.ua, slot: tr(slot.key) }),
        opciones: opts,
        correcta: opts.indexOf(correct),
        explicacion: v.inf + ': ' + v.formas + '. Ejemplo: "' + v.ejemplo + '"'
      };
    });
  }

  window._deleHandlers.conjugation = () => {
    const fixed = shuffle(D.tenseQuiz).slice(0, 8).map((q) => ({
      type: 'mc',
      q: '[' + q.tema + '] ' + q.q,
      opciones: q.opciones,
      correcta: q.correcta,
      explicacion: q.explicacion
    }));
    const generated = buildVerbFormQuestions(7);
    startQuiz({ title: tr('qt_conj'), mode: 'conjugacion', items: shuffle(fixed.concat(generated)) });
  };

  // =============================================================
  // GRAMÁTICA (quiz de 10 preguntas aleatorias por ejecución)
  // =============================================================

  window._deleHandlers.grammar = () => {
    const pool = shuffle(D.grammar).slice(0, Math.min(10, D.grammar.length));
    const items = pool.map((q) => ({
      type: 'mc',
      q: '[' + q.tema + '] ' + q.q,
      opciones: q.opciones,
      correcta: q.correcta,
      explicacion: q.explicacion
    }));
    startQuiz({ title: tr('qt_grammar'), mode: 'gramatica', items });
  };

  // =============================================================
  // ESCRITURA (selector de prompt + editor con contador de palabras)
  // =============================================================

  window._deleHandlers.writing = () => {
    activeRerender = window._deleHandlers.writing;
    const list = $('#writingContent');
    list.innerHTML = '';
    $('#writingTitle').textContent = tr('title_writing_choose');
    const both = [
      { prompts: D.writing.tarea1, label: tr('w_group1') },
      { prompts: D.writing.tarea2, label: tr('w_group2') }
    ];
    both.forEach((group) => {
      list.appendChild(el('div', { class: 'section-title' }, group.label));
      group.prompts.forEach((p) => {
        const item = el('div', { class: 'list-item' });
        item.appendChild(el('h4', {}, p.titulo));
        item.appendChild(el('p', {}, p.instrucciones));
        const open = el('button', { class: 'btn ghost', style: 'margin-top:8px' }, tr('w_start'));
        open.addEventListener('click', () => renderWritingPrompt(p));
        item.appendChild(open);
        list.appendChild(item);
      });
    });
    show('writingScreen');
  };

  function renderWritingPrompt(p) {
    const list = $('#writingContent');
    list.innerHTML = '';
    $('#writingTitle').textContent = p.titulo;

    list.appendChild(el('div', { class: 'writing-prompt' }, p.instrucciones));
    if (p.estimulo) list.appendChild(el('div', { class: 'reading-text' }, p.estimulo));

    if (p.ideasClave && p.ideasClave.length) {
      const tip = el('div', { class: 'tip-box' }, el('strong', {}, tr('w_ideas')));
      p.ideasClave.forEach((i) => tip.appendChild(el('div', {}, '• ' + i)));
      list.appendChild(tip);
    }

    list.appendChild(el('p', { class: 'section-title' }, tr('w_your_text')));
    const textarea = el('textarea', { placeholder: tr('w_placeholder') });
    const wc = el('div', { class: 'word-count' }, tr('w_words', { n: 0 }));
    const saveKey = 'writing-' + p.id;
    textarea.value = localStorage.getItem(saveKey) || '';
    function updateCount() {
      const n = (textarea.value.trim().match(/\S+/g) || []).length;
      wc.textContent = tr('w_words', { n: n });
      wc.className = 'word-count';
      if (n === 0) wc.classList.add('bad');
      else if (n < 120 || n > 200) wc.classList.add('bad');
      else if (n < 150 || n > 180) wc.classList.add('warn');
      else wc.classList.add('ok');
      localStorage.setItem(saveKey, textarea.value);
    }
    textarea.addEventListener('input', updateCount);
    list.appendChild(textarea);
    list.appendChild(wc);
    updateCount();

    if (p.checklist && p.checklist.length) {
      list.appendChild(el('p', { class: 'section-title' }, tr('w_criteria')));
      const cl = el('div', { class: 'checklist' });
      p.checklist.forEach((c) => cl.appendChild(el('div', { class: 'checklist-item' }, c)));
      list.appendChild(cl);
    }

    if (p.modelo) {
      list.appendChild(el('p', { class: 'section-title' }, tr('w_model')));
      const details = el('details', { class: 'audio-placeholder' });
      details.appendChild(el('summary', {}, tr('w_model_toggle')));
      details.appendChild(el('div', { class: 'transcript' }, p.modelo));
      list.appendChild(details);
    }

    const back = el('button', { class: 'btn ghost', style: 'margin-top:12px' }, tr('w_back_list'));
    back.addEventListener('click', () => window._deleHandlers.writing());
    list.appendChild(back);
  }

  // =============================================================
  // EXPRESIÓN ORAL (prompts y guías)
  // =============================================================

  window._deleHandlers.speaking = () => {
    activeRerender = window._deleHandlers.speaking;
    const c = $('#speakingContent');
    c.innerHTML = '';
    // Muletillas para ganar tiempo (referencia rápida, plegable)
    if (D.fillerPhrases && D.fillerPhrases.length) {
      const det = el('details', { class: 'audio-placeholder' });
      det.appendChild(el('summary', {}, tr('sp_fillers_toggle')));
      const box = el('div', { style: 'margin-top:8px' });
      D.fillerPhrases.forEach((f) => {
        box.appendChild(el('div', { class: 'writing-prompt', style: 'margin:0 0 6px 0' },
          el('div', { style: 'font-weight:600' }, f.es),
          el('div', { style: 'color:var(--muted);font-size:13px;margin-top:2px' }, f.ua)
        ));
      });
      det.appendChild(box);
      c.appendChild(det);
    }
    const groups = [
      { key: 'tarea1', label: tr('sp_g1') },
      { key: 'tarea2', label: tr('sp_g2') },
      { key: 'tarea3', label: tr('sp_g3') },
      { key: 'extra', label: tr('sp_extra') }
    ];
    groups.forEach((g) => {
      c.appendChild(el('div', { class: 'section-title' }, g.label));
      (D.speaking[g.key] || []).forEach((p) => {
        const item = el('div', { class: 'list-item' });
        item.appendChild(el('h4', {}, p.titulo));
        const open = el('button', { class: 'btn ghost', style: 'margin-top:8px' }, tr('sp_open'));
        open.addEventListener('click', () => renderSpeakingPrompt(p, g.key));
        item.appendChild(open);
        c.appendChild(item);
      });
    });
    show('speakingScreen');
  };
  function renderSpeakingPrompt(p, key) {
    const c = $('#speakingContent');
    c.innerHTML = '';
    c.appendChild(el('h2', {}, p.titulo));
    const sit = p.situacion || p.escenaDescrita || p.titular || '';
    c.appendChild(el('div', { class: 'writing-prompt' }, sit));
    const lists = [
      { key: 'preguntaEncuesta', single: true },
      { key: 'opcionesEncuesta' },
      { key: 'datosReales' },
      { key: 'propuestas' },
      { key: 'preguntasGuia' },
      { key: 'ayuda' },
      { key: 'vocabularioUtil' },
      { key: 'supuestoExaminador', single: true },
      { key: 'suPapel', single: true },
      { key: 'estrategias' },
      { key: 'estructura' },
      { key: 'ideasClave' }
    ];
    lists.forEach((l) => {
      const v = p[l.key];
      if (!v) return;
      c.appendChild(el('p', { class: 'section-title' }, tr('lbl_' + l.key)));
      if (l.single) {
        c.appendChild(el('div', { class: 'writing-prompt' }, v));
      } else {
        const box = el('div', { class: 'checklist' });
        v.forEach((i) => box.appendChild(el('div', { class: 'checklist-item' }, i)));
        c.appendChild(box);
      }
    });
    const back = el('button', { class: 'btn ghost', style: 'margin-top:12px' }, tr('back'));
    back.addEventListener('click', () => window._deleHandlers.speaking());
    c.appendChild(back);
  }

  // =============================================================
  // TIPS / CONSEJOS
  // =============================================================

  window._deleHandlers.tips = () => {
    activeRerender = window._deleHandlers.tips;
    $('#listingTitle').textContent = tr('title_tips');
    const c = $('#listingContent');
    c.innerHTML = '';
    Object.values(D.tips).forEach((section) => {
      c.appendChild(el('p', { class: 'section-title' }, section.titulo));
      const box = el('div', { class: 'checklist' });
      section.items.forEach((i) => box.appendChild(el('div', { class: 'checklist-item' }, i)));
      c.appendChild(box);
    });
    show('listingScreen');
  };

  // =============================================================
  // QUIZ RÁPIDO (20 preguntas aleatorias de todo el pool)
  // =============================================================

  function buildRandomPool() {
    const items = [];
    D.grammar.forEach((q) => items.push({
      type: 'mc', q: '[' + tr('tag_grammar') + ' · ' + q.tema + '] ' + q.q,
      opciones: q.opciones, correcta: q.correcta, explicacion: q.explicacion
    }));
    D.reading.t1.forEach((txt) => txt.preguntas.forEach((p) => items.push({
      type: 'mc', q: '[' + tr('tag_reading') + '] ' + p.q.replace(/^\d+\.\s*/, ''),
      reading: txt.texto.length > 600 ? null : txt.texto,
      opciones: p.opciones, correcta: p.correcta, explicacion: p.explicacion
    })));
    D.reading.t4.forEach((txt) => txt.huecos.forEach((h) => items.push({
      type: 'mc', q: '[' + tr('tag_lexgram') + '] Complete: ' + h.opciones.join(' / '),
      opciones: h.opciones, correcta: h.correcta, explicacion: h.explicacion
    })));
    D.listening.t1.forEach((m) => items.push({
      type: 'mc', transcript: m.transcripcion,
      q: '[' + tr('tag_listening') + '] ' + m.pregunta, opciones: m.opciones,
      correcta: m.correcta, explicacion: m.explicacion
    }));
    D.tenseQuiz.forEach((q) => items.push({
      type: 'mc', q: '[' + tr('tag_tenses') + ' · ' + q.tema + '] ' + q.q,
      opciones: q.opciones, correcta: q.correcta, explicacion: q.explicacion
    }));
    items.push(...buildVerbFormQuestions(6));
    // Algo de vocabulario de artículos para variar el repaso diario.
    if (D.articleDecks && D.articleDecks.length) {
      const allVocab = D.articleDecks.reduce((a, d) => a.concat(d.cards), []);
      buildVocabQuiz(allVocab, 8).forEach((it) => items.push(Object.assign({}, it, { q: '[' + tr('tag_vocab') + '] ' + it.q })));
    }
    return items;
  }

  window._deleHandlers.random = () => {
    const pool = buildRandomPool();
    const items = shuffle(pool).slice(0, Math.min(20, pool.length));
    startQuiz({ title: tr('qt_random'), mode: 'random', items });
  };

  // =============================================================
  // SIMULACRO DE EXAMEN (lectura + audición con temporizador)
  // =============================================================

  window._deleHandlers.mockexam = () => {
    const confirmStart = confirm(tr('mock_confirm'));
    if (!confirmStart) return;

    const items = [];

    // Lectura T1 (una de cada texto)
    D.reading.t1.slice(0, 1).forEach((t) => {
      t.preguntas.forEach((p, i) => items.push({
        type: 'mc',
        reading: t.texto,
        q: '[Lectura T1] ' + p.q, opciones: p.opciones,
        correcta: p.correcta, explicacion: p.explicacion
      }));
    });
    // Lectura T4 (huecos)
    D.reading.t4.forEach((t) => {
      t.huecos.slice(0, 8).forEach((h, i) => items.push({
        type: 'mc',
        reading: t.textoHtml,
        q: '[Lectura T4] Hueco ' + h.n, opciones: h.opciones,
        correcta: h.correcta, explicacion: h.explicacion
      }));
    });
    // Audición T1 (6 mensajes)
    D.listening.t1.forEach((m) => items.push({
      type: 'mc', transcript: '[' + m.tipo + ']\n' + m.transcripcion,
      q: '[Audición T1] ' + m.pregunta, opciones: m.opciones,
      correcta: m.correcta, explicacion: m.explicacion
    }));
    // Audición T3
    D.listening.t3.forEach((e) => {
      e.preguntas.forEach((p, i) => items.push({
        type: 'mc',
        transcript: e.transcripcion,
        q: '[Audición T3] ' + p.q, opciones: p.opciones,
        correcta: p.correcta, explicacion: p.explicacion
      }));
    });

    startQuiz({ title: tr('qt_mock'), mode: 'simulacro', items, timerSec: 60 * 60 });
  };

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
        el('strong', {}, tr('ios_hint_strong')),
        tr('ios_hint_rest')
      );
      hero.appendChild(hint);
    }, 400);
  }
})();
