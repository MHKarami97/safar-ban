/**
 * Single source of truth for the main destinations (bottom bar and home cards).
 * routeNames lists every route that should keep the tab highlighted.
 */
export var NAV_ITEMS = Object.freeze([
  { id: 'home', to: '/', title: 'خانه', desc: 'نمای کلی', icon: 'home', tone: 'brand', routeNames: ['home'] },
  { id: 'regions', to: '/regions', title: 'لوکیشن‌ها', desc: 'استان‌ها و کشورها، شهر به شهر و لوکیشن به لوکیشن', icon: 'pin', tone: 'emerald', routeNames: ['regions-home', 'region-manage', 'region-detail'] },
  { id: 'trips', to: '/trips', title: 'سفرها', desc: 'برنامه سفر با تاریخ شمسی، مقاصد روزانه و گزارش سفر', icon: 'bag', tone: 'sky', routeNames: ['trip-list', 'trip-guide', 'trip-create', 'trip-destinations', 'trip-detail'] },
  { id: 'reports', to: '/reports', title: 'گزارشات', desc: 'آمار و تحلیل سفرها', icon: 'chart', tone: 'amber', routeNames: ['reports'] }
])

export var TONES = Object.freeze({
  brand: 'bg-brand-50 text-brand-600 dark:bg-brand-700/20 dark:text-brand-300',
  emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-300',
  sky: 'bg-sky-50 text-sky-600 dark:bg-sky-900/20 dark:text-sky-300',
  amber: 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-300'
})

export var HOME_CARDS = NAV_ITEMS.filter((item) => item.id !== 'home')

export function isNavActive(item, routeName) {
  return item.routeNames.includes(String(routeName ?? ''))
}
