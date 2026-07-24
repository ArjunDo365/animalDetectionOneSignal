// src/main.tsx
//
// App entry point. Registers the PWA service worker (vite-plugin-pwa) and
// initializes OneSignal (scoped to /push/onesignal/) once the root mounts.

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { initOneSignal } from './services/notificationService';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

// Register the PWA's own service worker (root scope) for offline caching +
// installability. vite-plugin-pwa generates this module when enabled.
import { registerSW } from 'virtual:pwa-register';
registerSW({ immediate: true });

// Initialize OneSignal (separate worker under /push/onesignal/). The
// notification-click deep-link handler is set up inside and routes via the
// navigator registered by App.tsx.
initOneSignal().catch((err) =>
  console.warn('[OneSignal] init failed:', err),
);
