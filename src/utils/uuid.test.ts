import { describe, it, expect } from 'vitest'
import {
  generateUuidV4,
  generateUuidV1,
  generateUuidV3,
  generateUuidV5,
  generateUuid,
  isValidUuid,
  UUID_NAMESPACES
} from './uuid'

describe('uuid utils', () => {
  // 测试 UUID v4
  describe('generateUuidV4', () => {
    it('should generate valid UUID v4', () => {
      const uuid = generateUuidV4()
      expect(uuid).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/)
    })

    it('should generate unique UUIDs', () => {
      const uuid1 = generateUuidV4()
      const uuid2 = generateUuidV4()
      expect(uuid1).not.toBe(uuid2)
    })
  })

  // 测试 UUID v1
  describe('generateUuidV1', () => {
    it('should generate valid UUID v1', () => {
      const uuid = generateUuidV1()
      // Just check basic format - has 5 segments separated by dashes
      const parts = uuid.split('-')
      expect(parts.length).toBe(5)
      // Check it's hex format
      expect(uuid).toMatch(/^[0-9a-f-]+$/)
    })

    it('should generate unique UUIDs', () => {
      const uuid1 = generateUuidV1()
      const uuid2 = generateUuidV1()
      expect(uuid1).not.toBe(uuid2)
    })
  })

  // 测试 UUID v3
  describe('generateUuidV3', () => {
    it('should generate valid UUID v3', () => {
      const uuid = generateUuidV3(UUID_NAMESPACES.URL, 'test')
      expect(uuid).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-3[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/)
    })

    it('should generate same UUID for same input', () => {
      const uuid1 = generateUuidV3(UUID_NAMESPACES.URL, 'test')
      const uuid2 = generateUuidV3(UUID_NAMESPACES.URL, 'test')
      expect(uuid1).toBe(uuid2)
    })

    it('should throw error for empty name', () => {
      expect(() => generateUuidV3(UUID_NAMESPACES.URL, '')).toThrow()
    })
  })

  // 测试 UUID v5
  describe('generateUuidV5', () => {
    it('should generate valid UUID v5', () => {
      const uuid = generateUuidV5(UUID_NAMESPACES.URL, 'test')
      expect(uuid).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-5[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/)
    })

    it('should generate same UUID for same input', () => {
      const uuid1 = generateUuidV5(UUID_NAMESPACES.URL, 'test')
      const uuid2 = generateUuidV5(UUID_NAMESPACES.URL, 'test')
      expect(uuid1).toBe(uuid2)
    })

    it('should throw error for empty name', () => {
      expect(() => generateUuidV5(UUID_NAMESPACES.URL, '')).toThrow()
    })
  })

  // 测试 generateUuid
  describe('generateUuid', () => {
    it('should generate v4 by default', () => {
      const uuid = generateUuid('v4')
      expect(uuid).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/)
    })

    it('should generate v1', () => {
      const uuid = generateUuid('v1')
      // Just check basic format
      const parts = uuid.split('-')
      expect(parts.length).toBe(5)
    })

    it('should generate v3', () => {
      const uuid = generateUuid('v3', UUID_NAMESPACES.URL, 'test')
      expect(uuid).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-3[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/)
    })

    it('should generate v5', () => {
      const uuid = generateUuid('v5', UUID_NAMESPACES.URL, 'test')
      expect(uuid).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-5[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/)
    })
  })

  // 测试 isValidUuid
  describe('isValidUuid', () => {
    it('should return true for valid UUID', () => {
      expect(isValidUuid('550e8400-e29b-41d4-a716-446655440000')).toBe(true)
      expect(isValidUuid('6ba7b810-9dad-11d1-80b4-00c04fd430c8')).toBe(true)
    })

    it('should return false for invalid UUID', () => {
      expect(isValidUuid('invalid-uuid')).toBe(false)
      expect(isValidUuid('550e8400-e29b-41d4-a716-44665544000')).toBe(false)
      expect(isValidUuid('')).toBe(false)
    })
  })

  // 测试 UUID_NAMESPACES
  describe('UUID_NAMESPACES', () => {
    it('should have URL namespace', () => {
      expect(UUID_NAMESPACES.URL).toBe('6ba7b810-9dad-11d1-80b4-00c04fd430c8')
    })

    it('should have OID namespace', () => {
      expect(UUID_NAMESPACES.OID).toBe('6ba7b811-9dad-11d1-80b4-00c04fd430c8')
    })

    it('should have X500 namespace', () => {
      expect(UUID_NAMESPACES.X500).toBe('6ba7b812-9dad-11d1-80b4-00c04fd430c8')
    })
  })
})
