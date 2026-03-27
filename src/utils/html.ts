/**
 * HTML 格式化
 */
export function htmlFormat(input: string): string {
  let formatted = input
    .replace(/></g, '>\n<')
    .replace(/^\s+/gm, '')
  return formatted.trim()
}

/**
 * HTML 压缩
 */
export function htmlCompress(input: string): string {
  let compressed = input
    .replace(/>\s+</g, '><')
    .replace(/\s+/g, ' ')
  return compressed.trim()
}

/**
 * 检查是否为有效的 HTML（简单检查）
 */
export function isValidHtml(input: string): boolean {
  // 空内容无效
  if (!input || input.trim().length === 0) {
    return false
  }

  // 检查是否有配对的标签
  const openTags = (input.match(/<[a-z][^>]*>/gi) || []).length
  const closeTags = (input.match(/<\/[a-z][^>]*>/gi) || []).length

  // 自闭合标签
  const selfClosingTags = (input.match(/<[a-z][^>]*\/>/gi) || []).length

  // 有效的 HTML 应该有开放标签，或者自闭合标签
  // 开放标签数量应该大于等于非自闭合的闭合标签数量
  const nonSelfClosingCloseTags = closeTags
  const effectiveOpenTags = openTags - selfClosingTags

  return effectiveOpenTags >= nonSelfClosingCloseTags && (effectiveOpenTags > 0 || selfClosingTags > 0)
}
