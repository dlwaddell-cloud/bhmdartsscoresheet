// Define the cache name and files to cache
const CACHE_NAME = 'bar-darts-cache-v8'; // Incremented cache version to trigger update
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
 * self.skipWaiting() forces the waiting service worker to become the active one.
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
 * It uses a "cache-first, then network, with an app-shell fallback" strategy.
 */
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return the cached response.
        if (response) {
          return response;
        }
        
        // Not in cache - fetch from the network.
        // We clone the request because it's a stream and can only be consumed once.
        return fetch(event.request.clone());
      })
      .catch(() => {
        // This .catch() block is triggered if the initial cache match fails AND the network fetch fails.
        // This is the primary OFFLINE scenario.
        
        // If the failed request was for a page navigation...
        if (event.request.mode === 'navigate') {
          // ...return the main app shell (the hub page) from the cache.
          // This ensures the user always lands on a working page.
          return caches.match('bardarts.html');
        }

        // For any other type of request that fails (e.g., an image not in the cache),
        // we return a valid but empty 404 response to avoid the Safari error.
        return new Response('', {
          status: 404,
          statusText: 'Not Found'
        });
      })
  );
});


/**
 * Activate event
 * This event is triggered when the new service worker is activated.
 * self.clients.claim() ensures that the new service worker takes control of the page immediately.
 */
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          // If a cache is found that is not in our whitelist, delete it
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim()) // Take control of all open pages
  );
});
