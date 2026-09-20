<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useTripStore } from '../stores/tripStore'
import DestinationCard from '../components/DestinationCard.vue'

var props = defineProps({ id: { type: String, required: true } })
var router = useRouter()
var store = useTripStore()

var trip = computed(() => store.trips.find((t) => t.id === props.id))
var activeDay = ref(1)

var dayList = computed(() => {
  if (!trip.value) return []
  return Array.from({ length: trip.value.durationDays }, (_, i) => i + 1)
})

var destinationForm = ref({ name: '', startTime: '08:00', durationHours: 1, note: '' })
var overlapWarning = ref(false)

var accommodationForm = ref({ name: '', address: '', phone: '' })

var currentAccommodation = computed(() => trip.value?.accommodationForDay(activeDay.value) || null)

function selectDay(day) {
  activeDay.value = day
  overlapWarning.value = false
  var stay = trip.value?.accommodationForDay(day)
  accommodationForm.value = stay ? { name: stay.name, address: stay.address, phone: stay.phone } : { name: '', address: '', phone: '' }
}

function submitDestination() {
  if (!destinationForm.value.name.trim()) return
  var result = store.addDestination(props.id, { ...destinationForm.value, day: activeDay.value })
  overlapWarning.value = result.overlaps
  destinationForm.value = { name: '', startTime: '08:00', durationHours: 1, note: '' }
}

function removeDestination(destinationId) {
  store.removeDestination(props.id, destinationId)
}

function submitAccommodation() {
  if (!accommodationForm.value.name.trim()) return
  store.setAccommodation(props.id, { ...accommodationForm.value, day: activeDay.value })
}

function finish() {
  router.push(`/trips/${props.id}`)
}
</script>

<template>
  <section v-if="trip" class="space-y-6 max-w-3xl">
    <h1 class="text-xl sm:text-2xl font-bold">مقاصد روزانه و اقامتگاه — {{ trip.title }}</h1>

    <div class="flex items-center gap-2 overflow-x-auto no-scrollbar">
      <button
        v-for="day in dayList"
        :key="day"
        type="button"
        class="min-h-[40px] px-4 rounded-full text-sm whitespace-nowrap"
        :class="activeDay === day ? 'bg-brand-500 text-white' : 'bg-slate-100 dark:bg-slate-800'"
        @click="selectDay(day)"
      >
        روز {{ day }}
      </button>
    </div>

    <div class="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 space-y-3">
      <h2 class="text-sm font-semibold">مقاصد روز {{ activeDay }}</h2>

      <div class="space-y-2">
        <DestinationCard v-for="d in trip.destinationsForDay(activeDay)" :key="d.id" :destination="d" @remove="removeDestination" />
        <p v-if="!trip.destinationsForDay(activeDay).length" class="text-xs text-slate-400">مقصدی برای این روز ثبت نشده</p>
      </div>

      <div v-if="overlapWarning" class="text-xs bg-amber-50 dark:bg-amber-700/20 text-amber-700 dark:text-amber-200 rounded-xl p-3">
        ⚠️ زمان این مقصد با مقصد دیگری در همین روز تداخل دارد. برای ایمنی، بین برنامه‌ها زمان شناور بگذار تا اگر مقصد قبلی طول کشید، به مشکل نخوری.
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <input v-model="destinationForm.name" type="text" placeholder="نام مقصد (مثلا ارگ جهان شیراز)" class="min-h-[40px] rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-sm sm:col-span-1" />
        <input v-model="destinationForm.startTime" type="time" class="min-h-[40px] rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-sm" />
        <input v-model.number="destinationForm.durationHours" type="number" step="0.5" min="0.5" placeholder="مدت (ساعت)" class="min-h-[40px] rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-sm" />
      </div>
      <input v-model="destinationForm.note" type="text" placeholder="توضیح اختیاری" class="w-full min-h-[40px] rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-sm" />
      <button type="button" class="w-full min-h-[44px] rounded-xl bg-brand-500 text-white text-sm font-medium" @click="submitDestination">+ افزودن مقصد</button>
    </div>

    <div class="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 space-y-3">
      <h2 class="text-sm font-semibold">اقامتگاه روز {{ activeDay }}</h2>
      <input v-model="accommodationForm.name" type="text" placeholder="نام اقامتگاه" class="w-full min-h-[40px] rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-sm" />
      <input v-model="accommodationForm.address" type="text" placeholder="آدرس" class="w-full min-h-[40px] rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-sm" />
      <input v-model="accommodationForm.phone" type="text" placeholder="شماره تماس" class="w-full min-h-[40px] rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-sm" />
      <button type="button" class="w-full min-h-[44px] rounded-xl bg-slate-200 dark:bg-slate-700 text-sm font-medium" @click="submitAccommodation">ذخیره اقامتگاه</button>
    </div>

    <button type="button" class="w-full min-h-[48px] rounded-xl bg-brand-600 text-white font-semibold" @click="finish">پایان و مشاهده برنامه سفر</button>
  </section>
</template>
