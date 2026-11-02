/**
 * Central orchestrator for Google Drive backup & restore in safar-ban.
 */
import { storageService } from '../StorageService'
import { CloudBackupCodec } from './CloudBackupCodec'
import { CLOUD_CONFIG } from './cloudConfig'
import { deriveKeyFromPassphrase, isCryptoSupported } from './cloudCrypto'
import { cloudKeyVault } from './CloudKeyVault'
import { CloudSyncError, toUserMessage } from './CloudSyncError'
import { CLOUD_STATUS } from '../../models/CloudSync'
import { cloudSyncStateStorage } from './CloudSyncStateStorage'
import { DriveAppDataClient } from './DriveAppDataClient'
import { googleAuthService } from './GoogleAuthService'
import { mergeSafarbanData } from './mergeSafarbanData'

export class CloudSyncService {
  constructor(options = {}) {
    this.authService = options.authService || googleAuthService
    this.driveClient = options.driveClient || new DriveAppDataClient(this.authService)
    this.keyVault = options.keyVault || cloudKeyVault
    this.stateStorage = options.stateStorage || cloudSyncStateStorage
    this.codec = options.codec || new CloudBackupCodec(this.keyVault)
    this.storage = options.storage || storageService

    this.state = this.stateStorage.load()
    this._listeners = []
    this._autoBackupTimeout = null
    this._isPerformingSync = false
    this._unsubscribeStorage = null
    this._onDataRestored = null
  }

  getState() {
    return { ...this.state }
  }

  subscribe(listener) {
    this._listeners.push(listener)
    listener(this.getState())
    return () => {
      this._listeners = this._listeners.filter((l) => l !== listener)
    }
  }

  _notify() {
    var snapshot = this.getState()
    this.stateStorage.save(snapshot)
    this._listeners.forEach((l) => {
      try {
        l(snapshot)
      } catch (err) {
        console.error('CloudSyncService listener error', err)
      }
    })
  }

  _patchState(patch) {
    this.state = { ...this.state, ...patch }
    this._notify()
  }

  setDataRestoredHandler(handler) {
    this._onDataRestored = handler
  }

  getLocalData() {
    var data = {}
    this.storage.allKeys().forEach((fullKey) => {
      var shortKey = fullKey.replace(`${this.storage.namespace}:`, '')
      if (shortKey.startsWith('cloudSync:')) return
      data[shortKey] = this.storage.get(shortKey, null)
    })
    return data
  }

  async applyRestoredData(data) {
    if (!data || typeof data !== 'object') return
    Object.entries(data).forEach(([shortKey, value]) => {
      if (shortKey.startsWith('cloudSync:')) return
      this.storage.set(shortKey, value)
    })
    if (this._onDataRestored) {
      await this._onDataRestored()
    }
  }

  countTotalItems(data) {
    if (!data || typeof data !== 'object') return 0
    var tripsCount = Array.isArray(data.trips) ? data.trips.length : 0
    var regionsCount = Array.isArray(data.regions) ? data.regions.length : 0
    return tripsCount + regionsCount
  }

  async start() {
    var hasRollback = Boolean(await this.keyVault.getRollbackSnapshot())
    var existingKey = await this.keyVault.getCryptoKey()
    this._patchState({
      hasRollbackSnapshot: hasRollback,
      encryptionEnabled: Boolean(existingKey)
    })

    if (this._unsubscribeStorage) {
      this._unsubscribeStorage()
    }
    this._unsubscribeStorage = this.storage.onChange(() => {
      this.scheduleAutoBackup()
    })

    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        if (this.state.connected) {
          this.scheduleAutoBackup(1000)
        }
      })

      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible' && this.state.connected) {
          this.scheduleAutoBackup(2000)
        }
      })
    }

    if (this.state.connected && typeof navigator !== 'undefined' && navigator.onLine) {
      void this.silentStartupCheck()
    }
  }

  async connect() {
    this._patchState({ status: CLOUD_STATUS.SYNCING, lastError: null })
    try {
      await this.authService.getAccessToken(true)
      this._patchState({
        connected: true,
        status: CLOUD_STATUS.IDLE,
        lastError: null
      })
      await this.syncCheckOnConnect()
    } catch (error) {
      this._patchState({
        status: CLOUD_STATUS.ERROR,
        lastError: toUserMessage(error)
      })
      throw error
    }
  }

  async disconnect(removeRemoteBackups = false) {
    this._patchState({ status: CLOUD_STATUS.SYNCING })
    try {
      if (removeRemoteBackups) {
        try {
          await this.driveClient.deleteAllAppBackups()
        } catch (err) {
          console.warn('Failed to delete remote backups on disconnect', err)
        }
      }

      await this.authService.revoke()
      await this.keyVault.clearCryptoKey()
      await this.keyVault.clearRollbackSnapshot()

      this._patchState({
        connected: false,
        status: CLOUD_STATUS.DISCONNECTED,
        lastError: null,
        lastSyncedChecksum: null,
        encryptionEnabled: false,
        hasRollbackSnapshot: false,
        decision: null
      })
    } catch (error) {
      this._patchState({
        status: CLOUD_STATUS.ERROR,
        lastError: toUserMessage(error)
      })
      throw error
    }
  }

  async silentStartupCheck() {
    try {
      var token = await this.authService.getAccessToken(false)
      if (!token) {
        this._patchState({ status: CLOUD_STATUS.NEEDS_RECONNECT })
        return
      }
      await this.syncCheckOnConnect()
    } catch {
      if (typeof navigator !== 'undefined' && navigator.onLine) {
        this._patchState({ status: CLOUD_STATUS.NEEDS_RECONNECT })
      }
    }
  }

  async syncCheckOnConnect() {
    try {
      this._patchState({ status: CLOUD_STATUS.SYNCING })
      var backups = await this.driveClient.listBackups()

      if (backups.length === 0) {
        await this.performBackup()
        return
      }

      var latest = backups[0]
      var localData = this.getLocalData()
      var localChecksum = await this.codec.computeChecksum(localData)
      var remoteChecksum = latest.appProperties?.checksum

      if (remoteChecksum && remoteChecksum === localChecksum) {
        this._patchState({
          status: CLOUD_STATUS.SUCCESS,
          lastSuccessfulBackupTime: latest.modifiedTime || new Date().toISOString(),
          lastSyncedChecksum: localChecksum,
          decision: null
        })
        return
      }

      var localItemCount = this.countTotalItems(localData)
      var isRemoteEncrypted = latest.appProperties?.isEncrypted === 'true'

      var remoteItemCount = localItemCount
      try {
        var rawJson = await this.driveClient.downloadFile(latest.id)
        var deserialized = await this.codec.deserialize(rawJson, {})
        remoteItemCount = this.countTotalItems(deserialized.appData)
      } catch {
        // Needs key or encrypted
      }

      var kind = 'newer-remote'
      if (localItemCount === 0 && remoteItemCount > 0) {
        kind = 'remote-only'
      } else if (this.state.lastSyncedChecksum && this.state.lastSyncedChecksum !== localChecksum) {
        kind = 'conflict'
      }

      this._patchState({
        status: CLOUD_STATUS.DECISION_PENDING,
        decision: {
          kind: kind,
          remote: latest,
          localItemsCount: localItemCount,
          remoteItemsCount: remoteItemCount,
          remoteEncrypted: isRemoteEncrypted,
          dismissed: false
        }
      })
    } catch (error) {
      this._patchState({
        status: CLOUD_STATUS.ERROR,
        lastError: toUserMessage(error)
      })
    }
  }

  scheduleAutoBackup(delayMs = CLOUD_CONFIG.autoBackupDebounceMs) {
    if (!this.state.connected) return
    if (this._autoBackupTimeout) {
      clearTimeout(this._autoBackupTimeout)
    }
    this._autoBackupTimeout = setTimeout(() => {
      void this.performBackup().catch((err) => {
        console.warn('Auto backup error', err)
      })
    }, delayMs)
  }

  async performBackup() {
    if (!this.state.connected) return
    if (this._isPerformingSync) return

    this._isPerformingSync = true
    this._patchState({ status: CLOUD_STATUS.SYNCING, lastAttemptTime: new Date().toISOString() })

    try {
      var localData = this.getLocalData()
      var cryptoKey = await this.keyVault.getCryptoKey()
      var serialized = await this.codec.serialize(localData, cryptoKey)

      if (this.state.lastSyncedChecksum && this.state.lastSyncedChecksum === serialized.checksum) {
        this._patchState({
          status: CLOUD_STATUS.SUCCESS,
          lastError: null
        })
        this._isPerformingSync = false
        return
      }

      var timestamp = new Date().toISOString().replace(/[:.]/g, '-')
      var fileName = `${CLOUD_CONFIG.fileNamePrefix}${timestamp}.json`

      await this.driveClient.uploadNewBackup(fileName, serialized.jsonText, {
        schemaVersion: 1,
        isEncrypted: serialized.isEncrypted,
        checksum: serialized.checksum
      })

      await this.driveClient.pruneOldBackups(CLOUD_CONFIG.keepVersions)

      this._patchState({
        status: CLOUD_STATUS.SUCCESS,
        lastSuccessfulBackupTime: new Date().toISOString(),
        lastSyncedChecksum: serialized.checksum,
        lastError: null,
        decision: null
      })
    } catch (error) {
      var status = CLOUD_STATUS.ERROR
      if (error instanceof CloudSyncError && error.code === 'AUTH_TOKEN_EXPIRED') {
        status = CLOUD_STATUS.NEEDS_RECONNECT
      }
      this._patchState({
        status: status,
        lastError: toUserMessage(error)
      })
      throw error
    } finally {
      this._isPerformingSync = false
    }
  }

  async resolveRestore(mode = 'replace', passphrase = '') {
    var decision = this.state.decision
    if (!decision) return

    this._patchState({ status: CLOUD_STATUS.SYNCING })

    try {
      var rawJson = await this.driveClient.downloadFile(decision.remote.id)
      var deserialized = await this.codec.deserialize(rawJson, { passphrase: passphrase })

      // اسنپ‌شات محلی جهت بازگشت در صورت نیاز (Rollback)
      var currentLocal = this.getLocalData()
      await this.keyVault.saveRollbackSnapshot(currentLocal)

      var finalData
      if (mode === 'merge') {
        finalData = mergeSafarbanData(currentLocal, deserialized.appData)
      } else {
        finalData = deserialized.appData
      }

      await this.applyRestoredData(finalData)

      var checksum = await this.codec.computeChecksum(finalData)
      this._patchState({
        status: CLOUD_STATUS.SUCCESS,
        lastSuccessfulBackupTime: new Date().toISOString(),
        lastSyncedChecksum: checksum,
        hasRollbackSnapshot: true,
        decision: null,
        lastError: null
      })

      await this.performBackup()
    } catch (error) {
      this._patchState({
        status: CLOUD_STATUS.ERROR,
        lastError: toUserMessage(error)
      })
      throw error
    }
  }

  async resolveKeepLocal() {
    this._patchState({ decision: null })
    await this.performBackup()
  }

  dismissDecision() {
    if (this.state.decision) {
      this._patchState({
        decision: { ...this.state.decision, dismissed: true },
        status: CLOUD_STATUS.IDLE
      })
    }
  }

  reopenDecision() {
    if (this.state.decision) {
      this._patchState({
        decision: { ...this.state.decision, dismissed: false },
        status: CLOUD_STATUS.DECISION_PENDING
      })
    }
  }

  async enableEncryption(passphrase) {
    if (!isCryptoSupported()) {
      throw new CloudSyncError('CRYPTO_UNSUPPORTED', 'مرورگر شما از Web Crypto پشتیبانی نمی‌کند.')
    }
    if (!passphrase || passphrase.length < CLOUD_CONFIG.minPassphraseLength) {
      throw new CloudSyncError('PASSPHRASE_TOO_SHORT', `گذرواژه باید حداقل ${CLOUD_CONFIG.minPassphraseLength} نویسه باشد.`)
    }

    var salt = crypto.getRandomValues(new Uint8Array(16))
    var key = await deriveKeyFromPassphrase(passphrase, salt)
    await this.keyVault.storeCryptoKey(key, salt.buffer)

    this._patchState({ encryptionEnabled: true })
    if (this.state.connected) {
      await this.performBackup()
    }
  }

  async disableEncryption() {
    await this.keyVault.clearCryptoKey()
    this._patchState({ encryptionEnabled: false })
    if (this.state.connected) {
      await this.performBackup()
    }
  }

  async rollbackLastRestore() {
    var snapshot = await this.keyVault.getRollbackSnapshot()
    if (!snapshot) {
      throw new CloudSyncError('NO_ROLLBACK', 'هیچ نسخه‌ای برای بازگردانی وجود ندارد.')
    }

    await this.applyRestoredData(snapshot)
    await this.keyVault.clearRollbackSnapshot()

    this._patchState({
      hasRollbackSnapshot: false,
      lastError: null
    })

    if (this.state.connected) {
      await this.performBackup()
    }
  }

  setNotifyFailures(enabled) {
    this._patchState({ notifyFailures: Boolean(enabled) })
  }
}

export var cloudSyncService = new CloudSyncService()
