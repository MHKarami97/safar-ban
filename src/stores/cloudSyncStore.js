/**
 * Pinia store binding reactive cloud sync states to Vue components in safar-ban.
 */
import { defineStore } from 'pinia'
import { formatDateTimeFa } from '../services/cloud/cloudFormat'
import { cloudSyncService } from '../services/cloud'
import { googleIdentityLoader } from '../services/cloud/GoogleIdentityLoader'

export var useCloudSyncStore = defineStore('cloudSync', {
  state: () => ({
    snapshot: cloudSyncService.getState(),
    isPreloaded: false
  }),

  getters: {
    isConnected(state) {
      return state.snapshot.connected
    },
    isBusy(state) {
      return state.snapshot.status === 'syncing'
    },
    lastSuccessText(state) {
      return formatDateTimeFa(state.snapshot.lastSuccessfulBackupTime)
    },
    statusText(state) {
      switch (state.snapshot.status) {
        case 'disconnected':
          return 'قطع'
        case 'idle':
          return state.snapshot.connected ? 'متصل و آماده' : 'قطع'
        case 'syncing':
          return 'در حال همگام‌سازی...'
        case 'success':
          return 'همگام‌سازی موفق'
        case 'needs-reconnect':
          return 'نیاز به اتصال دوباره'
        case 'decision-pending':
          return 'در انتظار تصمیم کاربر'
        case 'error':
          return 'خطا در همگام‌سازی'
        default:
          return state.snapshot.status
      }
    },
    showFailureBar(state) {
      if (!state.snapshot.connected) return false
      if (!state.snapshot.notifyFailures) return false
      if (typeof navigator !== 'undefined' && !navigator.onLine) return false

      return (
        state.snapshot.status === 'needs-reconnect' ||
        (state.snapshot.status === 'error' && Boolean(state.snapshot.lastError))
      )
    },
    failureBarMessage(state) {
      if (state.snapshot.status === 'needs-reconnect') {
        return 'اعتبار اتصال به Google Drive منقضی شده است. اطلاعات هنوز همگام‌سازی نشده است.'
      }
      return state.snapshot.lastError || 'خطا در همگام‌سازی با Google Drive.'
    }
  },

  actions: {
    start() {
      cloudSyncService.subscribe((newSnapshot) => {
        this.snapshot = newSnapshot
      })
      void cloudSyncService.start()
    },

    preload() {
      if (this.isPreloaded) return
      this.isPreloaded = true
      void googleIdentityLoader.load().catch(() => {})
    },

    async connect() {
      await cloudSyncService.connect()
    },

    async disconnect(removeRemote = false) {
      await cloudSyncService.disconnect(removeRemote)
    },

    async backupNow() {
      await cloudSyncService.performBackup()
    },

    async resolveRestore(mode = 'replace', passphrase = '') {
      await cloudSyncService.resolveRestore(mode, passphrase)
    },

    async resolveKeepLocal() {
      await cloudSyncService.resolveKeepLocal()
    },

    dismissDecision() {
      cloudSyncService.dismissDecision()
    },

    reopenDecision() {
      cloudSyncService.reopenDecision()
    },

    async enableEncryption(passphrase) {
      await cloudSyncService.enableEncryption(passphrase)
    },

    async disableEncryption() {
      await cloudSyncService.disableEncryption()
    },

    async rollbackLastRestore() {
      await cloudSyncService.rollbackLastRestore()
    },

    setNotifyFailures(enabled) {
      cloudSyncService.setNotifyFailures(enabled)
    }
  }
})
