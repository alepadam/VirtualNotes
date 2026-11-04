/* notewithliqi service worker
   - vendor libraries and icons: cache first (their file names change when their content does)
   - pages, shared engine and subject files: network first, cached copy when offline
   - Google Fonts: cached, refreshed in the background
   A new worker takes over immediately; because everything that changes is fetched network-first,
   a page never mixes an old engine with new content. */
const STATIC = "nlq-static-658373bd54";
const PAGES = "nlq-pages-33e3b43ff1";
const FONTS = "nlq-fonts";
const STATIC_FILES = ["vendor/three-r128.min.js", "vendor/alasql-4.4.0.min.js", "icons/icon-192.png", "icons/icon-512.png", "icons/maskable-512.png", "icons/apple-touch-icon.png"];
const PAGE_FILES = ["./", "shared/core.css", "shared/core.js", "manifest.webmanifest", "big-data/", "big-data/data.js", "big-data/labs.js", "data-viz/", "data-viz/data.js", "data-viz/subject.css", "data-viz/dataset.js", "data-viz/viz.js", "data-viz/labs.js", "data-viz/sqllab.js", "data-viz/excel.js", "data-viz/practice-workbook.xlsx"];
const SUBJECT_DIRS = ["big-data/", "data-viz/"];

self.addEventListener("install", e => {
  e.waitUntil(Promise.all([
    caches.open(STATIC).then(c => c.addAll(STATIC_FILES)),
    caches.open(PAGES).then(c => c.addAll(PAGE_FILES.map(u => new Request(u, { cache: "no-cache" }))))
  ]).then(() => self.skipWaiting()));
});
self.addEventListener("message", e => { if (e.data === "SKIP_WAITING") self.skipWaiting(); });
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== STATIC && k !== PAGES && k !== FONTS).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

const scope = new URL(self.registration.scope);
// one cache key per page: /big-data/index.html and /big-data/ are the same page; query and hash ignored
function keyOf(url) {
  const u = new URL(url); u.hash = ""; u.search = "";
  if (u.pathname.endsWith("/index.html")) u.pathname = u.pathname.slice(0, -10);
  return u.href;
}
async function fromNetwork(req, ms) {
  const ctl = new AbortController(), t = setTimeout(() => ctl.abort(), ms);
  try { return await fetch(req, { signal: ctl.signal }); } finally { clearTimeout(t); }
}
async function networkFirst(req, isPage) {
  const cache = await caches.open(PAGES), key = keyOf(req.url);
  try {
    const res = await fromNetwork(req, isPage ? 4000 : 6000);
    if (res.ok && res.type === "basic" && !res.redirected) cache.put(key, res.clone());
    return res;
  } catch (err) {
    const hit = await cache.match(key) || await caches.match(key);
    if (hit) return hit;
    if (isPage) {  // offline and never opened: fall back to that subject's home, then the hub
      const p = new URL(key).pathname, dir = SUBJECT_DIRS.find(d => p.startsWith(new URL(d, scope).pathname));
      return (dir && await cache.match(new URL(dir, scope).href)) || await cache.match(scope.href) || Response.error();
    }
    return Response.error();
  }
}

self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin === location.origin) {
    const rel = url.pathname.slice(scope.pathname.length);
    if (rel.startsWith("vendor/") || rel.startsWith("icons/")) {
      e.respondWith(caches.match(req, { ignoreSearch: true }).then(hit => hit || fetch(req).then(res => {
        if (res.ok) { const copy = res.clone(); caches.open(STATIC).then(c => c.put(req, copy)); }
        return res;
      })));
      return;
    }
    if (rel === "sw.js") return;
    e.respondWith(networkFirst(req, req.mode === "navigate"));
    return;
  }
  if (url.hostname === "fonts.googleapis.com" || url.hostname === "fonts.gstatic.com") {
    e.respondWith(caches.open(FONTS).then(async c => {
      const hit = await c.match(req);
      const net = fetch(req).then(res => { if (res.ok || res.type === "opaque") c.put(req, res.clone()); return res; }).catch(() => hit);
      return hit || net;
    }));
  }
});
