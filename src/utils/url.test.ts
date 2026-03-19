import { describe, it, expect } from 'vitest'
import { urlEncode, urlDecode, isValidUrlEncoded } from './url'

describe('url utils', () => {
  // 测试 URL 编码
  describe('urlEncode', () => {
    it('should encode simple URL', () => {
      expect(urlEncode('https://example.com')).toBe('https%3A%2F%2Fexample.com')
    })

    it('should encode Chinese characters', () => {
      expect(urlEncode('你好世界')).toBe('%E4%BD%A0%E5%A5%BD%E4%B8%96%E7%95%8C')
    })

    it('should encode special characters', () => {
      expect(urlEncode('hello world')).toBe('hello%20world')
      expect(urlEncode('a=b&c=d')).toBe('a%3Db%26c%3Dd')
    })

    it('should encode empty string', () => {
      expect(urlEncode('')).toBe('')
    })
  })

  // 测试 URL 解码
  describe('urlDecode', () => {
    it('should decode simple URL', () => {
      expect(urlDecode('https%3A%2F%2Fexample.com')).toBe('https://example.com')
    })

    it('should decode Chinese characters', () => {
      expect(urlDecode('%E4%BD%A0%E5%A5%BD%E4%B8%96%E7%95%8C')).toBe('你好世界')
    })

    it('should decode special characters', () => {
      expect(urlDecode('hello%20world')).toBe('hello world')
      expect(urlDecode('a%3Db%26c%3Dd')).toBe('a=b&c=d')
    })

    it('should decode empty string', () => {
      expect(urlDecode('')).toBe('')
    })
  })

  // 测试编码解码的往返
  describe('roundtrip', () => {
    it('should encode and decode correctly', () => {
      const original = 'https://example.com/path?name=张三&age=25'
      const encoded = urlEncode(original)
      const decoded = urlDecode(encoded)
      expect(decoded).toBe(original)
    })
  })

  // 测试 URL 编码有效性验证
  describe('isValidUrlEncoded', () => {
    it('should return true for valid URL encoded string', () => {
      expect(isValidUrlEncoded('hello%20world')).toBe(true)
    })

    it('should return false for invalid URL encoded string', () => {
      // %ZZ is invalid
      expect(isValidUrlEncoded('hello%ZZ')).toBe(false)
    })

    it('should return true for empty string', () => {
      expect(isValidUrlEncoded('')).toBe(true)
    })
  })
})
