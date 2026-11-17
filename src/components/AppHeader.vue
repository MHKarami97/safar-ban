<script setup>
import { useUiStore } from '../stores/uiStore'
import AppIcon from './AppIcon.vue'

var ui = useUiStore()
</script>

<template>
  <header class="sticky top-0 z-20 backdrop-blur bg-white/80 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800">
    <div class="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
      <RouterLink to="/" class="flex items-center gap-2.5 font-bold text-lg">
        <span class="flex size-8 shrink-0 items-center justify-center rounded-xl bg-brand-500 text-white shadow-sm shadow-brand-500/20">
          <AppIcon name="compass" :size="19" />
        </span>
        <span>سفربان</span>
      </RouterLink>

      <div class="flex items-center gap-1">
        <RouterLink
          to="/settings"
          class="w-11 h-11 flex items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
          aria-label="تنظیمات"
        >
          <AppIcon name="sliders" />
        </RouterLink>
        <button
          type="button"
          class="w-11 h-11 flex items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
          :aria-label="ui.isDarkMode ? 'حالت روشن' : 'حالت تاریک'"
          @click="ui.toggleTheme"
        >
          <AppIcon :name="ui.isDarkMode ? 'sun' : 'moon'" />
        </button>
      </div>
    </div>
  </header>
</template>
