const CACHE = 'slopaoke-sw-v1';
const ASSETS = ['./', 'index.html', 'manifest.json', 'icon-180.png', 'icon-192.png', 'icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Serve from cache immediately, refresh the cached copy in the background —
// offline always works; a deploy shows up on the visit after it's fetched.
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  // Videos stream straight from the network: serving cached full responses
  // to iOS Safari's Range requests breaks playback.
  if (new URL(e.request.url).pathname.endsWith('.mp4')) return;
  e.respondWith(
    caches.open(CACHE).then(cache =>
      cache.match(e.request, { ignoreSearch: true }).then(hit => {
        const refresh = fetch(e.request).then(res => {
          if (res.ok) cache.put(e.request, res.clone());
          return res;
        }).catch(() => hit);
        return hit || refresh;
      })
    )
  );
});
