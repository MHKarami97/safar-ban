<script setup>
import { onMounted } from 'vue'
import { RouterView } from 'vue-router'
import { useUiStore } from './stores/uiStore'
import { useRegionStore } from './stores/regionStore'
import { useTripStore } from './stores/tripStore'
import { useCatalogStore } from './stores/catalogStore'
import AppHeader from './components/AppHeader.vue'
import BottomNav from './components/BottomNav.vue'
import AppFooter from './components/AppFooter.vue'
import UpdatePrompt from './components/UpdatePrompt.vue'

var ui = useUiStore()
var regionStore = useRegionStore()
var tripStore = useTripStore()
var catalogStore = useCatalogStore()

onMounted(() => {
  ui.initialize()
  regionStore.initialize()
  catalogStore.initialize()
  tripStore.initialize()
})
</script>

<template>
  <div class="min-h-screen flex flex-col pb-16 sm:pb-0">
    <AppHeader />
    <main class="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-4">
      <RouterView />
    </main>
    <AppFooter />
    <BottomNav class="sm:hidden" />
    <UpdatePrompt />
  </div>
</template>
