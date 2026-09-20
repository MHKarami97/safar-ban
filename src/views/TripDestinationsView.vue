<script setup>
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useTripStore } from '../stores/tripStore'
import DestinationCard from '../components/DestinationCard.vue'
import TimePicker from '../components/TimePicker.vue'

var props = defineProps({ id: { type: String, required: true } })
var router = useRouter()
var tripStore = useTripStore()

var trip = computed(() => tripStore.trips.find((t) => t.id === props.id))
var currentDay = ref(1)

var newDestination = ref({ name: '', startTime: '09:00', durationHours: 1 })
var overlapWarning = ref('')

var accForm = ref({ name: '', address: '', phone: '' })

watch(currentDay, () => {
  var existing = trip.value?.accommodationForDay(currentDay.value)
  accForm.value = existing ? { name: existing.name, address: existing.address, phone: existing.phone } : { name: '', address: '', phone: '' }
  overlapWarning.value = ''
}, { immediate: true })

function toMinutes(time) {
  var [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

/** Rough heuristic: 12:00–14:00 typically overlaps midday prayer + lunch hours. */
var restTimeWarning = computed(() => {
  var start = toMinutes(newDestination.value.startTime)
  var end = start + Math.round(Number(newDestination.value.durationHours || 0) * 60)
  var restStart = 12 * 60
  var restEnd = 14 * 60
  return start < restEnd && end > restStart
})

function addDestination() {
  if (!newDestination.value.name.trim()) return
  var { overlaps } = tripStore.addDestination(props.id, { day: currentDay.value, ...newDestination.value })
  overlapWarning.value = overlaps
    ? 'این بازه با مقصد قبلی همان روز تداخل زمانی دارد. بهتر است زمان قبلی را شناور در نظر بگیرید تا اگر طول کشید، برنامه به مشکل نخورد.'
    : ''
  newDestination.value = { name: '', startTime: newDestination.value.startTime, durationHours: 1 }
}

function removeDestination(destinationId) {
  tripStore.removeDestination(props.id, destinationId)
}

var isAccommodationValid = computed(() => accForm.value.name.trim().length > 0)

function sanitizePhone(event) {
  accForm.value.phone = event.target.value.replace(/[^0-9]/g, '')
}

function saveAccommodation() {
  if (!isAccommodationValid.value) return
  tripStore.setAccommodation(props.id, { day: currentDay.value, ...accForm.value })
}

function finish() { router.push(`/trips/${props.id}`) }
</script>

<template>
  <section v-if="trip" class="max-w-3xl mx-auto space-y-6">
    <div>
      <h1 class="text-xl sm:text-2xl font-bold">چیدن مقاصد روزانه — {{ trip.title }}</h1>
      <p class="text-sm text-slate-400 mt-1">برای هر روز، مقصدها و اقامتگاه را مشخص کن</p>
    </div>

    <div class="flex items-center gap-2 overflow-x-auto no-scrollbar">
      <button
        v-for="day in trip.durationDays"
        :key="day"
        type="button"
        class="min-h-[40px] px-4 rounded-full text-sm whitespace-nowrap font-medium transition-colors"
        :class="currentDay === day ? 'bg-brand-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'"
        @click="currentDay = day"
      >
        روز {{ day }}
      </button>
    </div>

    <div class="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5 space-y-3">
      <h2 class="text-sm font-semibold">مقصدهای روز {{ currentDay }}</h2>

      <DestinationCard
        v-for="destination in trip.destinationsForDay(currentDay)"
        :key="destination.id"
        :destination="destination"
        @remove="removeDestination"
      />
      <p v-if="!trip.destinationsForDay(currentDay).length" class="text-xs text-slate-400">هنوز مقصدی برای این روز اضافه نشده</p>

      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
        <div class="sm:col-span-1">
          <label class="text-xs text-slate-500 block mb-1">نام مقصد</label>
          <input v-model="newDestination.name" type="text" placeholder="مثلا آرامگاه حافظ" class="w-full min-h-[44px] rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-sm" />
        </div>
        <div>
          <label class="text-xs text-slate-500 block mb-1">ساعت شروع</label>
          <TimePicker v-model="newDestination.startTime" />
        </div>
        <div>
          <label class="text-xs text-slate-500 block mb-1">مدت زمان (ساعت)</label>
          <input v-model.number="newDestination.durationHours" type="number" min="0.5" step="0.5" placeholder="مثلا 1" class="w-full min-h-[44px] rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-sm" />
        </div>
      </div>

      <div v-if="restTimeWarning" class="text-xs bg-amber-50 dark:bg-amber-700/20 text-amber-700 dark:text-amber-200 rounded-xl px-3 py-2">
        ⚠️ این بازه بین ساعت ۱۲ تا ۱۴ است؛ معمولاً زمان نماز و ناهار است — ممکن است لوکیشن بسته باشد یا خودتان خسته شوید.
      </div>
      <div v-if="overlapWarning" class="text-xs bg-red-50 dark:bg-red-700/20 text-red-600 dark:text-red-200 rounded-xl px-3 py-2">
        ⚠️ {{ overlapWarning }}
      </div>

      <button type="button" class="w-full min-h-[44px] rounded-xl bg-brand-500 text-white text-sm font-medium" @click="addDestination">
        + افزودن مقصد به روز {{ currentDay }}
      </button>
    </div>

    <div class="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5 space-y-3">
      <h2 class="text-sm font-semibold">اقامتگاه روز {{ currentDay }}</h2>
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label class="text-xs text-slate-500 block mb-1">نام اقامتگاه</label>
          <input v-model="accForm.name" type="text" placeholder="مثلا هتل قارس" class="w-full min-h-[44px] rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-sm" />
        </div>
        <div>
          <label class="text-xs text-slate-500 block mb-1">آدرس</label>
          <input v-model="accForm.address" type="text" placeholder="آدرس اقامتگاه" class="w-full min-h-[44px] rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-sm" />
        </div>
        <div>
          <label class="text-xs text-slate-500 block mb-1">شماره تماس</label>
          <input :value="accForm.phone" type="tel" inputmode="numeric" placeholder="09xxxxxxxxx" class="w-full min-h-[44px] rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-sm ltr text-left" @input="sanitizePhone" />
        </div>
      </div>
      <p v-if="!isAccommodationValid" class="text-xs text-slate-400">برای فعال شدن دکمه ذخیره، حداقل نام اقامتگاه را وارد کن.</p>
      <button
        type="button"
        class="w-full min-h-[44px] rounded-xl text-sm font-medium transition-colors"
        :class="isAccommodationValid ? 'bg-brand-500 text-white hover:bg-brand-600' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'"
        :disabled="!isAccommodationValid"
        @click="saveAccommodation"
      >
        ذخیره اقامتگاه روز {{ currentDay }}
      </button>
    </div>

    <button type="button" class="w-full min-h-[48px] rounded-xl bg-slate-800 dark:bg-slate-100 text-white dark:text-slate-900 font-semibold" @click="finish">
      پایان و مشاهده برنامه سفر
    </button>
  </section>
</template>

<style scoped>
.ltr { direction: ltr; }
</style>
