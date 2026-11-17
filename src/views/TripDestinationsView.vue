<script setup>
import { computed, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useTripStore } from '../stores/tripStore'
import DestinationCard from '../components/DestinationCard.vue'
import AppIcon from '../components/AppIcon.vue'

var props = defineProps({ id: { type: String, required: true } })
var router = useRouter()
var tripStore = useTripStore()

var trip = computed(() => tripStore.trips.find((t) => t.id === props.id))
var activeDay = ref(1)

var destinationForm = reactive({ name: '', startTime: '09:00', durationHours: 1, note: '' })
var overlapWarning = ref(false)

var accommodationForm = reactive({ name: '', address: '', phone: '' })
var isEditingAccommodation = ref(false)
var justSavedAccommodation = ref(false)

/** Gentle reminder shown when a day already has destinations but no accommodation set yet. */
var showNoAccommodationWarning = computed(() => {
  return trip.value?.destinationsForDay(activeDay.value).length > 0 && !trip.value?.accommodationForDay(activeDay.value)
})

function switchDay(day) {
  activeDay.value = day
  overlapWarning.value = false
  syncAccommodationFormWithDay()
}

function syncAccommodationFormWithDay() {
  var existing = trip.value?.accommodationForDay(activeDay.value)
  accommodationForm.name = existing?.name || ''
  accommodationForm.address = existing?.address || ''
  accommodationForm.phone = existing?.phone || ''
  isEditingAccommodation.value = !existing
  justSavedAccommodation.value = false
}
syncAccommodationFormWithDay()

function addDestination() {
  if (!destinationForm.name.trim()) return
  var { overlaps } = tripStore.addDestination(props.id, {
    day: activeDay.value,
    name: destinationForm.name.trim(),
    startTime: destinationForm.startTime,
    durationHours: destinationForm.durationHours,
    note: destinationForm.note.trim()
  })
  overlapWarning.value = overlaps
  destinationForm.name = ''
  destinationForm.note = ''
}

function removeDestination(destinationId) {
  tripStore.removeDestination(props.id, destinationId)
}

/** Explicit save action — accommodation is never persisted automatically while typing. */
function saveAccommodation() {
  if (!accommodationForm.name.trim()) return
  tripStore.setAccommodation(props.id, {
    day: activeDay.value,
    name: accommodationForm.name.trim(),
    address: accommodationForm.address.trim(),
    phone: accommodationForm.phone.trim()
  })
  isEditingAccommodation.value = false
  justSavedAccommodation.value = true
  setTimeout(() => (justSavedAccommodation.value = false), 2000)
}

function editAccommodation() {
  isEditingAccommodation.value = true
}

function finish() {
  router.push(`/trips/${props.id}`)
}
</script>

<template>
  <section v-if="trip" class="space-y-6 max-w-3xl">
    <div>
      <h1 class="text-xl sm:text-2xl font-bold">مقاصد و اقامتگاه روزانه</h1>
      <p class="text-sm text-slate-400 mt-1">{{ trip.title }}</p>
    </div>

    <div class="flex items-center gap-2 overflow-x-auto no-scrollbar">
      <button
        v-for="day in trip.durationDays"
        :key="day"
        type="button"
        class="min-h-[40px] px-4 rounded-full text-sm whitespace-nowrap flex-shrink-0 font-medium transition-colors"
        :class="activeDay === day ? 'bg-brand-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'"
        @click="switchDay(day)"
      >
        روز {{ day }}
      </button>
    </div>

    <div class="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 space-y-3">
      <h2 class="text-sm font-semibold flex items-center gap-1.5">
        <AppIcon name="pin" :size="16" class="text-brand-500" />
        <span>مقصدهای روز {{ activeDay }}</span>
      </h2>

      <div v-if="overlapWarning" class="flex items-start gap-2 text-xs bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-200 rounded-xl p-3">
        <AppIcon name="warning" :size="16" class="shrink-0 mt-0.5" />
        <span>زمان این مقصد با مقصد دیگری در همین روز همپوشانی دارد. بهتر است کمی زمان شناور بین مقصدها در نظر بگیری تا اگر طول کشید، برنامه‌ات به‌هم نریزد.</span>
      </div>

      <DestinationCard v-for="d in trip.destinationsForDay(activeDay)" :key="d.id" :destination="d" @remove="removeDestination" />
      <p v-if="!trip.destinationsForDay(activeDay).length" class="text-xs text-slate-400">هنوز مقصدی برای این روز ثبت نشده</p>

      <div class="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2">
        <div class="sm:col-span-2">
          <label class="text-xs text-slate-400 block mb-1">نام مقصد</label>
          <input v-model="destinationForm.name" type="text" placeholder="متلا آرامگاه حافظ" class="w-full min-h-[40px] rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-sm" />
        </div>
        <div>
          <label class="text-xs text-slate-400 block mb-1">ساعت شروع</label>
          <input v-model="destinationForm.startTime" type="time" class="w-full min-h-[40px] rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-sm" />
        </div>
        <div>
          <label class="text-xs text-slate-400 block mb-1">مدت زمان (ساعت)</label>
          <input v-model.number="destinationForm.durationHours" type="number" min="0.5" step="0.5" class="w-full min-h-[40px] rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-sm" />
        </div>
      </div>
      <div>
        <label class="text-xs text-slate-400 block mb-1">توضیح کوتاه (اختیاری)</label>
        <input v-model="destinationForm.note" type="text" placeholder="متلا بلیط از قبل بگیر" class="w-full min-h-[40px] rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-sm" />
      </div>
      <button type="button" class="w-full min-h-[40px] rounded-lg bg-brand-500 text-white text-sm font-medium flex items-center justify-center gap-1.5 hover:bg-brand-600 transition-colors" @click="addDestination">
        <AppIcon name="plus" :size="16" />
        <span>افزودن مقصد</span>
      </button>
    </div>

    <div class="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 space-y-3">
      <div class="flex items-center justify-between">
        <h2 class="text-sm font-semibold flex items-center gap-1.5">
          <AppIcon name="hotel" :size="16" class="text-brand-500" />
          <span>اقامتگاه روز {{ activeDay }}</span>
        </h2>
        <span v-if="justSavedAccommodation" class="inline-flex items-center gap-1 text-xs text-brand-600 font-medium">
          <AppIcon name="check" :size="14" />
          <span>ذخیره شد</span>
        </span>
      </div>

      <div v-if="showNoAccommodationWarning && !isEditingAccommodation" class="flex items-start gap-2 text-xs bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-200 rounded-xl p-3">
        <AppIcon name="warning" :size="16" class="shrink-0 mt-0.5" />
        <span>برای این روز مقصد ثبت کرده‌ای ولی هنوز اقامتگاهی مشخص نکرده‌ای. فراموش نکن قبل از سفر آن را ثبت کنی.</span>
      </div>

      <template v-if="isEditingAccommodation">
        <div>
          <label class="text-xs text-slate-400 block mb-1">نام اقامتگاه</label>
          <input v-model="accommodationForm.name" type="text" placeholder="متلا هتل پارس" class="w-full min-h-[40px] rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-sm" />
        </div>
        <div>
          <label class="text-xs text-slate-400 block mb-1">آدرس</label>
          <input v-model="accommodationForm.address" type="text" placeholder="آدرس کامل" class="w-full min-h-[40px] rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-sm" />
        </div>
        <div>
          <label class="text-xs text-slate-400 block mb-1">شماره تماس</label>
          <input v-model="accommodationForm.phone" type="text" placeholder="متلا ۰۹۱۲xxxxxxx" class="w-full min-h-[40px] rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-sm" />
        </div>
        <button type="button" class="w-full min-h-[40px] rounded-lg bg-brand-500 text-white text-sm font-medium" @click="saveAccommodation">ذخیره اقامتگاه</button>
      </template>
      <template v-else>
        <div class="rounded-xl bg-slate-50 dark:bg-slate-900/40 p-3 flex items-start justify-between gap-2">
          <div class="text-sm">
            <p class="font-medium">{{ accommodationForm.name }}</p>
            <p class="text-xs text-slate-400 mt-0.5">{{ accommodationForm.address }}</p>
            <p class="text-xs text-slate-400">{{ accommodationForm.phone }}</p>
          </div>
          <button type="button" class="text-xs px-3 py-1.5 rounded-full bg-brand-50 dark:bg-brand-700/30 text-brand-700 dark:text-brand-100 font-medium flex-shrink-0" @click="editAccommodation">ویرایش</button>
        </div>
      </template>
    </div>

    <button type="button" class="w-full min-h-[48px] rounded-xl bg-slate-800 dark:bg-slate-100 text-white dark:text-slate-900 font-semibold" @click="finish">
      پایان و بازگشت به جزئیات سفر
    </button>
  </section>
</template>
