import type { KeyValueItem } from '../types/apiClient'

/**
 * 安全 URL 解码，防止非法编码导致 URIError 崩溃
 */
export function safeDecode(str: string): string {
  if (!str) return ''
  try {
    return decodeURIComponent(str)
  } catch {
    return str
  }
}

/**
 * 解析 Query String 为键值对列表
 * 支持 ?a=1&b=2 或 a=1&b=2 形式，支持变量占位符 {{var}}
 */
export function parseQueryParams(queryString: string): KeyValueItem[] {
  if (!queryString || !queryString.trim()) {
    return []
  }

  let clean = queryString.trim()
  if (clean.startsWith('?')) {
    clean = clean.slice(1)
  }

  // 截断 Hash 部分
  const hashIdx = clean.indexOf('#')
  if (hashIdx !== -1) {
    clean = clean.slice(0, hashIdx)
  }

  if (!clean) return []

  const pairs = clean.split('&')
  const items: KeyValueItem[] = []

  for (let i = 0; i < pairs.length; i++) {
    const pair = pairs[i]
    if (!pair) continue

    const eqIdx = pair.indexOf('=')
    let rawKey = ''
    let rawVal = ''

    if (eqIdx !== -1) {
      rawKey = pair.slice(0, eqIdx)
      rawVal = pair.slice(eqIdx + 1)
    } else {
      rawKey = pair
      rawVal = ''
    }

    const key = safeDecode(rawKey)
    const value = safeDecode(rawVal)

    items.push({
      id: `param_${Date.now()}_${i}_${Math.random().toString(36).slice(2, 5)}`,
      key,
      value,
      enabled: true,
      description: ''
    })
  }

  return items
}

/**
 * 从完整 URL 中提取 Base URL 和 Query Params
 */
export function extractUrlBaseAndParams(fullUrl: string): {
  baseUrl: string
  params: KeyValueItem[]
  hasQuery: boolean
} {
  if (!fullUrl) {
    return { baseUrl: '', params: [], hasQuery: false }
  }

  const qIdx = fullUrl.indexOf('?')
  if (qIdx === -1) {
    return { baseUrl: fullUrl, params: [], hasQuery: false }
  }

  const baseUrl = fullUrl.slice(0, qIdx)
  const queryString = fullUrl.slice(qIdx + 1)
  const params = parseQueryParams(queryString)

  return { baseUrl, params, hasQuery: true }
}

/**
 * 当 URL 发生变动时，合并提取的参数与现有参数（保留已有描述、ID及未修改属性）
 */
export function mergeParamsWithExisting(
  parsedParams: KeyValueItem[],
  existingParams: KeyValueItem[] = []
): KeyValueItem[] {
  if (parsedParams.length === 0) {
    return [
      {
        id: `param_${Date.now()}_default`,
        key: '',
        value: '',
        enabled: true,
        description: ''
      }
    ]
  }

  const result: KeyValueItem[] = []
  const usedExisting = new Set<string>()

  for (const parsed of parsedParams) {
    // 优先匹配未使用的同名现存项以保留其 description
    const matchedExisting = existingParams.find(
      (e) => e.key === parsed.key && !usedExisting.has(e.id)
    )

    if (matchedExisting) {
      usedExisting.add(matchedExisting.id)
      result.push({
        ...matchedExisting,
        value: parsed.value,
        enabled: true
      })
    } else {
      result.push(parsed)
    }
  }

  // 追加一行空的编辑辅助行
  result.push({
    id: `param_${Date.now()}_new`,
    key: '',
    value: '',
    enabled: true,
    description: ''
  })

  return result
}

/**
 * 根据 Base URL 与当前参数列表构建完整 URL
 */
export function buildUrlWithParams(baseUrl: string, params: KeyValueItem[]): string {
  const cleanBase = (baseUrl || '').split('?')[0]
  const enabledParams = (params || []).filter((p) => p.enabled && p.key.trim() !== '')

  if (enabledParams.length === 0) {
    return cleanBase
  }

  const parts = enabledParams.map((p) => {
    return `${p.key.trim()}=${p.value}`
  })

  return `${cleanBase}?${parts.join('&')}`
}

/**
 * 将 x-www-form-urlencoded 字符串解析为 KeyValueItem 列表
 */
export function parseFormUrlEncoded(bodyStr: string): KeyValueItem[] {
  return parseQueryParams(bodyStr)
}
