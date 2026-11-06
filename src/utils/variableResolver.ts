import type { Environment, VariableItem, ApiRequestItem } from '../types/apiClient'

/**
 * 构建变量字典（局部环境变量覆盖全局变量）
 */
export function buildVariableMap(
  activeEnv: Environment | null,
  globals: VariableItem[] = []
): Map<string, string> {
  const map = new Map<string, string>()

  // 1. 全局变量
  for (const item of globals) {
    if (item.enabled && item.key && item.key.trim()) {
      map.set(item.key.trim(), item.value)
    }
  }

  // 2. 当前环境局部变量（同名覆盖）
  if (activeEnv?.variables) {
    for (const item of activeEnv.variables) {
      if (item.enabled && item.key && item.key.trim()) {
        map.set(item.key.trim(), item.value)
      }
    }
  }

  return map
}

/**
 * 变量替换解析：将字符串中的 {{variable_name}} 替换为实际值
 * 支持嵌套引用（最多 5 层递归，防止死循环）
 */
export function resolveVariables(
  template: string,
  activeEnv: Environment | null,
  globals: VariableItem[] = [],
  maxDepth = 5
): string {
  if (!template || typeof template !== 'string') {
    return template || ''
  }

  const varMap = buildVariableMap(activeEnv, globals)
  if (varMap.size === 0) {
    return template
  }

  let result = template
  let depth = 0
  const regex = /\{\{\s*([\w.-]+)\s*\}\}/g

  while (depth < maxDepth && regex.test(result)) {
    regex.lastIndex = 0
    let hasReplaced = false

    result = result.replace(regex, (match, key) => {
      if (varMap.has(key)) {
        hasReplaced = true
        return varMap.get(key) ?? ''
      }
      return match
    })

    if (!hasReplaced) {
      break
    }
    depth++
  }

  return result
}

/**
 * 组装并解析完整请求信息（包含 URL 参数拼接、变量替换）
 */
export function resolveRequest(
  request: ApiRequestItem,
  activeEnv: Environment | null,
  globals: VariableItem[] = []
): {
  method: string
  url: string
  headers: { key: string; value: string; enabled: boolean }[]
  bodyType: string
  body: string
} {
  // 1. 解析基础 URL
  let resolvedUrl = resolveVariables(request.url.trim(), activeEnv, globals)

  // 2. 拼接 Query Params
  const enabledParams = (request.params || []).filter(
    (p) => p.enabled && p.key && p.key.trim()
  )

  if (enabledParams.length > 0) {
    const queryParts: string[] = []
    for (const p of enabledParams) {
      const k = encodeURIComponent(resolveVariables(p.key.trim(), activeEnv, globals))
      const v = encodeURIComponent(resolveVariables(p.value, activeEnv, globals))
      queryParts.push(`${k}=${v}`)
    }
    const queryString = queryParts.join('&')
    if (queryString) {
      const separator = resolvedUrl.includes('?') ? '&' : '?'
      resolvedUrl = `${resolvedUrl}${separator}${queryString}`
    }
  }

  // 3. 解析 Headers (只保留已启用且 key 非空的 headers)
  const resolvedHeaders = (request.headers || [])
    .filter((h) => h.enabled && h.key && h.key.trim())
    .map((h) => ({
      key: resolveVariables(h.key.trim(), activeEnv, globals),
      value: resolveVariables(h.value, activeEnv, globals),
      enabled: true
    }))

  // 4. 解析 Body
  let resolvedBody = ''
  if (request.bodyType === 'json' || request.bodyType === 'raw') {
    resolvedBody = resolveVariables(request.bodyRaw || '', activeEnv, globals)
  } else if (request.bodyType === 'x-www-form-urlencoded') {
    const enabledFormItems = (request.bodyUrlEncoded || []).filter(
      (item) => item.enabled && item.key && item.key.trim()
    )
    resolvedBody = enabledFormItems
      .map((item) => {
        const k = encodeURIComponent(resolveVariables(item.key.trim(), activeEnv, globals))
        const v = encodeURIComponent(resolveVariables(item.value, activeEnv, globals))
        return `${k}=${v}`
      })
      .join('&')
  }

  return {
    method: request.method,
    url: resolvedUrl,
    headers: resolvedHeaders,
    bodyType: request.bodyType,
    body: resolvedBody
  }
}

/**
 * 生成默认空白请求
 */
export function createDefaultRequest(name = '新接口'): ApiRequestItem {
  return {
    id: `req_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    name,
    method: 'GET',
    url: '',
    params: [
      { id: `param_${Date.now()}_1`, key: '', value: '', enabled: true, description: '' }
    ],
    headers: [
      { id: `header_${Date.now()}_1`, key: 'Accept', value: '*/*', enabled: true, description: '' }
    ],
    bodyType: 'none',
    bodyRaw: '',
    bodyUrlEncoded: [],
    updatedAt: Date.now()
  }
}
