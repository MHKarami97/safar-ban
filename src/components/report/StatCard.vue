<script setup>
defineProps({
  label: { type: String, required: true },
  value: { type: String, required: true },
  hint: { type: String, default: '' },
  icon: { type: String, default: '' }
});
</script>

<template>
  <div class="rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-700/60 p-3 min-w-0">
    <p class="text-xs text-slate-500 dark:text-slate-400 mb-1 truncate">
      <span v-if="icon" class="ml-1" aria-hidden="true">{{ icon }}</span>{{ label }}
    </p>
    <p class="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-100 break-words">{{ value }}</p>
    <p v-if="hint" class="text-11px text-slate-400 mt-0.5 leading-5">{{ hint }}</p>
  </div>
</template>
