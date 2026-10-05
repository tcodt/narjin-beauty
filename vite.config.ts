import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: [
        "favicon.svg",
        "favicon.ico",
        "robots.txt",
        "apple-touch-icon.png",
      ],
      manifest: {
        name: "نارژین | نوبت‌دهی آنلاین",
        short_name: "نارژین",
        description: "اپلیکیشن نوبت‌دهی سالن زیبایی نارژین",
        lang: "fa",
        dir: "rtl",
        theme_color: "#19705D",
        background_color: "#ffffff",
        display: "standalone",
        orientation: "portrait",
        scope: "/",
        start_url: "/",
        icons: [
          {
            src: "web-app-manifest-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "web-app-manifest-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "web-app-manifest-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
        ],
      },
      workbox: {
        navigateFallback: "/index.html",
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
        runtimeCaching: [
          {
            urlPattern:
              /^https:\/\/queuingprojectapi\.pythonanywhere\.com\/.*/i,
            handler: "NetworkFirst",
            options: {
              cacheName: "api-cache",
              expiration: { maxEntries: 64, maxAgeSeconds: 60 * 60 },
            },
          },
        ],
      },
    }),
  ],
});
