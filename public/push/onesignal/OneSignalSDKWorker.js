// OneSignal SDK Service Worker (scoped to /push/onesignal/)
//
// This worker is intentionally separate from the PWA's own service worker
// (registered by vite-plugin-pwa at the root scope "/"). A service worker
// scope can only be owned by one SW, so OneSignal gets its own subdirectory.
//
// At runtime OneSignal rewrites this file to include its full SDK. The
// importScripts line below is what makes that happen: when a push event
// arrives, OneSignal's CDN-hosted worker code takes over.
importScripts("https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.sw.js");
