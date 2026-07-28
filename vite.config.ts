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
      includeAssets: ["vite.svg", "icons/icon-192.png", "icons/icon-512.png"],
      manifest: {
        name: "Employee Directory PWA",
        short_name: "Employees",
        description: "Proof-of-concept PWA with OneSignal push notifications",
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
        target: "https://animal.do365tech.com",
        changeOrigin: true,
        secure: true,
      },
    },
  },
});
