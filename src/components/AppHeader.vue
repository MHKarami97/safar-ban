<script setup>
import { useUiStore } from '../stores/uiStore'

var ui = useUiStore()
</script>

<template>
  <header class="sticky top-0 z-20 backdrop-blur bg-white/80 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800">
    <div class="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
      <RouterLink to="/" class="flex items-center gap-2 font-bold text-lg">
        <span>🧭</span>
        <span>سفربان</span>
      </RouterLink>

      <button
        type="button"
        class="w-11 h-11 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        :aria-label="ui.isDarkMode ? 'حالت روشن' : 'حالت تاریک'"
        @click="ui.toggleTheme"
      >
        <span class="text-xl">{{ ui.isDarkMode ? '☀️' : '🌙' }}</span>
      </button>
    </div>
  </header>
</template>
