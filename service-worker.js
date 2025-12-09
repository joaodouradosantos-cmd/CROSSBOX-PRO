// service-worker.js – versão simples só para permitir instalação da PWA

// Versão (sobe se algum dia mudares algo aqui)
const SW_VERSION = "crossbox-pro-simple-v1";

// INSTALL – ativa logo a nova versão
self.addEventListener("install", (event) => {
  self.skipWaiting();
});

// ACTIVATE – assume controlo imediato das páginas abertas
self.addEventListener("activate", (event) => {
  self.clients.claim();
});

// FETCH – não intercepta nada, deixa a rede tratar tudo
// (ou seja, a app funciona tal como no browser normal)
self.addEventListener("fetch", (event) => {
  // não fazemos nada aqui de propósito
});
