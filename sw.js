const CACHE_NAME = 'gpa-calc-v2'; // Increment this (v3, v4, etc.) to force an update
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon.png',
  './html2canvas.min.js',
  'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@300;400;500;600&display=swap'
];

// Install: Cache all assets and force immediate activation
self.addEventListener('install', (event) => {
  self.skipWaiting(); 
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

// Activate: Clean up old versions of the cache
self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim()); 
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
});

// Fetch: Network falling back to Cache (Ensures updates if online, works if offline)
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});

// Listen for the "SKIP_WAITING" message from the HTML
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
