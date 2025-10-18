// Define the cache name and files to cache
const CACHE_NAME = 'bar-darts-cache-v10'; // Incremented cache version for update
const urlsToCache = [
  './',
  'bardarts.html',
  '501darts.html',
  'DartsCricket.html',
  'NSCricket.html',
  'DartsHalveIt.html',
  'DartsGolf.html',
  'https://bhamdartsscoresheet.netlify.app/KillerDarts.html',
  'icon-192x192.png',
  'icon-512x512.png',
  'manifest.json'
];

/**
 * Installation event
 * This event is triggered when the service worker is first installed.
 * It pre-caches all the essential files for the app to work offline.
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
 * It uses a "cache-first" strategy.
 */
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return the response from the cache
        if (response) {
          return response;
        }

        // Not in cache - fetch from the network
        return fetch(event.request).then(
          networkResponse => {
            // Check if we received a valid response
            if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
              return networkResponse;
            }

            // Clone the response because it's a stream and can only be consumed once.
            // We need one for the browser and one for the cache.
            const responseToCache = networkResponse.clone();

            caches.open(CACHE_NAME)
              .then(cache => {
                // Cache the new response for future offline use
                cache.put(event.request, responseToCache);
              });

            return networkResponse;
          }
        );
      })
      .catch(() => {
        // If both the cache and the network fail (e.g., offline and page not cached),
        // return the main hub page as a fallback for navigation requests.
        if (event.request.mode === 'navigate') {
          return caches.match('bardarts.html');
        }
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

