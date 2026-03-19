/**
 * 获取当前时间戳（秒）
 */
export function getCurrentTimestamp(): number {
  return Math.floor(Date.now() / 1000)
}

/**
 * 获取当前时间戳（毫秒）
 */
export function getCurrentTimestampMs(): number {
  return Date.now()
}

/**
 * 将时间戳转换为日期字符串
 * @param timestamp 时间戳（秒）
 * @param locale 语言代码 ('zh' | 'en')
 */
export function timestampToDate(timestamp: number | string, locale?: string): string {
  try {
    const ts = typeof timestamp === 'string' ? parseInt(timestamp) : timestamp
    const date = new Date(ts * 1000)
    return date.toLocaleString(locale === 'zh' ? 'zh-CN' : 'en-US')
  } catch {
    return 'Invalid timestamp'
  }
}

/**
 * 将日期字符串转换为时间戳
 * @param dateStr 日期字符串
 */
export function dateToTimestamp(dateStr: string): number | string {
  try {
    const date = new Date(dateStr)
    return Math.floor(date.getTime() / 1000)
  } catch {
    return 'Invalid date'
  }
}

/**
 * 格式化日期
 * @param date Date 对象或时间戳
 * @param locale 语言代码
 */
export function formatDate(date: Date | number, locale?: string): string {
  const d = typeof date === 'number' ? new Date(date) : date
  return d.toLocaleString(locale === 'zh' ? 'zh-CN' : 'en-US')
}

/**
 * 验证时间戳是否有效
 */
export function isValidTimestamp(timestamp: number | string): boolean {
  try {
    const ts = typeof timestamp === 'string' ? parseInt(timestamp) : timestamp
    return !isNaN(ts) && ts > 0
  } catch {
    return false
  }
}

/**
 * 验证日期字符串是否有效
 */
export function isValidDateString(dateStr: string): boolean {
  try {
    const date = new Date(dateStr)
    return !isNaN(date.getTime())
  } catch {
    return false
  }
}
