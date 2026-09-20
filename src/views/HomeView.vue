<script setup>
import { ref } from 'vue'
import { BackupService } from '../services/BackupService'

var importInput = ref(null)
var isImporting = ref(false)

function triggerImport() { importInput.value.click() }

async function handleImport(event) {
  var file = event.target.files?.[0]
  if (!file) return
  isImporting.value = true
  try {
    await BackupService.importAll(file)
    window.location.reload()
  } catch (error) {
    alert('وارد کردن فایل بکام با خطا مواجه شد: ' + error.message)
  } finally {
    isImporting.value = false
    event.target.value = ''
  }
}
</script>

<template>
  <section class="space-y-6">
    <div class="text-center py-6">
      <div class="text-5xl mb-3">🧭</div>
      <h1 class="text-2xl font-bold">سفربان</h1>
      <p class="text-sm text-slate-400 mt-1">لوکیشن‌های سفرت را ثبت کن، برنامه سفرت را بچین</p>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <RouterLink to="/regions" class="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 hover:shadow-md hover:-translate-y-0.5 transition-all">
        <div class="text-3xl mb-2">📍</div>
        <h2 class="font-semibold mb-1">لوکیشن‌های سفر</h2>
        <p class="text-xs text-slate-400">استان‌ها و کشورها، شهر به شهر و لوکیشن به لوکیشن</p>
      </RouterLink>

      <RouterLink to="/trips" class="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 hover:shadow-md hover:-translate-y-0.5 transition-all">
        <div class="text-3xl mb-2">🧳</div>
        <h2 class="font-semibold mb-1">برنامه‌ریزی سفر</h2>
        <p class="text-xs text-slate-400">ساخت برنامه سفر با تاریخ شمسی، مقاصد روزانه و گزارش سفر</p>
      </RouterLink>
    </div>

    <div class="flex items-center justify-between gap-3 rounded-xl border border-slate-200/70 dark:border-slate-700/70 bg-slate-50/60 dark:bg-slate-800/40 px-3 py-2.5">
      <p class="text-[11px] text-slate-400 leading-5">
        پشتیبان‌گیری کامل از تمام داده‌های اپ (لوکیشن‌ها، سفرها، رویدادها)
      </p>
      <div class="flex items-center gap-1.5 flex-shrink-0">
        <button type="button" class="text-[11px] px-2.5 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-medium" @click="BackupService.exportAll">
          خروجی
        </button>
        <button type="button" class="text-[11px] px-2.5 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-medium" :disabled="isImporting" @click="triggerImport">
          {{ isImporting ? '...' : 'ورودی' }}
        </button>
        <input ref="importInput" type="file" accept="application/json" class="hidden" @change="handleImport" />
      </div>
    </div>
  </section>
</template>
