const CACHE_NAME = 'bc41-cache-v2';
const urlsToCache = [
  './',
  './index.html',
  './style.css',
  './tournament_hero.css',
  './app.js',
  './tournaments.js',
  './admin.js',
  './Logo.jpg',
  './hero.png',
  './management.png',
  './tournaments.png'
];

// Installation du service worker et mise en cache des fichiers
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Mise en cache des ressources pour le mode hors-ligne');
        return cache.addAll(urlsToCache);
      })
  );
});

// Interception des requêtes réseau
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - retourne la réponse du cache si elle existe
        if (response) {
          return response;
        }
        // Sinon, fait la requête réseau normale
        return fetch(event.request);
      })
  );
});

// Nettoyage des anciens caches lors de la mise à jour
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
