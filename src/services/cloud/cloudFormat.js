/**
 * Jalali / Persian date and time formatting utilities for safar-ban.
 */
export function formatDateTimeFa(isoStringOrTimestamp) {
  if (!isoStringOrTimestamp) return ''
  try {
    var date = new Date(isoStringOrTimestamp)
    if (isNaN(date.getTime())) return ''
    return new Intl.DateTimeFormat('fa-IR-u-ca-persian', {
      dateStyle: 'medium',
      timeStyle: 'short'
    }).format(date)
  } catch {
    return String(isoStringOrTimestamp)
  }
}
