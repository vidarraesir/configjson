// Lógica de la app - se completa en la Tanda 4.
(function () {
  const screens = document.querySelectorAll('.screen');
  const tabs = document.querySelectorAll('.tab');
  const themeBtn = document.getElementById('themeBtn');
  const resetBtn = document.getElementById('resetBtn');

  function show(id) {
    screens.forEach((s) => s.classList.toggle('active', s.id === id));
    window.scrollTo(0, 0);
  }
  window.goHome = () => show('homeScreen');
  window.repeatQuiz = () => show('homeScreen');
  window.flashPrev = () => {};
  window.flashNext = () => {};
  window.flashShuffle = () => {};

  // Stub: todas las tarjetas vuelven al inicio hasta que se implemente el motor.
  document.querySelectorAll('[data-action]').forEach((el) => {
    el.addEventListener('click', () => {
      alert('Esta sección estará disponible pronto.');
    });
  });

  // Tema claro/oscuro con persistencia.
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark') document.documentElement.setAttribute('data-theme', 'dark');
  themeBtn?.addEventListener('click', () => {
    const cur = document.documentElement.getAttribute('data-theme');
    const next = cur === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
  });
  resetBtn?.addEventListener('click', () => {
    if (confirm('¿Reiniciar todo el progreso guardado?')) {
      localStorage.clear();
      location.reload();
    }
  });

  // Pestañas inferiores.
  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      tabs.forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');
      const screen = tab.dataset.screen;
      if (screen) show(screen);
    });
  });
})();
