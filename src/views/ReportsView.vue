<script setup>
import { computed } from 'vue';
import { useReportStore } from '../stores/reportStore';
import { REPORT_SOURCES } from '../services/report/TravelRecordCollector.js';
import ReportSection from '../components/report/ReportSection.vue';
import StatCard from '../components/report/StatCard.vue';
import BarChart from '../components/report/BarChart.vue';
import AppIcon from '../components/AppIcon.vue';
import { MONTH_NAMES } from '../utils/jalaliStats.js';
import {
  formatNumber, formatMoney, formatDays, formatKm, formatPercent, formatSigned, toFaDigits
} from '../utils/formatters.js';

var store = useReportStore();
var report = computed(function () { return store.report; });
var hasData = computed(function () { return report.value.overview.count > 0; });
var year = computed(function () { return store.activeYearSummary; });

var sourceOptions = [
  { key: REPORT_SOURCES.ALL, label: 'همه' },
  { key: REPORT_SOURCES.TRIPS, label: 'برنامه‌های سفر' },
  { key: REPORT_SOURCES.VISITS, label: 'بازدیدهای ثبت‌شده' }
];

var yearCountItems = computed(function () {
  return report.value.yearly.years.map(function (y) {
    return { label: toFaDigits(y.year), value: y.count, display: formatNumber(y.count) };
  });
});

var yearDaysItems = computed(function () {
  return report.value.yearly.years.map(function (y) {
    return { label: toFaDigits(y.year), value: y.totalDays, display: formatNumber(y.totalDays) };
  });
});

var yearCostItems = computed(function () {
  return report.value.yearly.years.map(function (y) {
    return { label: toFaDigits(y.year), value: y.totalCost, display: formatNumber(Math.round(y.totalCost / 1000)) + ' هزار' };
  });
});

var activeYearMonthItems = computed(function () {
  if (!year.value) {
    return [];
  }
  return year.value.months.map(function (count, index) {
    return { label: MONTH_NAMES[index], value: count, display: formatNumber(count) };
  });
});

var durationItems = computed(function () { return withDisplay(report.value.duration.buckets); });
var monthItems = computed(function () { return withDisplay(report.value.seasonal.months); });
var seasonItems = computed(function () { return withDisplay(report.value.seasonal.seasons); });
var weekdayItems = computed(function () { return withDisplay(report.value.seasonal.weekdays); });

var recentGaps = computed(function () {
  return report.value.gaps.gaps.slice().reverse().slice(0, 8);
});

var yearsDesc = computed(function () { return store.years.slice().reverse(); });
var yearRowsDesc = computed(function () { return report.value.yearly.years.slice().reverse(); });

var regionItems = computed(function () {
  return report.value.regions.mostVisited.map(function (r) {
    return { label: r.icon + ' ' + r.name, value: r.visits, display: formatNumber(r.visits) };
  });
});
var cityItems = computed(function () {
  return countItems(report.value.regions.topCities);
});
var vehicleItems = computed(function () { return countItems(report.value.tripInsights.vehicles); });
var companionItems = computed(function () { return countItems(report.value.tripInsights.companions); });
var stayItems = computed(function () { return countItems(report.value.tripInsights.accommodations.top); });
var weatherItems = computed(function () { return countItems(report.value.tripInsights.weatherCities); });

function countItems(list) {
  return list.map(function (item) {
    return { label: item.name, value: item.count, display: formatNumber(item.count) };
  });
}

function withDisplay(items) {
  return items.map(function (item) {
    return { label: item.label, value: item.value, display: formatNumber(item.value) };
  });
}

function onYearChange(event) {
  store.selectYear(Number(event.target.value));
}

function onPlannedChange(event) {
  store.setIncludePlanned(event.target.checked);
}

function nextEstimateText(estimate) {
  if (!estimate) {
    return '';
  }
  var days = Math.abs(estimate.daysLeft);
  var relation = estimate.daysLeft >= 0 ? formatDays(days) + ' دیگر' : formatDays(days) + ' از موعد گذشته';
  return toFaDigits(estimate.label) + ' (' + relation + ')';
}

function countDeltaText(delta) {
  return delta ? 'نسبت به سال قبل: ' + formatSigned(delta.count) : '';
}

function costDeltaText(delta) {
  return delta ? 'نسبت به سال قبل: ' + formatSigned(Math.round(delta.cost / 1000)) + ' هزار' : '';
}
</script>

<template>
  <section class="space-y-5 max-w-5xl">
    <div>
      <h1 class="text-xl sm:text-2xl font-bold">گزارشات سفر</h1>
      <p class="text-sm text-slate-400 mt-1">تحلیل سفرهای شما بر اساس تاریخ شمسی</p>
    </div>

    <div class="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 space-y-3">
      <div class="flex items-center gap-2 overflow-x-auto no-scrollbar">
        <button
          v-for="option in sourceOptions"
          :key="option.key"
          type="button"
          class="min-h-36px px-3 rounded-full text-xs whitespace-nowrap"
          :class="store.source === option.key ? 'bg-brand-500 text-white' : 'bg-slate-100 dark:bg-slate-700'"
          @click="store.setSource(option.key)"
        >{{ option.label }}</button>
      </div>
      <label class="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 cursor-pointer">
        <input type="checkbox" class="size-4 accent-brand-500" :checked="store.includePlanned" @change="onPlannedChange" />
        <span>شامل سفرهای در حال برنامه‌ریزی و در حال انجام</span>
      </label>
      <p class="text-11px text-slate-400 leading-5">
        به‌طور پیش‌فرض فقط سفرهایی که وضعیتشان «تمام‌شده» است حساب می‌شوند.
      </p>
    </div>

    <div v-if="!hasData" class="rounded-2xl border border-dashed border-slate-300 dark:border-slate-600 p-8 text-center text-sm text-slate-400">
      هنوز داده‌ای برای گزارش‌گیری وجود ندارد. یک سفر را به وضعیت «تمام‌شده» ببرید یا یک بازدید ثبت کنید.
    </div>

    <template v-else>
      <ReportSection title="نگاه کلی" icon="compass">
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard label="تعداد سفر" :value="formatNumber(report.overview.count)" />
          <StatCard label="مجموع روز سفر" :value="formatDays(report.overview.totalDays)" />
          <StatCard label="میانگین روز هر سفر" :value="formatDays(report.overview.avgDays)" :hint="'میانه: ' + formatDays(report.overview.medianDays)" />
          <StatCard label="مجموع هزینه" :value="formatMoney(report.overview.totalCost)" />
          <StatCard label="میانگین هزینه هر سفر" :value="formatMoney(report.overview.avgCost)" />
          <StatCard label="مجموع مسافت" :value="formatKm(report.overview.totalKm)" />
          <StatCard label="میانگین مسافت" :value="formatKm(report.overview.avgKm)" />
          <StatCard label="اولین سفر" :value="toFaDigits(report.overview.first.dateLabel)" :hint="report.overview.first.title" />
        </div>
        <ul class="text-xs text-slate-600 dark:text-slate-300 space-y-1.5 leading-6">
          <li v-if="report.overview.longest" class="flex items-center gap-1.5">
            <AppIcon name="trophy" :size="15" class="text-amber-500 shrink-0" />
            <span>طولانی‌ترین سفر: {{ report.overview.longest.title }} ({{ formatDays(report.overview.longest.days) }})</span>
          </li>
          <li v-if="report.overview.costliest" class="flex items-center gap-1.5">
            <AppIcon name="money" :size="15" class="text-rose-500 shrink-0" />
            <span>پرهزینه‌ترین سفر: {{ report.overview.costliest.title }} ({{ formatMoney(report.overview.costliest.cost) }})</span>
          </li>
          <li v-if="report.overview.farthest" class="flex items-center gap-1.5">
            <AppIcon name="route" :size="15" class="text-brand-500 shrink-0" />
            <span>دورترین سفر: {{ report.overview.farthest.title }} ({{ formatKm(report.overview.farthest.km) }})</span>
          </li>
          <li class="flex items-center gap-1.5">
            <AppIcon name="clock" :size="15" class="text-slate-400 shrink-0" />
            <span>آخرین سفر: {{ report.overview.last.title }} — {{ toFaDigits(report.overview.last.dateLabel) }}</span>
          </li>
        </ul>
      </ReportSection>

      <ReportSection title="فاصله بین سفرها" icon="hourglass" subtitle="از روز پایان هر سفر تا روز شروع سفر بعدی">
        <p v-if="report.gaps.count === 0" class="text-sm text-slate-400">برای محاسبه فاصله حداقل دو سفر لازم است.</p>
        <template v-else>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatCard label="میانگین فاصله" :value="formatDays(report.gaps.avg)" :hint="'میانه: ' + formatDays(report.gaps.median)" />
            <StatCard label="بیشترین فاصله" :value="formatDays(report.gaps.longest.days)" />
            <StatCard label="کمترین فاصله" :value="formatDays(report.gaps.shortest.days)" />
            <StatCard label="از آخرین سفر گذشته" :value="formatDays(report.gaps.sinceLast)" />
          </div>
          <p v-if="report.gaps.nextEstimate" class="text-xs rounded-xl bg-brand-50 dark:bg-brand-700/20 text-brand-700 dark:text-brand-100 p-3 leading-6">
            با الگوی فعلی (هر {{ formatDays(report.gaps.avgStartInterval) }} یک سفر)، سفر بعدی حدود
            {{ nextEstimateText(report.gaps.nextEstimate) }} است.
          </p>
          <ul class="space-y-2">
            <li v-for="gap in recentGaps" :key="gap.to.id" class="flex items-center justify-between gap-2 rounded-xl bg-slate-50 dark:bg-slate-900/40 px-3 py-2 text-xs">
              <span class="truncate min-w-0">{{ gap.from.title }} ← {{ gap.to.title }}</span>
              <span class="shrink-0 font-semibold">{{ gap.isOverlap ? 'هم‌پوشانی' : formatDays(gap.days) }}</span>
            </li>
          </ul>
        </template>
      </ReportSection>

      <ReportSection title="میانگین و روند سالانه" icon="calendar" subtitle="سالِ هر سفر بر اساس تاریخ شروع آن (شمسی) حساب می‌شود">
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard label="میانگین سفر در سال" :value="formatNumber(report.yearly.avgPerCalendarYear)" hint="از اولین سال تا سال جاری" />
          <StatCard label="میانگین در سال‌های فعال" :value="formatNumber(report.yearly.avgPerActiveYear)" hint="فقط سال‌هایی که سفر داشته‌اید" />
          <StatCard v-if="report.yearly.avgPerCompletedYear !== null" label="میانگین سال‌های کامل" :value="formatNumber(report.yearly.avgPerCompletedYear)" hint="بدون سال جاری" />
          <StatCard v-if="report.yearly.best" label="پرسفرترین سال" :value="toFaDigits(report.yearly.best.year)" :hint="formatNumber(report.yearly.best.count) + ' سفر'" />
        </div>
        <div class="space-y-4">
          <div>
            <h3 class="text-xs font-semibold mb-2 text-slate-500">تعداد سفر در هر سال</h3>
            <BarChart :items="yearCountItems" />
          </div>
          <div>
            <h3 class="text-xs font-semibold mb-2 text-slate-500">مجموع روز سفر در هر سال</h3>
            <BarChart :items="yearDaysItems" bar-class="bg-amber-500" />
          </div>
          <div>
            <h3 class="text-xs font-semibold mb-2 text-slate-500">هزینه هر سال</h3>
            <BarChart :items="yearCostItems" bar-class="bg-rose-500" />
          </div>
        </div>
      </ReportSection>

      <ReportSection v-if="year" title="خلاصه سال" icon="calendarDays">
        <div class="flex items-center gap-2">
          <label class="text-xs text-slate-500" for="report-year">سال:</label>
          <select
            id="report-year"
            class="min-h-40px rounded-xl bg-slate-100 dark:bg-slate-700 px-3 text-sm"
            :value="store.activeYear"
            @change="onYearChange"
          >
            <option v-for="y in yearsDesc" :key="y" :value="y">{{ toFaDigits(y) }}</option>
          </select>
        </div>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard label="تعداد سفر" :value="formatNumber(year.count)" :hint="countDeltaText(year.delta)" />
          <StatCard label="روزهای سفر" :value="formatDays(year.totalDays)" :hint="formatPercent(year.daysShare) + ' از سال'" />
          <StatCard label="هزینه" :value="formatMoney(year.totalCost)" :hint="costDeltaText(year.delta)" />
          <StatCard label="مسافت" :value="formatKm(year.totalKm)" />
          <StatCard label="میانگین روز هر سفر" :value="formatDays(year.avgDays)" />
          <StatCard label="میانگین هزینه هر سفر" :value="formatMoney(year.avgCost)" />
          <StatCard v-if="year.busiestMonth" label="شلوغ‌ترین ماه" :value="year.busiestMonth.name" :hint="formatNumber(year.busiestMonth.count) + ' سفر'" />
          <StatCard v-if="year.longest" label="طولانی‌ترین سفر" :value="formatDays(year.longest.days)" :hint="year.longest.title" />
        </div>
        <div>
          <h3 class="text-xs font-semibold mb-2 text-slate-500">سفرها به تفکیک ماه</h3>
          <BarChart :items="activeYearMonthItems" />
        </div>
        <p v-if="year.topRegions.length" class="text-xs text-slate-600 dark:text-slate-300 leading-6">
          مقصدهای پرتکرار این سال:
          <span v-for="(region, index) in year.topRegions" :key="region.name">{{ index ? '، ' : '' }}{{ region.name }} ({{ formatNumber(region.count) }})</span>
        </p>
        <div class="overflow-x-auto no-scrollbar rounded-xl border border-slate-100 dark:border-slate-700">
          <table class="w-full text-xs min-w-[480px]">
            <thead class="bg-slate-50 dark:bg-slate-900/40 text-slate-500">
              <tr>
                <th class="p-2 text-right font-medium">سال</th>
                <th class="p-2 text-right font-medium">سفر</th>
                <th class="p-2 text-right font-medium">روز</th>
                <th class="p-2 text-right font-medium">هزینه</th>
                <th class="p-2 text-right font-medium">مسافت</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in yearRowsDesc" :key="row.year" class="border-t border-slate-100 dark:border-slate-700">
                <td class="p-2 font-semibold">{{ toFaDigits(row.year) }}</td>
                <td class="p-2">{{ formatNumber(row.count) }}</td>
                <td class="p-2">{{ formatNumber(row.totalDays) }}</td>
                <td class="p-2">{{ formatMoney(row.totalCost) }}</td>
                <td class="p-2">{{ formatKm(row.totalKm) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </ReportSection>

      <ReportSection title="مدت سفرها" icon="clock">
        <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <StatCard label="میانگین" :value="formatDays(report.duration.avg)" />
          <StatCard label="میانه" :value="formatDays(report.duration.median)" />
          <StatCard v-if="report.duration.shortest" label="کوتاه‌ترین سفر" :value="formatDays(report.duration.shortest.days)" :hint="report.duration.shortest.title" />
        </div>
        <BarChart :items="durationItems" bar-class="bg-sky-500" />
      </ReportSection>

      <ReportSection title="فصل و ماه سفر" icon="leaf">
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <StatCard v-if="report.seasonal.favoriteSeason" label="فصل محبوب" :value="report.seasonal.favoriteSeason.name" :hint="formatNumber(report.seasonal.favoriteSeason.count) + ' سفر'" />
          <StatCard v-if="report.seasonal.favoriteMonth" label="ماه محبوب" :value="report.seasonal.favoriteMonth.name" :hint="formatNumber(report.seasonal.favoriteMonth.count) + ' سفر'" />
          <StatCard v-if="report.seasonal.favoriteWeekday" label="روز هفته شروع سفر" :value="report.seasonal.favoriteWeekday.name" :hint="formatNumber(report.seasonal.favoriteWeekday.count) + ' سفر'" />
        </div>
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div>
            <h3 class="text-xs font-semibold mb-2 text-slate-500">ماه شروع سفر</h3>
            <BarChart :items="monthItems" />
          </div>
          <div class="space-y-5">
            <div>
              <h3 class="text-xs font-semibold mb-2 text-slate-500">فصل‌ها</h3>
              <BarChart :items="seasonItems" bar-class="bg-emerald-500" />
            </div>
            <div>
              <h3 class="text-xs font-semibold mb-2 text-slate-500">روز هفته شروع سفر</h3>
              <BarChart :items="weekdayItems" bar-class="bg-violet-500" />
            </div>
          </div>
        </div>
      </ReportSection>

      <ReportSection title="هزینه‌ها" icon="money" :subtitle="'بر اساس ' + formatNumber(report.cost.tripCount) + ' سفر دارای هزینه'">
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard label="میانگین هر سفر" :value="formatMoney(report.cost.avgPerTrip)" />
          <StatCard label="میانگین هر روز" :value="formatMoney(report.cost.avgPerDay)" />
          <StatCard label="هزینه هر کیلومتر" :value="formatMoney(report.cost.avgPerKm)" hint="فقط بازدیدهای دارای مسافت" />
          <StatCard label="مجموع" :value="formatMoney(report.cost.totalCost)" />
        </div>
        <div v-if="report.cost.mostExpensive.length" class="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <h3 class="text-xs font-semibold mb-2 text-slate-500">پرهزینه‌ترین‌ها</h3>
            <ul class="space-y-1.5 text-xs">
              <li v-for="item in report.cost.mostExpensive" :key="item.id" class="flex justify-between gap-2 rounded-lg bg-slate-50 dark:bg-slate-900/40 px-3 py-2">
                <span class="truncate">{{ item.title }}</span><span class="shrink-0 font-semibold">{{ formatMoney(item.cost) }}</span>
              </li>
            </ul>
          </div>
          <div>
            <h3 class="text-xs font-semibold mb-2 text-slate-500">گران‌ترین در هر روز</h3>
            <ul class="space-y-1.5 text-xs">
              <li v-for="item in report.cost.dailyCostTop" :key="item.id" class="flex justify-between gap-2 rounded-lg bg-slate-50 dark:bg-slate-900/40 px-3 py-2">
                <span class="truncate">{{ item.title }}</span><span class="shrink-0 font-semibold">{{ formatMoney(item.costPerDay) }}</span>
              </li>
            </ul>
          </div>
        </div>
      </ReportSection>

      <ReportSection title="مناطق و مقصدها" icon="map" subtitle="بر اساس مناطق فعال؛ مستقل از فیلتر بالا">
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard label="پیشرفت کلی" :value="formatPercent(report.regions.percent)" :hint="formatNumber(report.regions.visitedLocations) + ' از ' + formatNumber(report.regions.totalLocations) + ' مکان'" />
          <StatCard label="مناطق دیده‌شده" :value="formatNumber(report.regions.touchedCount) + ' از ' + formatNumber(report.regions.regionCount)" />
          <StatCard label="بدون بازدید" :value="formatNumber(report.regions.neverVisited.length)" />
        </div>
        <div v-if="report.regions.mostVisited.length">
          <h3 class="text-xs font-semibold mb-2 text-slate-500">بیشترین تعداد بازدید</h3>
          <BarChart :items="regionItems" bar-class="bg-teal-500" />
        </div>
        <div v-if="report.regions.topCities.length">
          <h3 class="text-xs font-semibold mb-2 text-slate-500">شهرهای پربازدید</h3>
          <BarChart :items="cityItems" bar-class="bg-indigo-500" />
        </div>
        <p v-if="report.regions.almostDone.length" class="text-xs leading-6 text-slate-600 dark:text-slate-300">
          نزدیک به تکمیل:
          <span v-for="(r, index) in report.regions.almostDone" :key="r.id">{{ index ? '، ' : '' }}{{ r.name }} ({{ formatPercent(r.percent) }})</span>
        </p>
        <p v-if="report.regions.neverVisited.length" class="text-xs leading-6 text-slate-500">
          هنوز بازدید نشده: {{ report.regions.neverVisited.join('، ') }}
        </p>
      </ReportSection>

      <ReportSection v-if="report.tripInsights.tripCount > 0" title="جزئیات برنامه‌های سفر" icon="bag">
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard label="مقصدهای برنامه‌ریزی‌شده" :value="formatNumber(report.tripInsights.execution.planned)" />
          <StatCard v-if="report.tripInsights.execution.completionRate !== null" label="نرخ اجرای برنامه" :value="formatPercent(report.tripInsights.execution.completionRate)" :hint="formatNumber(report.tripInsights.execution.visited) + ' دیده‌شده، ' + formatNumber(report.tripInsights.execution.missed) + ' جاافتاده'" />
          <StatCard label="شب اقامت ثبت‌شده" :value="formatNumber(report.tripInsights.accommodations.nights)" />
          <StatCard label="میانگین گزارش روزانه" :value="formatNumber(report.tripInsights.execution.avgEvents)" />
          <StatCard v-if="report.tripInsights.budget.usagePercent !== null" label="مصرف بودجه" :value="formatPercent(report.tripInsights.budget.usagePercent)" :hint="formatNumber(report.tripInsights.budget.overCount) + ' سفر بیش از بودجه'" />
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div v-if="report.tripInsights.vehicles.length">
            <h3 class="font-semibold mb-2 text-slate-500">وسیله‌های پراستفاده</h3>
            <BarChart :items="vehicleItems" bar-class="bg-orange-500" />
          </div>
          <div v-if="report.tripInsights.companions.length">
            <h3 class="font-semibold mb-2 text-slate-500">هم‌سفرهای پرتکرار</h3>
            <BarChart :items="companionItems" bar-class="bg-pink-500" />
          </div>
          <div v-if="report.tripInsights.accommodations.top.length">
            <h3 class="font-semibold mb-2 text-slate-500">اقامتگاه‌های پرتکرار</h3>
            <BarChart :items="stayItems" bar-class="bg-cyan-500" />
          </div>
          <div v-if="report.tripInsights.weatherCities.length">
            <h3 class="font-semibold mb-2 text-slate-500">شهرهای مقصد (آب‌وهوا)</h3>
            <BarChart :items="weatherItems" bar-class="bg-lime-500" />
          </div>
        </div>
      </ReportSection>
    </template>
  </section>
</template>
