// YUN Admin Service Worker v2
var CACHE_NAME = 'yun-admin-v2';
var urlsToCache = [
  '/admin/index.html',
  '/admin/manifest.json'
];

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(urlsToCache);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', function(event) {
  event.respondWith(
    fetch(event.request).catch(function() {
      return caches.match(event.request);
    })
  );
});

// Push notification handler
self.addEventListener('push', function(event) {
  var data = { title: 'YUN Admin', body: 'New notification' };
  if (event.data) {
    try { data = event.data.json(); } catch(e) { data.body = event.data.text(); }
  }
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: 'https://res.cloudinary.com/dcj7lqvph/image/upload/q_auto,f_auto,w_192/v1781461884/IMG_20260531_223119_1_ebk1xo.png',
      badge: 'https://res.cloudinary.com/dcj7lqvph/image/upload/q_auto,f_auto,w_96/v1781461884/IMG_20260531_223119_1_ebk1xo.png',
      vibrate: [200, 100, 200],
      tag: data.tag || 'yun-notification',
      renotify: true,
      requireInteraction: true,
      data: { url: data.url || '/admin/index.html' }
    })
  );
});

// Notification click handler
self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  var url = (event.notification.data && event.notification.data.url) || '/admin/index.html';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
      for (var i = 0; i < clientList.length; i++) {
        var client = clientList[i];
        if (client.url.indexOf('/admin/') > -1 && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});
