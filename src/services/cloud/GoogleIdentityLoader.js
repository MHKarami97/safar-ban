/**
 * Lazy loader for Google Identity Services (GIS) client script.
 */
import { CloudSyncError } from './CloudSyncError'

var GIS_SRC = 'https://accounts.google.com/gsi/client'

export class GoogleIdentityLoader {
  constructor() {
    this._loadPromise = null
  }

  load() {
    if (typeof window === 'undefined') {
      return Promise.reject(new CloudSyncError('SSR_NOT_SUPPORTED', 'Google Identity can only be loaded in a browser environment.'))
    }

    if (window.google?.accounts?.oauth2) {
      return Promise.resolve(window.google)
    }

    if (this._loadPromise) {
      return this._loadPromise
    }

    this._loadPromise = new Promise((resolve, reject) => {
      var existing = document.querySelector(`script[src="${GIS_SRC}"]`)
      if (existing) {
        existing.addEventListener('load', () => resolve(window.google))
        existing.addEventListener('error', () => reject(new CloudSyncError('GIS_LOAD_FAILED', 'Failed to load Google Identity script.')))
        return
      }

      var script = document.createElement('script')
      script.src = GIS_SRC
      script.async = true
      script.defer = true
      script.onload = () => {
        if (window.google?.accounts?.oauth2) {
          resolve(window.google)
        } else {
          reject(new CloudSyncError('GIS_INIT_FAILED', 'Google Identity script loaded without oauth2.'))
        }
      }
      script.onerror = () => {
        this._loadPromise = null
        reject(new CloudSyncError('GIS_LOAD_FAILED', 'خطا در بارگذاری اسکریپت احراز هویت گوگل.'))
      }
      document.head.appendChild(script)
    })

    return this._loadPromise
  }
}

export var googleIdentityLoader = new GoogleIdentityLoader()
