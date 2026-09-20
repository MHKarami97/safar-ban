<script setup>
defineProps({
  isOpen: { type: Boolean, default: false },
  label: { type: String, default: '' }
})
defineEmits(['confirm', 'cancel'])
</script>

<template>
  <Transition name="fade">
    <div v-if="isOpen" class="fixed inset-0 z-30 flex items-center justify-center bg-black/40 px-4">
      <div class="bg-white dark:bg-slate-800 rounded-2xl p-5 w-full max-w-sm shadow-xl">
        <p class="text-sm sm:text-base mb-4">{{ label }}</p>
        <div class="flex gap-3">
          <button type="button" class="flex-1 min-h-[44px] rounded-xl bg-red-500 text-white font-medium" @click="$emit('confirm')">تایید</button>
          <button type="button" class="flex-1 min-h-[44px] rounded-xl border border-slate-300 dark:border-slate-600" @click="$emit('cancel')">انصراف</button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.15s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
