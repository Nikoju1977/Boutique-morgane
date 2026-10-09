/* L'Œil d'Hermès — service worker. Coquille en cache, réseau uniquement pour les API. */
var VERSION = "morgane-hermes-v5";
var COQUILLE = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./icone.svg",
  "./icone-maskable.svg"
];

self.addEventListener("install", function (e) {
  e.waitUntil(caches.open(VERSION).then(function (c) {
    return c.addAll(COQUILLE);
  }));
});

self.addEventListener("message", function (e) {
  if (e.data && e.data.action === "passer") self.skipWaiting();
});

self.addEventListener("activate", function (e) {
  e.waitUntil(caches.keys().then(function (cles) {
    return Promise.all(cles.map(function (k) { return (k.startsWith("morgane-horus-") || k.startsWith("morgane-hermes-")) && k !== VERSION ? caches.delete(k) : null; }));
  }).then(function () { return self.clients.claim(); }));
});

self.addEventListener("fetch", function (e) {
  var r = e.request;
  if (r.method !== "GET") return;
  var u = new URL(r.url);
  if (u.pathname.startsWith("/api/") || r.cache === "no-store") return;
  /* Les appels aux modèles ne passent jamais par le cache. */
  if (/api\.(mistral|groq|cerebras)\.ai|api\.groq\.com/.test(u.hostname)) return;

  e.respondWith(
    caches.match(r).then(function (rep) {
      if (rep) return rep;
      return fetch(r).then(function (res) {
        if (res && res.status === 200 && (u.origin === location.origin || /fonts\.(googleapis|gstatic)\.com/.test(u.hostname))) {
          var copie = res.clone();
          caches.open(VERSION).then(function (c) { c.put(r, copie); });
        }
        return res;
      }).catch(function () {
        return r.mode === "navigate" ? caches.match("./index.html") : Response.error();
      });
    })
  );
});
