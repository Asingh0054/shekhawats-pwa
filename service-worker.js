const CACHE = "shekhawats-cache-v1";
const ASSETS = ["/shekhawats-pwa/","/shekhawats-pwa/index.html","/shekhawats-pwa/manifest.json"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
});

self.addEventListener("fetch", e => {
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
});
