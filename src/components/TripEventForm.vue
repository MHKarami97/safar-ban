<script setup>
import { ref, watch } from 'vue'
import JalaliDatePicker from './JalaliDatePicker.vue'
import { todayJalali, formatJalali } from '../utils/jalali'

var props = defineProps({
  isOpen: { type: Boolean, default: false },
  destinations: { type: Array, default: () => [] },
  vehicles: { type: Array, default: () => [] },
  initial: { type: Object, default: null }
})
var emit = defineEmits(['save', 'cancel'])

var today = todayJalali()
var form = ref(emptyForm())

function emptyForm() {
  return {
    dateJalali: formatJalali(today.jy, today.jm, today.jd),
    visitedDestinationIds: [], missedDestinationIds: [], cost: 0, vehicleUsed: '',
    locationNotes: '', accommodationNotes: '', description: ''
  }
}

watch(() => props.isOpen, (open) => {
  if (open) form.value = props.initial ? { ...props.initial } : emptyForm()
})

function toggleIn(field, id) {
  var list = form.value[field]
  form.value[field] = list.includes(id) ? list.filter((v) => v !== id) : [...list, id]
}

function save() { emit('save', { ...form.value }) }
</script>

<template>
  <Transition name="fade">
    <div v-if="isOpen" class="fixed inset-0 z-30 flex items-center justify-center bg-black/40 px-4">
      <div class="bg-white dark:bg-slate-800 rounded-2xl p-5 w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto">
        <p class="text-sm font-semibold mb-4">ثبت رویداد امروز</p>

        <div class="space-y-3">
          <div>
            <label class="text-sm block mb-1">تاریخ</label>
            <JalaliDatePicker v-model="form.dateJalali" />
          </div>

          <div>
            <label class="text-sm block mb-1">مقصدهایی که رفتیم</label>
            <div class="flex flex-wrap gap-2">
              <label
                v-for="d in destinations"
                :key="'v-' + d.id"
                class="text-xs px-2.5 py-1 rounded-full cursor-pointer"
                :class="form.visitedDestinationIds.includes(d.id) ? 'bg-brand-500 text-white' : 'bg-slate-100 dark:bg-slate-700'"
              >
                <input type="checkbox" class="hidden" :checked="form.visitedDestinationIds.includes(d.id)" @change="toggleIn('visitedDestinationIds', d.id)" />
                {{ d.name }}
              </label>
            </div>
          </div>

          <div>
            <label class="text-sm block mb-1">مقصدهایی که به آن‌ها نرسیدیم</label>
            <div class="flex flex-wrap gap-2">
              <label
                v-for="d in destinations"
                :key="'m-' + d.id"
                class="text-xs px-2.5 py-1 rounded-full cursor-pointer"
                :class="form.missedDestinationIds.includes(d.id) ? 'bg-red-500 text-white' : 'bg-slate-100 dark:bg-slate-700'"
              >
                <input type="checkbox" class="hidden" :checked="form.missedDestinationIds.includes(d.id)" @change="toggleIn('missedDestinationIds', d.id)" />
                {{ d.name }}
              </label>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="text-sm block mb-1">هزینه امروز (تومان)</label>
              <input v-model.number="form.cost" type="number" min="0" class="w-full min-h-[44px] rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-sm" />
            </div>
            <div>
              <label class="text-sm block mb-1">وسیله رفت‌وآمد</label>
              <select v-model="form.vehicleUsed" class="w-full min-h-[44px] rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-sm">
                <option value="">انتخاب کنید</option>
                <option v-for="v in vehicles" :key="v.id" :value="v.name">{{ v.name }}</option>
              </select>
            </div>
          </div>

          <div>
            <label class="text-sm block mb-1">وضعیت لوکیشن‌ها (باز/بسته/نیاز به چه چیزی داشتند)</label>
            <textarea v-model="form.locationNotes" rows="2" class="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm"></textarea>
          </div>
          <div>
            <label class="text-sm block mb-1">وضعیت اقامتگاه امروز</label>
            <textarea v-model="form.accommodationNotes" rows="2" class="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm"></textarea>
          </div>
          <div>
            <label class="text-sm block mb-1">توضیحات کلی</label>
            <textarea v-model="form.description" rows="2" class="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm"></textarea>
          </div>
        </div>

        <div class="flex gap-3 mt-5">
          <button type="button" class="flex-1 min-h-[44px] rounded-xl bg-brand-500 text-white font-medium" @click="save">ذخیره رویداد</button>
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
