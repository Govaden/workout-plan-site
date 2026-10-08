// Cache name is keyed by the app version (sw.js?v=X), so each release installs a fresh cache.
// version.json is always fetched from the network first so the page can detect new releases.
const IMAGES = ['sq','bn','rw','wa','bp','wp','wt','sc','sh','sf','sg','sk','qs','op','sp','pl','pp','lr','fp','rd','pd'].map(i => `images/${i}.webp`);
const CORE = ['./', 'index.html', 'manifest.webmanifest', 'icons/icon.svg', 'version.json', ...IMAGES];
const VERSION = new URL(self.location).searchParams.get('v') || 'dev';
const CACHE = `workout-${VERSION}`;

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(CORE.map(u => new Request(u, { cache: 'reload' }))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

const put = (req, res) => { const c = res.clone(); caches.open(CACHE).then(x => x.put(req, c)); return res; };

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  if (url.origin !== location.origin) return;
  if (url.pathname.endsWith('/version.json')) {
    e.respondWith(fetch(e.request, { cache: 'no-cache' }).then(r => put(e.request, r)).catch(() => caches.match(e.request)));
    return;
  }
  e.respondWith(caches.match(e.request).then(hit => hit || fetch(e.request).then(r => put(e.request, r))));
});
