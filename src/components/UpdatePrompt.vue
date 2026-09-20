<script setup>
import { useRegisterSW } from "virtual:pwa-register/vue";
import { onUnmounted } from "vue";

// اصل Clean Code: استفاده از ثابت‌ها به جای Magic Numbers
// آپدیت هر یک ساعت یک بار چک شود، نه هر یک دقیقه!
const SW_UPDATE_INTERVAL_MS = 60 * 60 * 1000;

const { needRefresh, updateServiceWorker } = useRegisterSW({
  onRegisteredSW(swUrl, registration) {
    if (!registration) return;

    // اجرای چک اولیه
    registration.update();

    // 1. منطق هوشمندانه برای Polling با در نظر گرفتن وضعیت شبکه
    const intervalId = setInterval(() => {
      if (navigator.onLine) {
        registration.update();
      }
    }, SW_UPDATE_INTERVAL_MS);

    // 2. مدیریت درست رویدادها بر اساس Visibility
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && navigator.onLine) {
        registration.update();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    // 3. جلوگیری از Memory Leak در SPA
    onUnmounted(() => {
      clearInterval(intervalId);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    });
  },
  onRegisterError(error) {
    // در پروژه‌های Enterprise، این لاگ باید به ابزارهایی مثل Sentry ارسال شود
    console.error("[SafarBan PWA] Registration rejected:", error);
  },
});

const reload = async () => {
  await updateServiceWorker(true);
  setTimeout(() => window.location.reload(), 1500);
};
</script>

<template>
  <Transition name="fade">
    <!-- از تگ semantic aside برای پیام‌های شناور و غیر اصلی استفاده کنید -->
    <aside
      v-if="needRefresh"
      class="fixed bottom-20 sm:bottom-6 inset-x-0 z-40 flex justify-center px-4"
      aria-live="polite"
    >
      <div
        class="bg-slate-900 dark:bg-slate-800 text-white rounded-2xl shadow-xl px-4 py-3 flex items-center gap-3 max-w-sm w-full"
      >
        <span class="text-sm flex-1">نسخه جدید سفربان آماده است</span>
        <button
          type="button"
          class="min-h-[44px] px-4 rounded-xl bg-brand-500 hover:bg-brand-600 text-sm font-medium transition-colors"
          @click="reload"
        >
          به‌روزرسانی
        </button>
      </div>
    </aside>
  </Transition>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(8px);
}
</style>
