// ═══════════════════════════════════════════
// SERVICE WORKER — Mythologies PWA
// ═══════════════════════════════════════════
var CACHE = 'mythologies-v29';
var PRECACHE = ['./', './index.html', './data.js', './game.js', './logo.png', './manifest.json', './map-dosches.svg'];

self.addEventListener('install', function(e) {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE).then(function(c) { return c.addAll(PRECACHE); })
  );
});

self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(keys.filter(function(k){ return k!==CACHE; }).map(function(k){ return caches.delete(k); }));
    })
  );
  return self.clients.claim();
});

self.addEventListener('fetch', function(e) {
  var url = e.request.url;
  // Google Fonts : cache-first
  if (url.indexOf('fonts.googleapis.com') > -1 || url.indexOf('fonts.gstatic.com') > -1) {
    e.respondWith(
      caches.open(CACHE).then(function(c) {
        return c.match(e.request).then(function(cached) {
          if (cached) return cached;
          return fetch(e.request).then(function(res) { c.put(e.request, res.clone()); return res; });
        });
      })
    );
    return;
  }
  // App assets : network-first, cache fallback
  e.respondWith(
    fetch(e.request).then(function(res) {
      var clone = res.clone();
      caches.open(CACHE).then(function(c) { c.put(e.request, clone); });
      return res;
    }).catch(function() {
      return caches.match(e.request);
    })
  );
});

// Notify clients when a new version is available
self.addEventListener('message', function(e) {
  if (e.data === 'skipWaiting') self.skipWaiting();
});
