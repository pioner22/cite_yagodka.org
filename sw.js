// Retire the legacy root-scope messenger service worker.
// The web client keeps its own worker under /web/sw.js.
const WEB_CLIENT_PATH = "/web/";
const ROOT_PATHS = new Set(["/", "/index.html"]);

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.map((key) => caches.delete(key)));
      await self.clients.claim();
      await migrateRootClients();
      await self.registration.unregister();
    })(),
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(fetch(event.request));
});

async function migrateRootClients() {
  const targetUrl = new URL(WEB_CLIENT_PATH, self.location.origin).href;
  const clients = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
  await Promise.all(
    clients.map(async (client) => {
      let url;
      try {
        url = new URL(client.url);
      } catch {
        return;
      }
      if (url.origin !== self.location.origin || !ROOT_PATHS.has(url.pathname)) {
        return;
      }
      try {
        client.postMessage({ type: "YAGODKA_ROOT_PWA_MIGRATE", target: targetUrl });
      } catch {
        // ignore
      }
      try {
        await client.navigate(targetUrl);
      } catch {
        // ignore
      }
    }),
  );
}
