import { describe, it, expect } from 'vitest'
import { getFlagString, testRegex, highlightMatches, escapeHtml, isValidRegex } from './regex'

describe('regex utils', () => {
  // 测试 getFlagString
  describe('getFlagString', () => {
    it('should return empty string for all false flags', () => {
      expect(getFlagString({ g: false, i: false, m: false })).toBe('')
    })

    it('should return g for global flag', () => {
      expect(getFlagString({ g: true, i: false, m: false })).toBe('g')
    })

    it('should return gi for global and case insensitive', () => {
      expect(getFlagString({ g: true, i: true, m: false })).toBe('gi')
    })

    it('should return gim for all flags', () => {
      expect(getFlagString({ g: true, i: true, m: true })).toBe('gim')
    })
  })

  // 测试 testRegex
  describe('testRegex', () => {
    it('should match digits', () => {
      const result = testRegex('\\d+', 'Hello123World456', { g: true, i: false, m: false })
      expect(result.matches).toEqual(['123', '456'])
      expect(result.error).toBe('')
    })

    it('should match with case insensitive', () => {
      const result = testRegex('hello', 'Hello HELLO hello', { g: true, i: true, m: false })
      expect(result.matches).toEqual(['Hello', 'HELLO', 'hello'])
    })

    it('should return error for invalid pattern', () => {
      const result = testRegex('[', 'test', { g: true, i: false, m: false })
      expect(result.matches).toEqual([])
      expect(result.error).toBeDefined()
    })

    it('should match only first when global is false', () => {
      const result = testRegex('\\d+', 'Hello123World456', { g: false, i: false, m: false })
      expect(result.matches).toEqual(['123'])
    })

    it('should return empty for no match', () => {
      const result = testRegex('\\d+', 'HelloWorld', { g: true, i: false, m: false })
      expect(result.matches).toEqual([])
    })
  })

  // 测试 highlightMatches
  describe('highlightMatches', () => {
    it('should highlight matches in text', () => {
      const result = highlightMatches('\\d+', 'Hello123World456', { g: true, i: false, m: false }, false)
      expect(result).toContain('<mark class="highlight">123</mark>')
      expect(result).toContain('<mark class="highlight">456</mark>')
    })

    it('should escape HTML in matched text', () => {
      const result = highlightMatches('.+', 'a < b', { g: false, i: false, m: false }, false)
      expect(result).toContain('&lt;')
    })

    it('should return escaped text when pattern is empty', () => {
      const result = highlightMatches('', 'Hello <World>', { g: true, i: false, m: false }, false)
      expect(result).toBe('Hello &lt;World&gt;')
    })

    it('should return escaped text when has error', () => {
      const result = highlightMatches('[', 'Hello', { g: true, i: false, m: false }, true)
      expect(result).toBe('Hello')
    })
  })

  // 测试 escapeHtml
  describe('escapeHtml', () => {
    it('should escape HTML special characters', () => {
      expect(escapeHtml('<div>')).toBe('&lt;div&gt;')
      expect(escapeHtml('a & b')).toBe('a &amp; b')
      expect(escapeHtml('"quoted"')).toBe('&quot;quoted&quot;')
    })

    it('should handle empty string', () => {
      expect(escapeHtml('')).toBe('')
    })
  })

  // 测试 isValidRegex
  describe('isValidRegex', () => {
    it('should return true for valid patterns', () => {
      expect(isValidRegex('\\d+')).toBe(true)
      expect(isValidRegex('[a-z]+')).toBe(true)
      expect(isValidRegex('^hello$')).toBe(true)
    })

    it('should return false for invalid patterns', () => {
      expect(isValidRegex('[')).toBe(false)
      expect(isValidRegex('(')).toBe(false)
    })
  })
})
