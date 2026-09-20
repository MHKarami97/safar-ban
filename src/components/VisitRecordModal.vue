<script setup>
import { ref, watch } from 'vue'
import JalaliDatePicker from './JalaliDatePicker.vue'
import { todayJalali, formatJalali } from '../utils/jalali'

var props = defineProps({
  isOpen: { type: Boolean, default: false },
  locationNames: { type: Array, default: () => [] },
  initial: { type: Object, default: null }
})
var emit = defineEmits(['save', 'cancel'])

var today = todayJalali()
var form = ref(emptyForm())

function emptyForm() {
  return { dateJalali: formatJalali(today.jy, today.jm, today.jd), totalCost: 0, days: 1, km: 0, description: '' }
}

watch(() => props.isOpen, (open) => {
  if (open) form.value = props.initial ? { ...props.initial } : emptyForm()
})

function save() { emit('save', { ...form.value }) }
</script>

<template>
  <Transition name="fade">
    <div v-if="isOpen" class="fixed inset-0 z-30 flex items-center justify-center bg-black/40 px-4">
      <div class="bg-white dark:bg-slate-800 rounded-2xl p-5 w-full max-w-md shadow-xl max-h-[90vh] overflow-y-auto">
        <p class="text-sm font-semibold mb-1">ثبت جزئیات بازدید</p>
        <p class="text-xs text-slate-400 mb-4">{{ locationNames.join('، ') }}</p>

        <div class="space-y-3">
          <div>
            <label class="text-sm block mb-1">تاریخ رفتن</label>
            <JalaliDatePicker v-model="form.dateJalali" />
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="text-sm block mb-1">هزینه کلی (تومان)</label>
              <input v-model.number="form.totalCost" type="number" min="0" class="w-full min-h-[44px] rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-sm" />
            </div>
            <div>
              <label class="text-sm block mb-1">تعداد روز</label>
              <input v-model.number="form.days" type="number" min="1" class="w-full min-h-[44px] rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-sm" />
            </div>
          </div>
          <div>
            <label class="text-sm block mb-1">کیلومتر</label>
            <input v-model.number="form.km" type="number" min="0" class="w-full min-h-[44px] rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-sm" />
          </div>
          <div>
            <label class="text-sm block mb-1">توضیحات</label>
            <textarea v-model="form.description" rows="3" class="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm"></textarea>
          </div>
        </div>

        <div class="flex gap-3 mt-5">
          <button type="button" class="flex-1 min-h-[44px] rounded-xl bg-brand-500 text-white font-medium" @click="save">ذخیره</button>
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
