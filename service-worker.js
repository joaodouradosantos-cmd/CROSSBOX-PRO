/* CrossBox PRO – Service Worker (v5)
   Cache simples + Network-first para navegação
*/
const CACHE_NAME = "crossbox-pro-v5";
const APP_SHELL = [
  "./",
  "./index.html",
  "./app.js?v=5",
  "./manifest.json?v=5",
  "./imagens/crossbox_logo-192.png",
  "./imagens/crossbox_logo-512.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k.startsWith("crossbox-pro-") && k !== CACHE_NAME)
          .map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// Network-first para HTML (evita ecrã branco por cache antiga)
// Cache-first para restantes (rápido/offline)
self.addEventListener("fetch", (event) => {
  const req = event.request;
  const url = new URL(req.url);

  if (req.method !== "GET") return;

  const isSameOrigin = url.origin === self.location.origin;
  if (!isSameOrigin) return;

  const accept = req.headers.get("accept") || "";
  const isHTML = accept.includes("text/html") || url.pathname.endsWith("/") || url.pathname.endsWith(".html");

  if (isHTML) {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
          return res;
        })
        .catch(() => caches.match(req).then((r) => r || caches.match("./")))
    );
    return;
  }

  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req).then((res) => {
        const copy = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
        return res;
      });
    })
  );
});
