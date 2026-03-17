import { describe, it, expect } from 'vitest'
import CryptoJS from 'crypto-js'

describe('Base64 Tools', () => {
  it('should encode to base64', () => {
    const result = CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse('Hello'))
    expect(result).toBe('SGVsbG8=')
  })

  it('should decode from base64', () => {
    const decoded = CryptoJS.enc.Base64.parse('SGVsbG8=')
    expect(CryptoJS.enc.Utf8.stringify(decoded)).toBe('Hello')
  })
})

describe('UUID Generator', () => {
  it('should generate valid UUID format', () => {
    const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0
      const v = c === 'x' ? r : (r & 0x3) | 0x8
      return v.toString(16)
    })
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    expect(uuid).toMatch(uuidRegex)
  })
})

describe('JSON Tools', () => {
  it('should format JSON', () => {
    const obj = { name: 'test', value: 123 }
    const formatted = JSON.stringify(obj, null, 2)
    expect(formatted).toContain('\n')
  })

  it('should compress JSON', () => {
    const obj = { name: 'test', value: 123 }
    const compressed = JSON.stringify(obj)
    expect(compressed).toBe('{"name":"test","value":123}')
  })
})
