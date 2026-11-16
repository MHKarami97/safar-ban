<script setup>
import { useRoute } from 'vue-router'
import AppIcon from './AppIcon.vue'
import { NAV_ITEMS, isNavActive } from '../data/appNav'

var route = useRoute()
</script>

<template>
  <nav
    aria-label="منوی اصلی"
    class="pointer-events-none fixed inset-x-0 bottom-0 z-30 px-3 pt-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] sm:hidden"
  >
    <ul
      class="pointer-events-auto mx-auto grid max-w-md grid-cols-4 rounded-3xl bg-white/85 p-1.5 shadow-[0_8px_30px_rgba(15,23,42,0.18)] ring-1 ring-slate-200/70 backdrop-blur-xl dark:bg-slate-900/85 dark:ring-slate-700/60"
    >
      <li v-for="item in NAV_ITEMS" :key="item.id">
        <RouterLink
          :to="item.to"
          :aria-current="isNavActive(item, route.name) ? 'page' : undefined"
          class="group flex flex-col items-center gap-0.5 rounded-2xl px-1 py-1.5 text-[11px] transition-colors"
          :class="isNavActive(item, route.name) ? 'font-semibold text-brand-600 dark:text-brand-300' : 'text-slate-500 dark:text-slate-400'"
        >
          <span
            class="flex h-8 w-12 items-center justify-center rounded-full transition-all duration-200"
            :class="isNavActive(item, route.name)
              ? 'bg-brand-500 text-white shadow-md shadow-brand-500/30'
              : 'group-active:scale-90'"
          >
            <AppIcon :name="item.icon" :size="22" />
          </span>
          <span class="truncate">{{ item.title }}</span>
        </RouterLink>
      </li>
    </ul>
  </nav>
</template>
