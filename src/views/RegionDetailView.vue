<script setup>
import { computed, ref } from 'vue'
import { useRegionStore } from '../stores/regionStore'
import { useConfirm } from '../composables/useConfirm'
import ProgressBar from '../components/ProgressBar.vue'
import LocationTree from '../components/LocationTree.vue'
import VisitRecordModal from '../components/VisitRecordModal.vue'
import ConfirmDialog from '../components/ConfirmDialog.vue'

var props = defineProps({ id: { type: String, required: true } })
var store = useRegionStore()
var { isPending, pendingLabel, requestConfirm, confirmAction, cancelAction } = useConfirm()

if (store.activeRegionId !== props.id) store.selectRegion(props.id)

var region = computed(() => store.activeRegion)

var isVisitModalOpen = ref(false)
var editingRecordId = ref(null)
var editingLocationNames = ref([])

var selectedLocationNames = computed(() =>
  store.selectedLocationIds.map((id) => region.value?.findLocation(id)?.name).filter(Boolean)
)

function openFinishModal() {
  editingRecordId.value = null
  isVisitModalOpen.value = true
}

/** Editing a shared VisitRecord shows every location that belongs to it, not just the one clicked. */
function openEditModal({ location, record }) {
  editingRecordId.value = record?.id || null
  editingLocationNames.value = record
    ? record.locationIds.map((id) => region.value?.findLocation(id)?.name).filter(Boolean)
    : [location.name]
  isVisitModalOpen.value = true
}

function saveVisit(details) {
  if (editingRecordId.value) {
    store.updateVisitRecord(props.id, editingRecordId.value, details)
  } else {
    store.confirmVisit(props.id, details)
  }
  isVisitModalOpen.value = false
}

function handleUnmark(locationId) {
  requestConfirm('این لوکیشن به حالت رفته‌نشده برگردد؟', () => store.unmarkVisited(props.id, locationId))
}
</script>

<template>
  <section v-if="region" class="space-y-6">
    <div>
      <h1 class="text-xl sm:text-2xl font-bold flex items-center gap-2">
        <span>{{ region.icon }}</span>
        <span>{{ region.name }}</span>
      </h1>
      <p class="text-sm text-slate-400 mt-1">{{ region.visitedCount }} از {{ region.totalCount }} لوکیشن رفته شده</p>
    </div>

    <div class="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4">
      <ProgressBar :percent="region.progressPercent" label="پیشرفت بازدید" />
    </div>

    <LocationTree
      :region="region"
      @finish-selection="openFinishModal"
      @unmark="handleUnmark"
      @edit-record="openEditModal"
    />

    <VisitRecordModal
      :is-open="isVisitModalOpen"
      :location-names="editingRecordId ? editingLocationNames : selectedLocationNames"
      :initial="editingRecordId ? region.getVisitRecord(editingRecordId) : null"
      @save="saveVisit"
      @cancel="isVisitModalOpen = false"
    />
  </section>

  <ConfirmDialog :is-open="isPending" :label="pendingLabel" @confirm="confirmAction" @cancel="cancelAction" />
</template>
