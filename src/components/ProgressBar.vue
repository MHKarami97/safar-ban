<script setup>
defineProps({
  percent: { type: Number, required: true },
  size: { type: String, default: 'md' },
  label: { type: String, default: '' },
  showPercent: { type: Boolean, default: true }
})
</script>

<template>
  <div class="w-full">
    <div v-if="label || showPercent" class="flex items-center justify-between mb-1.5 text-xs text-slate-500 dark:text-slate-400">
      <span v-if="label">{{ label }}</span>
      <span v-if="showPercent" class="font-semibold text-brand-600 dark:text-brand-300">{{ percent }}٪</span>
    </div>
    <div class="w-full rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden" :class="size === 'sm' ? 'h-1.5' : 'h-2.5'">
      <div
        class="h-full rounded-full bg-gradient-to-l from-brand-400 to-brand-600 transition-all duration-500 ease-out"
        :style="{ width: percent + '%' }"
      />
    </div>
  </div>
</template>
