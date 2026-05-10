/// <reference lib="webworker" />
import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching';
import { clientsClaim } from 'workbox-core';

declare const self: ServiceWorkerGlobalScope;

// vite-plugin-pwa が注入する precache manifest
precacheAndRoute(self.__WB_MANIFEST);
cleanupOutdatedCaches();
self.skipWaiting();
clientsClaim();

const SHARE_CACHE = 'share-inbox-v1';

self.addEventListener('fetch', (event: FetchEvent) => {
  const url = new URL(event.request.url);
  if (event.request.method === 'POST' && url.pathname.endsWith('/share')) {
    event.respondWith(handleSharePost(event.request));
  }
});

async function handleSharePost(req: Request): Promise<Response> {
  try {
    const form = await req.formData();
    const data = {
      title: (form.get('title')?.toString() ?? '').trim(),
      text: (form.get('text')?.toString() ?? '').trim(),
      url: (form.get('url')?.toString() ?? '').trim(),
      receivedAt: Date.now(),
    };
    const cache = await caches.open(SHARE_CACHE);
    await cache.put(
      '/__pending_share',
      new Response(JSON.stringify(data), {
        headers: { 'Content-Type': 'application/json' },
      }),
    );
  } catch (e) {
    console.error('共有データの保存に失敗', e);
  }
  // 303 でアプリを起動
  return Response.redirect('/?shared=1', 303);
}
