<script setup>
import TripStatusBadge from './TripStatusBadge.vue'
import { jalaliDateToLabel } from '../utils/jalali'

defineProps({ trip: { type: Object, required: true } })
</script>

<template>
  <RouterLink
    :to="`/trips/${trip.id}`"
    class="block rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
  >
    <div class="flex items-start justify-between gap-2 mb-2">
      <h3 class="font-semibold text-sm sm:text-base">{{ trip.title }}</h3>
      <TripStatusBadge :status="trip.status" />
    </div>
    <p class="text-xs text-slate-400 line-clamp-1 mb-2">{{ trip.description }}</p>
    <p class="text-xs text-slate-500 dark:text-slate-400">
      {{ jalaliDateToLabel(trip.startDateJalali) }} تا {{ jalaliDateToLabel(trip.endDateJalali) }} · {{ trip.durationDays }} روز
    </p>
  </RouterLink>
</template>
