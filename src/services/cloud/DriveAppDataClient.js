/**
 * REST Client for Google Drive appDataFolder in safar-ban.
 * Handles file listing, download, multipart upload, and version pruning.
 */
import { CLOUD_CONFIG } from './cloudConfig'
import { CloudSyncError } from './CloudSyncError'

var DRIVE_FILES_URL = 'https://www.googleapis.com/drive/v3/files'
var DRIVE_UPLOAD_URL = 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart'

export class DriveAppDataClient {
  constructor(authService) {
    this.authService = authService
  }

  async _fetchWithAuth(url, options = {}) {
    var token = await this.authService.getAccessToken(true)
    if (!token) {
      throw new CloudSyncError('AUTH_TOKEN_EXPIRED', 'اعتبار توکن منقضی شده است.')
    }

    var headers = new Headers(options.headers || {})
    headers.set('Authorization', `Bearer ${token}`)

    var response = await fetch(url, { ...options, headers })

    if (response.status === 401) {
      this.authService.clearLocalToken()
      token = await this.authService.getAccessToken(true)
      headers.set('Authorization', `Bearer ${token}`)
      response = await fetch(url, { ...options, headers })
    }

    if (response.status === 403) {
      var body = await response.text()
      if (/rateLimitExceeded|userRateLimitExceeded/i.test(body)) {
        throw new CloudSyncError('RATE_LIMITED', 'محدودیت تعداد درخواست گوگل.')
      }
      throw new CloudSyncError('DRIVE_PERMISSION_DENIED', 'دسترسی به Google Drive مجاز نیست.')
    }

    if (!response.ok) {
      var errText = await response.text()
      throw new CloudSyncError('DRIVE_API_ERROR', `خطای درایو (${response.status}): ${errText}`)
    }

    return response
  }

  async listBackups() {
    var prefix = CLOUD_CONFIG.fileNamePrefix
    var q = `'${CLOUD_CONFIG.appFolder}' in parents and trashed = false and name contains '${prefix}'`
    var params = new URLSearchParams({
      spaces: CLOUD_CONFIG.appFolder,
      q: q,
      fields: 'files(id, name, modifiedTime, size, appProperties, description)',
      orderBy: 'modifiedTime desc',
      pageSize: '30'
    })

    var response = await this._fetchWithAuth(`${DRIVE_FILES_URL}?${params.toString()}`)
    var data = await response.json()
    return (data.files || []).filter((f) => f.name.startsWith(prefix))
  }

  async downloadFile(fileId) {
    var response = await this._fetchWithAuth(`${DRIVE_FILES_URL}/${fileId}?alt=media`)
    return response.text()
  }

  async uploadNewBackup(fileName, jsonContent, metadata = {}) {
    var boundary = '-------314159265358979323846'
    var delimiter = `\r\n--${boundary}\r\n`
    var closeDelimiter = `\r\n--${boundary}--`

    var fileMetadata = {
      name: fileName,
      parents: [CLOUD_CONFIG.appFolder],
      mimeType: 'application/json',
      appProperties: {
        appName: CLOUD_CONFIG.appName,
        schemaVersion: String(metadata.schemaVersion || 1),
        isEncrypted: String(Boolean(metadata.isEncrypted)),
        checksum: metadata.checksum || ''
      }
    }

    var multipartBody =
      delimiter +
      'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
      JSON.stringify(fileMetadata) +
      delimiter +
      'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
      jsonContent +
      closeDelimiter

    var response = await this._fetchWithAuth(DRIVE_UPLOAD_URL, {
      method: 'POST',
      headers: {
        'Content-Type': `multipart/related; boundary=${boundary}`
      },
      body: multipartBody
    })

    return response.json()
  }

  async deleteFile(fileId) {
    await this._fetchWithAuth(`${DRIVE_FILES_URL}/${fileId}`, {
      method: 'DELETE'
    })
  }

  async pruneOldBackups(keepCount = CLOUD_CONFIG.keepVersions) {
    var backups = await this.listBackups()
    if (backups.length <= keepCount) return []

    var toDelete = backups.slice(keepCount)
    var deletedIds = []
    for (var file of toDelete) {
      try {
        await this.deleteFile(file.id)
        deletedIds.push(file.id)
      } catch (err) {
        console.warn(`Failed to prune backup ${file.id}`, err)
      }
    }
    return deletedIds
  }

  async deleteAllAppBackups() {
    var backups = await this.listBackups()
    for (var file of backups) {
      try {
        await this.deleteFile(file.id)
      } catch (err) {
        console.warn(`Failed to delete backup ${file.id}`, err)
      }
    }
  }
}
