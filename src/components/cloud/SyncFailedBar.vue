<script setup>
import { computed, ref } from 'vue'
import { useCloudSyncStore } from '../../stores/cloudSyncStore'

var store = useCloudSyncStore()
var dismissedKey = ref('')
var isRetrying = ref(false)

var currentKey = computed(() => `${store.snapshot.status}|${store.snapshot.lastError ?? ''}`)
var isVisible = computed(
  () => store.showFailureBar && dismissedKey.value !== currentKey.value
)

function dismiss() {
  dismissedKey.value = currentKey.value
}

async function retry() {
  isRetrying.value = true
  try {
    await store.connect()
  } catch {
    // Error stays in store
  } finally {
    isRetrying.value = false
  }
}
</script>

<template>
  <Transition name="slide-up">
    <aside
      v-if="isVisible"
      role="status"
      aria-live="polite"
      class="fixed inset-x-0 bottom-20 sm:bottom-4 z-40 flex justify-center px-4 pointer-events-none"
    >
      <div class="pointer-events-auto flex w-full max-w-lg items-center justify-between gap-3 rounded-xl bg-amber-600 px-4 py-2.5 text-xs font-medium text-white shadow-lg ring-1 ring-amber-700/30">
        <div class="flex min-w-0 items-center gap-2">
          <span class="text-base shrink-0" aria-hidden="true">⚠️</span>
          <span class="truncate">{{ store.failureBarMessage }}</span>
        </div>
        <div class="flex shrink-0 items-center gap-2">
          <button
            type="button"
            :disabled="isRetrying"
            class="rounded-lg bg-white px-2.5 py-1 text-xs font-bold text-amber-700 transition hover:bg-amber-50 active:scale-95 disabled:opacity-50"
            @click="retry"
          >
            {{ isRetrying ? 'در حال تلاش...' : 'تلاش دوباره' }}
          </button>
          <button
            type="button"
            class="rounded-lg p-1 text-white/80 transition hover:bg-white/10 hover:text-white"
            title="بستن"
            aria-label="بستن"
            @click="dismiss"
          >
            ✕
          </button>
        </div>
      </div>
    </aside>
  </Transition>
</template>

<style scoped>
.slide-up-enter-active,
.slide-up-leave-active {
  transition: transform 0.25s ease, opacity 0.25s ease;
}

.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(20px);
  opacity: 0;
}
</style>
