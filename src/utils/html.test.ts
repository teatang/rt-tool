import { describe, it, expect } from 'vitest'
import { htmlFormat, htmlCompress, isValidHtml } from './html'

describe('html utils', () => {
  // 测试 HTML 格式化
  describe('htmlFormat', () => {
    it('should format simple HTML', () => {
      const input = '<html><head></head><body></body></html>'
      const output = htmlFormat(input)
      expect(output).toContain('<html>')
      expect(output).toContain('<head>')
    })

    it('should format nested HTML', () => {
      const input = '<div><span>Hello</span></div>'
      const output = htmlFormat(input)
      expect(output).toContain('<div>')
      expect(output).toContain('<span>')
    })

    it('should handle empty tags', () => {
      const input = '<br/><hr/>'
      const output = htmlFormat(input)
      expect(output).toContain('<br/>')
      expect(output).toContain('<hr/>')
    })
  })

  // 测试 HTML 压缩
  describe('htmlCompress', () => {
    it('should compress HTML', () => {
      const input = '<html>\n  <head>\n  </head>\n</html>'
      const output = htmlCompress(input)
      expect(output).toBe('<html><head></head></html>')
    })

    it('should compress nested HTML', () => {
      const input = '<div>\n  <span>Hello</span>\n</div>'
      const output = htmlCompress(input)
      expect(output).toBe('<div><span>Hello</span></div>')
    })

    it('should remove whitespace between tags', () => {
      const input = '<div>  <span>Hello</span>  </div>'
      const output = htmlCompress(input)
      expect(output).toBe('<div><span>Hello</span></div>')
    })
  })

  // 测试 HTML 有效性验证
  describe('isValidHtml', () => {
    it('should return true for valid HTML', () => {
      expect(isValidHtml('<div></div>')).toBe(true)
      expect(isValidHtml('<html><body></body></html>')).toBe(true)
    })

    it('should return true for empty string', () => {
      expect(isValidHtml('')).toBe(true)
    })

    it('should return false for plain text', () => {
      expect(isValidHtml('Hello World')).toBe(false)
    })
  })
})
