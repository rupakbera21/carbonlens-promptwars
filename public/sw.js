/**
 * CarbonLens Service Worker — offline-first caching strategy.
 *
 * Strategy:
 * - Static assets (JS, CSS, images): Cache First
 * - API calls: Network First with cache fallback
 * - Navigation: Network First with offline fallback page
 */

const CACHE_NAME = "carbonlens-v1";
const STATIC_CACHE = "carbonlens-static-v1";

const STATIC_ASSETS = ["/offline.html", "/manifest.json"];

// Install: pre-cache essential static assets
self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(STATIC_CACHE).then((cache) => cache.addAll(STATIC_ASSETS)));
  self.skipWaiting();
});

// Activate: clean old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME && key !== STATIC_CACHE)
            .map((key) => caches.delete(key)),
        ),
      ),
  );
  self.clients.claim();
});

// Fetch: strategy-based caching
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== "GET") return;

  // API calls: Network First
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          return response;
        })
        .catch(() => caches.match(request)),
    );
    return;
  }

  // Static assets: Cache First
  if (url.pathname.match(/\.(js|css|png|jpg|jpeg|svg|webp|avif|woff2?)$/)) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request).then((response) => {
            const clone = response.clone();
            caches.open(STATIC_CACHE).then((cache) => cache.put(request, clone));
            return response;
          }),
      ),
    );
    return;
  }

  // Navigation: Network First with offline fallback
  if (request.mode === "navigate") {
    event.respondWith(fetch(request).catch(() => caches.match("/offline.html")));
    return;
  }
});
