// service-worker.js – CrossBox PRO (offline simples e seguro)
// Atualiza o CACHE_NAME sempre que mudares ficheiros para forçar atualização nos telemóveis.

const CACHE_NAME = "crossbox-pro-shell-v5";

const APP_SHELL = [
  "./",
  "./index.html",
  "./app.js",
  "./manifest.json",

  // offline assets essenciais
  "./js/chart.umd.min.js",
  "./css/fonts.css",
  "./fonts/StardosStencil-Regular.woff2",
  "./fonts/StardosStencil-Bold.woff2",

  // ícones usados no manifest / iOS
  "./imagens/crossbox_logo.png",
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
          .filter((k) => k !== CACHE_NAME)
          .map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const req = event.request;

  // Navegação (abrir a app / mudar de "página"): network-first com fallback ao cache
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put("./index.html", copy));
          return res;
        })
        .catch(() => caches.match("./index.html"))
    );
    return;
  }

  // Restante: cache-first (rápido) + fallback para network
  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;

      return fetch(req)
        .then((res) => {
          // só cachear respostas válidas (evita cachear erros)
          if (!res || res.status !== 200 || res.type === "opaque") return res;

          const copy = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
          return res;
        })
        .catch(() => cached);
    })
  );
});
