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
  const DAILY_GOAL = 20;
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
        ? '¡Meta diaria cumplida! ' + hoy + ' preguntas hoy 🎉'
        : 'Meta diaria: ' + hoy + ' / ' + DAILY_GOAL + ' preguntas';
    }
    if (goalBar) goalBar.style.width = Math.min(100, (hoy / DAILY_GOAL) * 100) + '%';
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

  // =============================================================
  // MOTOR DE QUIZ (opción múltiple, relacionar, huecos)
  // =============================================================

  let quizState = null;
  function startQuiz({ title, mode, items, timerSec = 0 }) {
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
        finishQuiz('¡Tiempo agotado!');
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
      det.appendChild(el('summary', {}, '▾ Texto de lectura (toca para ocultar/mostrar)'));
      det.appendChild(el('div', { class: 'reading-text', style: 'margin-top:10px' }, item.reading));
      card.appendChild(det);
    }
    if (item.transcript) {
      const det = el('details', { class: 'audio-placeholder', open: '' });
      det.appendChild(el('summary', {}, '▾ Audio (transcripción — léela en voz alta o usa la lectura del sistema)'));
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

    const confirm = el('button', { class: 'btn' }, 'Comprobar');
    const next = el('button', { class: 'btn ghost' }, 'Siguiente ›');
    next.style.display = 'none';
    card.appendChild(confirm);
    card.appendChild(next);

    confirm.addEventListener('click', () => {
      if (selected === null) return alert('Elige una opción primero.');
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
      feedback.appendChild(el('div', { class: 'feedback ' + (ok ? 'ok' : 'bad') }, ok ? '¡Correcto!' : 'Incorrecto.'));
      if (item.explicacion) {
        feedback.appendChild(el('div', { class: 'feedback-explain' }, el('strong', {}, 'Explicación: '), document.createTextNode(item.explicacion)));
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
      el('strong', {}, 'Afirmación: '),
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

    const confirm = el('button', { class: 'btn' }, 'Comprobar');
    const next = el('button', { class: 'btn ghost' }, 'Siguiente ›');
    next.style.display = 'none';
    card.appendChild(confirm);
    card.appendChild(next);
    container.appendChild(card);

    confirm.addEventListener('click', () => {
      if (selected === null) return alert('Elige una opción.');
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
      feedback.appendChild(el('div', { class: 'feedback ' + (ok ? 'ok' : 'bad') }, ok ? '¡Correcto!' : 'Incorrecto.'));
      if (item.explicacion) {
        feedback.appendChild(el('div', { class: 'feedback-explain' }, el('strong', {}, 'Explicación: '), document.createTextNode(item.explicacion)));
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
      [90, '¡Excelente! Nivel sobresaliente.'],
      [75, '¡Muy bien! Estás lista para el examen.'],
      [60, 'Aprobado. Sigue practicando puntos débiles.'],
      [40, 'Por debajo del aprobado. Revisa las explicaciones.'],
      [0,  'Mucho por repasar. No te rindas, ¡es el principio!']
    ];
    const label = labels.find(([m]) => pct >= m)[1];
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
    startQuiz({ title: 'Lectura · Tarea 1', mode: 'r1', items });
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
    startQuiz({ title: 'Lectura · Tarea 2', mode: 'r2', items });
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
    startQuiz({ title: 'Lectura · Tarea 3', mode: 'r3', items });
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
    startQuiz({ title: 'Lectura · Tarea 4', mode: 'r4', items });
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
        { letter: 'C', text: 'Ninguno de los dos' }
      ];
      set.enunciados.forEach((e) => {
        items.push({
          type: 'match',
          transcript: set.transcripcion,
          afirmacion: e.n + '. ' + e.texto + '  —  ¿Quién lo dice?',
          choices,
          correcta: e.correcta,
          explicacion: e.explicacion
        });
      });
    });
    startQuiz({ title: 'Audición · Tarea 2 (¿quién lo dice?)', mode: 'a2', items });
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
    startQuiz({ title: 'Audición · Tarea 4 (relacionar personas)', mode: 'a4', items });
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
    startQuiz({ title: 'Audición · Tarea 1 (mensajes cortos)', mode: 'a1', items });
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
    startQuiz({ title: 'Audición · Tarea 3 (entrevista)', mode: 'a3', items });
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
    startQuiz({ title: 'Audición · Tarea 5 (conferencia)', mode: 'a5', items });
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
    const diffs = loadDifficult()[title] || [];
    let deck = cards;
    if (onlyDifficult) {
      deck = cards.filter((c) => diffs.includes(cardKey(c)));
      if (!deck.length) { alert('No hay tarjetas marcadas como difíciles en este mazo. ¡Bien hecho!'); return; }
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
      (diffs.length ? ' · difíciles: ' + diffs.length : '');
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
      card.appendChild(el('div', { class: 'flashcard-hint' }, 'Toca la tarjeta para ver la respuesta'));
    }
    card.addEventListener('click', () => {
      s.flipped = !s.flipped;
      renderFlash();
    });
    box.appendChild(card);

    if (s.flipped) {
      const row = el('div', { class: 'nav-buttons' });
      const hardBtn = el('button', { class: 'btn secondary' }, 'Difícil, repetir');
      const okBtn = el('button', { class: 'btn' }, '¡La sé!');
      hardBtn.addEventListener('click', () => markCard(true));
      okBtn.addEventListener('click', () => markCard(false));
      row.appendChild(hardBtn);
      row.appendChild(okBtn);
      box.appendChild(row);
    } else {
      const diffCount = (loadDifficult()[s.title] || []).length;
      if (diffCount && s.allCards) {
        const rev = el('button', { class: 'btn ghost', style: 'margin-top:10px' }, 'Repasar solo difíciles (' + diffCount + ')');
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

  // Navegador de vocabulario de artículos (escalable: crece con cada lista nueva)
  window._deleHandlers.articleBrowser = () => {
    $('#listingTitle').textContent = 'Vocabulario de artículos · Ucraniano';
    const c = $('#listingContent');
    c.innerHTML = '';
    const total = D.articleDecks.reduce((s, d) => s + d.cards.length, 0);
    c.appendChild(el('div', { class: 'tip-box' },
      el('strong', {}, 'Cada artículo es un mazo. '),
      'Toca uno para estudiarlo con flashcards; marca las difíciles y repásalas aparte. En total: ' + total + ' palabras.'
    ));
    D.articleDecks.forEach((deck) => {
      const b = el('div', { class: 'list-item', style: 'cursor:pointer' });
      b.appendChild(el('h4', { style: 'margin:0' }, deck.emoji + ' ' + deck.titulo));
      b.appendChild(el('p', { style: 'margin:2px 0 0 0' }, deck.cards.length + ' palabras'));
      b.addEventListener('click', () => startFlashcards(deck.cards, deck.emoji + ' ' + deck.titulo));
      c.appendChild(b);
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
    startQuiz({ title: 'Quiz: SER y ESTAR (12)', mode: 'serestar', items });
  };

  // Nota de uso: TENDENCIA (calco frecuente + colocaciones útiles)
  window._deleHandlers.tendencia = () => {
    $('#listingTitle').textContent = 'Palabra clave: TENDENCIA';
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
    $('#listingTitle').textContent = 'Sinónimos de TENER · Синоніми до TENER';
    const c = $('#listingContent');
    c.innerHTML = '';
    c.appendChild(el('div', { class: 'tip-box' },
      el('strong', {}, 'Sube tu nivel: '),
      'el verbo "tener" es correcto, pero repetirlo baja la nota en el DELE. Sustitúyelo por estos sinónimos según el contexto y tu expresión sonará mucho más rica.'
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
    $('#listingTitle').textContent = 'Tiempos verbales · Дієслівні часи';
    const c = $('#listingContent');
    c.innerHTML = '';
    c.appendChild(el('div', { class: 'tip-box' },
      el('strong', {}, '¿Cómo estudiar los tiempos? '),
      'Lee un tiempo al día, copia sus ejemplos a mano y luego haz el quiz de conjugación. El contraste indefinido/imperfecto y el subjuntivo son los que más caen en el examen.'
    ));
    const practicar = el('button', { class: 'btn' }, 'Practicar conjugación (quiz)');
    practicar.addEventListener('click', () => window._deleHandlers.conjugation());
    c.appendChild(practicar);
    D.tenses.forEach((t) => {
      const box = el('div', { class: 'list-item', style: 'margin-top:12px' });
      box.appendChild(el('h4', {}, t.nombre));
      box.appendChild(el('p', { style: 'color:var(--red);font-weight:600;margin:2px 0 8px 0' }, t.ua));
      box.appendChild(el('p', { style: 'font-size:13px;margin:0 0 8px 0' }, el('strong', {}, 'Formación: '), document.createTextNode(t.formacion)));
      const usos = el('div', { class: 'checklist' });
      t.usos.forEach((u) => usos.appendChild(el('div', { class: 'checklist-item' }, u)));
      box.appendChild(usos);
      t.ejemplos.forEach((e) => {
        box.appendChild(el('div', { class: 'writing-prompt', style: 'margin-top:8px;margin-bottom:0' },
          el('div', {}, e.es),
          el('div', { style: 'color:var(--muted);font-size:13px;margin-top:2px' }, e.ua)
        ));
      });
      if (t.truco) {
        box.appendChild(el('div', { class: 'tip-box', style: 'margin-bottom:0' }, el('strong', {}, 'Truco: '), document.createTextNode(t.truco)));
      }
      c.appendChild(box);
    });
    show('listingScreen');
  };

  window._deleHandlers.verbs = () => {
    $('#listingTitle').textContent = 'Verbos clave · Ключові дієслова';
    const c = $('#listingContent');
    c.innerHTML = '';
    c.appendChild(el('div', { class: 'tip-box' },
      el('strong', {}, 'Formas mostradas: '),
      'yo presente · yo indefinido · yo subjuntivo · participio. Domina estas cuatro y el resto de la conjugación sale sola.'
    ));
    const row = el('div', { class: 'nav-buttons' });
    const fBtn = el('button', { class: 'btn' }, 'Estudiar con flashcards');
    const qBtn = el('button', { class: 'btn secondary' }, 'Quiz de conjugación');
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
      { idx: 1, label: 'yo, pretérito indefinido' },
      { idx: 2, label: 'yo, presente de subjuntivo' },
      { idx: 3, label: 'participio' }
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
        q: '¿Cuál es la forma correcta de "' + v.inf + '" (' + v.ua + ') — ' + slot.label + '?',
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
    startQuiz({ title: 'Conjugación (15 preguntas)', mode: 'conjugacion', items: shuffle(fixed.concat(generated)) });
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
    startQuiz({ title: 'Gramática B2 (10 preguntas)', mode: 'gramatica', items });
  };

  // =============================================================
  // ESCRITURA (selector de prompt + editor con contador de palabras)
  // =============================================================

  window._deleHandlers.writing = () => {
    const list = $('#writingContent');
    list.innerHTML = '';
    $('#writingTitle').textContent = 'Expresión escrita — elige una tarea';
    const both = [
      { prompts: D.writing.tarea1, label: 'Tarea 1 · Carta formal' },
      { prompts: D.writing.tarea2, label: 'Tarea 2 · Redacción' }
    ];
    both.forEach((group) => {
      list.appendChild(el('div', { class: 'section-title' }, group.label));
      group.prompts.forEach((p) => {
        const item = el('div', { class: 'list-item' });
        item.appendChild(el('h4', {}, p.titulo));
        item.appendChild(el('p', {}, p.instrucciones));
        const open = el('button', { class: 'btn ghost', style: 'margin-top:8px' }, 'Empezar');
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
      const tip = el('div', { class: 'tip-box' }, el('strong', {}, 'Ideas clave: '));
      p.ideasClave.forEach((i) => tip.appendChild(el('div', {}, '• ' + i)));
      list.appendChild(tip);
    }

    list.appendChild(el('p', { class: 'section-title' }, 'Tu redacción'));
    const textarea = el('textarea', { placeholder: 'Escribe aquí tu texto...' });
    const wc = el('div', { class: 'word-count' }, '0 palabras');
    const saveKey = 'writing-' + p.id;
    textarea.value = localStorage.getItem(saveKey) || '';
    function updateCount() {
      const n = (textarea.value.trim().match(/\S+/g) || []).length;
      wc.textContent = n + ' palabras (objetivo: 150–180)';
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
      list.appendChild(el('p', { class: 'section-title' }, 'Criterios a revisar'));
      const cl = el('div', { class: 'checklist' });
      p.checklist.forEach((c) => cl.appendChild(el('div', { class: 'checklist-item' }, c)));
      list.appendChild(cl);
    }

    if (p.modelo) {
      list.appendChild(el('p', { class: 'section-title' }, 'Texto modelo (tras escribir el tuyo)'));
      const details = el('details', { class: 'audio-placeholder' });
      details.appendChild(el('summary', {}, '▸ Ver texto modelo'));
      details.appendChild(el('div', { class: 'transcript' }, p.modelo));
      list.appendChild(details);
    }

    const back = el('button', { class: 'btn ghost', style: 'margin-top:12px' }, '‹ Volver a la lista');
    back.addEventListener('click', () => window._deleHandlers.writing());
    list.appendChild(back);
  }

  // =============================================================
  // EXPRESIÓN ORAL (prompts y guías)
  // =============================================================

  window._deleHandlers.speaking = () => {
    const c = $('#speakingContent');
    c.innerHTML = '';
    // Muletillas para ganar tiempo (referencia rápida, plegable)
    if (D.fillerPhrases && D.fillerPhrases.length) {
      const det = el('details', { class: 'audio-placeholder' });
      det.appendChild(el('summary', {}, '▸ Muletillas para ganar tiempo · Як заповнити тишу'));
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
      { key: 'tarea1', label: 'Tarea 1 · Valorar propuestas (6-7 min)' },
      { key: 'tarea2', label: 'Tarea 2 · Situación a partir de una foto (5-6 min)' },
      { key: 'tarea3', label: 'Tarea 3 · Opinar sobre una encuesta (3-4 min)' },
      { key: 'extra', label: 'Práctica extra de conversación (no entra en el examen)' }
    ];
    groups.forEach((g) => {
      c.appendChild(el('div', { class: 'section-title' }, g.label));
      (D.speaking[g.key] || []).forEach((p) => {
        const item = el('div', { class: 'list-item' });
        item.appendChild(el('h4', {}, p.titulo));
        const open = el('button', { class: 'btn ghost', style: 'margin-top:8px' }, 'Abrir');
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
      { key: 'preguntaEncuesta', label: 'Pregunta de la encuesta', single: true },
      { key: 'opcionesEncuesta', label: 'Opciones (conteste usted primero)' },
      { key: 'datosReales', label: 'Datos reales (compárelos con su respuesta)' },
      { key: 'propuestas', label: 'Propuestas a valorar' },
      { key: 'preguntasGuia', label: 'Preguntas guía' },
      { key: 'ayuda', label: 'Ayudas y vocabulario' },
      { key: 'vocabularioUtil', label: 'Vocabulario útil' },
      { key: 'supuestoExaminador', label: 'Papel del examinador', single: true },
      { key: 'suPapel', label: 'Tu papel', single: true },
      { key: 'estrategias', label: 'Estrategias' },
      { key: 'estructura', label: 'Estructura sugerida' },
      { key: 'ideasClave', label: 'Ideas clave' }
    ];
    lists.forEach((l) => {
      const v = p[l.key];
      if (!v) return;
      c.appendChild(el('p', { class: 'section-title' }, l.label));
      if (l.single) {
        c.appendChild(el('div', { class: 'writing-prompt' }, v));
      } else {
        const box = el('div', { class: 'checklist' });
        v.forEach((i) => box.appendChild(el('div', { class: 'checklist-item' }, i)));
        c.appendChild(box);
      }
    });
    const back = el('button', { class: 'btn ghost', style: 'margin-top:12px' }, '‹ Volver');
    back.addEventListener('click', () => window._deleHandlers.speaking());
    c.appendChild(back);
  }

  // =============================================================
  // TIPS / CONSEJOS
  // =============================================================

  window._deleHandlers.tips = () => {
    $('#listingTitle').textContent = 'Consejos y estrategias';
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
      type: 'mc', q: '[Gramática · ' + q.tema + '] ' + q.q,
      opciones: q.opciones, correcta: q.correcta, explicacion: q.explicacion
    }));
    D.reading.t1.forEach((t) => t.preguntas.forEach((p) => items.push({
      type: 'mc', q: '[Lectura] ' + p.q.replace(/^\d+\.\s*/, ''),
      reading: t.texto.length > 600 ? null : t.texto,
      opciones: p.opciones, correcta: p.correcta, explicacion: p.explicacion
    })));
    D.reading.t4.forEach((t) => t.huecos.forEach((h) => items.push({
      type: 'mc', q: '[Léxico/Gramática] Complete: ' + h.opciones.join(' / '),
      opciones: h.opciones, correcta: h.correcta, explicacion: h.explicacion
    })));
    D.listening.t1.forEach((m) => items.push({
      type: 'mc', transcript: m.transcripcion,
      q: '[Audición] ' + m.pregunta, opciones: m.opciones,
      correcta: m.correcta, explicacion: m.explicacion
    }));
    D.tenseQuiz.forEach((q) => items.push({
      type: 'mc', q: '[Tiempos · ' + q.tema + '] ' + q.q,
      opciones: q.opciones, correcta: q.correcta, explicacion: q.explicacion
    }));
    items.push(...buildVerbFormQuestions(6));
    return items;
  }

  window._deleHandlers.random = () => {
    const pool = buildRandomPool();
    const items = shuffle(pool).slice(0, Math.min(20, pool.length));
    startQuiz({ title: 'Quiz rápido (20 mixtas)', mode: 'random', items });
  };

  // =============================================================
  // SIMULACRO DE EXAMEN (lectura + audición con temporizador)
  // =============================================================

  window._deleHandlers.mockexam = () => {
    const confirmStart = confirm(
      'Simulacro DELE B2:\n\n' +
      '• Lectura (≈20 preguntas) + Audición (≈18 preguntas)\n' +
      '• Tiempo total: 60 minutos con cronómetro\n' +
      '• Las escritas y orales se practican aparte.\n\n' +
      '¿Empezar?'
    );
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

    startQuiz({ title: 'Simulacro DELE B2', mode: 'simulacro', items, timerSec: 60 * 60 });
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
        el('strong', {}, 'Instálala en tu iPhone:'),
        ' pulsa el botón Compartir en Safari y elige "Añadir a pantalla de inicio" para usarla como una app.'
      );
      hero.appendChild(hint);
    }, 400);
  }
})();
