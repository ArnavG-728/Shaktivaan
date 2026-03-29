const CACHE_NAME = 'shaktivaan-cache-v2';
const urlsToCache = [
  '/'
];

// Install event: cache core assets and immediately activate
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

// Activate event: clear old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event: TRUE Network-First strategy
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request)
      .catch(() => {
        // Only return from cache if the network fails (offline)
        return caches.match(event.request).then(response => {
           return response || caches.match('/');
        });
      })
  );
});
