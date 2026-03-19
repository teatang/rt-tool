import CryptoJS from 'crypto-js'

// 加密算法类型
export type EncryptionAlgorithm =
  | 'md5'
  | 'sha1'
  | 'sha256'
  | 'sha512'
  | 'hmac-md5'
  | 'hmac-sha1'
  | 'hmac-sha256'

/**
 * 使用指定算法加密
 */
export function encrypt(input: string, algorithm: EncryptionAlgorithm, secret: string = ''): string {
  switch (algorithm) {
    case 'md5':
      return CryptoJS.MD5(input).toString()
    case 'sha1':
      return CryptoJS.SHA1(input).toString()
    case 'sha256':
      return CryptoJS.SHA256(input).toString()
    case 'sha512':
      return CryptoJS.SHA512(input).toString()
    case 'hmac-md5':
      if (!secret) {
        return 'Secret key required'
      }
      return CryptoJS.HmacMD5(input, secret).toString()
    case 'hmac-sha1':
      if (!secret) {
        return 'Secret key required'
      }
      return CryptoJS.HmacSHA1(input, secret).toString()
    case 'hmac-sha256':
      if (!secret) {
        return 'Secret key required'
      }
      return CryptoJS.HmacSHA256(input, secret).toString()
    default:
      throw new Error(`Unknown algorithm: ${algorithm}`)
  }
}

/**
 * MD5 加密
 */
export function md5(input: string): string {
  return CryptoJS.MD5(input).toString()
}

/**
 * SHA1 加密
 */
export function sha1(input: string): string {
  return CryptoJS.SHA1(input).toString()
}

/**
 * SHA256 加密
 */
export function sha256(input: string): string {
  return CryptoJS.SHA256(input).toString()
}

/**
 * SHA512 加密
 */
export function sha512(input: string): string {
  return CryptoJS.SHA512(input).toString()
}

/**
 * HMAC-MD5 加密
 */
export function hmacMd5(input: string, secret: string): string {
  return CryptoJS.HmacMD5(input, secret).toString()
}

/**
 * HMAC-SHA1 加密
 */
export function hmacSha1(input: string, secret: string): string {
  return CryptoJS.HmacSHA1(input, secret).toString()
}

/**
 * HMAC-SHA256 加密
 */
export function hmacSha256(input: string, secret: string): string {
  return CryptoJS.HmacSHA256(input, secret).toString()
}
