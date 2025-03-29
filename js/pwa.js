// Enregistrement du service worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('Service Worker enregistré avec succès:', registration.scope);
      })
      .catch(error => {
        console.log('Échec de l\'enregistrement du Service Worker:', error);
      });
  });
}

// Gestion de l'installation de l'application
let deferredPrompt;

// Création du bouton d'installation
function createInstallButton() {
  // Vérifier si le bouton existe déjà
  if (document.getElementById('installButton')) {
    return document.getElementById('installButton');
  }
  
  const installButton = document.createElement('button');
  installButton.id = 'installButton';
  installButton.className = 'btn btn-primary install-button';
  installButton.innerHTML = '<i class="bi bi-download"></i> Installer l\'application';
  installButton.style.display = 'none'; // Caché par défaut
  
  // Ajouter le bouton au DOM
  document.body.appendChild(installButton);
  
  // Ajouter le style CSS pour le bouton
  const style = document.createElement('style');
  style.textContent = `
    .install-button {
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 1000;
      padding: 10px 15px;
      border-radius: 50px;
      box-shadow: 0 4px 8px rgba(0,0,0,0.2);
      display: flex;
      align-items: center;
      gap: 8px;
      animation: pulse 2s infinite;
    }
    
    @keyframes pulse {
      0% { transform: scale(1); }
      50% { transform: scale(1.05); }
      100% { transform: scale(1); }
    }
  `;
  document.head.appendChild(style);
  
  // Ajouter l'événement de clic
  installButton.addEventListener('click', async () => {
    if (deferredPrompt) {
      try {
        // Afficher l'invite d'installation
        deferredPrompt.prompt();
        
        // Attendre que l'utilisateur réponde à l'invite
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`Résultat de l'installation: ${outcome}`);
      } catch (error) {
        console.error('Erreur lors de l\'affichage de l\'invite d\'installation:', error);
      } finally {
        // Réinitialiser la variable deferredPrompt
        deferredPrompt = null;
        
        // Cacher le bouton
        installButton.style.display = 'none';
      }
    }
  });
  
  return installButton;
}

// Intercepter l'événement beforeinstallprompt
window.addEventListener('beforeinstallprompt', (e) => {
  // Nous empêchons l'affichage automatique de la bannière native
  // pour utiliser notre propre bouton d'installation personnalisé
  e.preventDefault();
  
  // Stocker l'événement pour pouvoir le déclencher plus tard
  deferredPrompt = e;
  
  // Créer le bouton d'installation s'il n'existe pas déjà
  const installButton = createInstallButton();
  
  // Afficher le bouton
  installButton.style.display = 'flex';
  
  // Ajouter un message dans la console pour indiquer que le bouton est disponible
  console.log('Le bouton d\'installation est maintenant disponible');
});

// Détecter quand l'application a été installée
window.addEventListener('appinstalled', (e) => {
  console.log('Application installée avec succès');
  
  // Cacher le bouton d'installation
  const installButton = document.getElementById('installButton');
  if (installButton) {
    installButton.style.display = 'none';
  }
  
  // Réinitialiser deferredPrompt
  deferredPrompt = null;
});

const CACHE_NAME = 'clavier-v1';
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

// Installation du Service Worker
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                return cache.addAll(urlsToCache);
            })
    );
});

// Activation du Service Worker
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// Interception des requêtes
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Si la ressource est trouvée dans le cache
                if (response) {
                    // Vérifier si c'est une requête de navigation
                    if (event.request.mode === 'navigate') {
                        // Pour les requêtes de navigation, toujours essayer de récupérer la dernière version
                        return fetch(event.request)
                            .then(fetchResponse => {
                                // Mettre à jour le cache avec la nouvelle version
                                const responseToCache = fetchResponse.clone();
                                caches.open(CACHE_NAME)
                                    .then(cache => {
                                        cache.put(event.request, responseToCache);
                                    });
                                return fetchResponse;
                            })
                            .catch(() => {
                                // En cas d'erreur, utiliser la version en cache
                                return response;
                            });
                    }
                    return response;
                }
                // Si la ressource n'est pas dans le cache, la récupérer du réseau
                return fetch(event.request)
                    .then(fetchResponse => {
                        // Mettre en cache la nouvelle ressource
                        const responseToCache = fetchResponse.clone();
                        caches.open(CACHE_NAME)
                            .then(cache => {
                                cache.put(event.request, responseToCache);
                            });
                        return fetchResponse;
                    });
            })
    );
}); 