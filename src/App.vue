<script setup>
import { onMounted } from 'vue'
import { RouterView } from 'vue-router'
import { useUiStore } from './stores/uiStore'
import { useRegionStore } from './stores/regionStore'
import { useTripStore } from './stores/tripStore'
import { useCatalogStore } from './stores/catalogStore'
import { useCloudSyncStore } from './stores/cloudSyncStore'
import { cloudSyncService } from './services/cloud'
import AppHeader from './components/AppHeader.vue'
import BottomNav from './components/BottomNav.vue'
import UpdatePrompt from './components/UpdatePrompt.vue'
import SyncFailedBar from './components/cloud/SyncFailedBar.vue'
import CloudConflictModal from './components/cloud/CloudConflictModal.vue'

var ui = useUiStore()
var regionStore = useRegionStore()
var tripStore = useTripStore()
var catalogStore = useCatalogStore()
var cloudStore = useCloudSyncStore()

onMounted(() => {
  cloudSyncService.setDataRestoredHandler(async () => {
    regionStore.initialize()
    catalogStore.initialize()
    tripStore.initialize()
  })

  ui.initialize()
  regionStore.initialize()
  catalogStore.initialize()
  tripStore.initialize()
  cloudStore.start()
})
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <AppHeader />
    <main class="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-4">
      <RouterView />
    </main>
    <div class="bottom-nav-spacer sm:hidden" aria-hidden="true"></div>
    <BottomNav class="sm:hidden" />
    <UpdatePrompt />
    <SyncFailedBar />
    <CloudConflictModal />
  </div>
</template>

<style scoped>
/* Reserves room under the content for the floating bottom bar (bar ~5rem + gap + safe area). */
.bottom-nav-spacer {
  flex: none;
  height: calc(6.5rem + env(safe-area-inset-bottom, 0px));
}
</style>
