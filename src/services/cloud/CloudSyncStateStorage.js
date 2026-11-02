/**
 * Local persistence for cloud synchronization metadata in safar-ban.
 */
import { createDefaultSyncState } from '../../models/CloudSync'
import { CLOUD_CONFIG } from './cloudConfig'

export class CloudSyncStateStorage {
  constructor(storageKey = CLOUD_CONFIG.stateStorageKey) {
    this.storageKey = storageKey
  }

  load() {
    try {
      var raw = localStorage.getItem(this.storageKey)
      if (!raw) return createDefaultSyncState()
      var parsed = JSON.parse(raw)
      return { ...createDefaultSyncState(), ...parsed }
    } catch {
      return createDefaultSyncState()
    }
  }

  save(state) {
    try {
      var toSave = {
        connected: state.connected,
        userEmail: state.userEmail,
        status: state.status,
        lastSuccessfulBackupTime: state.lastSuccessfulBackupTime,
        lastAttemptTime: state.lastAttemptTime,
        lastError: state.lastError,
        notifyFailures: state.notifyFailures,
        lastSyncedChecksum: state.lastSyncedChecksum,
        encryptionEnabled: state.encryptionEnabled,
        hasRollbackSnapshot: state.hasRollbackSnapshot,
        decision: state.decision ? { ...state.decision, dismissed: Boolean(state.decision.dismissed) } : null
      }
      localStorage.setItem(this.storageKey, JSON.stringify(toSave))
    } catch (err) {
      console.warn('Failed to save cloud sync state', err)
    }
  }

  clear() {
    localStorage.removeItem(this.storageKey)
  }
}

export var cloudSyncStateStorage = new CloudSyncStateStorage()
