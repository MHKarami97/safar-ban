<script setup>
var currentYear = new Date().getFullYear()
</script>

<template>
  <footer class="border-t border-slate-200 dark:border-slate-800 mt-auto">
    <div class="max-w-5xl mx-auto px-4 sm:px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs sm:text-sm text-slate-400">
      <span>© {{ currentYear }} سفربان</span>
      <a
        href="https://mhkarami97.ir"
        target="_blank"
        rel="noopener noreferrer"
        class="inline-flex items-center gap-1.5 min-h-[44px] px-2 text-slate-500 dark:text-slate-300 hover:text-brand-500 dark:hover:text-brand-400 transition-colors"
      >
        ساخته شده توسط
        <span class="font-medium underline underline-offset-4">mhkarami97.ir</span>
      </a>
    </div>
  </footer>
</template>
