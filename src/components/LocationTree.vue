<script setup>
import { ref } from 'vue'
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

function recordFor(location) {
  return location.visitRecordId ? props.region.getVisitRecord(location.visitRecordId) : null
}
</script>

<template>
  <div class="space-y-5">
    <div v-for="city in region.cities" :key="city.id" class="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4">
      <div class="flex items-center justify-between mb-3">
        <h3 class="font-semibold text-sm sm:text-base">🏙️ {{ city.name }}</h3>
        <button type="button" class="text-xs text-brand-600 dark:text-brand-300" @click="openLocationForm(city.id)">+ افزودن لوکیشن</button>
      </div>

      <div v-if="addingLocationForCity === city.id" class="flex flex-col sm:flex-row gap-2 mb-3">
        <input v-model="newLocationName" type="text" placeholder="نام لوکیشن (مثلا آرامگاه حافظ)" class="flex-1 min-h-[40px] rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-sm" />
        <input v-model="newLocationDesc" type="text" placeholder="توضیح کوتاه (اختیاری)" class="flex-1 min-h-[40px] rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-sm" />
        <button type="button" class="min-h-[40px] px-4 rounded-lg bg-brand-500 text-white text-sm" @click="submitLocation(city.id)">افزودن</button>
      </div>

      <ul class="space-y-1.5">
        <li v-for="location in city.locations.filter((l) => !l.isVisited)" :key="location.id" class="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50">
          <input type="checkbox" :checked="store.selectedLocationIds.includes(location.id)" @change="store.toggleLocationSelection(location.id)" />
          <span class="text-sm flex-1">{{ location.name }}</span>
          <span v-if="location.description" class="text-xs text-slate-400">{{ location.description }}</span>
        </li>
      </ul>
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

    <div v-if="region.visitedCount" class="pt-4 border-t border-slate-200 dark:border-slate-700">
      <h3 class="font-semibold text-sm mb-3">📌 رفته‌شده‌ها</h3>
      <div class="space-y-2">
        <div v-for="city in region.cities" :key="'v-' + city.id">
          <div
            v-for="location in city.locations.filter((l) => l.isVisited)"
            :key="location.id"
            class="flex items-start justify-between gap-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 p-3"
          >
            <div class="flex-1">
              <p class="text-sm font-medium">{{ city.name }} — {{ location.name }}</p>
              <p v-if="recordFor(location)" class="text-xs text-slate-400 mt-0.5">
                {{ jalaliDateToLabel(recordFor(location).dateJalali) }} · {{ recordFor(location).totalCost.toLocaleString('fa-IR') }} تومان · {{ recordFor(location).km }} کیلومتر
              </p>
              <p v-if="recordFor(location)?.description" class="text-xs text-slate-500 mt-0.5">{{ recordFor(location).description }}</p>
            </div>
            <div class="flex items-center gap-2 flex-shrink-0">
              <button type="button" class="text-xs text-brand-600" @click="$emit('edit-record', { location, record: recordFor(location) })">ویرایش</button>
              <button type="button" class="text-xs text-red-500" @click="$emit('unmark', location.id)">برگرداندن</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
