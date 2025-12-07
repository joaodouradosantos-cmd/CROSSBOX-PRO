// service-worker-pro.js – SW só para a versão PRO

const CACHE_NAME = "crossbox-pro-static-v1";
const RUNTIME_CACHE = "crossbox-pro-runtime-v1";

const URLS_TO_CACHE = [
  "./",
  "./index.html",
  "./imagens/crossbox_logo.png"
];

// INSTALAÇÃO – pré-cache de ficheiros base
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(URLS_TO_CACHE))
  );
  self.skipWaiting();
});

// ATIVAÇÃO – limpeza de caches antigos desta versão PRO
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME && key !== RUNTIME_CACHE) {
            return caches.delete(key);
          }
        })
      )
    )
  );
  self.clients.claim();
});

// FETCH
self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Navegações (entrar na app / mudar de página)
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put("./index_pro.html", clone);
          });
          return response;
        })
        .catch(() =>
          caches.match("./index_pro.html").then((res) => {
            return res || Response.error();
          })
        )
    );
    return;
  }

  // Outros pedidos (imagens, JS, etc.) – network first com fallback cache
  event.respondWith(
    fetch(request)
      .then((response) => {
        const clone = response.clone();
        caches.open(RUNTIME_CACHE).then((cache) => {
          cache.put(request, clone);
        });
        return response;
      })
      .catch(() =>
        caches.match(request).then((cached) => {
          return cached || Response.error();
        })
      )
  );
});
