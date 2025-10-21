// Define the cache name and files to cache
const CACHE_NAME = 'bar-darts-cache-v1';
const urlsToCache = [
  'index.html',
  'bardarts.html',
  '501Darts.html',
  'DartsCricket.html',
  'NSCricket.html',
  'DartsHalveIt.html',
  'DartsGolf.html',
  'KillerDarts.html'
];

/**
 * Installation event
 * This event is triggered when the service worker is first installed.
 * It opens a cache and adds the core application files to it.
 */
self.addEventListener('install', event => {
  // Perform install steps
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        // Add all the specified URLs to the cache
        return cache.addAll(urlsToCache);
      })
  );
});

/**
 * Fetch event
 * This event is triggered for every network request made by the page.
 * It follows a "cache-first" strategy:
 * 1. It checks if the requested resource is in the cache.
 * 2. If it is, the cached version is returned.
 * 3. If it's not in the cache, it fetches it from the network.
 */
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return the cached response
        if (response) {
          return response;
        }
        // Not in cache - fetch from the network
        return fetch(event.request);
      }
    )
  );
});

/**
 * Activate event
 * This event is triggered when the new service worker is activated.
 * It's a good place to clean up old caches to remove outdated files.
 */
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          // If a cache is found that is not in our whitelist, delete it
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
