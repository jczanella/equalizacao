const CACHE = 'equalizacao-v1';

const ARQUIVOS = [
  '/equalizacao/',
  '/equalizacao/index.html',
  '/equalizacao/manifest.json',
  '/equalizacao/icon-192.png',
  '/equalizacao/icon-512.png',
];

// Instalação: pré-carrega os arquivos no cache
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ARQUIVOS)));
});

// Ativação: remove caches antigos DESTE app (o domínio é compartilhado com /simuladores/)
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k.startsWith('equalizacao-') && k !== CACHE).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

// Network First: com internet busca a versão nova; sem internet usa o cache
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    fetch(event.request)
      .then(response => {
        if (response.ok && event.request.url.includes('jczanella.github.io/equalizacao/')) {
          const clone = response.clone();
          caches.open(CACHE).then(cache => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() => caches.match(event.request, { ignoreSearch: true }))
  );
});
