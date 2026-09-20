<script setup>
import { useRegisterSW } from 'virtual:pwa-register/vue'

const { needRefresh, updateServiceWorker } = useRegisterSW({
  onRegisteredSW(swUrl, registration) {
    if (!registration) return

    registration.update()

    setInterval(() => registration.update(), 60 * 1000)

    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') registration.update()
    })
  },
  onRegisterError(error) {
    console.error('SafarBan service worker registration failed', error)
  }
})

function reload() {
  updateServiceWorker(true)
}
</script>

<template>
  <Transition name="fade">
    <div v-if="needRefresh" class="fixed bottom-20 sm:bottom-6 inset-x-0 z-40 flex justify-center px-4">
      <div class="bg-slate-900 dark:bg-slate-800 text-white rounded-2xl shadow-xl px-4 py-3 flex items-center gap-3 max-w-sm w-full">
        <span class="text-sm flex-1">نسخه جدید سفربان آمادست</span>
        <button type="button" class="min-h-[44px] px-4 rounded-xl bg-brand-500 hover:bg-brand-600 text-sm font-medium transition-colors" @click="reload">به‌روزرسانی</button>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease, transform 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; transform: translateY(8px); }
</style>
