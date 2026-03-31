/**
 * SQL 格式化
 */
export function sqlFormat(input: string): string {
  let formatted = input
    .replace(/\s+/g, ' ')
    .replace(/\s*,\s*/g, ', ')
    .replace(/\s*\(\s*/g, ' (')
    .replace(/\s*\)\s*/g, ') ')
    .replace(/\bSELECT\b/gi, '\nSELECT')
    .replace(/\bFROM\b/gi, '\nFROM')
    .replace(/\bWHERE\b/gi, '\nWHERE')
    .replace(/\bAND\b/gi, '\n  AND')
    .replace(/\bOR\b/gi, '\n  OR')
    .replace(/\bJOIN\b/gi, '\nJOIN')
    .replace(/\bLEFT\b/gi, '\nLEFT')
    .replace(/\bRIGHT\b/gi, '\nRIGHT')
    .replace(/\bINNER\b/gi, '\nINNER')
    .replace(/\bOUTER\b/gi, '\nOUTER')
    .replace(/\bORDER BY\b/gi, '\nORDER BY')
    .replace(/\bGROUP BY\b/gi, '\nGROUP BY')
    .replace(/\bHAVING\b/gi, '\nHAVING')
    .replace(/\bLIMIT\b/gi, '\nLIMIT')
  return formatted.trim()
}

/**
 * SQL 压缩
 */
export function sqlCompress(input: string): string {
  let compressed = input
    .replace(/--.*$/gm, '') // Remove comments
    .replace(/\s+/g, ' ')
    .replace(/\s*,\s*/g, ',')
    .replace(/\s*\(\s*/g, '(')
    .replace(/\s*\)\s*/g, ')')
  return compressed.trim()
}

/**
 * 检查是否为有效的 SQL（简单检查）
 */
export function isValidSql(input: string): boolean {
  // 空内容视为有效（空 SQL 是有效的）
  if (!input || input.trim().length === 0) {
    return true
  }

  // 检查是否包含基本 SQL 关键字（需要与词边界匹配）
  const sqlPatterns = [
    /\bSELECT\b/i,
    /\bFROM\b/i,
    /\bWHERE\b/i,
    /\bINSERT\b/i,
    /\bUPDATE\b/i,
    /\bDELETE\b/i,
    /\bCREATE\b/i,
    /\bDROP\b/i,
    /\bALTER\b/i,
    /\bTABLE\b/i,
    /\bINDEX\b/i,
    /\bJOIN\b/i,
    /\bLEFT\b/i,
    /\bRIGHT\b/i,
    /\bINNER\b/i,
    /\bOUTER\b/i,
    /\bORDER\s+BY\b/i,
    /\bGROUP\s+BY\b/i,
    /\bHAVING\b/i,
    /\bLIMIT\b/i
  ]

  return sqlPatterns.some(pattern => pattern.test(input))
}
