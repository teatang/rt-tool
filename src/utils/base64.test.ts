import { describe, it, expect } from 'vitest'
import { base64Encode, base64Decode, isValidBase64 } from './base64'

describe('base64 utils', () => {
  // 测试 Base64 编码
  describe('base64Encode', () => {
    it('should encode simple ASCII string', () => {
      expect(base64Encode('Hello')).toBe('SGVsbG8=')
    })

    it('should encode string with spaces', () => {
      expect(base64Encode('Hello World')).toBe('SGVsbG8gV29ybGQ=')
    })

    it('should encode Chinese characters', () => {
      expect(base64Encode('你好世界')).toBe('5L2g5aW95LiW55WM')
    })

    it('should encode empty string', () => {
      expect(base64Encode('')).toBe('')
    })
  })

  // 测试 Base64 解码
  describe('base64Decode', () => {
    it('should decode simple Base64 string', () => {
      expect(base64Decode('SGVsbG8=')).toBe('Hello')
    })

    it('should decode Base64 with spaces', () => {
      expect(base64Decode('SGVsbG8gV29ybGQ=')).toBe('Hello World')
    })

    it('should decode Chinese characters', () => {
      expect(base64Decode('5L2g5aW95LiW55WM')).toBe('你好世界')
    })

    it('should decode empty string', () => {
      expect(base64Decode('')).toBe('')
    })
  })

  // 测试编码解码的往返
  describe('roundtrip', () => {
    it('should encode and decode correctly', () => {
      const original = 'Hello World! 你好世界！'
      const encoded = base64Encode(original)
      const decoded = base64Decode(encoded)
      expect(decoded).toBe(original)
    })
  })

  // 测试 Base64 有效性验证
  describe('isValidBase64', () => {
    it('should return true for valid Base64', () => {
      expect(isValidBase64('SGVsbG8=')).toBe(true)
    })

    it('should return true for empty string', () => {
      expect(isValidBase64('')).toBe(true)
    })
  })
})
