self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request).catch(() => {
      return new Response(
        'GrabMe is currently offline. Please check your internet connection.',
        { headers: { 'Content-Type': 'text/plain' } }
      );
    })
  );
});
