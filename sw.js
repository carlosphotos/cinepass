self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Intentionally no cache strategy yet.
// This keeps ReelStub installable as a PWA without serving stale assets.
