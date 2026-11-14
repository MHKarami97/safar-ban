export var CURRENCY_LABEL = 'تومان';

var numberFormat = new Intl.NumberFormat('fa-IR', { maximumFractionDigits: 1 });
var FA_DIGITS = '۰۱۲۳۴۵۶۷۸۹';

export function toFaDigits(text) {
  return String(text).replace(/\d/g, function (digit) { return FA_DIGITS[digit]; });
}

export function formatNumber(value) {
  return numberFormat.format(Number(value) || 0);
}

export function formatMoney(value) {
  return formatNumber(Math.round(Number(value) || 0)) + ' ' + CURRENCY_LABEL;
}

export function formatDays(value) {
  return formatNumber(value) + ' روز';
}

export function formatKm(value) {
  return formatNumber(Math.round(Number(value) || 0)) + ' کیلومتر';
}

export function formatPercent(value) {
  return formatNumber(Math.round(Number(value) || 0)) + '٪';
}

export function formatSigned(value) {
  var number = Number(value) || 0;
  if (number === 0) {
    return formatNumber(0);
  }
  return (number > 0 ? '+' : '−') + formatNumber(Math.abs(number));
}
