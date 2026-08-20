// Service worker: caches the app shell (HTML/CSS/JS/data) so the guide keeps
// working with no network connection -- deliberately useful for an analyst
// who wants this reference open during an incident, which is exactly when a
// client network's internet is least reliable.
//
// Strategy: stale-while-revalidate. A cached response is returned instantly
// when available; the network is still hit in the background to refresh the
// cache for next time. First visit must be online (nothing to serve from
// cache yet) -- everything after that works offline.
//
// Bump CACHE_VERSION when shipping a change, so returning visitors get the
// update instead of a stale cache; the old cache is deleted automatically.

const CACHE_VERSION = 'v1';
const CACHE_NAME = `reg-guide-${CACHE_VERSION}`;

// Same-origin files -- exact and known, safe to precache on install.
const PRECACHE_URLS = [
  './',
  './index.html',
  './css/styles.css',
  './js/tailwind.config.js',
  './js/bootstrap.js',
  './js/store.shell.js',
  './js/store.data.js',
  './js/widgets/visualizer.js',
  './js/widgets/entropy.js',
  './js/widgets/decisionTree.js',
  './js/widgets/reportBuilder.js',
  './js/widgets/reference.js',
  './data/family-profiles.json',
  './data/indicator-groups.json',
  './data/glossary.json',
  './data/sources.json',
  './modules/module-1.html',
  './modules/module-2.html',
  './modules/module-3.html',
  './modules/module-4.html',
  './modules/module-5.html',
  './modules/reference.html',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
      .catch((err) => {
        // Precaching failure (e.g. a path typo) shouldn't brick install --
        // log it and continue; runtime caching in fetch() below still helps.
        console.error('SW precache failed:', err);
      })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  if (!req.url.startsWith('http')) return; // skip chrome-extension:// etc.

  event.respondWith(
    caches.open(CACHE_NAME).then(async (cache) => {
      const cached = await cache.match(req);

      const networkFetch = fetch(req)
        .then((res) => {
          // Cache successful same-origin responses and opaque cross-origin
          // ones (CDN scripts/fonts -- status is 0 for no-cors requests, but
          // still cacheable and usable).
          if (res && (res.ok || res.type === 'opaque')) {
            cache.put(req, res.clone());
          }
          return res;
        })
        .catch(() => null);

      if (cached) {
        // Stale-while-revalidate: serve the cached copy now, refresh in the background.
        event.waitUntil(networkFetch);
        return cached;
      }

      const networkRes = await networkFetch;
      return networkRes || new Response(
        'Offline and this resource was never cached. Reconnect once to make it available offline.',
        { status: 503, statusText: 'Offline', headers: { 'Content-Type': 'text/plain' } }
      );
    })
  );
});
