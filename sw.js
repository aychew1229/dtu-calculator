const CACHE_NAME = 'gpa-calc-v3.1'; // Increment this (v4, v5...) to force mobile update
const ASSETS = [
  './',
  'index.html',
  'manifest.json',
  'https://cdn-icons-png.flaticon.com/512/3135/3135715.png',
  'html2canvas.min.js',
  'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@300;400;500;600&display=swap'
];

// Install: Cache everything
self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS);
    })
  );
});

// Activate: Remove old caches
self.addEventListener('activate', (e) => {
  e.waitUntil(clients.claim());
  e.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)));
    })
  );
});

// Fetch: Network-First Strategy
self.addEventListener('fetch', (e) => {
  e.respondWith(
    fetch(e.request)
      .then(networkResponse => {
        // Update cache with fresh version from network
        return caches.open(CACHE_NAME).then(cache => {
          if (e.request.method === 'GET') {
            cache.put(e.request, networkResponse.clone());
          }
          return networkResponse;
        });
      })
      .catch(() => caches.match(e.request)) // Offline fallback
  );
});

// Listener for manual skip waiting
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
