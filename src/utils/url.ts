/**
 * URL 编码
 */
export function urlEncode(input: string): string {
  return encodeURIComponent(input)
}

/**
 * URL 解码
 */
export function urlDecode(input: string): string {
  return decodeURIComponent(input)
}

/**
 * 检查是否为有效的 URL 编码字符串
 */
export function isValidUrlEncoded(input: string): boolean {
  try {
    decodeURIComponent(input)
    return true
  } catch {
    return false
  }
}
