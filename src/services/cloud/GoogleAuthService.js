/**
 * Token manager using Google Identity Services (token model).
 * Manages short-lived OAuth2 access tokens and revocation.
 */
import { CLOUD_CONFIG } from './cloudConfig'
import { CloudSyncError } from './CloudSyncError'
import { googleIdentityLoader } from './GoogleIdentityLoader'

export class GoogleAuthService {
  constructor(clientId = CLOUD_CONFIG.clientId, scope = CLOUD_CONFIG.scope) {
    this.clientId = clientId
    this.scope = scope
    this.tokenClient = null
    this.accessToken = null
    this.tokenExpiresAt = 0
  }

  async init() {
    if (this.tokenClient) return
    var google = await googleIdentityLoader.load()
    this.tokenClient = google.accounts.oauth2.initTokenClient({
      client_id: this.clientId,
      scope: this.scope,
      callback: () => {}
    })
  }

  hasValidToken() {
    return Boolean(this.accessToken && Date.now() < this.tokenExpiresAt - 60000)
  }

  async requestToken(promptOption = '') {
    await this.init()

    return new Promise((resolve, reject) => {
      this.tokenClient.callback = (response) => {
        if (response.error) {
          if (response.error === 'access_denied') {
            reject(new CloudSyncError('AUTH_CANCELLED', 'ورود به حساب گوگل لغو شد.'))
          } else if (response.error === 'popup_blocked_by_browser') {
            reject(new CloudSyncError('AUTH_POPUP_BLOCKED', 'پنجره پاپ‌آپ توسط مرورگر مسدود شد.'))
          } else {
            reject(new CloudSyncError('AUTH_FAILED', response.error_description || response.error))
          }
          return
        }

        this.accessToken = response.access_token
        var expiresInSec = Number(response.expires_in) || 3599
        this.tokenExpiresAt = Date.now() + expiresInSec * 1000
        resolve(this.accessToken)
      }

      this.tokenClient.error_callback = (err) => {
        reject(new CloudSyncError('AUTH_FAILED', err?.message || 'خطا در احراز هویت گوگل.'))
      }

      try {
        this.tokenClient.requestAccessToken({
          prompt: promptOption
        })
      } catch (err) {
        reject(new CloudSyncError('AUTH_REQUEST_FAILED', 'درخواست توکن ناموفق بود.', err))
      }
    })
  }

  async getAccessToken(interactive = true) {
    if (this.hasValidToken()) {
      return this.accessToken
    }

    if (!interactive) {
      try {
        return await this.requestToken('none')
      } catch {
        return null
      }
    }

    return this.requestToken('')
  }

  async revoke() {
    var token = this.accessToken
    this.accessToken = null
    this.tokenExpiresAt = 0

    if (!token) return

    try {
      var google = await googleIdentityLoader.load()
      await new Promise((resolve) => {
        google.accounts.oauth2.revoke(token, () => resolve())
      })
    } catch (err) {
      console.warn('Revoke token failed', err)
    }
  }

  clearLocalToken() {
    this.accessToken = null
    this.tokenExpiresAt = 0
  }
}

export var googleAuthService = new GoogleAuthService()
