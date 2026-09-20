<script setup>
import { useRoute, useRouter } from 'vue-router'

var route = useRoute()
var router = useRouter()

var tabs = [
  { name: 'home', label: 'خانه', icon: '🏠', to: '/' },
  { name: 'regions-home', label: 'لوکیشن‌ها', icon: '📍', to: '/regions' },
  { name: 'trip-list', label: 'سفرها', icon: '🧳', to: '/trips' }
]
</script>

<template>
  <nav class="fixed bottom-0 inset-x-0 z-20 bg-white/95 dark:bg-slate-900/95 border-t border-slate-200 dark:border-slate-800 flex items-center justify-around h-16">
    <button
      v-for="tab in tabs"
      :key="tab.name"
      type="button"
      class="flex flex-col items-center justify-center min-w-[44px] min-h-[44px] px-4 text-sm"
      :class="route.path === tab.to || route.name === tab.name ? 'text-brand-500 font-semibold' : 'text-slate-500 dark:text-slate-400'"
      @click="router.push(tab.to)"
    >
      <span class="text-xl">{{ tab.icon }}</span>
      <span>{{ tab.label }}</span>
    </button>
  </nav>
</template>
