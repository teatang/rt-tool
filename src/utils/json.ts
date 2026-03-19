/**
 * JSON 格式化
 */
export function jsonFormat(input: string, indent: number = 2): string {
  const parsed = JSON.parse(input)
  return JSON.stringify(parsed, null, indent)
}

/**
 * JSON 压缩
 */
export function jsonCompress(input: string): string {
  const parsed = JSON.parse(input)
  return JSON.stringify(parsed)
}

/**
 * 检查是否为有效的 JSON
 */
export function isValidJson(input: string): boolean {
  try {
    JSON.parse(input)
    return true
  } catch {
    return false
  }
}

/**
 * 解析 JSON 返回结果
 */
export function parseJson(input: string): { success: boolean; data?: unknown; error?: string } {
  try {
    const data = JSON.parse(input)
    return { success: true, data }
  } catch (e) {
    return { success: false, error: (e as Error).message }
  }
}
