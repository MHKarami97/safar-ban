<script setup>
import { ref, computed, watch } from 'vue'
import { jalaliMonthLength, parseJalali, formatJalali, todayJalali, JALALI_MONTH_NAMES } from '../utils/jalali'

var props = defineProps({
  modelValue: { type: String, default: '' },
  placeholder: { type: String, default: 'انتخاب تاریخ...' }
})
var emit = defineEmits(['update:modelValue'])

var isOpen = ref(false)
var today = todayJalali()
var draft = ref(parseJalali(props.modelValue) || { jy: today.jy, jm: today.jm, jd: today.jd })

watch(() => props.modelValue, (val) => {
  var parsed = parseJalali(val)
  if (parsed) draft.value = parsed
})

var years = computed(() => {
  var list = []
  for (var y = today.jy - 3; y <= today.jy + 5; y += 1) list.push(y)
  return list
})

var dayCount = computed(() => jalaliMonthLength(draft.value.jy, draft.value.jm))
var days = computed(() => Array.from({ length: dayCount.value }, (_, i) => i + 1))

function open() { isOpen.value = true }

function confirm() {
  if (draft.value.jd > dayCount.value) draft.value.jd = dayCount.value
  emit('update:modelValue', formatJalali(draft.value.jy, draft.value.jm, draft.value.jd))
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
      class="w-full min-h-[44px] rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 text-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-400"
      @click="open"
    />
    <Transition name="fade">
      <div v-if="isOpen" class="fixed inset-0 z-30 flex items-center justify-center bg-black/40 px-4" @click.self="cancel">
        <div class="bg-white dark:bg-slate-800 rounded-2xl p-5 w-full max-w-sm shadow-xl">
          <p class="text-sm font-semibold mb-3">انتخاب تاریخ شمسی</p>
          <div class="grid grid-cols-3 gap-2">
            <select v-model.number="draft.jd" class="min-h-[44px] rounded-xl bg-slate-100 dark:bg-slate-700 px-2 text-sm">
              <option v-for="d in days" :key="d" :value="d">{{ d }}</option>
            </select>
            <select v-model.number="draft.jm" class="min-h-[44px] rounded-xl bg-slate-100 dark:bg-slate-700 px-2 text-sm">
              <option v-for="(m, i) in JALALI_MONTH_NAMES" :key="m" :value="i + 1">{{ m }}</option>
            </select>
            <select v-model.number="draft.jy" class="min-h-[44px] rounded-xl bg-slate-100 dark:bg-slate-700 px-2 text-sm">
              <option v-for="y in years" :key="y" :value="y">{{ y }}</option>
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
