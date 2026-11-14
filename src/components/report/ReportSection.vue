<script setup>
defineProps({
  title: { type: String, required: true },
  icon: { type: String, default: '' },
  subtitle: { type: String, default: '' }
});
</script>

<template>
  <section class="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 sm:p-5 space-y-4">
    <header>
      <h2 class="text-sm sm:text-base font-bold">
        <span v-if="icon" class="ml-1" aria-hidden="true">{{ icon }}</span>{{ title }}
      </h2>
      <p v-if="subtitle" class="text-xs text-slate-400 mt-1 leading-5">{{ subtitle }}</p>
    </header>
    <slot />
  </section>
</template>
