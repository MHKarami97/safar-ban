<script setup>
import { useRegisterSW } from "virtual:pwa-register/vue";
import { onUnmounted } from "vue";

// اجتناب از Magic Numbers و تنظیم منطقی زمان چک کردن آپدیت (۱ ساعت)
const SW_UPDATE_INTERVAL_MS = 60 * 60 * 1000;

const { needRefresh, updateServiceWorker } = useRegisterSW({
  // اصلاح Signature: دریافت swUrl به عنوان پارامتر اول
  onRegisteredSW(swUrl, registration) {
    if (!registration) return;

    // چک کردن بلافاصله پس از ثبت
    registration.update();

    // Polling هوشمندانه: فقط در صورت اتصال به اینترنت ریکوئست ارسال شود
    const intervalId = setInterval(() => {
      if (navigator.onLine) {
        registration.update();
      }
    }, SW_UPDATE_INTERVAL_MS);

    // به‌روزرسانی در صورت بازگشت کاربر به تب مرورگر
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && navigator.onLine) {
        registration.update();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    // پاکسازی Event Listener و Timer برای جلوگیری از نشت حافظه (Memory Leak)
    onUnmounted(() => {
      clearInterval(intervalId);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    });
  },
  onRegisterError(error) {
    console.error("[SafarBan PWA] Service worker registration failed:", error);
  },
});

// پیاده‌سازی Resilient برای دکمه رفرش
const reload = async () => {
  try {
    // ارسال سیگنال SKIP_WAITING به Service Worker جدید
    await updateServiceWorker(true);

    // Fallback Mechanism: اگر به هر دلیلی مرورگر رویداد controllerchange را بلاک کرد
    // پس از 1.5 ثانیه صفحه را اجباری رفرش می‌کنیم تا کلاینت گیر نکند
    setTimeout(() => {
      window.location.reload();
    }, 1500);
  } catch (error) {
    console.error("[SafarBan PWA] Failed to update service worker:", error);
    window.location.reload();
  }
};
</script>

<template>
  <Transition name="fade">
    <!-- استفاده از aside به جای div برای Semantic HTML پیام‌های شناور -->
    <aside
      v-if="needRefresh"
      class="fixed bottom-20 sm:bottom-6 inset-x-0 z-40 flex justify-center px-4"
      aria-live="polite"
    >
      <div
        class="bg-slate-900 dark:bg-slate-800 text-white rounded-2xl shadow-xl px-4 py-3 flex items-center gap-3 max-w-sm w-full"
      >
        <span class="text-sm flex-1">نسخه جدید سفربان آمادست</span>
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
