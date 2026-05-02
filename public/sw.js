// Service Worker pour Yaay - Mode hors-ligne basique
const CACHE_NAME = 'yaay-app-femme-v2';
const URLS_TO_CACHE = ['/'];

// Installation
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(URLS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Activation
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) => {
      return Promise.all(
        names.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n))
      );
    })
  );
  self.clients.claim();
});

// Stratégie réseau d'abord, cache en secours
self.addEventListener('fetch', (event) => {
  // Ignorer les requêtes non-HTTP (extensions Chrome, etc.)
  if (!event.request.url.startsWith('http')) {
    return;
  }

  // Ne pas cacher les requêtes Supabase (données dynamiques)
  if (event.request.url.includes('supabase.co')) {
    return;
  }

  // Ne pas cacher les requêtes non-GET
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Mettre en cache uniquement les réponses valides
        if (response && response.status === 200 && response.type === 'basic') {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            // Try/catch supplémentaire pour éviter tout crash
            try {
              cache.put(event.request, responseClone);
            } catch (e) {
              console.warn('Cache put failed:', e);
            }
          });
        }
        return response;
      })
      .catch(() => {
        // En cas d'échec réseau, servir depuis le cache
        return caches.match(event.request);
      })
  );
});