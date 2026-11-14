<script setup>
import { computed } from 'vue';

var props = defineProps({
  items: { type: Array, default: function () { return []; } },
  barClass: { type: String, default: 'bg-brand-500' }
});

var maxValue = computed(function () {
  var max = 0;
  props.items.forEach(function (item) {
    if (item.value > max) {
      max = item.value;
    }
  });
  return max;
});

function widthOf(item) {
  if (maxValue.value <= 0 || item.value <= 0) {
    return '0%';
  }
  return Math.max((item.value / maxValue.value) * 100, 3) + '%';
}
</script>

<template>
  <ul class="space-y-1.5">
    <li v-for="(item, index) in items" :key="index" class="flex items-center gap-2 text-xs">
      <span class="w-20 shrink-0 truncate text-slate-500 dark:text-slate-400">{{ item.label }}</span>
      <div class="flex-1 h-3 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
        <div class="h-full rounded-full transition-all duration-500" :class="barClass" :style="{ width: widthOf(item) }"></div>
      </div>
      <span class="w-16 shrink-0 text-end font-medium text-slate-700 dark:text-slate-200">{{ item.display ?? item.value }}</span>
    </li>
  </ul>
</template>
