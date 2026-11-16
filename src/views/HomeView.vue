<script setup>
import AppIcon from '../components/AppIcon.vue'
import { HOME_CARDS, TONES } from '../data/appNav'
</script>

<template>
  <section class="space-y-6">
    <header class="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-500 to-brand-700 p-6 text-white shadow-lg shadow-brand-500/20">
      <div class="pointer-events-none absolute -left-10 -top-10 size-40 rounded-full bg-white/10" aria-hidden="true"></div>
      <div class="pointer-events-none absolute -bottom-12 right-6 size-32 rounded-full bg-white/10" aria-hidden="true"></div>
      <div class="relative flex items-center gap-4">
        <span class="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">
          <AppIcon name="compass" :size="32" />
        </span>
        <div>
          <h1 class="text-2xl font-bold">سفربان</h1>
          <p class="mt-1 text-sm text-white/85">لوکیشن‌های سفرت را ثبت کن، برنامه سفرت را بچین</p>
        </div>
      </div>
    </header>

    <ul class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <li v-for="card in HOME_CARDS" :key="card.id">
        <RouterLink
          :to="card.to"
          class="group flex h-full items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 transition-all hover:-translate-y-0.5 hover:border-brand-400 hover:shadow-md active:scale-[0.98] dark:border-slate-700 dark:bg-slate-800 motion-reduce:transition-none"
        >
          <span class="flex size-12 shrink-0 items-center justify-center rounded-2xl" :class="TONES[card.tone]">
            <AppIcon :name="card.icon" :size="26" />
          </span>
          <span class="flex-1">
            <span class="block font-semibold">{{ card.title }}</span>
            <span class="mt-0.5 block text-xs leading-6 text-slate-500 dark:text-slate-400">{{ card.desc }}</span>
          </span>
          <AppIcon name="chevron" :size="18" class="text-slate-300 transition-colors group-hover:text-brand-500" />
        </RouterLink>
      </li>
    </ul>
  </section>
</template>
