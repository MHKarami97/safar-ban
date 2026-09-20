<script setup>
var steps = [
  { icon: '📝', title: 'اطلاعات کلی سفر', text: 'عنوان، توضیحات، تاریخ شروع شمسی، تعداد روز سفر و هزینه در نظر گرفته‌شده را وارد کن. تاریخ پایان به‌صورت خودکار محاسبه می‌شود.' },
  { icon: '⛅', title: 'پیش‌بینی آب‌وهوا', text: 'نام شهر مقصد را وارد کن تا هوای هفت روز آینده نمایش داده شود.' },
  { icon: '🎒', title: 'وسیله، همسفر، مدارک و تجهیزات', text: 'از لیست‌های موجود انتخاب کن یا در صورت نبود، مورد جدید اضافه کن.' },
  { icon: '📜', title: 'نکات فرهنگی', text: 'قوانین محلی و نکات فرهنگی مقصد را در همین مرحله ثبت کن.' },
  { icon: '🗺️', title: 'چیدن مقاصد روزانه', text: 'برای هر روز، مقصدها را با ساعت شروع و مدت‌زمان تخمینی وارد کن؛ پایان هر مقصد خودکار محاسبه می‌شود.' },
  { icon: '⚠️', title: 'هشدار همپوشانی زمانی', text: 'اگر دو مقصد در یک روز زمان‌شان روی هم بیفتد، هشدار داده می‌شود تا زمان شناور در نظر بگیری.' },
  { icon: '🏨', title: 'اقامتگاه هر روز', text: 'برای هر روز می‌توانی اقامتگاه (نام، آدرس، شماره تماس) را هم ثبت کنی.' },
  { icon: '📋', title: 'ثبت رویداد روزانه', text: 'در طول سفر، از دکمه «ثبت رویداد» برای گزارش روزانه استفاده کن.' },
  { icon: '🔄', title: 'وضعیت سفر', text: 'وضعیت سفر را از «در حال برنامه‌ریزی» تا «پایان یافته» به‌روزرسانی کن. سفرهای پایان‌یافته در بخش جدایی در پایین لیست سفرها نمایش داده می‌شوند.' },
  { icon: '🖨️', title: 'خروجی و پرینت', text: 'هر زمان که خواستی، از دکمه خروجی هر سفر یک نسخه پرینت‌شده و شیک از کل برنامه بگیر.' }
]
</script>

<template>
  <section class="space-y-6">
    <div class="rounded-3xl bg-gradient-to-l from-brand-600 to-brand-500 text-white p-6 sm:p-8">
      <h1 class="text-2xl font-bold mb-2">راهنمای چیدن برنامه سفر</h1>
      <p class="text-sm text-brand-50/90">قبل از ساخت اولین برنامه سفر، این ۱۰ قدم را مرور کن تا هیچ نکته‌ای از قلم نیفتد.</p>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div
        v-for="(step, index) in steps"
        :key="index"
        class="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5"
      >
        <div class="flex items-center gap-3 mb-2">
          <span class="w-9 h-9 flex items-center justify-center rounded-xl bg-brand-50 dark:bg-brand-700/30 text-lg">{{ step.icon }}</span>
          <h3 class="font-semibold text-sm">{{ index + 1 }}. {{ step.title }}</h3>
        </div>
        <p class="text-xs text-slate-500 dark:text-slate-400 leading-6">{{ step.text }}</p>
      </div>
    </div>

    <RouterLink
      to="/trips/create"
      class="block text-center min-h-[52px] leading-[52px] rounded-2xl bg-brand-500 hover:bg-brand-600 text-white text-base font-semibold shadow-sm transition-colors"
    >
      شروع ساخت برنامه سفر 🚀
    </RouterLink>
  </section>
</template>
