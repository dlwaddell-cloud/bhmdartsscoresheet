// Define the cache name and files to cache
const CACHE_NAME = 'bar-darts-cache-v13'; // Incremented cache version for update

// The base URL of your repository, hosted via GitHub Pages.
const GITHUB_PAGES_BASE_URL = 'https://dlwaddell-cloud.github.io/bhmdartsscoresheet/';

// Create a list of full URLs to cache by prepending the base URL.
const urlsToCache = [
  '', // Caches the root page (the base URL itself)
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
].map(file => GITHUB_PAGES_BASE_URL + file);

/**
 * Installation event
 * This event is triggered when the service worker is first installed.
 * It pre-caches all the essential files for the app to work offline.
 * This version is more robust, caching files individually.
 */
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache. Caching essential assets individually from GitHub...');
        const cachePromises = urlsToCache.map(urlToCache => {
          return cache.add(urlToCache).catch(err => {
            // Log the error but don't let it break the entire install
            console.warn(`Failed to cache ${urlToCache}:`, err);
          });
        });
        return Promise.all(cachePromises);
      })
      .then(() => {
        console.log('All available assets have been cached.');
        return self.skipWaiting(); // Force the new service worker to activate immediately
      })
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
        // If both the cache and the network fail, the request will fail,
        // resulting in the browser's default offline error page.
        // The fallback logic has been removed as requested.
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

