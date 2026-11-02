/**
 * Structured errors for cloud synchronization operations in safar-ban.
 */
export class CloudSyncError extends Error {
  constructor(code, message, cause) {
    super(message)
    this.name = 'CloudSyncError'
    this.code = code
    this.cause = cause
  }
}

export function toUserMessage(error) {
  if (!error) return 'خطای نامشخص'
  if (error instanceof CloudSyncError) {
    switch (error.code) {
      case 'NETWORK_OFFLINE':
        return 'اتصال اینترنت برقرار نیست.'
      case 'AUTH_POPUP_BLOCKED':
        return 'پنجره ورود به گوگل توسط مرورگر مسدود شد. لطفاً به این سایت اجازه باز کردن پاپ‌آپ بدهید.'
      case 'AUTH_CANCELLED':
        return 'فرآیند ورود به حساب گوگل لغو شد.'
      case 'AUTH_TOKEN_EXPIRED':
        return 'اعتبار ورود شما منقضی شده است؛ لطفاً دوباره متصل شوید.'
      case 'DRIVE_PERMISSION_DENIED':
        return 'دسترسی به پوشه اختصاصی برنامه در Google Drive امکان‌پذیر نیست.'
      case 'PASSPHRASE_REQUIRED':
        return 'این فایل پشتیبان دارای رمز است. لطفاً گذرواژه را وارد کنید.'
      case 'PASSPHRASE_INVALID':
        return 'گذرواژه واردشده نادرست است یا فایل آسیب دیده است.'
      case 'CHECKSUM_MISMATCH':
        return 'یکپارچگی فایل پشتیبان تأیید نشد؛ احتمال خرابی داده در انتقال.'
      case 'INVALID_BACKUP_SCHEMA':
        return 'ساختار فایل پشتیبان با این نسخه از برنامه همخوانی ندارد.'
      case 'RATE_LIMITED':
        return 'درخواست‌های مکرر به سرور گوگل محدود شدند؛ لطفاً چند دقیقه بعد تلاش کنید.'
      default:
        return error.message || 'خطا در همگام‌سازی ابری.'
    }
  }
  if (typeof error === 'object' && error && 'message' in error) {
    var msg = String(error.message)
    if (/network|failed to fetch/i.test(msg)) {
      return 'خطا در برقراری ارتباط با سرور گوگل. لطفاً اتصال اینترنت خود را بررسی کنید.'
    }
    return msg
  }
  return String(error)
}
