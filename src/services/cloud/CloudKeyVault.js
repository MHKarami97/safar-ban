/**
 * Native IndexedDB storage for non-extractable CryptoKey and pre-restore rollback snapshot.
 */
import { CLOUD_CONFIG } from './cloudConfig'

var DB_NAME = CLOUD_CONFIG.dbName
var DB_VERSION = 1
var STORE_KEYS = 'keys'
var STORE_SNAPSHOTS = 'snapshots'
var KEY_DERIVED_SECRET = 'activeEncryptionKey'
var KEY_SALT = 'activeSalt'
var KEY_ROLLBACK_SNAPSHOT = 'preRestoreSnapshot'

export class CloudKeyVault {
  constructor() {
    this._dbPromise = null
  }

  _getDb() {
    if (this._dbPromise) return this._dbPromise

    this._dbPromise = new Promise((resolve, reject) => {
      var req = indexedDB.open(DB_NAME, DB_VERSION)
      req.onupgradeneeded = () => {
        var db = req.result
        if (!db.objectStoreNames.contains(STORE_KEYS)) {
          db.createObjectStore(STORE_KEYS)
        }
        if (!db.objectStoreNames.contains(STORE_SNAPSHOTS)) {
          db.createObjectStore(STORE_SNAPSHOTS)
        }
      }
      req.onsuccess = () => resolve(req.result)
      req.onerror = () => reject(req.error)
    })

    return this._dbPromise
  }

  async storeCryptoKey(cryptoKey, saltBuffer) {
    var db = await this._getDb()
    return new Promise((resolve, reject) => {
      var tx = db.transaction(STORE_KEYS, 'readwrite')
      var store = tx.objectStore(STORE_KEYS)
      store.put(cryptoKey, KEY_DERIVED_SECRET)
      store.put(saltBuffer, KEY_SALT)
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error)
    })
  }

  async getCryptoKey() {
    var db = await this._getDb()
    return new Promise((resolve, reject) => {
      var tx = db.transaction(STORE_KEYS, 'readonly')
      var store = tx.objectStore(STORE_KEYS)
      var req = store.get(KEY_DERIVED_SECRET)
      req.onsuccess = () => resolve(req.result || null)
      req.onerror = () => reject(req.error)
    })
  }

  async getSalt() {
    var db = await this._getDb()
    return new Promise((resolve, reject) => {
      var tx = db.transaction(STORE_KEYS, 'readonly')
      var store = tx.objectStore(STORE_KEYS)
      var req = store.get(KEY_SALT)
      req.onsuccess = () => resolve(req.result || null)
      req.onerror = () => reject(req.error)
    })
  }

  async clearCryptoKey() {
    var db = await this._getDb()
    return new Promise((resolve, reject) => {
      var tx = db.transaction(STORE_KEYS, 'readwrite')
      var store = tx.objectStore(STORE_KEYS)
      store.delete(KEY_DERIVED_SECRET)
      store.delete(KEY_SALT)
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error)
    })
  }

  async saveRollbackSnapshot(snapshot) {
    var db = await this._getDb()
    return new Promise((resolve, reject) => {
      var tx = db.transaction(STORE_SNAPSHOTS, 'readwrite')
      var store = tx.objectStore(STORE_SNAPSHOTS)
      store.put({ data: snapshot, savedAt: Date.now() }, KEY_ROLLBACK_SNAPSHOT)
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error)
    })
  }

  async getRollbackSnapshot() {
    var db = await this._getDb()
    return new Promise((resolve, reject) => {
      var tx = db.transaction(STORE_SNAPSHOTS, 'readonly')
      var store = tx.objectStore(STORE_SNAPSHOTS)
      var req = store.get(KEY_ROLLBACK_SNAPSHOT)
      req.onsuccess = () => resolve(req.result ? req.result.data : null)
      req.onerror = () => reject(req.error)
    })
  }

  async clearRollbackSnapshot() {
    var db = await this._getDb()
    return new Promise((resolve, reject) => {
      var tx = db.transaction(STORE_SNAPSHOTS, 'readwrite')
      var store = tx.objectStore(STORE_SNAPSHOTS)
      store.delete(KEY_ROLLBACK_SNAPSHOT)
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error)
    })
  }
}

export var cloudKeyVault = new CloudKeyVault()
