/**
 * Serializer, deserializer, and schema validator for safar-ban backups.
 * Handles both plain-text JSON and AES-256-GCM encrypted envelopes.
 */
import { CLOUD_CONFIG } from './cloudConfig'
import {
  arrayBufferToBase64,
  base64ToArrayBuffer,
  computeSha256,
  decryptData,
  deriveKeyFromPassphrase,
  encryptData,
  stableStringify
} from './cloudCrypto'
import { CloudSyncError } from './CloudSyncError'

var SCHEMA_VERSION = 1
var ENCRYPTED_TYPE = 'safarban-encrypted-backup'

export class CloudBackupCodec {
  constructor(keyVault) {
    this.keyVault = keyVault
  }

  computeChecksum(appData) {
    var canonical = stableStringify(appData)
    return computeSha256(canonical)
  }

  async serialize(appData, cryptoKey = null) {
    var canonical = stableStringify(appData)
    var checksum = await computeSha256(canonical)

    if (cryptoKey) {
      var encrypted = await encryptData(canonical, cryptoKey)
      var salt = await this.keyVault.getSalt()
      var envelope = {
        type: ENCRYPTED_TYPE,
        schemaVersion: SCHEMA_VERSION,
        appName: CLOUD_CONFIG.appName,
        savedAt: new Date().toISOString(),
        algorithm: 'AES-GCM-256',
        kdf: 'PBKDF2-SHA256',
        iterations: CLOUD_CONFIG.pbkdf2Iterations,
        salt: salt ? arrayBufferToBase64(salt) : '',
        iv: encrypted.iv,
        cipherText: encrypted.cipherText,
        checksum: checksum
      }

      return {
        jsonText: JSON.stringify(envelope, null, 2),
        checksum: checksum,
        isEncrypted: true
      }
    }

    var plainPayload = {
      schemaVersion: SCHEMA_VERSION,
      appName: CLOUD_CONFIG.appName,
      savedAt: new Date().toISOString(),
      checksum: checksum,
      data: appData
    }

    return {
      jsonText: JSON.stringify(plainPayload, null, 2),
      checksum: checksum,
      isEncrypted: false
    }
  }

  async deserialize(rawJson, options = {}) {
    var parsed
    try {
      parsed = JSON.parse(rawJson)
    } catch (err) {
      throw new CloudSyncError('INVALID_BACKUP_SCHEMA', 'فایل پشتیبان معتبر نیست.', err)
    }

    if (parsed.type === ENCRYPTED_TYPE || parsed.cipherText) {
      return this._deserializeEncrypted(parsed, options)
    }

    return this._deserializePlain(parsed)
  }

  async _deserializePlain(parsed) {
    if (!parsed || !parsed.data) {
      throw new CloudSyncError('INVALID_BACKUP_SCHEMA', 'ساختار پشتیبان ابری نامعتبر است.')
    }

    var appData = parsed.data
    var checksum = parsed.checksum || (await this.computeChecksum(appData))
    var calculated = await this.computeChecksum(appData)

    if (checksum && checksum !== calculated) {
      throw new CloudSyncError('CHECKSUM_MISMATCH', 'چک‌سام فایل پشتیبان ابری همخوانی ندارد.')
    }

    return {
      appData: appData,
      isEncrypted: false,
      checksum: calculated,
      savedAt: parsed.savedAt || new Date().toISOString()
    }
  }

  async _deserializeEncrypted(parsed, options = {}) {
    var key = options.cryptoKey
    if (!key) {
      key = await this.keyVault.getCryptoKey()
    }

    if (!key && options.passphrase) {
      if (!parsed.salt) {
        throw new CloudSyncError('PASSPHRASE_INVALID', 'اطلاعات سالت در فایل رمزشده وجود ندارد.')
      }
      var saltBuf = base64ToArrayBuffer(parsed.salt)
      var iterations = parsed.iterations || CLOUD_CONFIG.pbkdf2Iterations
      key = await deriveKeyFromPassphrase(options.passphrase, saltBuf, iterations)
    }

    if (!key) {
      throw new CloudSyncError('PASSPHRASE_REQUIRED', 'برای رمزگشایی فایل ابری به گذرواژه نیاز است.')
    }

    var plainText
    try {
      plainText = await decryptData(parsed.cipherText, parsed.iv, key)
    } catch (err) {
      throw new CloudSyncError('PASSPHRASE_INVALID', 'رمزگشایی ناموفق بود؛ احتمال گذرواژه اشتباه است.', err)
    }

    var appData
    try {
      appData = JSON.parse(plainText)
    } catch (err) {
      throw new CloudSyncError('INVALID_BACKUP_SCHEMA', 'محتوای رمزگشایی‌شده معتبر نیست.', err)
    }

    var calculated = await this.computeChecksum(appData)
    if (parsed.checksum && parsed.checksum !== calculated) {
      throw new CloudSyncError('CHECKSUM_MISMATCH', 'چک‌سام محتوای رمزگشایی‌شده همخوانی ندارد.')
    }

    return {
      appData: appData,
      isEncrypted: true,
      checksum: calculated,
      savedAt: parsed.savedAt || new Date().toISOString()
    }
  }
}
