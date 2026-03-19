import CryptoJS from 'crypto-js'

/**
 * Base64 编码
 */
export function base64Encode(input: string): string {
  return CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(input))
}

/**
 * Base64 解码
 */
export function base64Decode(input: string): string {
  const decoded = CryptoJS.enc.Base64.parse(input)
  return CryptoJS.enc.Utf8.stringify(decoded)
}

/**
 * 检查是否为有效的 Base64 字符串
 */
export function isValidBase64(input: string): boolean {
  try {
    CryptoJS.enc.Base64.parse(input)
    return true
  } catch {
    return false
  }
}
