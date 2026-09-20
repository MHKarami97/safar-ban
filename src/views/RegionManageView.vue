<script setup>
import { ref } from 'vue'
import { useRegionStore } from '../stores/regionStore'

var store = useRegionStore()
var newName = ref('')
var newIcon = ref('📍')
var newType = ref('province')

function createCustom() {
  if (!newName.value.trim()) return
  store.createCustomRegion(newName.value.trim(), newIcon.value, newType.value)
  newName.value = ''
}
</script>

<template>
  <section class="space-y-6">
    <h1 class="text-xl sm:text-2xl font-bold">مدیریت استان‌ها و کشورها</h1>

    <div class="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4">
      <h2 class="text-sm font-semibold mb-3">استان‌ها (فعال/فعال در صفحه اول)</h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <label v-for="region in store.provinces" :key="region.id" class="flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900/40">
          <span class="text-sm">{{ region.icon }} {{ region.name }}</span>
          <input type="checkbox" :checked="region.isEnabled" @change="store.toggleRegionEnabled(region.id)" />
        </label>
      </div>
    </div>

    <div class="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4">
      <h2 class="text-sm font-semibold mb-3">کشورها (پیش‌فرض فعال — فقط با انتخاب شما نمایش داده می‌شوند)</h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <label v-for="region in store.countries" :key="region.id" class="flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900/40">
          <span class="text-sm">{{ region.icon }} {{ region.name }}</span>
          <input type="checkbox" :checked="region.isEnabled" @change="store.toggleRegionEnabled(region.id)" />
        </label>
      </div>
    </div>

    <div class="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4">
      <h2 class="text-sm font-semibold mb-3">افزودن استان/کشور شخصی</h2>
      <div class="flex flex-col sm:flex-row gap-2">
        <input v-model="newName" type="text" placeholder="نام..." class="flex-1 min-h-[44px] rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-sm" />
        <input v-model="newIcon" type="text" placeholder="آیکون" class="w-20 min-h-[44px] rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-sm text-center" />
        <select v-model="newType" class="min-h-[44px] rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-sm">
          <option value="province">استان</option>
          <option value="country">کشور</option>
        </select>
        <button type="button" class="min-h-[44px] px-4 rounded-xl bg-brand-500 text-white text-sm" @click="createCustom">افزودن</button>
      </div>
    </div>
  </section>
</template>
