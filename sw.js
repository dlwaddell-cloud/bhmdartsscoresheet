// Define the cache name and files to cache
const CACHE_NAME = 'bar-darts-cache-v9'; // Incremented cache version for update
const urlsToCache = [
  './',
  'bardarts.html',
  '501darts.html',
  'DartsCricket.html',
  'NSCricket.html',
  'DartsHalveIt.html',
  'DartsGolf.html',
  'KillerDarts.html',
  'icon-192x192.png',
  'icon-512x512.png',
  'manifest.json'
];

/**
 * Installation event
 * This event is triggered when the service worker is first installed.
 */
self.addEventListener('install', event => {
  // Perform install steps
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache and caching files for offline use.');
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting()) // Force the new service worker to activate immediately
  );
});

/**
 * Fetch event
 * This event is triggered for every network request made by the page.
 * It uses a network-first strategy for pages and a cache-first for assets.
 */
self.addEventListener('fetch', event => {
  // For navigation requests (pages), use a Network-First strategy.
  // This ensures users get the latest version if they are online.
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // If the fetch is successful, we clone it and store it in the cache for offline use.
          return caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, response.clone());
            return response;
          });
        })
        .catch(() => {
          // If the network request fails (i.e., the user is offline),
          // we try to serve the requested page from the cache.
          return caches.match(event.request)
            .then(response => {
              // If the page is in the cache, serve it.
              // Otherwise, serve the main hub page as a final fallback.
              return response || caches.match('bardarts.html');
            });
        })
    );
    return;
  }

  // For all other requests (images, manifest), use a Cache-First strategy.
  // These assets don't change often, so serving from cache is faster.
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // If we have a cached version, return it.
        if (response) {
          return response;
        }
        // Otherwise, fetch it from the network.
        return fetch(event.request);
      })
  );
});


/**
 * Activate event
 * This event is triggered when the new service worker is activated.
 * It cleans up old, unused caches.
 */
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          // If a cache is found that is not in our whitelist, delete it.
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim()) // Take control of all open pages immediately.
  );
});

