<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useTripStore } from '../stores/tripStore'
import { useCatalogStore } from '../stores/catalogStore'
import { useConfirm } from '../composables/useConfirm'
import { TRIP_STATUSES } from '../models/trip/TripPlan'
import { jalaliDateToLabel } from '../utils/jalali'
import TripStatusBadge from '../components/TripStatusBadge.vue'
import TripEventForm from '../components/TripEventForm.vue'
import ConfirmDialog from '../components/ConfirmDialog.vue'
import TagMultiSelect from '../components/TagMultiSelect.vue'

var props = defineProps({ id: { type: String, required: true } })
var router = useRouter()
var tripStore = useTripStore()
var catalog = useCatalogStore()
var { isPending, pendingLabel, requestConfirm, confirmAction, cancelAction } = useConfirm()

var trip = computed(() => tripStore.trips.find((t) => t.id === props.id))
var isEventFormOpen = ref(false)
var editingEventId = ref(null)

var statusEntries = computed(() => Object.entries(TRIP_STATUSES))

function destinationName(id) {
  return trip.value?.destinations.find((d) => d.id === id)?.name || id
}

function openNewEvent() {
  editingEventId.value = null
  isEventFormOpen.value = true
}

function openEditEvent(event) {
  editingEventId.value = event.id
  isEventFormOpen.value = true
}

function saveEvent(data) {
  if (editingEventId.value) {
    tripStore.updateEvent(props.id, editingEventId.value, data)
  } else {
    tripStore.addEvent(props.id, data)
  }
  isEventFormOpen.value = false
}

function removeEvent(eventId) {
  requestConfirm('این رویداد حذف شود؟', () => tripStore.removeEvent(props.id, eventId))
}

function deleteTrip() {
  requestConfirm('این برنامه سفر به‌طور کامل حذف شود؟', () => {
    tripStore.deleteTrip(props.id)
    router.push('/trips')
  })
}
</script>

<template>
  <section v-if="trip" class="space-y-6">
    <div class="flex items-start justify-between gap-3">
      <div>
        <h1 class="text-xl sm:text-2xl font-bold">{{ trip.title }}</h1>
        <p class="text-sm text-slate-400 mt-1">{{ trip.description }}</p>
      </div>
      <TripStatusBadge :status="trip.status" />
    </div>

    <div class="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
      <div>📅 تاریخ شروع: {{ jalaliDateToLabel(trip.startDateJalali) }}</div>
      <div>📅 تاریخ پایان: {{ jalaliDateToLabel(trip.endDateJalali) }}</div>
      <div>🗓️ تعداد روز: {{ trip.durationDays }}</div>
      <div>💰 هزینه در نظر گرفته‌شده: {{ Number(trip.budget).toLocaleString('fa-IR') }} تومان</div>
      <div class="sm:col-span-2">
        <label class="text-xs text-slate-400 block mb-1">وضعیت سفر</label>
        <select :value="trip.status" class="min-h-[40px] rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-sm" @change="tripStore.setStatus(trip.id, $event.target.value)">
          <option v-for="[key, label] in statusEntries" :key="key" :value="key">{{ label }}</option>
        </select>
      </div>
    </div>

    <div v-if="trip.weatherSnapshot" class="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4">
      <h2 class="text-sm font-semibold mb-3">🌤️ پیش‌بینی آب‌وهوا — {{ trip.weatherSnapshot.resolvedName || trip.weatherCity }}</h2>
      <div class="flex gap-2 overflow-x-auto no-scrollbar">
        <div v-for="day in trip.weatherSnapshot.daily" :key="day.date" class="flex-shrink-0 rounded-xl bg-brand-50 dark:bg-brand-700/20 px-3 py-2 text-center text-xs">
          <div>{{ day.date.slice(5) }}</div>
          <div class="font-semibold">{{ Math.round(day.max) }}° / {{ Math.round(day.min) }}°</div>
          <div class="text-slate-400">{{ day.rainChance }}٪ باران</div>
        </div>
      </div>
    </div>
    <div v-else-if="trip.weatherCity" class="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 text-xs text-slate-400">
      🌤️ پیش‌بینی آب‌وهوا برای «{{ trip.weatherCity }}» ثبت نشده بود.
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div class="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4">
        <TagMultiSelect v-model="trip.vehicleIds" :items="catalog.vehicles" label="وسایل نقلیه" @add-custom="(name) => { var it = catalog.addCustom('vehicles', name); if (it) trip.vehicleIds.push(it.id); tripStore.persistAll() }" />
      </div>
      <div class="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4">
        <TagMultiSelect v-model="trip.companionIds" :items="catalog.companions" label="هم‌سفرها" @add-custom="(name) => { var it = catalog.addCustom('companions', name); if (it) trip.companionIds.push(it.id); tripStore.persistAll() }" />
      </div>
      <div class="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4">
        <TagMultiSelect v-model="trip.documentIds" :items="catalog.documents" label="مدارک مورد نیاز" @add-custom="(name) => { var it = catalog.addCustom('documents', name); if (it) trip.documentIds.push(it.id); tripStore.persistAll() }" />
      </div>
      <div class="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4">
        <TagMultiSelect v-model="trip.equipmentIds" :items="catalog.equipment" label="تجهیزات سفر" @add-custom="(name) => { var it = catalog.addCustom('equipment', name); if (it) trip.equipmentIds.push(it.id); tripStore.persistAll() }" />
      </div>
    </div>

    <div v-if="trip.culturalNotes.length" class="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4">
      <h2 class="text-sm font-semibold mb-2">نکات فرهنگی</h2>
      <ul class="list-disc pr-5 text-sm space-y-1">
        <li v-for="(note, i) in trip.culturalNotes" :key="i">{{ note }}</li>
      </ul>
    </div>

    <div class="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4">
      <div class="flex items-center justify-between mb-3">
        <h2 class="text-sm font-semibold">برنامه روزانه</h2>
        <RouterLink :to="`/trips/${trip.id}/destinations`" class="text-xs text-brand-600 underline">ویرایش مقاصد و اقامتگاه</RouterLink>
      </div>

      <div v-for="day in trip.durationDays" :key="day" class="mb-4 last:mb-0">
        <p class="text-xs font-bold text-brand-600 dark:text-brand-300 mb-2">روز {{ day }}</p>

        <div v-if="trip.destinationsForDay(day).length" class="space-y-2">
          <div
            v-for="d in trip.destinationsForDay(day)"
            :key="d.id"
            class="flex items-start gap-3 rounded-xl bg-slate-50 dark:bg-slate-900/40 p-3"
          >
            <div class="flex-shrink-0 text-center min-w-[64px] rounded-lg bg-white dark:bg-slate-800 px-2 py-1 text-xs font-mono">
              <div>{{ d.startTime }}</div>
              <div class="text-slate-400">تا {{ d.endTime }}</div>
            </div>
            <div class="flex-1">
              <p class="text-sm font-medium">📍 {{ d.name }}</p>
              <p v-if="d.note" class="text-xs text-slate-400 mt-0.5">{{ d.note }}</p>
            </div>
          </div>
        </div>
        <p v-else class="text-xs text-slate-400">مقصدی برای این روز ثبت نشده</p>

        <div v-if="trip.accommodationForDay(day)" class="mt-2 flex items-start gap-3 rounded-xl bg-brand-50 dark:bg-brand-700/10 p-3">
          <span class="text-lg flex-shrink-0">🏨</span>
          <div>
            <p class="text-sm font-medium">اقامتگاه: {{ trip.accommodationForDay(day).name }}</p>
            <p class="text-xs text-slate-500 dark:text-slate-400">{{ trip.accommodationForDay(day).address }} — {{ trip.accommodationForDay(day).phone }}</p>
          </div>
        </div>
      </div>
    </div>

    <div class="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4">
      <div class="flex items-center justify-between mb-3">
        <h2 class="text-sm font-semibold">گزارش رویدادها</h2>
        <button type="button" class="text-xs px-3 py-1.5 rounded-full bg-brand-500 text-white" @click="openNewEvent">+ ثبت رویداد</button>
      </div>
      <div v-for="event in trip.events" :key="event.id" class="border border-slate-100 dark:border-slate-700/60 rounded-xl p-3 mb-2 space-y-1.5">
        <div class="flex items-start justify-between gap-2">
          <p class="text-sm font-medium">📅 {{ jalaliDateToLabel(event.dateJalali) }}</p>
          <div class="flex items-center gap-2 flex-shrink-0">
            <button type="button" class="text-xs text-brand-600" @click="openEditEvent(event)">ویرایش</button>
            <button type="button" class="text-xs text-red-500" @click="removeEvent(event.id)">حذف</button>
          </div>
        </div>
        <p class="text-xs text-slate-500">💰 هزینه: {{ event.cost.toLocaleString('fa-IR') }} تومان &nbsp;·&nbsp; 🚗 وسیله: {{ event.vehicleUsed || '—' }}</p>
        <p v-if="event.visitedDestinationIds.length" class="text-xs text-brand-600">✅ رفتیم به: {{ event.visitedDestinationIds.map(destinationName).join('، ') }}</p>
        <p v-if="event.missedDestinationIds.length" class="text-xs text-red-500">❌ نرسیدیم به: {{ event.missedDestinationIds.map(destinationName).join('، ') }}</p>
        <p v-if="event.locationNotes" class="text-xs text-slate-600 dark:text-slate-300">📍 وضعیت لوکیشن‌ها: {{ event.locationNotes }}</p>
        <p v-if="event.accommodationNotes" class="text-xs text-slate-600 dark:text-slate-300">🏨 وضعیت اقامتگاه: {{ event.accommodationNotes }}</p>
        <p v-if="event.description" class="text-xs text-slate-500">📝 توضیحات: {{ event.description }}</p>
      </div>
      <p v-if="!trip.events.length" class="text-xs text-slate-400">رویدادی ثبت نشده</p>
    </div>

    <div class="flex gap-2">
      <button type="button" class="flex-1 min-h-[44px] rounded-xl bg-slate-800 text-white text-sm font-medium dark:bg-slate-100 dark:text-slate-900" @click="tripStore.printTrip(trip.id)">
        🖨️ خروجی / پرینت سفر
      </button>
      <button type="button" class="min-h-[44px] px-4 rounded-xl border border-red-300 text-red-500 text-sm" @click="deleteTrip">حذف سفر</button>
    </div>

    <TripEventForm
      :is-open="isEventFormOpen"
      :destinations="trip.destinations"
      :vehicles="catalog.vehicles"
      :initial="editingEventId ? trip.events.find((e) => e.id === editingEventId) : null"
      @save="saveEvent"
      @cancel="isEventFormOpen = false"
    />
  </section>

  <ConfirmDialog :is-open="isPending" :label="pendingLabel" @confirm="confirmAction" @cancel="cancelAction" />
</template>
