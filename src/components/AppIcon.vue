<script setup>
import { computed } from 'vue'
import { ICON_PATHS } from '../data/iconPaths'

var props = defineProps({
  name: { type: String, required: true },
  size: { type: Number, default: 24 },
  strokeWidth: { type: [Number, String], default: 1.8 }
})

var paths = computed(() => ICON_PATHS[props.name] ?? '')
</script>

<template>
  <svg
    v-if="paths"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    :stroke-width="strokeWidth"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
    focusable="false"
    class="shrink-0"
    :width="size"
    :height="size"
    v-html="paths"
  />
  <span
    v-else
    class="inline-flex shrink-0 items-center justify-center leading-none select-none"
    :style="{ fontSize: `${size * 0.85}px`, width: `${size}px`, height: `${size}px` }"
    aria-hidden="true"
  >
    {{ name }}
  </span>
</template>
