// service-worker.js – versão simples e estável

const SW_VERSION = "crossbox-pro-simple-v2";

// INSTALAÇÃO – ativa logo o novo SW
self.addEventListener("install", (event) => {
  self.skipWaiting();
});

// ATIVAÇÃO – passa a controlar imediatamente as páginas
self.addEventListener("activate", (event) => {
  self.clients.claim();
});

// FETCH – não mexe em nada, deixa a rede tratar todos os pedidos
self.addEventListener("fetch", (event) => {
  // propositadamente vazio
});
