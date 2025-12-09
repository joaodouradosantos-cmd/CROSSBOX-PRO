// service-worker-pro.js – CrossBox PRO

// 🔁 sobe a versão sempre que alterares o SW
const STATIC_CACHE = "crossbox-pro-static-v4";
const RUNTIME_CACHE = "crossbox-pro-runtime-v4";

// Em GitHub Pages é mais seguro tratar o "shell" como ./ (raiz da app)
const APP_SHELL_URL = new URL("./", self.location).toString();

const PRECACHE_URLS = [
  "./", // raiz da app
  "./manifest.json",
  "./imagens/crossbox_logo.png",
  "./imagens/crossbox_logo-192.png",
  "./imagens/crossbox_logo-512.png"
];

// INSTALL – pré-cache do “app shell”
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(PRECACHE_URLS))
  );
  self.skipWaiting();
});

// ACTIVATE – limpeza de caches antigos
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== STATIC_CACHE && key !== RUNTIME_CACHE) {
            return caches.delete(key);
          }
        })
      )
    )
  );
  self.clients.claim();
});

// FETCH – navegação + assets
self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Só tratamos GET
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // 1) Navegações (entrar na app / abrir atalho PWA / mudar de página)
  const isNavigation =
    request.mode === "navigate" ||
    (request.headers.get("accept") || "").includes("text/html");

  if (isNavigation) {
    event.respondWith(handleNavigationRequest(request));
    return;
  }

  // 2) Pedidos do mesmo origin (imagens, JS, etc.)
  if (url.origin === self.location.origin) {
    // Imagens – cache-first
    if (url.pathname.match(/\.(png|jpg|jpeg|gif|webp|svg|ico)$/i)) {
      event.respondWith(cacheFirst(request));
      return;
    }

    // Outros ficheiros estáticos – stale-while-revalidate
    event.respondWith(staleWhileRevalidate(request));
    return;
  }

  // 3) Requests externos – deixam seguir pela rede normalmente
});

// -------- Estratégias --------

async function handleNavigationRequest(request) {
  try {
    // Tenta sempre ir primeiro à rede (versão mais recente)
    const networkResponse = await fetch(request);

    // Atualiza o app shell em cache sempre que houver resposta válida
    const cache = await caches.open(STATIC_CACHE);
    await cache.put(APP_SHELL_URL, networkResponse.clone());

    return networkResponse;
  } catch (err) {
    // Se falhar (offline, etc.), devolve o shell em cache (./)
    const cache = await caches.open(STATIC_CACHE);
    const cached = await cache.match(APP_SHELL_URL);
    return cached || Response.error();
  }
}

async function cacheFirst(request) {
  const cache = await caches.open(RUNTIME_CACHE);
  const cached = await cache.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    cache.put(request, response.clone());
    return response;
  } catch (err) {
    return Response.error();
  }
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(RUNTIME_CACHE);

  const cachedPromise = cache.match(request);
  const networkPromise = fetch(request)
    .then((response) => {
      cache.put(request, response.clone());
      return response;
    })
    .catch(() => null);

  const cached = await cachedPromise;
  if (cached) {
    networkPromise.catch(() => {});
    return cached;
  }

  const network = await networkPromise;
  return network || Response.error();
}
