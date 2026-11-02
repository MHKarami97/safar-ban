/**
 * Cloud sync domain constants and state definitions.
 */
export var CLOUD_STATUS = {
  DISCONNECTED: 'disconnected',
  IDLE: 'idle',
  SYNCING: 'syncing',
  SUCCESS: 'success',
  ERROR: 'error',
  NEEDS_RECONNECT: 'needs-reconnect',
  DECISION_PENDING: 'decision-pending'
}

export function createDefaultSyncState() {
  return {
    connected: false,
    userEmail: null,
    status: CLOUD_STATUS.DISCONNECTED,
    lastSuccessfulBackupTime: null,
    lastAttemptTime: null,
    lastError: null,
    notifyFailures: true,
    lastSyncedChecksum: null,
    encryptionEnabled: false,
    hasRollbackSnapshot: false,
    decision: null
  }
}
