// service-worker.js – CrossBox PRO (offline seguro, sem páginas brancas)
// Versão do cache: incrementa sempre que alterares o index/manifest/estrutura
const CACHE_VERSION = "v3";
const CACHE_NAME = `crossbox-pro-shell-${CACHE_VERSION}`;

// “Esqueleto” mínimo (não metas ficheiros que possam não existir, para evitar falhas no install)
const APP_SHELL = [
  "./",
  "./index.html",
  "./manifest.json",
  "./imagens/crossbox"
];

// Recursos opcionais (se existirem, cacheamos; se não existirem, ignoramos sem rebentar a app)
const OPTIONAL_ASSETS = [
  "./imagens/crossbox_logo.png",
  "./imagens/crossbox_logo-192.png",
  "./imagens/crossbox_logo-512.png",
  "./crossbox_logo.png",
  "./crossbox_logo-192.png",
  "./crossbox_logo-512.png"
];

// INSTALL – pré-carrega o essencial + tenta (sem falhar) os opcionais
self.addEventListener("install", (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);

    // Essenciais
    await cache.addAll(APP_SHELL);

    // Opcionais: nunca deixes o install falhar por um ficheiro em falta
    await Promise.allSettled(
      OPTIONAL_ASSETS.map((url) => cache.add(url).catch(() => null))
    );
  })());

  self.skipWaiting();
});

// ACTIVATE – limpa caches antigas
self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(
      keys.map((key) => {
        if (key !== CACHE_NAME && key.startsWith("crossbox-pro-shell-")) {
          return caches.delete(key);
        }
      })
    );
    await self.clients.claim();
  })());
});

// FETCH – navegação + ficheiros estáticos do mesmo domínio
self.addEventListener("fetch", (event) => {
  const request = event.request;

  // Só tratamos GET
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // 1) Navegações (abrir app / refrescar / voltar ao ícone)
  if (request.mode === "navigate") {
    event.respondWith(handleNavigation(request));
    return;
  }

  // 2) Recursos do mesmo domínio (imagens, etc.) – cache-first
  if (url.origin === self.location.origin) {
    event.respondWith(cacheFirst(request));
    return;
  }
});

// ---------- Estratégias ----------

// Navegação: rede primeiro; se falhar, devolve index.html em cache (sem ecrã branco)
async function handleNavigation(request) {
  const cache = await caches.open(CACHE_NAME);

  try {
    const networkResponse = await fetch(request);

    // Atualiza o cache com a resposta da navegação (normalmente index.html)
    cache.put(request, networkResponse.clone());

    // Também garante que o index.html “canónico” fica cacheado
    cache.put("./index.html", networkResponse.clone());

    return networkResponse;
  } catch (_) {
    const cachedIndex =
      (await cache.match("./index.html")) ||
      (await cache.match("./")) ||
      (await cache.match(request));

    if (cachedIndex) return cachedIndex;

    return new Response(
      "Estás offline e a app ainda não foi totalmente cacheada.",
      { status: 503, headers: { "Content-Type": "text/plain; charset=utf-8" } }
    );
  }
}

// Estáticos: cache primeiro, rede depois (e guarda em cache quando conseguir)
async function cacheFirst(request) {
  const cache = await caches.open(CACHE_NAME);

  const cached = await cache.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    cache.put(request, response.clone());
    return response;
  } catch (_) {
    return new Response("Recurso indisponível offline.", {
      status: 504,
      headers: { "Content-Type": "text/plain; charset=utf-8" }
    });
  }
}

