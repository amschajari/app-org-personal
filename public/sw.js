// Service worker mínimo para habilitar la instalación como PWA.
// No cachea respuestas: la app siempre usa la red (network passthrough).
self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', () => {
  // Handler requerido por los navegadores para que la app sea instalable.
});
