import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    vue(),
    VitePWA({
      registerType: "prompt",
      includeAssets: ["icons/icon-48.png"],
      manifest: {
        name: "سفربان",
        short_name: "سفربان",
        description: "ثبت لوکیشن‌های سفر و برنامه‌ریزی سفر با تاریخ شمسی",
        theme_color: "#0e5f38",
        background_color: "#0e5f38",
        display: "standalone",
        orientation: "portrait",
        dir: "rtl",
        lang: "fa",
        icons: [
          { src: "icons/icon-48.png", sizes: "48x48", type: "image/png" },
          { src: "icons/icon-72.png", sizes: "72x72", type: "image/png" },
          { src: "icons/icon-96.png", sizes: "96x96", type: "image/png" },
          { src: "icons/icon-144.png", sizes: "144x144", type: "image/png" },
          { src: "icons/icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "icons/icon-512.png", sizes: "512x512", type: "image/png" },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,ico,png,svg,woff2}"],
        cleanupOutdatedCaches: true,
      },
    }),
  ],
});
