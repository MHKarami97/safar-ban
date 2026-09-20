<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useTripStore } from '../stores/tripStore'
import { useCatalogStore } from '../stores/catalogStore'
import { WeatherService } from '../services/trip/WeatherService'
import JalaliDatePicker from '../components/JalaliDatePicker.vue'
import TagMultiSelect from '../components/TagMultiSelect.vue'
import { todayJalali, formatJalali, addDaysJalali, parseJalali } from '../utils/jalali'

var router = useRouter()
var tripStore = useTripStore()
var catalog = useCatalogStore()

var today = todayJalali()
var form = ref({
  title: '',
  description: '',
  startDateJalali: formatJalali(today.jy, today.jm, today.jd),
  durationDays: 3,
  budget: 0,
  weatherCity: '',
  weatherSnapshot: null,
  vehicleIds: [],
  companionIds: [],
  culturalNotes: [''],
  documentIds: [],
  equipmentIds: []
})

var isFetchingWeather = ref(false)

var computedEndDate = computed(() => {
  var start = parseJalali(form.value.startDateJalali)
  if (!start) return ''
  var end = addDaysJalali(start.jy, start.jm, start.jd, Math.max(form.value.durationDays - 1, 0))
  return formatJalali(end.jy, end.jm, end.jd)
})

async function fetchWeather() {
  if (!form.value.weatherCity.trim()) return
  isFetchingWeather.value = true
  form.value.weatherSnapshot = await WeatherService.fetchForecast(form.value.weatherCity.trim())
  isFetchingWeather.value = false
}

function addCulturalNote() {
  form.value.culturalNotes.push('')
}

function removeCulturalNote(index) {
  form.value.culturalNotes.splice(index, 1)
}

var CATALOG_FIELD_MAP = { vehicles: 'vehicleIds', companions: 'companionIds', documents: 'documentIds', equipment: 'equipmentIds' }

function addCustomCatalog(kind, name) {
  var item = catalog.addCustom(kind, name)
  if (item) form.value[CATALOG_FIELD_MAP[kind]].push(item.id)
}

function submit() {
  if (!form.value.title.trim()) return
  var trip = tripStore.createTrip({
    ...form.value,
    culturalNotes: form.value.culturalNotes.filter((note) => note.trim())
  })
  router.push(`/trips/${trip.id}/destinations`)
}
</script>

<template>
  <section class="space-y-6 max-w-3xl">
    <div class="flex items-center justify-between">
      <h1 class="text-xl sm:text-2xl font-bold">ساخت برنامه سفر جدید</h1>
      <RouterLink to="/trips/guide" class="text-xs text-brand-600 underline">اول راهنما را ببین</RouterLink>
    </div>

    <div class="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5 space-y-4">
      <div>
        <label class="text-sm block mb-1">عنوان سفر</label>
        <input v-model="form.title" type="text" placeholder="مثلا سفر تابستانی شمال" class="w-full min-h-[44px] rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-sm" />
      </div>

      <div>
        <label class="text-sm block mb-1">توضیحات</label>
        <textarea v-model="form.description" rows="2" class="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm"></textarea>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label class="text-sm block mb-1">تاریخ شروع</label>
          <JalaliDatePicker v-model="form.startDateJalali" />
        </div>
        <div>
          <label class="text-sm block mb-1">تعداد روز سفر</label>
          <input v-model.number="form.durationDays" type="number" min="1" class="w-full min-h-[44px] rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-sm" />
        </div>
        <div>
          <label class="text-sm block mb-1">تاریخ پایان (خودکار)</label>
          <input :value="computedEndDate" disabled type="text" class="w-full min-h-[44px] rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-900 px-3 text-sm text-slate-500" />
        </div>
      </div>

      <div>
        <label class="text-sm block mb-1">هزینه در نظر گرفته‌شده (تومان)</label>
        <input v-model.number="form.budget" type="number" min="0" class="w-full min-h-[44px] rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-sm" />
      </div>

      <div>
        <label class="text-sm block mb-1">پیش‌بینی آب‌وهوا (نام شهر مقصد)</label>
        <div class="flex gap-2">
          <input v-model="form.weatherCity" type="text" placeholder="مثلا رشت" class="flex-1 min-h-[44px] rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-sm" />
          <button type="button" class="min-h-[44px] px-4 rounded-xl bg-slate-200 dark:bg-slate-700 text-sm" :disabled="isFetchingWeather" @click="fetchWeather">
            {{ isFetchingWeather ? '...' : 'دریافت پیش‌بینی' }}
          </button>
        </div>
        <div v-if="form.weatherSnapshot" class="mt-3 flex gap-2 overflow-x-auto no-scrollbar">
          <div v-for="day in form.weatherSnapshot.daily" :key="day.date" class="flex-shrink-0 rounded-xl bg-brand-50 dark:bg-brand-700/20 px-3 py-2 text-center text-xs">
            <div>{{ day.date.slice(5) }}</div>
            <div class="font-semibold">{{ Math.round(day.max) }}° / {{ Math.round(day.min) }}°</div>
            <div class="text-slate-400">{{ day.rainChance }}٪ باران</div>
          </div>
        </div>
        <p v-else-if="form.weatherCity && !isFetchingWeather" class="text-xs text-slate-400 mt-2">برای دریافت پیش‌بینی روی دکمه بزن</p>
      </div>

      <TagMultiSelect v-model="form.vehicleIds" :items="catalog.vehicles" label="وسایل نقلیه" @add-custom="(name) => addCustomCatalog('vehicles', name)" />
      <TagMultiSelect v-model="form.companionIds" :items="catalog.companions" label="هم‌سفرها" @add-custom="(name) => addCustomCatalog('companions', name)" />

      <div>
        <label class="text-sm block mb-1">نکات فرهنگی و قوانین محلی</label>
        <div v-for="(note, index) in form.culturalNotes" :key="index" class="flex gap-2 mb-2">
          <input v-model="form.culturalNotes[index]" type="text" placeholder="مثلا رعایت پوشش در اماکن مذهبی" class="flex-1 min-h-[40px] rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-sm" />
          <button type="button" class="min-w-[40px] min-h-[40px] text-slate-400 hover:text-red-500" @click="removeCulturalNote(index)">🗑️</button>
        </div>
        <button type="button" class="text-xs text-brand-600" @click="addCulturalNote">+ افزودن نکته</button>
      </div>

      <TagMultiSelect v-model="form.documentIds" :items="catalog.documents" label="مدارک مورد نیاز" @add-custom="(name) => addCustomCatalog('documents', name)" />
      <TagMultiSelect v-model="form.equipmentIds" :items="catalog.equipment" label="تجهیزات سفر" @add-custom="(name) => addCustomCatalog('equipment', name)" />

      <button type="button" class="w-full min-h-[48px] rounded-xl bg-brand-500 text-white font-semibold" @click="submit">
        تایید و رفتن به چیدن مقاصد روزانه
      </button>
    </div>
  </section>
</template>
