// Define the cache name and files to cache
const CACHE_NAME = 'bar-darts-cache-v3'; // Incremented cache version for update
const urlsToCache = [
  './',
  'bardarts.html',
  '501Darts.html',
  'DartsCricket.html',
  'NSCricket.html',
  'DartsHalveIt.html',
  'DartsGolf.html',
  'KillerDarts.html',
  'icon-192x192.png',
  'icon-512x512.png'
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
        console.log('Opened cache and caching files for offline use.');
        return cache.addAll(urlsToCache);
      })
  );
});

/**
 * Fetch event
 * This event is triggered for every network request made by the page.
 * It follows a robust "cache-first, then network, with offline fallback" strategy.
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
        return fetch(event.request);
      })
      .catch(() => {
        // This .catch() block is triggered if the initial cache match fails AND the network fetch fails.
        // This is crucial for handling "clean URLs" (e.g., /501Darts) when offline.
        
        // We only want to do this for navigation requests (i.e., loading a page).
        if (event.request.mode === 'navigate') {
          const url = new URL(event.request.url);
          const path = url.pathname;
          
          // Check if the requested path is for a file (contains a dot).
          const hasFileExtension = path.split('/').pop().indexOf('.') > -1;

          // If it's a clean URL without a file extension, try to find a matching .html file in the cache.
          if (!hasFileExtension) {
            return caches.match(path + '.html');
          }
        }

        // For any other failed request (e.g., an image not in the cache), the request will fail as expected.
        // You could return a generic offline fallback page here if you had one.
      })
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
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

