// Estrategia: network-first para HTML/JS/CSS (para que los cambios lleguen
// enseguida cuando hay conexión) + cache-first como red de seguridad
// offline. Al cambiar la versión del cache se invalida la anterior.

const CACHE = 'dele-b2-v8';
const ASSETS = [
  './',
  './index.html',
  './i18n.js',
  './app.js',
  './questions.js',
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
