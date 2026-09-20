<script setup>
import { TRIP_STATUSES } from '../models/trip/TripPlan'

defineProps({ status: { type: String, required: true } })

var colorMap = {
  planning: 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200',
  upcoming: 'bg-amber-100 text-amber-700 dark:bg-amber-700/30 dark:text-amber-200',
  ongoing: 'bg-brand-100 text-brand-700 dark:bg-brand-700/30 dark:text-brand-100',
  completed: 'bg-slate-800 text-white dark:bg-slate-100 dark:text-slate-900'
}
</script>

<template>
  <span class="text-xs px-2.5 py-1 rounded-full font-medium" :class="colorMap[status]">{{ TRIP_STATUSES[status] }}</span>
</template>
