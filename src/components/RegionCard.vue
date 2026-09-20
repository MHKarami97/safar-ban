<script setup>
import ProgressBar from './ProgressBar.vue'

defineProps({ region: { type: Object, required: true } })
</script>

<template>
  <RouterLink
    :to="`/regions/${region.id}`"
    class="block rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
  >
    <div class="flex items-center justify-between gap-2 mb-3">
      <div class="flex items-center gap-2">
        <span class="text-2xl">{{ region.icon }}</span>
        <span class="font-semibold text-sm sm:text-base">{{ region.name }}</span>
      </div>
      <span class="text-xs text-slate-500 dark:text-slate-400">{{ region.visitedCount }}/{{ region.totalCount }}</span>
    </div>
    <ProgressBar :percent="region.progressPercent" size="sm" :show-percent="false" />
  </RouterLink>
</template>
