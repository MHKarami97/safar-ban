<script setup>
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
    <button type="button" class="min-w-[40px] min-h-[40px] text-slate-400 hover:text-red-500" @click="$emit('remove', destination.id)">🗑️</button>
  </div>
</template>
