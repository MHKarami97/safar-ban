<script setup>
import { useTripStore } from '../stores/tripStore'
import TripCard from '../components/TripCard.vue'

var store = useTripStore()

var statusOptions = [
  { key: 'all', label: 'همه' },
  { key: 'planning', label: 'در حال برنامه‌ریزی' },
  { key: 'upcoming', label: 'پیش رو' },
  { key: 'ongoing', label: 'در حال انجام' }
]
</script>

<template>
  <section class="space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div>
        <h1 class="text-xl sm:text-2xl font-bold">سفرهای من</h1>
        <p class="text-sm text-slate-400 mt-1">{{ store.ongoingTrips.length }} سفر فعال</p>
      </div>
      <div class="flex items-center gap-2">
        <RouterLink to="/trips/guide" class="min-h-[44px] px-4 rounded-xl border border-slate-300 dark:border-slate-600 text-sm flex items-center justify-center">راهنما</RouterLink>
        <RouterLink to="/trips/create" class="min-h-[44px] px-4 rounded-xl bg-brand-500 text-white text-sm font-medium flex items-center justify-center">+ سفر جدید</RouterLink>
      </div>
    </div>

    <div class="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
      <input
        :value="store.searchQuery"
        type="search"
        placeholder="جستجوی سفر..."
        class="min-h-[44px] rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 text-sm w-full sm:w-64"
        @input="store.setSearchQuery($event.target.value)"
      />
      <div class="flex items-center gap-2 overflow-x-auto no-scrollbar">
        <button
          v-for="option in statusOptions"
          :key="option.key"
          type="button"
          class="min-h-[36px] px-3 rounded-full text-xs whitespace-nowrap"
          :class="store.filterStatus === option.key ? 'bg-brand-500 text-white' : 'bg-slate-100 dark:bg-slate-800'"
          @click="store.setFilterStatus(option.key)"
        >
          {{ option.label }}
        </button>
      </div>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <TripCard v-for="trip in store.ongoingTrips" :key="trip.id" :trip="trip" />
    </div>
    <p v-if="!store.ongoingTrips.length" class="text-sm text-slate-400 text-center py-8">سفری برای نمایش نیست</p>

    <div v-if="store.completedTrips.length" class="pt-6 border-t border-slate-200 dark:border-slate-700">
      <h2 class="text-sm font-semibold mb-3">سفرهای پایان‌یافته</h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <TripCard v-for="trip in store.completedTrips" :key="trip.id" :trip="trip" />
      </div>
    </div>
  </section>
</template>
