const CACHE_NAME = 'julinemart-pwa-v1';
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/admin/index.html',
  '/admin/inventory.html',
  '/admin/vendors.html',
  '/admin/payments.html',
  '/admin/login.html',
  '/admin/setup-x7k2p9.html',
  '/vendor/index.html',
  '/vendor/payments.html',
  '/vendor/bank-details.html',
  '/vendor/reset-password.html',
  '/favicon.ico',
  '/manifest.webmanifest',
  '/js/shared/auth.js',
  '/js/shared/logo.js',
  '/js/shared/payments.js',
  '/js/shared/supabase.js',
  '/js/shared/supabase.local.example.js',
  '/js/shared/vendor-auth.js',
  '/js/shared/vendor-manager.js',
  '/js/shared/pwa.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
    ))
  );
  self.clients.claim();
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') {
    return;
  }

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) {
    return;
  }

  if (request.mode === 'navigate') {
    event.respondWith(
      caches.match(request).then((cached) => cached || fetch(request).then((resp) => {
        const copy = resp.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
        return resp;
      }).catch(() => caches.match('/index.html')))
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => cached || fetch(request).then((resp) => {
      const copy = resp.clone();
      caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
      return resp;
    }))
  );
});
