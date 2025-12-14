// service-worker.js – CrossBox PRO (offline seguro, sem páginas brancas)

// Sempre que fizeres alterações importantes ao index.html ou à estrutura,
// incrementa esta versão (ex.: v1 → v2 → v3...)
const CACHE_VERSION = "v3";
const CACHE_NAME = `crossbox-pro-shell-${CACHE_VERSION}`;

// Ficheiros essenciais da app (ajusta se tiveres mais JS/CSS)
const APP_SHELL = [
  "./",
  "./index.html",
  "./app.js",
  "./manifest.json",
  "./imagens/crossbox_logo.png",
  "./imagens/crossbox_logo-192.png",
  "./imagens/crossbox_logo-512.png",
  "./index.js",    // se existir
  "./scripts.js"   // se existir];

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
          // Apaga qualquer cache antiga de versões anteriores
          if (key !== CACHE_NAME && key.startsWith("crossbox-pro-shell-")) {
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

  // 1) Navegações (abrir app, clicar no ícone da PWA, etc.)
  if (request.mode === "navigate") {
    event.respondWith(handleNavigation(request));
    return;
  }

  // 2) Ficheiros do mesmo domínio (imagens, JS, CSS, etc.)
  if (url.origin === self.location.origin) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // 3) Pedidos externos – deixamos seguir normalmente
});

// ---------- Estratégias ----------

// Navegação: tenta SEMPRE rede primeiro; se falhar, usa index.html em cache
async function handleNavigation(request) {
  try {
    const networkResponse = await fetch(request);

    // Se correu bem, atualiza o cache do index.html em background
    const cache = await caches.open(CACHE_NAME);
    cache.put("./index.html", networkResponse.clone());

    return networkResponse;
  } catch (err) {
    // Offline ou falha de rede → usa index.html em cache
    const cache = await caches.open(CACHE_NAME);
    const cachedIndex =
      (await cache.match("./index.html")) || (await cache.match("./"));
    if (cachedIndex) return cachedIndex;

    // Se, por algum motivo, não houver nada em cache,
    // devolve uma mensagem simples em vez de ficar tudo em branco
    return new Response(
      "Estás offline e a app ainda não foi totalmente cacheada.",
      {
        status: 503,
        headers: { "Content-Type": "text/plain; charset=utf-8" }
      }
    );
  }
}

// Ficheiros estáticos: cache primeiro, rede depois
async function cacheFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    cache.put(request, response.clone());
    return response;
  } catch (err) {
    // Se falhar e não houver cache, devolve a resposta da rede (pode falhar, mas não mata a navegação)
    return fetch(request);
  }
}

