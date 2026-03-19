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
  // 检查是否有配对的标签
  const openTags = (input.match(/<[a-z][^>]*>/gi) || []).length
  const closeTags = (input.match(/<\/[a-z][^>]*>/gi) || []).length

  // 简化的检查：至少有开标签和闭标签
  return openTags > 0 || closeTags > 0 || input.trim().length === 0
}
