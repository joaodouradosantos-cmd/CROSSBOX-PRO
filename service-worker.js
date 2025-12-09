// service-worker.js – CrossBox PRO (versão com offline simples e segura)

const CACHE_NAME = "crossbox-pro-cache-v1";

// Ficheiros base da app (ajusta se tiveres CSS/JS próprios)
const APP_SHELL = [
  "./",
  "./index.html",
  "./manifest.json",
  "./imagens/crossbox_logo.png",
  "./imagens/crossbox_logo-192.png",
  "./imagens/crossbox_logo-512.png"
];

// INSTALL – pré-cache do app shell
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

// ACTIVATE – limpar caches antigos
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )
    )
  );
  self.clients.claim();
});

// FETCH – navegações + ficheiros estáticos
self.addEventListener("fetch", (event) => {
  const request = event.request;

  // Só tratamos GET
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // 1) Navegações (abrir app, mudar de página, abrir atalho PWA)
  if (request.mode === "navigate") {
    event.respondWith(handleNavigation(request));
    return;
  }

  // 2) Pedidos do mesmo origin (imagens, CSS, JS, etc.)
  if (url.origin === self.location.origin) {
    // Cache-first para ficheiros estáticos
    event.respondWith(cacheFirst(request));
    return;
  }

  // 3) Requests externos – deixamos seguir normalmente (sem interceptar)
});

// ---------- Estratégias ----------

async function handleNavigation(request) {
  try {
    // Tentamos sempre primeiro a rede (versão mais recente)
    const networkResponse = await fetch(request);
    return networkResponse;
  } catch (err) {
    // Se falhar (offline), devolvemos SEMPRE o index.html em cache
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match("./index.html");
    // Se por algum motivo não estiver em cache, ainda tentamos "./"
    return (
      cached ||
      (await cache.match("./")) ||
      new Response("Offline e sem app shell em cache.", {
        status: 503,
        headers: { "Content-Type": "text/plain" }
      })
    );
  }
}

async function cacheFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    cache.put(request, response.clone());
    return response;
  } catch (err) {
    // Se falhar e não houver cache, devolvemos a resposta original de erro da rede
    return fetch(request);
  }
}
