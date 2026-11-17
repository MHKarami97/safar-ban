<script setup>
import { ref, computed } from 'vue'
import AppIcon from './AppIcon.vue'

var props = defineProps({
  items: { type: Array, required: true },
  modelValue: { type: Array, default: () => [] },
  label: { type: String, default: '' },
  placeholder: { type: String, default: 'افزودن مورد جدید...' }
})
var emit = defineEmits(['update:modelValue', 'add-custom'])

var isOpen = ref(false)
var newName = ref('')

var selectedItems = computed(() => props.items.filter((item) => props.modelValue.includes(item.id)))

function toggle(id) {
  var next = props.modelValue.includes(id) ? props.modelValue.filter((v) => v !== id) : [...props.modelValue, id]
  emit('update:modelValue', next)
}

function submitCustom() {
  if (!newName.value.trim()) return
  emit('add-custom', newName.value.trim())
  newName.value = ''
}
</script>

<template>
  <div>
    <label v-if="label" class="text-sm font-medium block mb-1.5">{{ label }}</label>

    <div class="flex flex-wrap gap-2 mb-2">
      <span
        v-for="item in selectedItems"
        :key="item.id"
        class="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-brand-50 text-brand-700 dark:bg-brand-700/30 dark:text-brand-100"
      >
        <span>{{ item.name }}</span>
        <button type="button" class="text-brand-500 hover:text-red-500 transition-colors p-0.5" aria-label="حذف" @click="toggle(item.id)">
          <AppIcon name="close" :size="12" />
        </button>
      </span>
    </div>

    <button type="button" class="min-h-[40px] px-3 rounded-xl border border-slate-300 dark:border-slate-600 text-xs sm:text-sm w-full text-right inline-flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors" @click="isOpen = !isOpen">
      <span class="inline-flex items-center gap-1.5">
        <AppIcon :name="isOpen ? 'close' : 'plus'" :size="14" />
        <span>{{ isOpen ? 'بستن لیست' : 'انتخاب یا افزودن مورد' }}</span>
      </span>
      <AppIcon name="chevron" :size="16" :class="isOpen ? '-rotate-90' : 'rotate-90'" class="transition-transform text-slate-400" />
    </button>

    <div v-if="isOpen" class="mt-2 border border-slate-200 dark:border-slate-700 rounded-xl p-3 space-y-2 bg-slate-50 dark:bg-slate-800/60">
      <label v-for="item in items" :key="item.id" class="flex items-center gap-2 text-sm px-1 py-1 rounded-lg hover:bg-white dark:hover:bg-slate-700 cursor-pointer">
        <input type="checkbox" :checked="modelValue.includes(item.id)" @change="toggle(item.id)" />
        <span>{{ item.name }}</span>
      </label>

      <div class="flex items-center gap-2 pt-1">
        <input
          v-model="newName"
          type="text"
          :placeholder="placeholder"
          class="flex-1 min-h-[38px] rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-xs"
          @keyup.enter="submitCustom"
        />
        <button type="button" class="min-h-[38px] px-3 rounded-lg bg-brand-500 text-white text-xs" @click="submitCustom">افزودن</button>
      </div>
    </div>
  </div>
</template>
