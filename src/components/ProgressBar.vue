<script setup>
defineProps({
  percent: { type: Number, required: true },
  size: { type: String, default: 'md' }
})
</script>

<template>
  <div class="w-full">
    <div class="w-full rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden" :class="size === 'sm' ? 'h-1.5' : 'h-2.5'">
      <div
        class="h-full rounded-full bg-gradient-to-l from-brand-400 to-brand-600 transition-all duration-500 ease-out"
        :style="{ width: percent + '%' }"
      />
    </div>
  </div>
</template>
