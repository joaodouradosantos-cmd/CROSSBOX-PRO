// service-worker-pro.js – CrossBox PRO

const STATIC_CACHE = "crossbox-pro-static-v3";
const RUNTIME_CACHE = "crossbox-pro-runtime-v3";

// URL absoluto do index.html dentro do scope do SW
const APP_SHELL_URL = new URL("./index.html", self.location).toString();

const PRECACHE_URLS = [
  "./",               // raiz da app (dentro da pasta onde está o SW)
  "./index.html",
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

  // 1) NAVEGAÇÕES (entrar na app / abrir atalho PWA / mudar de página)
  const isNavigation =
    request.mode === "navigate" ||
    (request.headers.get("accept") || "").includes("text/html");

  if (isNavigation) {
    event.respondWith(handleNavigationRequest(request));
    return;
  }

  // 2) PEDIDOS DO MESMO ORIGIN (imagens, JS, etc.)
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

  // 3) Requests externos – deixa seguir pela rede normalmente
  // (podes adaptar se quiseres cache também para CDNs, etc.)
});

// -------- Estratégias --------

async function handleNavigationRequest(request) {
  try {
    // Tenta sempre ir primeiro à rede (para apanhar a versão mais recente)
    const networkResponse = await fetch(request);

    // Se vier uma resposta válida, atualizamos o app shell em cache
    const cache = await caches.open(STATIC_CACHE);
    cache.put(APP_SHELL_URL, networkResponse.clone());

    return networkResponse;
  } catch (err) {
    // Se falhar (offline, etc.), tenta devolver o index.html em cache
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

  // responde logo com o que estiver em cache (se existir)
  const cachedPromise = cache.match(request);
  const networkPromise = fetch(request)
    .then((response) => {
      cache.put(request, response.clone());
      return response;
    })
    .catch(() => null);

  const cached = await cachedPromise;
  if (cached) {
    // atualiza em background
    networkPromise.catch(() => {});
    return cached;
  }

  // se não houver cache, usa a rede
  const network = await networkPromise;
  return network || Response.error();
}
