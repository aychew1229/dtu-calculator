const CACHE_NAME = 'gpa-calc-v3.6'; // IMPORTANT: Change this version tag (e.g., v4.0 to v4.1) every time you modify your code!

const ASSETS = [
  './',
  'index.html',
  'manifest.json',
  'html2canvas.min.js',
  'icon.png',
  'https://cdn-icons-png.flaticon.com/512/3135/3135715.png',
  'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@300;400;500;600&display=swap'
];

// 1. Install Event: Save core files into cache instantly
self.addEventListener('install', (e) => {
  self.skipWaiting(); // Force the new service worker to activate and replace the old one immediately
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

// 2. Activate Event: Wipe out older cache variations automatically
self.addEventListener('activate', (e) => {
  e.waitUntil(self.clients.claim()); // Take absolute control of the active browser window immediately
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
});

// 3. Fetch Event: Try internet first, update cache, or fallback to cache on network failure/timeout
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;

  // Racing mechanism: Prevents the app from freezing on slow network connections
  const timeout = (ms) => new Promise((_, reject) => 
    setTimeout(() => reject(new Error('Network connection timed out')), ms)
  );

  e.respondWith(
    Promise.race([
      // Action A: Fetch fresh content from the internet
      fetch(e.request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(e.request, responseClone); // Save the fresh file version for the next offline session
          });
        }
        return networkResponse;
      }),
      // Action B: Stop waiting after 2.5 seconds (2500ms) if the connection is hanging
      timeout(2500)
    ]).catch(() => {
      // Offline fallback: If Action A fails OR Action B finishes first, load from local cache storage
      return caches.match(e.request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        // Emergency response if an un-cached asset is requested while offline
        return new Response('Offline content unavailable', {
          status: 503,
          statusText: 'Service Unavailable'
        });
      });
    })
  );
});
