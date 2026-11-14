import { toGregorian, toJalali, isLeapJalaliYear } from './jalali.js';

var MS_PER_DAY = 86400000;
var UNIX_EPOCH_WEEKDAY_FROM_SATURDAY = 5;

export var MONTH_NAMES = [
  'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
  'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'
];
export var SEASON_NAMES = ['بهار', 'تابستان', 'پاییز', 'زمستان'];
export var WEEKDAY_NAMES = ['شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه'];

export function jalaliToDayNumber(jy, jm, jd) {
  var g = toGregorian(jy, jm, jd);
  return Math.floor(Date.UTC(g.gy, g.gm - 1, g.gd) / MS_PER_DAY);
}

export function dayNumberToJalali(dayNumber) {
  var date = new Date(dayNumber * MS_PER_DAY);
  return toJalali(date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate());
}

export function weekdayIndex(dayNumber) {
  return (((dayNumber + UNIX_EPOCH_WEEKDAY_FROM_SATURDAY) % 7) + 7) % 7;
}

export function seasonIndex(jalaliMonth) {
  return Math.floor((jalaliMonth - 1) / 3);
}

export function daysInJalaliYear(jy) {
  return isLeapJalaliYear(jy) ? 366 : 365;
}

export function formatJalaliLabel(date) {
  return date.jd + ' ' + MONTH_NAMES[date.jm - 1] + ' ' + date.jy;
}
