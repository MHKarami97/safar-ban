<script setup>
import { useRegionStore } from '../stores/regionStore'
import RegionCard from '../components/RegionCard.vue'

var store = useRegionStore()
</script>

<template>
  <section class="space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div>
        <h1 class="text-xl sm:text-2xl font-bold">لوکیشن‌های سفر</h1>
        <p class="text-sm text-slate-400 mt-1">{{ store.enabledProvinces.length }} استان فعال</p>
      </div>
      <RouterLink to="/regions/manage" class="min-h-[44px] px-4 rounded-xl border border-slate-300 dark:border-slate-600 text-sm flex items-center justify-center">
        مدیریت استان‌ها و کشورها
      </RouterLink>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <RegionCard v-for="region in store.enabledProvinces" :key="region.id" :region="region" />
      <RegionCard v-for="region in store.countries.filter((r) => r.isEnabled)" :key="region.id" :region="region" />
    </div>
  </section>
</template>
