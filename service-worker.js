// Versão da cache – quando mudares este valor, a cache antiga é limpa
const CACHE_VERSION = "v1.0.0";
const CACHE_NAME = "crossbox-pro-cache-" + CACHE_VERSION;

// LISTA DE FICHEIROS A COLOCAR EM CACHE LOGO NA INSTALAÇÃO
const ASSETS_TO_CACHE = [
  "/",                 // raiz (se estiveres a usar GitHub Pages com custom domain)
  "/index.html",
  "/manifest.json",
  "/service-worker.js",
  "/imagens/crossbox_logo.png"
  // se tiveres mais imagens ou ficheiros JS/CSS separados, adiciona aqui
  // ex.: "/imagens/icon-192.png",
  //      "/imagens/icon-512.png"
];

// INSTALAÇÃO – faz o pré-cache dos ficheiros principais
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(ASSETS_TO_CACHE))
      .then(() => self.skipWaiting())
  );
});

// ATIVAÇÃO – apaga caches antigas
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key.startsWith("crossbox-pro-cache-") && key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

// FETCH – estratégia "cache primeiro, depois rede"
self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Só lidamos com pedidos GET
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // Só pedidos do mesmo domínio
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        // Tenta atualizar em background mas devolve logo o que está em cache
        fetch(request)
          .then((networkResponse) => {
            if (
              networkResponse &&
              networkResponse.status === 200 &&
              networkResponse.type === "basic"
            ) {
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(request, networkResponse.clone());
              });
            }
          })
          .catch(() => {
            // se falhar a rede, não faz mal – continuamos com a cache
          });

        return cachedResponse;
      }

      // Se não estiver em cache, vai à rede
      return fetch(request)
        .then((networkResponse) => {
          // Guarda em cache para a próxima vez
          if (
            networkResponse &&
            networkResponse.status === 200 &&
            networkResponse.type === "basic"
          ) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // Se falhar a rede e não houver cache: devolve pelo menos o index
          return caches.match("/index.html");
        });
    })
  );
});
