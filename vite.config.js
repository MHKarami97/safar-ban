import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    vue(),
    VitePWA({
      registerType: 'prompt',
      injectRegister: 'auto',
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'سفربان',
        short_name: 'سفربان',
        description: 'ثبت لوکیشن‌های سفر و برنامه‌ریزی سفر با تاریخ شمسی',
        theme_color: '#0e5f38',
        background_color: '#0e5f38',
        display: 'standalone',
        orientation: 'portrait',
        dir: 'rtl',
        lang: 'fa',
        icons: [{ src: 'favicon.svg', sizes: 'any', type: 'image/svg+xml' }]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,ico,png,svg,woff2}'],
        cleanupOutdatedCaches: true,
        // Explicit (not just relying on defaults): a new service worker must
        // stay in the "waiting" state until updateServiceWorker() is called
        // from the prompt. If either of these were true, the browser would
        // activate the new SW immediately and needRefresh would never fire.
        skipWaiting: false,
        clientsClaim: false
      },
      devOptions: {
        // Without this, `npm run dev` never registers a real service worker,
        // so the update prompt can only ever be tested against a production
        // build (`npm run build && npm run preview`) or the deployed site.
        enabled: true,
        type: 'module'
      }
    })
  ]
})
