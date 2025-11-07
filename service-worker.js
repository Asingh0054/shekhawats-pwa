<<<<<<< HEAD
const CACHE = "shekhawats-cache-v1";
const ASSETS = ["/shekhawats-pwa/","/shekhawats-pwa/index.html","/shekhawats-pwa/manifest.json"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
});

self.addEventListener("fetch", e => {
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
=======
const CACHE_NAME = "shekhawats-cache-v2";
const ASSETS = [
  "/shekhawats-pwa/",
  "/shekhawats-pwa/index.html",
  "/shekhawats-pwa/manifest.json",
  "/shekhawats-pwa/images/icon-192x192.png",
  "/shekhawats-pwa/images/icon-512x512.png"
];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)));
});

self.addEventListener("fetch", e => {
  e.respondWith(
    caches.match(e.request).then(response => response || fetch(e.request))
  );
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))))
  );
>>>>>>> c892f33
});
