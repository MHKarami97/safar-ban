/**
 * Jalali (Persian) <-> Gregorian calendar conversion.
 * Implements the astronomical algorithm (33-year break cycles),
 * the standard approach used across Persian-calendar libraries.
 * Pure functions only.
 */
var BREAKS = [-61, 9, 38, 199, 426, 686, 756, 818, 1111, 1181, 1210, 1635, 2060, 2097, 2192, 2262, 2324, 2394, 2456, 3178]

function div(a, b) { return ~~(a / b) }
function mod(a, b) { return a - ~~(a / b) * b }

function jalCal(jy) {
  var breaksLength = BREAKS.length
  var gy = jy + 621
  var leapJ = -14
  var jp = BREAKS[0]
  var jm, jump, leap, n, i

  for (i = 1; i < breaksLength; i += 1) {
    jm = BREAKS[i]
    jump = jm - jp
    if (jy < jm) break
    leapJ = leapJ + div(jump, 33) * 8 + div(mod(jump, 33), 4)
    jp = jm
  }

  n = jy - jp
  leapJ = leapJ + div(n, 33) * 8 + div(mod(n, 33) + 3, 4)
  if (mod(jump, 33) === 4 && jump - n === 4) leapJ += 1

  var leapG = div(gy, 4) - div((div(gy, 100) + 1) * 3, 4) - 150
  var march = 20 + leapJ - leapG

  if (jump - n < 6) n = n - jump + div(jump, 33) * 33
  leap = mod(mod(n + 1, 33) - 1, 4)
  if (leap === -1) leap = 4

  return { leap: leap, gy: gy, march: march }
}

function g2d(gy, gm, gd) {
  var d = div((gy + div(gm - 8, 6) + 100100) * 1461, 4) + div(153 * mod(gm + 9, 12) + 2, 5) + gd - 34840408
  d = d - div(div(gy + 100100 + div(gm - 8, 6), 100) * 3, 4) + 752
  return d
}

function d2g(jdn) {
  var j = 4 * jdn + 139361631
  j = j + div(div(4 * jdn + 183187720, 146097) * 3, 4) * 4 - 3908
  var i = div(mod(j, 1461), 4) * 5 + 308
  var gd = div(mod(i, 153), 5) + 1
  var gm = mod(div(i, 153), 12) + 1
  var gy = div(j, 1461) - 100100 + div(8 - gm, 6)
  return { gy: gy, gm: gm, gd: gd }
}

function j2d(jy, jm, jd) {
  var r = jalCal(jy)
  return g2d(r.gy, 3, r.march) + (jm - 1) * 31 - div(jm, 7) * (jm - 7) + jd - 1
}

function d2j(jdn) {
  var gy = d2g(jdn).gy
  var jy = gy - 621
  var r = jalCal(jy)
  var jdn1f = g2d(gy, 3, r.march)
  var jd, jm, k

  k = jdn - jdn1f
  if (k >= 0) {
    if (k <= 185) {
      jm = 1 + div(k, 31)
      jd = mod(k, 31) + 1
      return { jy: jy, jm: jm, jd: jd }
    }
    k -= 186
  } else {
    jy -= 1
    k += 179
    if (r.leap === 1) k += 1
  }
  jm = 7 + div(k, 30)
  jd = mod(k, 30) + 1
  return { jy: jy, jm: jm, jd: jd }
}

export function isLeapJalaliYear(jy) { return jalCal(jy).leap === 0 }

export function jalaliMonthLength(jy, jm) {
  if (jm <= 6) return 31
  if (jm <= 11) return 30
  return isLeapJalaliYear(jy) ? 30 : 29
}

export function toJalali(gy, gm, gd) { return d2j(g2d(gy, gm, gd)) }
export function toGregorian(jy, jm, jd) { return d2g(j2d(jy, jm, jd)) }

export function todayJalali() {
  var now = new Date()
  return toJalali(now.getFullYear(), now.getMonth() + 1, now.getDate())
}

var PAD = (n) => String(n).padStart(2, '0')

export function formatJalali(jy, jm, jd) { return `${jy}/${PAD(jm)}/${PAD(jd)}` }

export function parseJalali(text) {
  if (!text) return null
  var parts = String(text).split('/').map((p) => parseInt(p, 10))
  if (parts.length !== 3 || parts.some((p) => Number.isNaN(p))) return null
  return { jy: parts[0], jm: parts[1], jd: parts[2] }
}

/**
 * Adds `days` (can be negative) to a Jalali date, returning a new Jalali date.
 * Delegates day arithmetic to the native Date object via Gregorian conversion.
 */
export function addDaysJalali(jy, jm, jd, days) {
  var g = toGregorian(jy, jm, jd)
  var date = new Date(g.gy, g.gm - 1, g.gd)
  date.setDate(date.getDate() + days)
  return toJalali(date.getFullYear(), date.getMonth() + 1, date.getDate())
}

export var JALALI_MONTH_NAMES = [
  'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
  'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'
]

export function jalaliDateToLabel(jalaliStr) {
  var parsed = parseJalali(jalaliStr)
  if (!parsed) return ''
  return `${parsed.jd} ${JALALI_MONTH_NAMES[parsed.jm - 1]} ${parsed.jy}`
}
