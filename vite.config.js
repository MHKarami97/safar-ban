import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    vue(),
    VitePWA({
      registerType: 'prompt',
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
      workbox: { globPatterns: ['**/*.{js,css,ico,png,svg,woff2}'], cleanupOutdatedCaches: true }
    })
  ]
})
