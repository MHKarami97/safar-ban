<script setup>
import { ref, computed } from 'vue'
import { useRegionStore } from '../stores/regionStore'
import { jalaliDateToLabel } from '../utils/jalali'

var props = defineProps({ region: { type: Object, required: true } })
defineEmits(['finish-selection', 'unmark', 'edit-record'])

var store = useRegionStore()
var newCityName = ref('')
var addingLocationForCity = ref(null)
var newLocationName = ref('')
var newLocationDesc = ref('')

function addCity() {
  if (!newCityName.value.trim()) return
  store.addCity(props.region.id, newCityName.value.trim())
  newCityName.value = ''
}

function openLocationForm(cityId) {
  addingLocationForCity.value = addingLocationForCity.value === cityId ? null : cityId
  newLocationName.value = ''
  newLocationDesc.value = ''
}

function submitLocation(cityId) {
  if (!newLocationName.value.trim()) return
  store.addLocation(props.region.id, cityId, newLocationName.value, newLocationDesc.value)
  addingLocationForCity.value = null
}

function removeLocation(locationId) {
  store.removeLocation(props.region.id, locationId)
}

function cityNameOf(location) {
  return props.region.findCityOfLocation(location.id)?.name || ''
}

/**
 * Groups every visited location by its shared VisitRecord so locations
 * marked as "visited together" (e.g. سعدی و حافز در یک سفر) render as a
 * single box instead of one row per location.
 */
var visitGroups = computed(() => {
  return props.region.visitRecords
    .map((record) => ({
      record,
      locations: record.locationIds
        .map((id) => props.region.findLocation(id))
        .filter(Boolean)
        .map((location) => ({ location, cityName: cityNameOf(location) }))
    }))
    .filter((group) => group.locations.length)
    .sort((a, b) => b.record.createdAt - a.record.createdAt)
})
</script>

<template>
  <div class="space-y-5">
    <div v-for="city in region.cities" :key="city.id" class="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4">
      <div class="flex items-center justify-between mb-3">
        <h3 class="font-semibold text-sm sm:text-base">🏙️ {{ city.name }}</h3>
        <button type="button" class="text-xs text-brand-600 dark:text-brand-300" @click="openLocationForm(city.id)">+ افزودن لوکیشن</button>
      </div>

      <div v-if="addingLocationForCity === city.id" class="flex flex-col sm:flex-row gap-2 mb-3">
        <input v-model="newLocationName" type="text" placeholder="نام لوکیشن (متلا آرامگاه حافظ)" class="flex-1 min-h-[40px] rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-sm" />
        <input v-model="newLocationDesc" type="text" placeholder="توضیح کوتاه (اختیاری)" class="flex-1 min-h-[40px] rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-sm" />
        <button type="button" class="min-h-[40px] px-4 rounded-lg bg-brand-500 text-white text-sm" @click="submitLocation(city.id)">افزودن</button>
      </div>

      <div class="space-y-2">
        <div
          v-for="location in city.locations.filter((l) => !l.isVisited)"
          :key="location.id"
          class="group flex items-center gap-3 rounded-xl px-3 py-3 bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-700/60 transition-colors hover:border-brand-300 dark:hover:border-brand-500/50"
        >
          <button
            type="button"
            class="relative w-6 h-6 flex-shrink-0 rounded-md border-2 flex items-center justify-center transition-colors"
            :class="store.selectedLocationIds.includes(location.id) ? 'bg-brand-500 border-brand-500' : 'border-slate-300 dark:border-slate-600'"
            :aria-pressed="store.selectedLocationIds.includes(location.id)"
            @click="store.toggleLocationSelection(location.id)"
          >
            <svg v-if="store.selectedLocationIds.includes(location.id)" class="w-4 h-4 text-white animate-check-pop" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M16.7 5.3a1 1 0 010 1.4l-7.4 7.4a1 1 0 01-1.4 0L3.3 9.5a1 1 0 111.4-1.4l3.2 3.2 6.7-6.7a1 1 0 011.4 0z" clip-rule="evenodd" />
            </svg>
          </button>

          <div class="flex-1 min-w-0 cursor-pointer" @click="store.toggleLocationSelection(location.id)">
            <p class="text-sm sm:text-base text-slate-800 dark:text-slate-100">{{ location.name }}</p>
            <p v-if="location.description" class="text-xs text-slate-400 mt-0.5">{{ location.description }}</p>
          </div>

          <button
            type="button"
            class="opacity-0 group-hover:opacity-100 focus:opacity-100 min-w-[36px] min-h-[36px] flex items-center justify-center text-slate-400 hover:text-red-500 transition-opacity flex-shrink-0"
            aria-label="حذف لوکیشن"
            @click="removeLocation(location.id)"
          >
            🗑️
          </button>
        </div>
      </div>
      <p v-if="!city.locations.some((l) => !l.isVisited)" class="text-xs text-slate-400 py-1">همه لوکیشن‌های این شهر رفته شده‌اند</p>
    </div>

    <div class="flex items-center gap-2">
      <input v-model="newCityName" type="text" placeholder="افزودن شهر جدید..." class="flex-1 min-h-[44px] rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 text-sm" @keyup.enter="addCity" />
      <button type="button" class="min-h-[44px] px-4 rounded-xl bg-slate-200 dark:bg-slate-700 text-sm" @click="addCity">افزودن شهر</button>
    </div>

    <button
      v-if="store.selectedLocationIds.length"
      type="button"
      class="w-full min-h-[48px] rounded-xl bg-brand-500 text-white font-semibold"
      @click="$emit('finish-selection')"
    >
      ✅ اتمام و ثبت جزئیات بازدید ({{ store.selectedLocationIds.length }} مورد انتخاب‌شده)
    </button>

    <div v-if="visitGroups.length" class="pt-4 border-t border-slate-200 dark:border-slate-700">
      <h3 class="font-semibold text-sm mb-3">📌 رفته‌شده‌ها</h3>
      <div class="space-y-3">
        <div v-for="group in visitGroups" :key="group.record.id" class="rounded-xl border border-slate-100 dark:border-slate-700/60 bg-slate-50 dark:bg-slate-800/60 p-3">
          <div class="flex items-start justify-between gap-2 mb-2">
            <ul class="space-y-1 flex-1">
              <li v-for="entry in group.locations" :key="entry.location.id" class="flex items-center justify-between gap-2">
                <span class="text-sm font-medium">✅ {{ entry.cityName }} — {{ entry.location.name }}</span>
                <button type="button" class="text-[11px] text-red-500 flex-shrink-0" @click="$emit('unmark', entry.location.id)">بازگرداندن</button>
              </li>
            </ul>
            <button type="button" class="text-xs text-brand-600 flex-shrink-0" @click="$emit('edit-record', { location: group.locations[0].location, record: group.record })">ویرایش</button>
          </div>
          <p class="text-xs text-slate-400">
            {{ jalaliDateToLabel(group.record.dateJalali) }} · {{ group.record.totalCost.toLocaleString('fa-IR') }} تومان · {{ group.record.days }} روز · {{ group.record.km }} یلومتر
          </p>
          <p v-if="group.record.description" class="text-xs text-slate-500 mt-1">{{ group.record.description }}</p>
        </div>
      </div>
    </div>
  </div>
</template>
