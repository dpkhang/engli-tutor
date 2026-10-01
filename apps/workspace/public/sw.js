self.addEventListener("push", (event) => {
  const payload = event.data ? event.data.json() : {};
  event.waitUntil(
    (async () => {
      const windows = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
      if (windows.some((client) => client.focused)) return;
      await self.registration.showNotification(payload.title || "EngliTutor", {
        body: payload.body || "",
        data: { url: typeof payload.url === "string" ? payload.url : "/" },
      });
    })(),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url || "/";
  event.waitUntil(
    (async () => {
      const windows = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
      const existing = windows.find((client) => client.url.startsWith(self.location.origin));
      if (existing) {
        existing.postMessage({ type: "navigate", url });
        await existing.focus();
        return;
      }
      await self.clients.openWindow(url);
    })(),
  );
});
