/// <reference lib="webworker" />
import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching'

declare const self: ServiceWorkerGlobalScope

// --- Precaching (offline app shell) ------------------------------------------
// __WB_MANIFEST is injected at build time by vite-plugin-pwa.
cleanupOutdatedCaches()
precacheAndRoute(self.__WB_MANIFEST)

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim())
})

// --- Update flow (prompt-based) ----------------------------------------------
// registerType: 'prompt' means the new SW waits in the "waiting" state until
// the user confirms via UpdateNotice.tsx, which then posts this message.
self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    void self.skipWaiting()
  }
})

// --- Web Push (wired up in Phase 4) ------------------------------------------
// Handlers are defined now so the SW contract is stable; they no-op safely
// until a push subscription and backend sender exist.

interface PushPayload {
  title: string
  body?: string
  url?: string
  tag?: string
}

self.addEventListener('push', (event) => {
  if (!event.data) return
  let payload: PushPayload
  try {
    payload = event.data.json() as PushPayload
  } catch {
    payload = { title: 'CuidaJunto', body: event.data.text() }
  }

  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      tag: payload.tag,
      icon: 'icons/icon-192.png',
      badge: 'icons/icon-192.png',
      data: { url: payload.url ?? '/' },
    }),
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const targetUrl = (event.notification.data?.url as string) ?? '/'

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) return client.focus()
      }
      return self.clients.openWindow(targetUrl)
    }),
  )
})
