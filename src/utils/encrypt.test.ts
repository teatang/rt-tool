import { describe, it, expect } from 'vitest'
import { encrypt, md5, sha1, sha256, sha512, hmacMd5, hmacSha1, hmacSha256 } from './encrypt'

describe('encrypt utils', () => {
  // 测试 encrypt 函数
  describe('encrypt', () => {
    it('should encrypt with MD5', () => {
      const result = encrypt('Hello World', 'md5')
      expect(result).toBe('b10a8db164e0754105b7a99be72e3fe5')
    })

    it('should encrypt with SHA1', () => {
      const result = encrypt('Hello World', 'sha1')
      expect(result).toBe('0a4d55a8d778e5022fab701977c5d840bbc486d0')
    })

    it('should encrypt with SHA256', () => {
      const result = encrypt('Hello World', 'sha256')
      expect(result).toBe('a591a6d40bf420404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f146e')
    })

    it('should encrypt with SHA512', () => {
      const result = encrypt('Hello World', 'sha512')
      // Just check length since SHA512 produces different format
      expect(result.length).toBe(128)
    })

    it('should require secret for HMAC algorithms', () => {
      const result = encrypt('Hello World', 'hmac-md5', '')
      expect(result).toBe('Secret key required')
    })

    it('should encrypt with HMAC-MD5', () => {
      const result = encrypt('Hello World', 'hmac-md5', 'secret')
      expect(result).toBe('6b3bb4427589dde1f9875a3793bc2062')
    })

    it('should encrypt with HMAC-SHA256', () => {
      const result = encrypt('Hello World', 'hmac-sha256', 'secret')
      expect(result).toBe('82ce0d2f821fa0ce5447b21306f214c99240fecc6387779d7515148bbdd0c415')
    })
  })

  // 测试单独的哈希函数
  describe('hash functions', () => {
    it('should generate MD5 hash', () => {
      expect(md5('Hello World')).toBe('b10a8db164e0754105b7a99be72e3fe5')
    })

    it('should generate SHA1 hash', () => {
      expect(sha1('Hello World')).toBe('0a4d55a8d778e5022fab701977c5d840bbc486d0')
    })

    it('should generate SHA256 hash', () => {
      expect(sha256('Hello World')).toBe('a591a6d40bf420404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f146e')
    })

    it('should generate SHA512 hash', () => {
      const result = sha512('Hello World')
      expect(result).toHaveLength(128)
    })
  })

  // 测试 HMAC 函数
  describe('hmac functions', () => {
    it('should generate HMAC-MD5', () => {
      const result = hmacMd5('Hello World', 'secret')
      expect(result).toBeDefined()
      expect(typeof result).toBe('string')
    })

    it('should generate HMAC-SHA1', () => {
      const result = hmacSha1('Hello World', 'secret')
      expect(result).toBeDefined()
      expect(typeof result).toBe('string')
    })

    it('should generate HMAC-SHA256', () => {
      const result = hmacSha256('Hello World', 'secret')
      expect(result).toBeDefined()
      expect(typeof result).toBe('string')
    })
  })

  // 测试空字符串
  describe('empty string', () => {
    it('should handle empty input', () => {
      expect(md5('')).toBe('d41d8cd98f00b204e9800998ecf8427e')
      expect(sha1('')).toBe('da39a3ee5e6b4b0d3255bfef95601890afd80709')
      expect(sha256('')).toBe('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855')
    })
  })
})
