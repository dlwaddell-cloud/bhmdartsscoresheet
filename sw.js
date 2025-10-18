// Define the cache name and files to cache
const CACHE_NAME = 'bar-darts-cache-v5'; // Incremented cache version for update
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
        
        // Handle navigation requests (i.e., loading a page) when offline.
        if (event.request.mode === 'navigate') {
          const url = new URL(event.request.url);
          const path = url.pathname;

          // If it's the root URL, serve the main page.
          if (path === '/') {
              return caches.match('bardarts.html');
          }
          
          // Check if it's a "clean URL" without a file extension.
          const hasFileExtension = path.split('/').pop().indexOf('.') > -1;

          // If it is a clean URL, try to find the matching .html file in the cache.
          if (!hasFileExtension) {
            return caches.match(path + '.html');
          }
        }

        // For any other type of request that fails (e.g., an image not in the cache),
        // we must return a valid Response object to avoid the Safari error.
        // Returning a simple 404 response is a safe way to handle this.
        return new Response('', { status: 404 });
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

