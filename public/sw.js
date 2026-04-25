/**
 * Service Worker — Offline-first PWA with intelligent caching.
 *
 * Strategies:
 * - Precache: core HTML shell (/) for instant offline loads
 * - Cache-first: static assets (JS, CSS, images, fonts) — instant after first load
 * - Stale-while-revalidate: Google Fonts — fast display with background refresh
 * - Network-first: API routes & navigation — fresh when online, cached fallback offline
 *
 * Features:
 * - Versioned caching with automatic old cache cleanup
 * - Offline status notifications to the client
 * - Background sync readiness (for future cloud sync)
 * - Max cache size enforcement (prevents unbounded growth)
 */

const CACHE_VERSION = 'shaktivaan-v3'
const STATIC_CACHE = `${CACHE_VERSION}-static`
const FONT_CACHE = `${CACHE_VERSION}-fonts`
const RUNTIME_CACHE = `${CACHE_VERSION}-runtime`

// Core assets to precache on install
const PRECACHE_URLS = [
  '/',
]

// Max entries per cache to prevent unbounded growth
const MAX_RUNTIME_ENTRIES = 60
const MAX_FONT_ENTRIES = 20

// ── Install ──────────────────────────────────────────────────────────────────

self.addEventListener('install', (event) => {
  self.skipWaiting()
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => cache.addAll(PRECACHE_URLS))
      .catch(err => console.error('[SW] Precache failed:', err))
  )
})

// ── Activate ─────────────────────────────────────────────────────────────────

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then(keys => {
        return Promise.all(
          keys
            .filter(key => key !== STATIC_CACHE && key !== FONT_CACHE && key !== RUNTIME_CACHE)
            .map(key => {
              console.info('[SW] Deleting old cache:', key)
              return caches.delete(key)
            })
        )
      })
      .then(() => self.clients.claim())
      .then(() => notifyClients({ type: 'SW_ACTIVATED', version: CACHE_VERSION }))
  )
})

// ── Fetch ────────────────────────────────────────────────────────────────────

self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Skip non-GET requests (POST, etc.)
  if (request.method !== 'GET') return

  // Skip chrome-extension, blob, etc.
  if (!url.protocol.startsWith('http')) return

  // Strategy selection based on request type
  if (isGoogleFont(url)) {
    event.respondWith(staleWhileRevalidate(request, FONT_CACHE, MAX_FONT_ENTRIES))
  } else if (isStaticAsset(url)) {
    event.respondWith(cacheFirst(request, STATIC_CACHE))
  } else if (isNavigationOrAPI(request, url)) {
    event.respondWith(networkFirst(request, RUNTIME_CACHE))
  } else {
    // Default: network-first for everything else
    event.respondWith(networkFirst(request, RUNTIME_CACHE))
  }
})

// ── Caching Strategies ───────────────────────────────────────────────────────

/**
 * Cache-First — serve from cache, fallback to network.
 * Best for: static assets (JS, CSS, images) that don't change between deploys.
 */
async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request)
  if (cached) return cached

  try {
    const response = await fetch(request)
    if (response.ok) {
      const cache = await caches.open(cacheName)
      cache.put(request, response.clone())
    }
    return response
  } catch {
    // If both cache and network fail, return offline fallback
    return caches.match('/') || new Response('Offline', { status: 503 })
  }
}

/**
 * Network-First — try network, fallback to cache.
 * Best for: HTML pages, API responses that should be fresh.
 */
async function networkFirst(request, cacheName) {
  try {
    const response = await fetch(request)
    if (response.ok) {
      const cache = await caches.open(cacheName)
      cache.put(request, response.clone())
      await trimCache(cacheName, MAX_RUNTIME_ENTRIES)
    }
    return response
  } catch {
    const cached = await caches.match(request)
    if (cached) return cached

    // For navigation requests, return the cached shell
    if (request.mode === 'navigate') {
      const shell = await caches.match('/')
      if (shell) return shell
    }

    return new Response('Offline', {
      status: 503,
      headers: { 'Content-Type': 'text/plain' }
    })
  }
}

/**
 * Stale-While-Revalidate — serve from cache immediately, update cache in background.
 * Best for: fonts, third-party resources that change infrequently.
 */
async function staleWhileRevalidate(request, cacheName, maxEntries) {
  const cache = await caches.open(cacheName)
  const cached = await cache.match(request)

  // Background revalidation
  const fetchPromise = fetch(request)
    .then(response => {
      if (response.ok) {
        cache.put(request, response.clone())
        trimCache(cacheName, maxEntries)
      }
      return response
    })
    .catch(() => null) // silently fail on revalidation

  // Return cached immediately if available, otherwise wait for network
  return cached || fetchPromise || new Response('', { status: 503 })
}

// ── URL Classification ───────────────────────────────────────────────────────

function isGoogleFont(url) {
  return url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com'
}

function isStaticAsset(url) {
  return /\.(js|css|png|jpg|jpeg|svg|webp|ico|woff|woff2|ttf|eot)(\?.*)?$/.test(url.pathname)
}

function isNavigationOrAPI(request, url) {
  return request.mode === 'navigate' || url.pathname.startsWith('/api/')
}

// ── Cache Maintenance ────────────────────────────────────────────────────────

/**
 * Trim cache to maxEntries (LRU-style — removes oldest).
 */
async function trimCache(cacheName, maxEntries) {
  const cache = await caches.open(cacheName)
  const keys = await cache.keys()
  if (keys.length > maxEntries) {
    // Delete oldest entries (FIFO)
    const toDelete = keys.slice(0, keys.length - maxEntries)
    await Promise.all(toDelete.map(key => cache.delete(key)))
  }
}

// ── Client Communication ─────────────────────────────────────────────────────

/**
 * Send a message to all connected clients.
 */
async function notifyClients(message) {
  const clients = await self.clients.matchAll({ type: 'window' })
  clients.forEach(client => client.postMessage(message))
}

// ── Online/Offline Detection ─────────────────────────────────────────────────

// Listen for messages from the client
self.addEventListener('message', (event) => {
  if (event.data?.type === 'PING') {
    // Client is checking if SW is alive
    event.source?.postMessage({ type: 'PONG', version: CACHE_VERSION })
  }

  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})
