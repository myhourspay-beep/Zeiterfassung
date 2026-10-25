// Service Worker: hält nur die App-Hülle bereit; Daten kommen immer frisch aus der Tabelle.
var CACHE = 'zeiterfassung-tr-v3';
var DATEIEN = ['./', './index.html', './manifest.webmanifest', '../icon-192.png', '../icon-512.png'];
self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(DATEIEN); }));
  self.skipWaiting();
});
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (k) {
    return Promise.all(k.filter(function (x) { return x !== CACHE && x.indexOf('zeiterfassung-tr-v') === 0; }).map(function (x) { return caches.delete(x); }));
  }));
  self.clients.claim();
});
self.addEventListener('fetch', function (e) {
  var url = new URL(e.request.url);
  if (url.origin !== location.origin) return;               // Anfragen an Google nie zwischenspeichern
  e.respondWith(fetch(e.request, { cache: 'no-cache' }).then(function (r) {   // immer beim Server nachfragen (Updates sofort), sonst Zwischenspeicher
    var kopie = r.clone(); caches.open(CACHE).then(function (c) { c.put(e.request, kopie); }); return r;
  }).catch(function () { return caches.match(e.request).then(function (r) { return r || caches.match('./index.html'); }); }));
});
