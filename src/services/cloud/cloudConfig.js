/**
 * Configuration constants for Google Drive appDataFolder backup in safar-ban.
 */
var fallbackClientId = '627723972815-qrp35936cvbodbo2udkp4qeeh6sgoqms.apps.googleusercontent.com'

export var CLOUD_CONFIG = {
  clientId: (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_GOOGLE_CLIENT_ID) || fallbackClientId,
  scope: 'https://www.googleapis.com/auth/drive.appdata',
  appFolder: 'appDataFolder',
  appName: 'safar-ban',
  fileNamePrefix: 'safar-ban.backup.',
  keepVersions: 3,
  autoBackupDebounceMs: 15000,
  pbkdf2Iterations: 600000,
  minPassphraseLength: 8,
  dbName: 'SafarbanCloudDB',
  stateStorageKey: 'safar-ban:cloudSync:state'
}
