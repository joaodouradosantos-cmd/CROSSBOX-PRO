// service-worker.js – CrossBox PRO (offline simples e seguro)

const CACHE_NAME = "crossbox-pro-shell-v1";

// Ficheiros essenciais da app
const APP_SHELL = [
  "./",
  "./index.html",
  "./manifest.json",
  "./imagens/crossbox_logo.png",
  "./imagens/crossbox_logo-192.png",
  "./imagens/crossbox_logo-512.png"
  // se no futuro criares ficheiros CSS/JS externos, adicionas aqui
];

// INSTALL – pré-carrega o “esqueleto” da app
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

// ACTIVATE – limpa caches antigas
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

// FETCH – navegação + ficheiros estáticos
self.addEventListener("fetch", (event) => {
  const request = event.request;

  // Só tratamos GET
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // 1) Navegações (abrir app, clicar ícone da PWA, etc.)
  if (request.mode === "navigate") {
    event.respondWith(handleNavigation(request));
    return;
  }

  // 2) Ficheiros do mesmo domínio (imagens, JS, CSS, etc.)
  if (url.origin === self.location.origin) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // 3) Pedidos externos – seguem para a rede normalmente
});

// ---------- Estratégias ----------

async function handleNavigation(request) {
  try {
    // Online: tenta ir à rede
    const networkResponse = await fetch(request);
    return networkResponse;
  } catch (err) {
    // Offline: devolve SEMPRE o index.html em cache
    const cache = await caches.open(CACHE_NAME);
    const cachedIndex =
      (await cache.match("./index.html")) || (await cache.match("./"));
    if (cachedIndex) return cachedIndex;

    // Se não houver nada em cache
    return new Response(
      "Estás offline e a app ainda não foi totalmente cacheada.",
      {
        status: 503,
        headers: { "Content-Type": "text/plain; charset=utf-8" }
      }
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
    // Sem cache e sem rede
    return new Response(
      "",
      { status: 504, statusText: "Offline e sem cache para este recurso." }
    );
  }
}
