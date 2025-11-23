// SERVICE WORKER DESATIVADO TEMPORARIAMENTE PARA LIMPAR CACHE

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  clients.claim();
});

self.addEventListener("fetch", (event) => {
  // NÃO faz cache de nada
  return fetch(event.request);
});
