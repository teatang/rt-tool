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
  // 简单检查：是否包含 SQL 关键字
  const keywords = ['SELECT', 'FROM', 'WHERE', 'INSERT', 'UPDATE', 'DELETE', 'CREATE', 'DROP', 'ALTER']
  const upperInput = input.toUpperCase()
  return keywords.some(keyword => upperInput.includes(keyword)) || input.trim().length === 0
}
