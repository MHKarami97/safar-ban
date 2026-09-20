import { storageService } from './StorageService'

/**
 * Facade Pattern: aggregates every domain repository's raw storage payload
 * into a single portable JSON file, and restores all of them back in one
 * shot. Storage-key based (not model based) so it always captures the
 * full app state regardless of which feature added new keys later.
 */
export class BackupService {
  static exportAll() {
    var payload = { app: 'safar-ban', exportedAt: new Date().toISOString(), data: {} }
    storageService.allKeys().forEach((fullKey) => {
      var shortKey = fullKey.replace(`${storageService.namespace}:`, '')
      payload.data[shortKey] = storageService.get(shortKey, null)
    })

    var blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
    var url = URL.createObjectURL(blob)
    var link = document.createElement('a')
    link.href = url
    link.download = `safarban-backup-${Date.now()}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  static async importAll(file) {
    var text = await file.text()
    var parsed = JSON.parse(text)
    if (!parsed || !parsed.data) throw new Error('فایل بکاپ نامعتبر است')

    Object.entries(parsed.data).forEach(([key, value]) => { storageService.set(key, value) })
    return true
  }
}
