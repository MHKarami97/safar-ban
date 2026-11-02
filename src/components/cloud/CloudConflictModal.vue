<script setup>
import { computed, ref, watch } from 'vue'
import { useCloudSyncStore } from '../../stores/cloudSyncStore'
import { formatDateTimeFa } from '../../services/cloud/cloudFormat'
import { CloudSyncError, toUserMessage } from '../../services/cloud/CloudSyncError'

var store = useCloudSyncStore()
var decision = computed(() => store.snapshot.decision)
var isOpen = computed(() => Boolean(decision.value && !decision.value.dismissed))

var mode = ref('replace')
var passphrase = ref('')
var errorText = ref('')
var isWorking = ref(false)
var passphraseRequested = ref(false)

var needsPassphrase = computed(
  () => passphraseRequested.value || (!!decision.value?.remoteEncrypted && !store.snapshot.encryptionEnabled)
)

var title = computed(() => {
  switch (decision.value?.kind) {
    case 'conflict':
      return 'تفاوت بین دیتای این دستگاه و Google Drive'
    case 'remote-only':
      return 'پشتیبان ابری پیدا شد'
    default:
      return 'نسخه‌ی جدیدتری در Google Drive هست'
  }
})

var description = computed(() => {
  switch (decision.value?.kind) {
    case 'conflict':
      return 'هم این دستگاه و هم نسخه‌ی ابری از آخرین همگام‌سازی تغییر کرده‌اند. یکی از گزینه‌های زیر را انتخاب کنید.'
    case 'remote-only':
      return 'در Google Drive شما نسخه‌ی پشتیبان پیدا شد اما این دستگاه هنوز داده‌ای ندارد. مایل به بازیابی هستید؟'
    default:
      return 'دیتای این دستگاه تغییری نکرده است و نسخه‌ی ابری (احتمالاً از دستگاه دیگر) جدیدتر است.'
  }
})

watch(
  () => decision.value?.remote.id,
  () => {
    mode.value = decision.value?.kind === 'conflict' ? 'merge' : 'replace'
    passphrase.value = ''
    errorText.value = ''
    passphraseRequested.value = false
  },
  { immediate: true }
)

async function handleRestore() {
  errorText.value = ''
  isWorking.value = true
  try {
    await store.resolveRestore(mode.value, needsPassphrase.value ? passphrase.value : undefined)
    alert('اطلاعات سفر و لوکیشن‌ها با موفقیت از Google Drive بازیابی شدند.')
  } catch (error) {
    if (
      error instanceof CloudSyncError &&
      (error.code === 'PASSPHRASE_REQUIRED' || error.code === 'PASSPHRASE_INVALID')
    ) {
      passphraseRequested.value = true
      errorText.value = error.message
    } else {
      errorText.value = toUserMessage(error)
    }
  } finally {
    isWorking.value = false
  }
}

async function handleKeepLocal() {
  errorText.value = ''
  isWorking.value = true
  try {
    await store.resolveKeepLocal()
    alert('دیتای این دستگاه در Google Drive ذخیره شد.')
  } catch (error) {
    errorText.value = toUserMessage(error)
  } finally {
    isWorking.value = false
  }
}
</script>

<template>
  <div
    v-if="isOpen && decision"
    class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs"
    role="dialog"
    aria-modal="true"
  >
    <div class="flex max-h-[90vh] w-full max-w-lg flex-col gap-4 overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800 text-slate-800 dark:text-slate-100">
      <div class="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
        <h2 class="text-base font-bold">{{ title }}</h2>
        <button
          type="button"
          class="rounded-lg p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          aria-label="بستن"
          @click="store.dismissDecision()"
        >
          ✕
        </button>
      </div>

      <p class="text-xs leading-relaxed text-slate-600 dark:text-slate-300">
        {{ description }}
      </p>

      <div class="flex flex-col gap-2 rounded-xl bg-slate-50 p-3 text-xs ring-1 ring-slate-200/60 dark:bg-slate-800/50 dark:ring-slate-700/60">
        <div class="flex items-center justify-between">
          <span class="text-slate-500 dark:text-slate-400">تاریخ آخرین نسخه ابری:</span>
          <span class="font-medium">{{ formatDateTimeFa(decision.remote.modifiedTime) }}</span>
        </div>
        <div class="flex items-center justify-between">
          <span class="text-slate-500 dark:text-slate-400">تعداد سفرها و مناطق در Drive:</span>
          <span class="font-bold text-brand-500">{{ decision.remoteItemsCount }}</span>
        </div>
        <div class="flex items-center justify-between">
          <span class="text-slate-500 dark:text-slate-400">تعداد در این دستگاه:</span>
          <span class="font-medium">{{ decision.localItemsCount }}</span>
        </div>
        <div class="flex items-center justify-between">
          <span class="text-slate-500 dark:text-slate-400">نوع ذخیره‌سازی ابری:</span>
          <span class="font-medium">{{ decision.remoteEncrypted ? '🔒 AES-GCM (رمزشده)' : 'ساده (بدون رمز)' }}</span>
        </div>
      </div>

      <div v-if="needsPassphrase" class="flex flex-col gap-1.5">
        <label class="text-xs font-semibold text-slate-700 dark:text-slate-300">
          گذرواژه رمزگشایی فایل پشتیبان ابری:
        </label>
        <input
          v-model="passphrase"
          type="password"
          placeholder="گذرواژه‌ای که قبلاً تعیین کردید..."
          class="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs"
        />
      </div>

      <div class="flex flex-col gap-2">
        <span class="text-xs font-semibold text-slate-700 dark:text-slate-300">نحوه اعمال نسخه ابری:</span>
        <div class="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <label
            :class="[
              'flex cursor-pointer items-start gap-2 rounded-xl p-3 ring-1 transition',
              mode === 'merge'
                ? 'bg-brand-50/70 ring-brand-500 dark:bg-brand-950/40'
                : 'bg-white ring-slate-200 hover:bg-slate-50 dark:bg-slate-900 dark:ring-slate-800'
            ]"
          >
            <input v-model="mode" type="radio" value="merge" class="mt-0.5 accent-brand-500" />
            <div class="flex flex-col gap-0.5 text-xs">
              <strong class="font-semibold text-brand-600 dark:text-brand-400">ادغام هوشمند (Merge)</strong>
              <span class="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">سفرها، لوکیشن‌ها و سوابق بازدید دو طرف تلفیق می‌شوند.</span>
            </div>
          </label>

          <label
            :class="[
              'flex cursor-pointer items-start gap-2 rounded-xl p-3 ring-1 transition',
              mode === 'replace'
                ? 'bg-rose-50/70 ring-rose-500 dark:bg-rose-950/40'
                : 'bg-white ring-slate-200 hover:bg-slate-50 dark:bg-slate-900 dark:ring-slate-800'
            ]"
          >
            <input v-model="mode" type="radio" value="replace" class="mt-0.5 accent-rose-600" />
            <div class="flex flex-col gap-0.5 text-xs">
              <strong class="font-semibold text-rose-600 dark:text-rose-400">جایگزینی کامل (Replace)</strong>
              <span class="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">اطلاعات دستگاه دقیقاً با نسخه ابری جایگزین می‌شود.</span>
            </div>
          </label>
        </div>
        <p class="text-[11px] text-slate-400">
          * پیش از بازیابی، یک اسنپ‌شات محلی از دیتای فعلی ذخیره می‌شود و قابل بازگشت است.
        </p>
      </div>

      <p v-if="errorText" class="rounded-lg bg-rose-50 p-2.5 text-xs font-medium text-rose-600 dark:bg-rose-950/50 dark:text-rose-300">
        {{ errorText }}
      </p>

      <div class="flex flex-col-reverse gap-2 pt-2 sm:flex-row-reverse sm:justify-start">
        <button
          type="button"
          :disabled="isWorking || (needsPassphrase && passphrase.length === 0)"
          class="min-h-[40px] px-4 rounded-xl bg-brand-500 text-white text-xs font-medium hover:bg-brand-600 transition-colors disabled:opacity-50"
          @click="handleRestore"
        >
          {{ isWorking ? 'در حال بازیابی...' : 'بازیابی از Google Drive' }}
        </button>

        <button
          v-if="decision.localItemsCount > 0"
          type="button"
          :disabled="isWorking"
          class="min-h-[40px] px-4 rounded-xl border border-slate-300 dark:border-slate-600 text-xs font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          @click="handleKeepLocal"
        >
          نگه‌داشتن دیتای این دستگاه
        </button>

        <button
          type="button"
          :disabled="isWorking"
          class="min-h-[40px] px-4 rounded-xl border border-slate-300 dark:border-slate-600 text-xs font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          @click="store.dismissDecision()"
        >
          بعداً
        </button>
      </div>
    </div>
  </div>
</template>
