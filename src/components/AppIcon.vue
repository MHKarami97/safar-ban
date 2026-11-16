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
</template>
