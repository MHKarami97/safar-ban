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
var isStatusMenuOpen = ref(false)

var statusEntries = computed(() => Object.entries(TRIP_STATUSES))

var STATUS_STYLES = {
  planning: { dot: 'bg-slate-400', chip: 'bg-slate-100 dark:bg-slate-700' },
  upcoming: { dot: 'bg-amber-400', chip: 'bg-amber-50 dark:bg-amber-700/20' },
  ongoing: { dot: 'bg-brand-500', chip: 'bg-brand-50 dark:bg-brand-700/20' },
  completed: { dot: 'bg-slate-800 dark:bg-slate-100', chip: 'bg-slate-800/5 dark:bg-slate-100/10' }
}

function destinationName(id) {
  return trip.value?.destinations.find((d) => d.id === id)?.name || id
}

function setStatus(status) {
  tripStore.setStatus(props.id, status)
  isStatusMenuOpen.value = false
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
  if (editingEventId.value) tripStore.updateEvent(props.id, editingEventId.value, data)
  else tripStore.addEvent(props.id, data)
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
    <RouterLink to="/" class="inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 hover:text-brand-600">
      <span>🏠</span>
      <span>بازگشت به خانه</span>
    </RouterLink>

    <div class="flex items-start justify-between gap-3">
      <div>
        <h1 class="text-xl sm:text-2xl font-bold">{{ trip.title }}</h1>
        <p class="text-sm text-slate-400 mt-1">{{ trip.description }}</p>
      </div>
      <TripStatusBadge :status="trip.status" />
    </div>

    <div class="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
      <div>تاریخ شروع: {{ jalaliDateToLabel(trip.startDateJalali) }}</div>
      <div>تاریخ پایان: {{ jalaliDateToLabel(trip.endDateJalali) }}</div>
      <div>تعداد روز: {{ trip.durationDays }}</div>
      <div>هزینه در نظر گرفته‌شده: {{ Number(trip.budget).toLocaleString('en-US') }} تومان</div>

      <div class="sm:col-span-2 relative">
        <label class="text-xs text-slate-400 block mb-1.5">وضعیت سفر</label>
        <button
          type="button"
          class="w-full min-h-[44px] rounded-xl px-3 flex items-center justify-between text-sm font-medium"
          :class="STATUS_STYLES[trip.status].chip"
          @click="isStatusMenuOpen = !isStatusMenuOpen"
        >
          <span class="flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full" :class="STATUS_STYLES[trip.status].dot"></span>
            {{ TRIP_STATUSES[trip.status] }}
          </span>
          <span class="text-xs text-slate-400">{{ isStatusMenuOpen ? '▲' : '▼' }}</span>
        </button>
        <div v-if="isStatusMenuOpen" class="absolute z-10 mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-lg overflow-hidden">
          <button
            v-for="[key, label] in statusEntries"
            :key="key"
            type="button"
            class="w-full text-right px-3 py-2.5 text-sm flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-700"
            @click="setStatus(key)"
          >
            <span class="w-2.5 h-2.5 rounded-full" :class="STATUS_STYLES[key].dot"></span>
            {{ label }}
          </button>
        </div>
      </div>
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
      <div v-for="day in trip.durationDays" :key="day" class="mb-3">
        <p class="text-xs font-semibold text-slate-500 mb-1">روز {{ day }}</p>
        <ul class="text-sm space-y-1 pr-2">
          <li v-for="d in trip.destinationsForDay(day)" :key="d.id">{{ d.startTime }} - {{ d.endTime }} — {{ d.name }}</li>
          <li v-if="!trip.destinationsForDay(day).length" class="text-xs text-slate-400">مقصدی ثبت نشده</li>
        </ul>
        <p v-if="trip.accommodationForDay(day)" class="text-xs text-slate-500 mt-1">
          🏨 {{ trip.accommodationForDay(day).name }} — {{ trip.accommodationForDay(day).address }} — {{ trip.accommodationForDay(day).phone }}
        </p>
      </div>
    </div>

    <div class="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4">
      <div class="flex items-center justify-between mb-3">
        <h2 class="text-sm font-semibold">گزارش رویدادها</h2>
        <button type="button" class="text-xs px-3 py-1.5 rounded-full bg-brand-500 text-white font-medium" @click="openNewEvent">+ ثبت رویداد</button>
      </div>

      <div v-for="event in trip.events" :key="event.id" class="rounded-xl border border-slate-100 dark:border-slate-700/60 bg-slate-50/60 dark:bg-slate-900/30 p-4 mb-3">
        <div class="flex items-start justify-between gap-2 mb-2">
          <p class="text-sm font-semibold">{{ jalaliDateToLabel(event.dateJalali) }}</p>
          <div class="flex items-center gap-3 flex-shrink-0">
            <button type="button" class="text-xs text-brand-600 font-medium" @click="openEditEvent(event)">ویرایش</button>
            <button type="button" class="text-xs text-red-500 font-medium" @click="removeEvent(event.id)">حذف</button>
          </div>
        </div>

        <div class="flex flex-wrap gap-3 text-xs text-slate-500 dark:text-slate-400 mb-2">
          <span class="inline-flex items-center gap-1">💰 {{ event.cost.toLocaleString('en-US') }} تومان</span>
          <span class="inline-flex items-center gap-1">🚗 {{ event.vehicleUsed || '—' }}</span>
        </div>

        <p v-if="event.visitedDestinationIds.length" class="text-xs text-brand-700 dark:text-brand-300 bg-brand-50 dark:bg-brand-700/20 rounded-lg px-2.5 py-1.5 mb-1.5">
          ✅ رفتیم: {{ event.visitedDestinationIds.map(destinationName).join('، ') }}
        </p>
        <p v-if="event.missedDestinationIds.length" class="text-xs text-red-600 dark:text-red-300 bg-red-50 dark:bg-red-700/20 rounded-lg px-2.5 py-1.5 mb-1.5">
          ❌ نرسیدیم: {{ event.missedDestinationIds.map(destinationName).join('، ') }}
        </p>
        <p v-if="event.locationNotes" class="text-xs text-slate-500 mt-1">📍 {{ event.locationNotes }}</p>
        <p v-if="event.accommodationNotes" class="text-xs text-slate-500 mt-1">🏨 {{ event.accommodationNotes }}</p>
        <p v-if="event.description" class="text-xs text-slate-500 mt-1">{{ event.description }}</p>
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
