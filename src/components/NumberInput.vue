<script setup>
import { computed } from 'vue'

var props = defineProps({
  modelValue: { type: Number, default: 0 },
  label: { type: String, default: '' },
  suffix: { type: String, default: '' },
  placeholder: { type: String, default: '0' }
})
var emit = defineEmits(['update:modelValue'])

var displayValue = computed(() => Number(props.modelValue || 0).toLocaleString('en-US'))

function onInput(event) {
  var digitsOnly = event.target.value.replace(/[^0-9]/g, '')
  emit('update:modelValue', digitsOnly ? parseInt(digitsOnly, 10) : 0)
}
</script>

<template>
  <div>
    <label v-if="label" class="text-sm block mb-1">{{ label }}</label>
    <div class="relative">
      <input
        :value="displayValue"
        type="text"
        inputmode="numeric"
        :placeholder="placeholder"
        class="w-full min-h-[44px] rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-sm ltr text-left"
        :class="suffix ? 'pl-14' : ''"
        @input="onInput"
      />
      <span v-if="suffix" class="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">{{ suffix }}</span>
    </div>
  </div>
</template>

<style scoped>
.ltr { direction: ltr; }
</style>
