<script setup>
import AppIcon from './AppIcon.vue'

defineProps({ destination: { type: Object, required: true } })
defineEmits(['remove'])
</script>

<template>
  <div class="flex items-center gap-3 rounded-xl px-3 py-3 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/60">
    <div class="flex-1">
      <p class="text-sm font-medium">{{ destination.name }}</p>
      <p class="text-xs text-slate-400 mt-0.5">{{ destination.startTime }} تا {{ destination.endTime }} ({{ destination.durationHours }} ساعت)</p>
      <p v-if="destination.note" class="text-xs text-slate-400 mt-0.5">{{ destination.note }}</p>
    </div>
    <button
      type="button"
      class="flex size-10 items-center justify-center rounded-xl text-slate-400 hover:bg-rose-50 hover:text-rose-500 dark:hover:bg-rose-950/30 transition-colors"
      aria-label="حذف مقصد"
      @click="$emit('remove', destination.id)"
    >
      <AppIcon name="trash" :size="18" />
    </button>
  </div>
</template>
