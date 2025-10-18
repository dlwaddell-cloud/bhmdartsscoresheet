const CACHE_NAME = 'bar-darts-cache-v2'; // Incremented cache version
const urlsToCache = [
  '/',
  'BarDarts.html',
  '501Darts.html',
  'DartsCricket.html',
  'NSCricket.html',
  'DartsHalveIt.html',
  'DartsGolf.html',
  'KillerDarts.html',
  'manifest.json',
  'icon-192x192.png',
  'icon-512x512.png',
  'apple-touch-icon.png',
  'favicon.ico'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache and caching files');
        return cache.addAll(urlsToCache);
      })
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response; // Serve from cache
        }
        return fetch(event.request); // Fetch from network
      })
  );
});

