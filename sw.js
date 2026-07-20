// Estrategia: network-first para HTML/JS/CSS (para que los cambios lleguen
// enseguida cuando hay conexión) + cache-first como red de seguridad
// offline. Al cambiar la versión del cache se invalida la anterior.

const CACHE = 'dele-b2-v10';
// Los scripts llevan ?v=10 para que el HTML nuevo pida siempre el motor que le
// corresponde (evita mezclar menú nuevo con motor viejo). Precacheamos ambas
// formas para que funcione offline desde la primera carga.
const ASSETS = [
  './',
  './index.html',
  './i18n.js?v=10',
  './questions.js?v=10',
  './app.js?v=10',
  './manifest.json',
  './icon.svg',
  './icon.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  event.respondWith(
    fetch(req).then((resp) => {
      if (resp && resp.status === 200 && resp.type !== 'opaque') {
        const copy = resp.clone();
        caches.open(CACHE).then((cache) => cache.put(req, copy));
      }
      return resp;
    }).catch(() =>
      caches.match(req).then((cached) => cached || caches.match('./index.html'))
    )
  );
});
