/* Big Data Applications and Analytics: service worker
   - pages: network first (you always get the newest notes when online), cached copy when offline
   - site files: cache first (the 3D library and icons never change under the same name)
   - Google Fonts: served from cache, refreshed in the background */
const VERSION = "bdl-9c7545777e";
const RUNTIME = "bdl-runtime";
const CORE = ["./", "vendor/three-r128.min.js", "vendor/alasql-4.4.0.min.js", "manifest.webmanifest", "icons/icon-192.png", "icons/icon-512.png", "icons/maskable-512.png", "icons/apple-touch-icon.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(CORE)));
});
self.addEventListener("message", e => { if (e.data === "SKIP_WAITING") self.skipWaiting(); });
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== VERSION && k !== RUNTIME).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

async function networkFirstPage(req) {
  const cache = await caches.open(VERSION);
  try {
    const ctl = new AbortController();
    const timer = setTimeout(() => ctl.abort(), 4000);
    const res = await fetch(new URL("./", self.registration.scope).href, { signal: ctl.signal, cache: "no-cache" });
    clearTimeout(timer);
    if (res.ok && !res.redirected) cache.put("./", res.clone());
    return res;
  } catch (err) {
    return (await cache.match("./")) || (await caches.match("./")) || Response.error();
  }
}

self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (req.mode === "navigate" && url.origin === location.origin) {
    e.respondWith(networkFirstPage(req));
    return;
  }
  if (url.origin === location.origin) {
    e.respondWith(caches.match(req, { ignoreSearch: true }).then(hit => hit || fetch(req).then(res => {
      if (res.ok) { const copy = res.clone(); caches.open(VERSION).then(c => c.put(req, copy)); }
      return res;
    })));
    return;
  }
  if (url.hostname === "fonts.googleapis.com" || url.hostname === "fonts.gstatic.com") {
    e.respondWith(caches.open(RUNTIME).then(async c => {
      const hit = await c.match(req);
      const net = fetch(req).then(res => { if (res.ok || res.type === "opaque") c.put(req, res.clone()); return res; }).catch(() => hit);
      return hit || net;
    }));
  }
});
