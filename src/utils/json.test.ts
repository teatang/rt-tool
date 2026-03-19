import { describe, it, expect } from 'vitest'
import { jsonFormat, jsonCompress, isValidJson, parseJson } from './json'

describe('json utils', () => {
  // 测试 JSON 格式化
  describe('jsonFormat', () => {
    it('should format JSON with default indent', () => {
      const input = '{"name":"张三","age":25}'
      const output = jsonFormat(input)
      expect(output).toBe('{\n  "name": "张三",\n  "age": 25\n}')
    })

    it('should format JSON with custom indent', () => {
      const input = '{"name":"张三","age":25}'
      const output = jsonFormat(input, 4)
      expect(output).toBe('{\n    "name": "张三",\n    "age": 25\n}')
    })

    it('should format nested JSON', () => {
      const input = '{"user":{"name":"张三","age":25}}'
      const output = jsonFormat(input)
      expect(output).toContain('"user"')
      expect(output).toContain('"name": "张三"')
    })

    it('should format JSON array', () => {
      const input = '[1,2,3]'
      const output = jsonFormat(input)
      expect(output).toBe('[\n  1,\n  2,\n  3\n]')
    })
  })

  // 测试 JSON 压缩
  describe('jsonCompress', () => {
    it('should compress JSON', () => {
      const input = '{"name":"张三","age":25}'
      const output = jsonCompress(input)
      expect(output).toBe('{"name":"张三","age":25}')
    })

    it('should compress nested JSON', () => {
      const input = '{\n  "user": {\n    "name": "张三"\n  }\n}'
      const output = jsonCompress(input)
      expect(output).toBe('{"user":{"name":"张三"}}')
    })
  })

  // 测试 JSON 有效性验证
  describe('isValidJson', () => {
    it('should return true for valid JSON', () => {
      expect(isValidJson('{"name":"张三"}')).toBe(true)
      expect(isValidJson('[1,2,3]')).toBe(true)
      expect(isValidJson('"string"')).toBe(true)
      expect(isValidJson('123')).toBe(true)
      expect(isValidJson('true')).toBe(true)
      expect(isValidJson('null')).toBe(true)
    })

    it('should return false for invalid JSON', () => {
      expect(isValidJson('{name:"张三"}')).toBe(false)
      expect(isValidJson('{name:}')).toBe(false)
      expect(isValidJson('')).toBe(false)
    })
  })

  // 测试 parseJson
  describe('parseJson', () => {
    it('should parse valid JSON', () => {
      const result = parseJson('{"name":"张三"}')
      expect(result.success).toBe(true)
      expect(result.data).toEqual({ name: '张三' })
    })

    it('should return error for invalid JSON', () => {
      const result = parseJson('{name}')
      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
    })
  })

  // 测试往返
  describe('roundtrip', () => {
    it('should format and compress correctly', () => {
      const original = '{"name":"张三","age":25,"city":"北京"}'
      const formatted = jsonFormat(original)
      const compressed = jsonCompress(formatted)
      expect(compressed).toBe(original)
    })
  })
})
