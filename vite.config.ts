import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      // The PWA's own service worker is registered at the root scope ("/").
      // OneSignal uses a separate worker scoped to "/push/onesignal/" so the two
      // never collide (a scope can only be owned by one SW).
      registerType: "autoUpdate",
      includeAssets: ["assets/images/favicon.svg", "assets/logo192.png", "assets/logo512.png"],
      manifest: {
        name: "Camlytix AI",
        short_name: "Camlytix",
        description:
          "Camlytix is an AI-based campus safety application that detects animals through camera analytics and sends real-time alerts to users when an animal is identified in a monitored campus area.",
        start_url: "/",
        scope: "/",
        display: "standalone",
        orientation: "portrait",
        theme_color: "#0f4c81",
        background_color: "#ffffff",
        icons: [
          {
            src: "icons/icon-192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "icons/icon-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "icons/icon-512-maskable.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,png,ico}"],
        // Don't try to cache the OneSignal worker files — they live in their own scope.
        globIgnores: ["push/onesignal/**"],
      },
      devOptions: {
        enabled: true,
        type: "module",
      },
    }),
  ],
  server: {
    proxy: {
      "/admin/api": {
        target: "https://animal.camlytix.ai",
        changeOrigin: true,
        secure: true,
      },
    },
  },
});
