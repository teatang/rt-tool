import { describe, it, expect } from 'vitest'
import {
  getCurrentTimestamp,
  getCurrentTimestampMs,
  timestampToDate,
  dateToTimestamp,
  formatDate,
  isValidTimestamp,
  isValidDateString
} from './timestamp'

describe('timestamp utils', () => {
  // 测试 getCurrentTimestamp
  describe('getCurrentTimestamp', () => {
    it('should return current timestamp in seconds', () => {
      const timestamp = getCurrentTimestamp()
      expect(timestamp).toBeGreaterThan(0)
      expect(timestamp).toBeLessThan(Date.now() / 1000 + 1)
    })
  })

  // 测试 getCurrentTimestampMs
  describe('getCurrentTimestampMs', () => {
    it('should return current timestamp in milliseconds', () => {
      const timestamp = getCurrentTimestampMs()
      expect(timestamp).toBeGreaterThan(0)
    })
  })

  // 测试 timestampToDate
  describe('timestampToDate', () => {
    it('should convert timestamp to date string', () => {
      // 2024-01-01 00:00:00 UTC = 1704067200
      const result = timestampToDate(1704067200, 'zh')
      expect(result).toContain('2024')
    })

    it('should handle string timestamp', () => {
      const result = timestampToDate('1704067200', 'en')
      expect(result).toContain('2024')
    })

    it('should handle negative timestamp', () => {
      const result = timestampToDate(-1, 'zh')
      // Negative timestamps are valid but represent dates before 1970
      expect(result).toContain('1970')
    })
  })

  // 测试 dateToTimestamp
  describe('dateToTimestamp', () => {
    it('should convert date string to timestamp', () => {
      const result = dateToTimestamp('2024-01-01 00:00:00')
      // Result depends on local timezone, just check it's a number
      expect(typeof result).toBe('number')
    })

    it('should return error for invalid date', () => {
      const result = dateToTimestamp('invalid-date')
      // JavaScript Date returns NaN for invalid dates
      expect(result).toBeNaN()
    })
  })

  // 测试 formatDate
  describe('formatDate', () => {
    it('should format date with Date object', () => {
      const date = new Date(1704067200000)
      const result = formatDate(date, 'zh')
      expect(result).toContain('2024')
    })

    it('should format date with timestamp', () => {
      const result = formatDate(1704067200000, 'en')
      expect(result).toContain('2024')
    })
  })

  // 测试 isValidTimestamp
  describe('isValidTimestamp', () => {
    it('should return true for valid timestamp', () => {
      expect(isValidTimestamp(1704067200)).toBe(true)
      expect(isValidTimestamp('1704067200')).toBe(true)
    })

    it('should return false for invalid timestamp', () => {
      expect(isValidTimestamp(-1)).toBe(false)
      expect(isValidTimestamp('abc')).toBe(false)
    })
  })

  // 测试 isValidDateString
  describe('isValidDateString', () => {
    it('should return true for valid date string', () => {
      expect(isValidDateString('2024-01-01')).toBe(true)
      expect(isValidDateString('2024-01-01 12:00:00')).toBe(true)
    })

    it('should return false for invalid date string', () => {
      expect(isValidDateString('invalid')).toBe(false)
      expect(isValidDateString('')).toBe(false)
    })
  })
})
