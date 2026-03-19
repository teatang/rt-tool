// 正则表达式标志接口
export interface RegexFlags {
  g: boolean
  i: boolean
  m: boolean
}

/**
 * 获取正则表达式标志字符串
 */
export function getFlagString(flags: RegexFlags): string {
  return Object.entries(flags)
    .filter(([_, v]) => v)
    .map(([k]) => k)
    .join('')
}

/**
 * 测试正则表达式匹配
 */
export function testRegex(pattern: string, testString: string, flags: RegexFlags): {
  matches: string[]
  error: string
} {
  const matches: string[] = []
  let error = ''

  if (!pattern || !testString) {
    return { matches, error }
  }

  try {
    const flagStr = getFlagString(flags)
    const regex = new RegExp(pattern, flagStr)

    if (flags.g) {
      const results = testString.match(regex)
      if (results) {
        matches.push(...results)
      }
    } else {
      const match = testString.match(regex)
      if (match) {
        matches.push(match[0])
      }
    }
  } catch (e) {
    error = (e as Error).message
  }

  return { matches, error }
}

/**
 * 生成带高亮的 HTML
 */
export function highlightMatches(pattern: string, testString: string, flags: RegexFlags, hasError: boolean): string {
  if (!pattern || !testString || hasError) {
    return escapeHtml(testString)
  }

  try {
    const flagStr = getFlagString(flags)
    const regex = new RegExp(pattern, flagStr)

    const result = testString.replace(regex, (match) => {
      return `<mark class="highlight">${escapeHtml(match)}</mark>`
    })
    return result
  } catch {
    return escapeHtml(testString)
  }
}

/**
 * 转义 HTML 特殊字符
 */
export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/**
 * 验证正则表达式是否有效
 */
export function isValidRegex(pattern: string): boolean {
  try {
    new RegExp(pattern)
    return true
  } catch {
    return false
  }
}
