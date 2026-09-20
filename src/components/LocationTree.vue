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

/**
 * Groups visited locations by their shared VisitRecord so a multi-location
 * trip (e.g. سعدی و حافظ با هم) renders as a single card, not one row per location.
 */
var visitGroups = computed(() => {
  var groups = new Map()
  props.region.cities.forEach((city) => {
    city.locations.filter((loc) => loc.isVisited).forEach((location) => {
      var record = location.visitRecordId ? props.region.getVisitRecord(location.visitRecordId) : null
      var key = record?.id || location.id
      if (!groups.has(key)) groups.set(key, { record, entries: [] })
      groups.get(key).entries.push({ city, location })
    })
  })
  return Array.from(groups.values()).sort((a, b) => (b.record?.createdAt || 0) - (a.record?.createdAt || 0))
})
</script>

<template>
  <div class="space-y-5">
    <div v-for="city in region.cities" :key="city.id" class="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4">
      <div class="flex items-center justify-between mb-3">
        <h3 class="font-semibold text-sm sm:text-base">🏙️ {{ city.name }}</h3>
        <button
          type="button"
          class="inline-flex items-center gap-1.5 min-h-[40px] px-3.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs sm:text-sm font-semibold shadow-sm transition-colors"
          @click="openLocationForm(city.id)"
        >
          <span class="text-base leading-none">+</span>
          <span>افزودن لوکیشن</span>
        </button>
      </div>

      <div v-if="addingLocationForCity === city.id" class="flex flex-col sm:flex-row gap-2 mb-3">
        <input v-model="newLocationName" type="text" placeholder="نام لوکیشن (مثلا آرامگاه حافظ)" class="flex-1 min-h-[40px] rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-sm" />
        <input v-model="newLocationDesc" type="text" placeholder="توضیح کوتاه (اختیاری)" class="flex-1 min-h-[40px] rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-sm" />
        <button type="button" class="min-h-[40px] px-4 rounded-lg bg-brand-500 text-white text-sm font-medium" @click="submitLocation(city.id)">افزودن</button>
      </div>

      <ul class="space-y-2">
        <li
          v-for="location in city.locations.filter((l) => !l.isVisited)"
          :key="location.id"
          class="flex items-center gap-3 px-2.5 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50"
        >
          <button
            type="button"
            class="w-6 h-6 flex-shrink-0 rounded-md border-2 flex items-center justify-center transition-colors"
            :class="store.selectedLocationIds.includes(location.id) ? 'bg-brand-500 border-brand-500' : 'border-slate-300 dark:border-slate-600'"
            @click="store.toggleLocationSelection(location.id)"
          >
            <svg v-if="store.selectedLocationIds.includes(location.id)" class="w-4 h-4 text-white" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M16.7 5.3a1 1 0 010 1.4l-7.4 7.4a1 1 0 01-1.4 0L3.3 9.5a1 1 0 111.4-1.4l3.2 3.2 6.7-6.7a1 1 0 011.4 0z" clip-rule="evenodd" />
            </svg>
          </button>
          <span class="text-sm flex-1">{{ location.name }}</span>
          <span v-if="location.description" class="text-xs text-slate-400">{{ location.description }}</span>
        </li>
      </ul>
      <p v-if="!city.locations.some((l) => !l.isVisited)" class="text-xs text-slate-400 py-1">همه لوکیشن‌های این شهر رفته شده‌اند</p>
    </div>

    <div class="flex items-center gap-2">
      <input v-model="newCityName" type="text" placeholder="افزودن شهر جدید..." class="flex-1 min-h-[44px] rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 text-sm" @keyup.enter="addCity" />
      <button type="button" class="min-h-[44px] px-4 rounded-xl bg-slate-200 dark:bg-slate-700 text-sm font-medium" @click="addCity">افزودن شهر</button>
    </div>

    <button
      v-if="store.selectedLocationIds.length"
      type="button"
      class="w-full min-h-[48px] rounded-xl bg-brand-500 text-white font-semibold shadow-sm"
      @click="$emit('finish-selection')"
    >
      ✅ اتمام و ثبت جزئیات بازدید ({{ store.selectedLocationIds.length }} مورد انتخاب‌شده)
    </button>

    <div v-if="region.visitedCount" class="pt-4 border-t border-slate-200 dark:border-slate-700">
      <h3 class="font-semibold text-sm mb-3">📌 رفته‌شده‌ها</h3>
      <div class="space-y-4">
        <div
          v-for="group in visitGroups"
          :key="group.record?.id || group.entries[0].location.id"
          class="rounded-xl bg-slate-50 dark:bg-slate-800/60 p-4"
        >
          <p class="text-sm font-medium mb-1">
            {{ group.entries.map((e) => `${e.city.name} — ${e.location.name}`).join('، ') }}
          </p>
          <p v-if="group.record" class="text-xs text-slate-400">
            {{ jalaliDateToLabel(group.record.dateJalali) }} · {{ group.record.totalCost.toLocaleString('en-US') }} تومان · {{ group.record.km.toLocaleString('en-US') }} کیلومتر · {{ group.record.days }} روز
          </p>
          <p v-if="group.record?.description" class="text-xs text-slate-500 mt-1">{{ group.record.description }}</p>

          <div class="flex items-center gap-3 mt-2">
            <button
              type="button"
              class="text-xs text-brand-600 dark:text-brand-300 font-medium"
              @click="$emit('edit-record', { location: group.entries[0].location, record: group.record })"
            >
              ویرایش
            </button>
            <button
              v-for="e in group.entries"
              :key="'unmark-' + e.location.id"
              type="button"
              class="text-xs text-red-500 font-medium"
              @click="$emit('unmark', e.location.id)"
            >
              برگرداندن «{{ e.location.name }}»
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
