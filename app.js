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

  // ------- Opción múltiple (a/b/c) -------
  function renderMC(container, item) {
    const card = el('div', { class: 'question-card' });
    if (item.reading) {
      card.appendChild(el('div', { class: 'reading-text' }, item.reading));
    }
    if (item.transcript) {
      const det = el('details', { class: 'audio-placeholder' });
      det.appendChild(el('summary', {}, '▸ Audio (transcripción — léala en voz alta o use la lectura del sistema)'));
      det.appendChild(el('div', { class: 'transcript' }, item.transcript));
      card.appendChild(det);
    }
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
          reading: i === 0 ? text.texto : null,
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
          reading: idx === 0 ? renderT2Texts(set.textos) : null,
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
          reading: idx === 0 ? set.texto : null,
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
          reading: idx === 0 ? set.textoHtml : null,
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
    else if (task === 't3') startListeningT3();
    else if (task === 't5') startListeningT5();
  };

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
          transcript: i === 0 ? e.transcripcion : null,
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
          transcript: i === 0 ? e.transcripcion : null,
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
  function startFlashcards(cards, title = 'Vocabulario') {
    flashState = { cards: shuffle(cards), idx: 0, flipped: false, title };
    $('#flashCategory').textContent = title;
    show('flashScreen');
    renderFlash();
  }
  function renderFlash() {
    const s = flashState;
    if (!s) return;
    $('#flashProgress').textContent = (s.idx + 1) + ' / ' + s.cards.length;
    $('#flashProgressBar').style.width = (((s.idx + 1) / s.cards.length) * 100) + '%';
    const c = s.cards[s.idx];
    const box = $('#flashCardContainer');
    box.innerHTML = '';
    const card = el('div', { class: 'flashcard' });
    card.appendChild(el('div', { class: 'flashcard-type' }, c.categoria || c.funcion || c.tipo || 'B2'));
    card.appendChild(el('div', { class: 'flashcard-word' }, c.palabra || c.expresion || c.conector));
    if (s.flipped) {
      if (c.traduccion) card.appendChild(el('div', { class: 'flashcard-translation' }, c.traduccion));
      if (c.significado) card.appendChild(el('div', { class: 'flashcard-translation' }, c.significado));
      if (c.funcion && c.conector) card.appendChild(el('div', { class: 'flashcard-translation' }, c.funcion));
      if (c.ejemplo) card.appendChild(el('div', { class: 'flashcard-example' }, '"' + c.ejemplo + '"'));
    } else {
      card.appendChild(el('div', { class: 'flashcard-hint' }, 'Toca la tarjeta para ver la respuesta'));
    }
    card.addEventListener('click', () => {
      s.flipped = !s.flipped;
      renderFlash();
    });
    box.appendChild(card);
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
