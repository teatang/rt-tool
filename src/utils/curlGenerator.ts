/**
 * 转义 Shell 单引号字符串
 */
function escapeShellArg(arg: string): string {
  return `'${arg.replace(/'/g, `'\\''`)}'`
}

/**
 * 根据请求参数生成标准 cURL 命令
 */
export function generateCurlCommand(
  method: string,
  url: string,
  headers: { key: string; value: string; enabled?: boolean }[] = [],
  bodyType: string = 'none',
  body: string = ''
): string {
  const parts: string[] = ['curl']
  const upperMethod = (method || 'GET').toUpperCase()

  // 1. 请求方法
  if (upperMethod !== 'GET') {
    parts.push(`-X ${upperMethod}`)
  }

  // 2. 请求 URL
  parts.push(escapeShellArg(url || ''))

  // 3. 请求头
  for (const h of headers) {
    if (h.enabled !== false && h.key && h.key.trim()) {
      parts.push(`-H ${escapeShellArg(`${h.key.trim()}: ${h.value || ''}`)}`)
    }
  }

  // 4. 请求体
  if (bodyType !== 'none' && body && body.trim()) {
    if (bodyType === 'json') {
      const hasContentType = headers.some(
        (h) => h.enabled !== false && h.key.trim().toLowerCase() === 'content-type'
      )
      if (!hasContentType) {
        parts.push(`-H 'Content-Type: application/json'`)
      }
      parts.push(`--data-raw ${escapeShellArg(body)}`)
    } else if (bodyType === 'x-www-form-urlencoded') {
      const hasContentType = headers.some(
        (h) => h.enabled !== false && h.key.trim().toLowerCase() === 'content-type'
      )
      if (!hasContentType) {
        parts.push(`-H 'Content-Type: application/x-www-form-urlencoded'`)
      }
      parts.push(`--data ${escapeShellArg(body)}`)
    } else if (bodyType === 'raw') {
      parts.push(`--data-raw ${escapeShellArg(body)}`)
    }
  }

  return parts.join(' \\\n  ')
}
