<script setup>
import { computed, onMounted, ref } from 'vue'
import { CLOUD_CONFIG } from '../../services/cloud/cloudConfig'
import { toUserMessage } from '../../services/cloud/CloudSyncError'
import { useCloudSyncStore } from '../../stores/cloudSyncStore'

var store = useCloudSyncStore()
var minLength = CLOUD_CONFIG.minPassphraseLength
var snapshot = computed(() => store.snapshot)
var passphrase = ref('')
var passphraseConfirm = ref('')
var isWorking = ref(false)

onMounted(() => {
  store.preload()
})

var pillClass = computed(() => {
  switch (snapshot.value.status) {
    case 'success':
    case 'idle':
      return snapshot.value.connected
        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
        : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
    case 'syncing':
      return 'bg-blue-100 text-blue-800 animate-pulse dark:bg-blue-950/60 dark:text-blue-300'
    case 'needs-reconnect':
    case 'decision-pending':
      return 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
    case 'error':
      return 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
    default:
      return 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
  }
})

async function run(action, successMessage) {
  isWorking.value = true
  try {
    await action()
    if (successMessage) alert(successMessage)
  } catch (error) {
    alert(toUserMessage(error))
  } finally {
    isWorking.value = false
  }
}

function handleConnect() {
  return run(() => store.connect(), 'اتصال به Google Drive با موفقیت برقرار شد.')
}

function handleBackupNow() {
  return run(() => store.backupNow(), 'پشتیبان‌گیری در Google Drive انجام شد.')
}

async function handleDisconnect() {
  if (!confirm('اتصال به Google Drive قطع شود؟ پشتیبان‌گیری خودکار متوقف می‌شود.')) return
  var removeRemote = confirm(
    'آیا نسخه‌های پشتیبان موجود در پوشه مخفی Google Drive هم حذف شوند؟\nتأیید = حذف نسخه‌های ابری، لغو = نگه‌داشتن فایل‌ها در Drive'
  )
  await run(() => store.disconnect(removeRemote), 'اتصال با موفقیت قطع شد.')
}

async function handleEnableEncryption() {
  if (passphrase.value.length < minLength) {
    alert(`رمز عبور باید حداقل ${minLength} نویسه باشد.`)
    return
  }
  if (passphrase.value !== passphraseConfirm.value) {
    alert('رمز عبور و تکرار آن یکسان نیستند.')
    return
  }
  await run(async () => {
    await store.enableEncryption(passphrase.value)
    passphrase.value = ''
    passphraseConfirm.value = ''
  }, 'رمزنگاری سمت کلاینت با موفقیت فعال شد.')
}

async function handleDisableEncryption() {
  if (!confirm('از این پس پشتیبان‌های ابری بدون رمزنگاری ذخیره می‌شوند. آیا ادامه می‌دهید؟')) return
  await run(() => store.disableEncryption(), 'رمزنگاری غیرفعال شد.')
}

async function handleRollback() {
  if (!confirm('اطلاعات این دستگاه به وضعیت قبل از آخرین بازیابی ابری بازمی‌گردد. آیا ادامه می‌دهید؟')) return
  await run(() => store.rollbackLastRestore(), 'داده‌ها به وضعیت پیش از بازیابی برگشت.')
  window.location.reload()
}
</script>

<template>
  <div class="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5 shadow-sm space-y-4">
    <div class="flex items-center justify-between gap-2 flex-wrap">
      <div class="flex items-center gap-2">
        <span class="text-xl">☁️</span>
        <h2 class="text-base font-bold text-slate-800 dark:text-slate-100">پشتیبان‌گیری خودکار در Google Drive</h2>
      </div>
      <span :class="['rounded-full px-2.5 py-0.5 text-xs font-semibold', pillClass]">
        {{ store.statusText }}
      </span>
    </div>

    <p class="text-xs leading-relaxed text-slate-500 dark:text-slate-400">
      نسخه‌ی پشتیبان در پوشه‌ی مخفی اختصاصی همین برنامه در Google Drive شخصی شما (appDataFolder) ذخیره می‌شود
      و سایر برنامه‌ها به آن دسترسی ندارند. پس از هر تغییر دیتا، پشتیبان‌گیری به‌صورت خودکار با چند ثانیه تأخیر انجام می‌شود.
    </p>

    <!-- پنل وضعیت -->
    <div class="flex flex-col gap-2 rounded-xl bg-slate-50 p-3 text-xs ring-1 ring-slate-200/60 dark:bg-slate-800/50 dark:ring-slate-700/60">
      <div class="flex items-center justify-between">
        <span class="text-slate-500 dark:text-slate-400">وضعیت اتصال:</span>
        <strong class="font-medium text-slate-800 dark:text-slate-200">{{ store.statusText }}</strong>
      </div>
      <div v-if="store.isConnected && store.lastSuccessText" class="flex items-center justify-between">
        <span class="text-slate-500 dark:text-slate-400">آخرین پشتیبان موفق:</span>
        <strong class="font-medium text-slate-800 dark:text-slate-200">{{ store.lastSuccessText }}</strong>
      </div>
      <p v-if="store.isConnected && snapshot.status !== 'error' && snapshot.lastError" class="text-xs text-rose-500">
        {{ snapshot.lastError }}
      </p>
    </div>

    <!-- دکمه‌های عملیات اصلی -->
    <div class="flex flex-wrap items-center gap-2">
      <button
        v-if="!store.isConnected"
        type="button"
        :disabled="isWorking"
        class="min-h-[40px] px-4 rounded-xl bg-brand-500 text-white text-xs font-medium hover:bg-brand-600 transition-colors"
        @click="handleConnect"
      >
        🔗 اتصال به Google Drive
      </button>

      <template v-else>
        <button
          v-if="snapshot.status === 'needs-reconnect' || snapshot.status === 'error'"
          type="button"
          :disabled="isWorking"
          class="min-h-[40px] px-3 rounded-xl border border-slate-300 dark:border-slate-600 text-xs font-medium hover:bg-slate-50 dark:hover:bg-slate-800"
          @click="handleConnect"
        >
          🔄 اتصال دوباره
        </button>

        <button
          v-if="snapshot.decision && snapshot.decision.dismissed"
          type="button"
          class="min-h-[40px] px-3 rounded-xl border border-slate-300 dark:border-slate-600 text-xs font-medium hover:bg-slate-50 dark:hover:bg-slate-800"
          @click="store.reopenDecision()"
        >
          ☁️ بررسی نسخه‌ی ابری
        </button>

        <button
          type="button"
          :disabled="isWorking || store.isBusy || !!snapshot.decision"
          class="min-h-[40px] px-4 rounded-xl bg-brand-500 text-white text-xs font-medium hover:bg-brand-600 transition-colors disabled:opacity-50"
          @click="handleBackupNow"
        >
          <span :class="store.isBusy ? 'inline-block animate-spin' : ''">🔄</span>
          پشتیبان‌گیری همین حالا
        </button>

        <button
          type="button"
          :disabled="isWorking"
          class="min-h-[40px] px-3 rounded-xl border border-rose-300 text-rose-600 dark:border-rose-800 dark:text-rose-400 text-xs font-medium hover:bg-rose-50 dark:hover:bg-rose-950/40"
          @click="handleDisconnect"
        >
          قطع اتصال
        </button>
      </template>
    </div>

    <!-- زیرپنل رمزنگاری سمت کلاینت (Zero-Knowledge) -->
    <div class="flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 dark:border-slate-800 dark:bg-slate-900/60">
      <div class="flex items-center gap-1.5">
        <span class="text-base" aria-hidden="true">🔐</span>
        <h3 class="text-xs font-bold text-slate-800 dark:text-slate-200">رمزنگاری سرتاسری اختیاری (Zero-Knowledge)</h3>
      </div>

      <template v-if="snapshot.encryptionEnabled">
        <div class="flex items-start gap-2 rounded-lg bg-emerald-50 p-2.5 text-xs text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200">
          <span class="text-base shrink-0">🛡️</span>
          <div>
            <strong class="font-bold">رمزنگاری استاندارد AES-GCM ۲۵۶ فعال است.</strong>
            <p class="mt-0.5 text-[11px] leading-relaxed text-emerald-700 dark:text-emerald-300">
              داده‌ها پیش از خروج از دستگاه شما رمز می‌شوند و حتی گوگل هم به اطلاعات سفرهای شما دسترسی ندارد.
            </p>
          </div>
        </div>
        <div>
          <button
            type="button"
            :disabled="isWorking"
            class="text-xs text-rose-600 underline hover:text-rose-700 dark:text-rose-400"
            @click="handleDisableEncryption"
          >
            غیرفعال‌سازی رمزنگاری
          </button>
        </div>
      </template>

      <template v-else>
        <p class="text-xs leading-relaxed text-slate-500 dark:text-slate-400">
          بدون رمزنگاری، محتوا به صورت فایل استاندارد ذخیره می‌شود. با فعال‌سازی، فایل‌ها با کلید مشتق‌شده از گذرواژه شما (PBKDF2 با ۶۰۰٬۰۰۰ دور) رمز می‌شوند.
          <strong class="text-rose-600 dark:text-rose-400 block mt-1">هشدار: در صورت فراموشی گذرواژه، اطلاعات ابری هرگز قابل بازیابی نخواهد بود.</strong>
        </p>

        <div class="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <div class="flex flex-col gap-1">
            <label class="text-[11px] font-medium text-slate-500">گذرواژه رمزنگاری (حداقل {{ minLength }} نویسه):</label>
            <input
              v-model="passphrase"
              type="password"
              placeholder="گذرواژه قوی..."
              class="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs"
            />
          </div>
          <div class="flex flex-col gap-1">
            <label class="text-[11px] font-medium text-slate-500">تکرار گذرواژه:</label>
            <input
              v-model="passphraseConfirm"
              type="password"
              placeholder="تکرار همان گذرواژه..."
              class="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs"
            />
          </div>
        </div>

        <div>
          <button
            type="button"
            :disabled="isWorking || passphrase.length < minLength || passphrase !== passphraseConfirm"
            class="min-h-[36px] px-4 rounded-xl border border-slate-300 dark:border-slate-600 text-xs font-medium hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50"
            @click="handleEnableEncryption"
          >
            🛡️ فعال‌سازی رمزنگاری
          </button>
        </div>
      </template>
    </div>

    <!-- تنظیمات اعلان و بازگشت -->
    <div class="flex flex-col gap-2 pt-1 text-xs">
      <label class="flex cursor-pointer items-center gap-2 text-slate-600 dark:text-slate-400">
        <input
          type="checkbox"
          class="size-4 rounded accent-brand-500"
          :checked="snapshot.notifyFailures"
          @change="store.setNotifyFailures(($event.target).checked)"
        />
        <span>نمایش نوار هشدار پایین صفحه در صورت عدم موفقیت همگام‌سازی (فقط در حالت آنلاین)</span>
      </label>

      <div
        v-if="snapshot.hasRollbackSnapshot"
        class="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-amber-50 p-2.5 text-xs text-amber-800 ring-1 ring-amber-200/80 dark:bg-amber-950/40 dark:text-amber-200 dark:ring-amber-800/40"
      >
        <span>پیش از آخرین بازیابی ابری، نسخه‌ی محلی ذخیره شده است.</span>
        <button
          type="button"
          :disabled="isWorking"
          class="px-3 py-1.5 rounded-lg border border-amber-300 dark:border-amber-700 text-xs hover:bg-amber-100 dark:hover:bg-amber-900/50"
          @click="handleRollback"
        >
          ↩️ بازگرداندن نسخه پیش از بازیابی
        </button>
      </div>
    </div>
  </div>
</template>
