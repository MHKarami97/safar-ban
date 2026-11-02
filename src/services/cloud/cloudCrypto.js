/**
 * Client-side cryptographic operations via Web Crypto API.
 * Uses PBKDF2 (600,000 iterations OWASP) + AES-GCM 256 + SHA-256.
 */
import { CLOUD_CONFIG } from './cloudConfig'

export function isCryptoSupported() {
  return typeof crypto !== 'undefined' && typeof crypto.subtle !== 'undefined'
}

export function arrayBufferToBase64(buffer) {
  var bytes = new Uint8Array(buffer)
  var binary = ''
  var len = bytes.byteLength
  for (var i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
}

export function base64ToArrayBuffer(base64) {
  var binary = atob(base64)
  var len = binary.length
  var bytes = new Uint8Array(len)
  for (var i = 0; i < len; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes.buffer
}

export async function computeSha256(content) {
  var encoder = new TextEncoder()
  var data = typeof content === 'string' ? encoder.encode(content) : new Uint8Array(content)
  var hashBuffer = await crypto.subtle.digest('SHA-256', data)
  var hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
}

export async function deriveKeyFromPassphrase(passphrase, saltBuffer, iterations = CLOUD_CONFIG.pbkdf2Iterations) {
  var encoder = new TextEncoder()
  var baseKey = await crypto.subtle.importKey(
    'raw',
    encoder.encode(passphrase),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  )

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: saltBuffer,
      iterations: iterations,
      hash: 'SHA-256'
    },
    baseKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  )
}

export async function encryptData(plainText, cryptoKey) {
  var iv = crypto.getRandomValues(new Uint8Array(12))
  var encoder = new TextEncoder()
  var cipherBuffer = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    cryptoKey,
    encoder.encode(plainText)
  )

  return {
    cipherText: arrayBufferToBase64(cipherBuffer),
    iv: arrayBufferToBase64(iv)
  }
}

export async function decryptData(cipherTextBase64, ivBase64, cryptoKey) {
  var cipherBuffer = base64ToArrayBuffer(cipherTextBase64)
  var iv = new Uint8Array(base64ToArrayBuffer(ivBase64))
  var plainBuffer = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    cryptoKey,
    cipherBuffer
  )
  var decoder = new TextDecoder()
  return decoder.decode(plainBuffer)
}

export function stableStringify(obj) {
  if (obj === null || typeof obj !== 'object') {
    return JSON.stringify(obj)
  }
  if (Array.isArray(obj)) {
    return '[' + obj.map(stableStringify).join(',') + ']'
  }
  var keys = Object.keys(obj).sort()
  var parts = keys.map((key) => JSON.stringify(key) + ':' + stableStringify(obj[key]))
  return '{' + parts.join(',') + '}'
}
