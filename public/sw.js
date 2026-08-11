/* Code Arcade service worker — offline cache */
const CACHE = 'codearcade-v2';
const FILES = [
  './', './index.html', './manifest.webmanifest', './icons/icon.svg',
  './css/style.css',
  './js/main.js', './js/core.js', './js/ui.js', './js/data/bank.js',
  './js/games/bughunter.js', './js/games/oracle.js', './js/games/parsons.js',
  './js/games/binary.js', './js/games/regex.js', './js/games/typer.js',
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
  ).then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return;
  e.respondWith(
    fetch(e.request)
      .then(res => {
        if (res.ok) {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, copy)).catch(() => {});
        }
        return res;
      })
      .catch(() => caches.match(e.request).then(r => {
        if (r) return r;
        if (e.request.mode === 'navigate') return caches.match('./index.html');
        return new Response('', { status: 408 });
      }))
  );
});
