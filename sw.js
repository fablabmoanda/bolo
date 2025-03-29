// Increment the cache version to force update
const CACHE_NAME = 'clavier-web-cache-v1.14';
const urlsToCache = [
  '/',
  '/index.html',
  '/css/style.css',
  '/js/main.js',
  '/js/pwa.js',
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css',
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js',
  'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css'
];

// Fonction pour vérifier si une requête peut être mise en cache
function isCacheableRequest(request) {
  const url = new URL(request.url);
  
  // Exclure l'API liste.php du cache pour toujours obtenir les données fraîches
  if (url.pathname.includes('/api/liste.php')) {
    return false;
  }
  
  return (url.protocol === 'http:' || url.protocol === 'https:') && request.method === 'GET';
}

// Installation du Service Worker
self.addEventListener('install', event => {
  self.skipWaiting(); // Forcer l'activation immédiate
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache ouvert');
        return cache.addAll(urlsToCache);
      })
  );
});

// Activation du Service Worker
self.addEventListener('activate', event => {
  event.waitUntil(
    Promise.all([
      // Prendre le contrôle immédiatement
      clients.claim(),
      // Nettoyer les anciens caches
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== CACHE_NAME) {
              return caches.delete(cacheName);
            }
          })
        );
      })
    ])
  );
});

// Interception des requêtes
self.addEventListener('fetch', event => {
  // Ignorer les requêtes non cacheables
  if (!isCacheableRequest(event.request)) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          // Retourner la réponse du cache
          return response;
        }

        // Cloner la requête car elle ne peut être utilisée qu'une fois
        const fetchRequest = event.request.clone();

        return fetch(fetchRequest)
          .then(response => {
            // Vérifier si nous avons reçu une réponse valide
            if (!response || response.status !== 200) {
              return response;
            }

            // Cloner la réponse car elle ne peut être utilisée qu'une fois
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then(cache => {
                try {
                  cache.put(event.request, responseToCache);
                } catch (error) {
                  console.warn('Erreur lors de la mise en cache:', error);
                }
              });

            return response;
          })
          .catch(error => {
            console.warn('Erreur de fetch:', error);
            return response;
          });
      })
  );
});

// Gestion des messages
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});