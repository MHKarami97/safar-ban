<script setup>
import { ref } from 'vue'
import { BackupService } from '../services/BackupService'
import { useUiStore } from '../stores/uiStore'
import AppIcon from '../components/AppIcon.vue'
import CloudBackupCard from '../components/cloud/CloudBackupCard.vue'

var ui = useUiStore()
var importInput = ref(null)
var isImporting = ref(false)
var message = ref({ type: '', text: '' })
var currentYear = new Date().getFullYear()

function triggerImport() {
  importInput.value?.click()
}

function handleExport() {
  BackupService.exportAll()
  message.value = { type: 'success', text: 'فایل پشتیبان دانلود شد.' }
}

async function handleImport(event) {
  var file = event.target.files?.[0]
  if (!file) return
  isImporting.value = true
  try {
    await BackupService.importAll(file)
    window.location.reload()
  } catch (error) {
    message.value = { type: 'error', text: 'وارد کردن فایل بکاپ با خطا مواجه شد: ' + (error.message || '') }
  } finally {
    isImporting.value = false
    event.target.value = ''
  }
}
</script>

<template>
  <div class="space-y-8">
    <div>
      <h1 class="text-xl sm:text-2xl font-bold">تنظیمات</h1>
      <p class="mt-1 text-sm text-slate-400">ظاهر برنامه، پشتیبان‌گیری و مدیریت داده</p>
    </div>

    <section class="space-y-3" aria-labelledby="appearance-title">
      <h2 id="appearance-title" class="text-sm font-semibold text-slate-500">ظاهر</h2>
      <button
        type="button"
        class="flex w-full min-h-[64px] items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3 text-right dark:border-slate-700 dark:bg-slate-800"
        :aria-pressed="ui.isDarkMode"
        @click="ui.toggleTheme"
      >
        <span class="flex size-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-slate-700 dark:text-amber-300">
          <AppIcon :name="ui.isDarkMode ? 'moon' : 'sun'" />
        </span>
        <span class="flex-1">
          <span class="block text-sm font-semibold">حالت تاریک</span>
          <span class="block text-xs text-slate-400">{{ ui.isDarkMode ? 'روشن است' : 'خاموش است' }}</span>
        </span>
      </button>
    </section>

    <section class="space-y-3" aria-labelledby="cloud-title">
      <h2 id="cloud-title" class="text-sm font-semibold text-slate-500">پشتیبان‌گیری ابری (Google Drive)</h2>
      <CloudBackupCard />
    </section>

    <section class="space-y-3" aria-labelledby="data-title">
      <h2 id="data-title" class="text-sm font-semibold text-slate-500">مدیریت داده (فایل JSON)</h2>
      <p class="text-xs leading-6 text-slate-500 dark:text-slate-400">
        پشتیبان‌گیری کامل از تمام داده‌های اپ (لوکیشن‌ها، سفرها، رویدادها) یا بازیابی از فایل قبلی.
      </p>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button
          type="button"
          class="flex min-h-[64px] items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3 text-right transition-colors hover:border-brand-400 dark:border-slate-700 dark:bg-slate-800"
          @click="handleExport"
        >
          <span class="flex size-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-300">
            <AppIcon name="download" />
          </span>
          <span>
            <span class="block text-sm font-semibold">خروجی</span>
            <span class="block text-xs text-slate-400">دانلود فایل پشتیبان</span>
          </span>
        </button>

        <button
          type="button"
          class="flex min-h-[64px] items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3 text-right transition-colors hover:border-brand-400 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800"
          :disabled="isImporting"
          @click="triggerImport"
        >
          <span class="flex size-11 items-center justify-center rounded-xl bg-sky-50 text-sky-600 dark:bg-sky-900/20 dark:text-sky-300">
            <AppIcon name="upload" />
          </span>
          <span>
            <span class="block text-sm font-semibold">{{ isImporting ? 'در حال بازیابی...' : 'ورودی' }}</span>
            <span class="block text-xs text-slate-400">بازگردانی از فایل</span>
          </span>
        </button>
      </div>
      <input ref="importInput" type="file" accept="application/json" class="hidden" @change="handleImport" />

      <p
        v-if="message.text"
        class="flex items-start justify-between gap-2 rounded-xl p-3 text-xs"
        :class="message.type === 'success'
          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300'
          : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300'"
        role="status"
      >
        <span>{{ message.text }}</span>
        <button type="button" class="opacity-70 hover:opacity-100" aria-label="بستن پیام" @click="message = { type: '', text: '' }">
          <AppIcon name="close" :size="16" />
        </button>
      </p>
    </section>

    <section class="space-y-3" aria-labelledby="about-title">
      <h2 id="about-title" class="text-sm font-semibold text-slate-500">درباره</h2>
      <div class="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
        <p class="text-sm font-bold">سفربان</p>
        <p class="mt-1 text-xs leading-6 text-slate-500 dark:text-slate-400">
          ساخته‌شده توسط <span class="font-medium text-slate-700 dark:text-slate-200">محمدحسین کرمی</span>
        </p>
        <a
          href="https://mhkarami97.ir"
          target="_blank"
          rel="noopener noreferrer"
          class="mt-3 inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-brand-300 px-4 text-sm font-medium text-brand-600 transition-colors hover:bg-brand-50 dark:text-brand-300 dark:hover:bg-slate-700"
        >
          <span>mhkarami97.ir</span>
          <span aria-hidden="true">↗</span>
        </a>
        <p class="mt-3 text-[11px] text-slate-400">© {{ currentYear }} سفربان</p>
      </div>
    </section>
  </div>
</template>
