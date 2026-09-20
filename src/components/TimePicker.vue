<script setup>
import { ref, watch } from 'vue'

var props = defineProps({
  modelValue: { type: String, default: '08:00' },
  placeholder: { type: String, default: 'انتخاب ساعت...' }
})
var emit = defineEmits(['update:modelValue'])

function parse(value) {
  var [h, m] = (value || '08:00').split(':').map(Number)
  return { h: h || 0, m: m || 0 }
}

var isOpen = ref(false)
var draft = ref(parse(props.modelValue))

watch(() => props.modelValue, (val) => { draft.value = parse(val) })

var hours = Array.from({ length: 24 }, (_, i) => i)
var minutes = [0, 15, 30, 45]

function open() { isOpen.value = true }

function confirm() {
  var h = String(draft.value.h).padStart(2, '0')
  var m = String(draft.value.m).padStart(2, '0')
  emit('update:modelValue', `${h}:${m}`)
  isOpen.value = false
}

function cancel() { isOpen.value = false }
</script>

<template>
  <div class="relative">
    <input
      type="text"
      readonly
      :value="modelValue"
      :placeholder="placeholder"
      class="w-full min-h-[44px] rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 text-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-400 text-center"
      @click="open"
    />
    <Transition name="fade">
      <div v-if="isOpen" class="fixed inset-0 z-30 flex items-center justify-center bg-black/40 px-4" @click.self="cancel">
        <div class="bg-white dark:bg-slate-800 rounded-2xl p-5 w-full max-w-xs shadow-xl">
          <p class="text-sm font-semibold mb-3">انتخاب ساعت</p>
          <div class="grid grid-cols-2 gap-2">
            <select v-model.number="draft.h" class="min-h-[44px] rounded-xl bg-slate-100 dark:bg-slate-700 px-2 text-sm text-center">
              <option v-for="h in hours" :key="h" :value="h">{{ String(h).padStart(2, '0') }}</option>
            </select>
            <select v-model.number="draft.m" class="min-h-[44px] rounded-xl bg-slate-100 dark:bg-slate-700 px-2 text-sm text-center">
              <option v-for="m in minutes" :key="m" :value="m">{{ String(m).padStart(2, '0') }}</option>
            </select>
          </div>
          <div class="flex gap-3 mt-4">
            <button type="button" class="flex-1 min-h-[44px] rounded-xl bg-brand-500 text-white font-medium" @click="confirm">تایید</button>
            <button type="button" class="flex-1 min-h-[44px] rounded-xl border border-slate-300 dark:border-slate-600" @click="cancel">انصراف</button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.15s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
