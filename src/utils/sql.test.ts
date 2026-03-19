import { describe, it, expect } from 'vitest'
import { sqlFormat, sqlCompress, isValidSql } from './sql'

describe('sql utils', () => {
  // 测试 SQL 格式化
  describe('sqlFormat', () => {
    it('should format simple SELECT', () => {
      const input = "SELECT id, name FROM users"
      const output = sqlFormat(input)
      expect(output).toContain('SELECT')
      expect(output).toContain('FROM')
    })

    it('should format WHERE clause', () => {
      const input = "SELECT * FROM users WHERE age > 18"
      const output = sqlFormat(input)
      expect(output).toContain('\nWHERE')
    })

    it('should format JOIN', () => {
      const input = "SELECT * FROM users JOIN orders ON users.id = orders.user_id"
      const output = sqlFormat(input)
      expect(output).toContain('\nJOIN')
    })

    it('should format ORDER BY', () => {
      const input = "SELECT * FROM users ORDER BY name"
      const output = sqlFormat(input)
      expect(output).toContain('\nORDER BY')
    })

    it('should format GROUP BY', () => {
      const input = "SELECT COUNT(*) FROM users GROUP BY age"
      const output = sqlFormat(input)
      expect(output).toContain('\nGROUP BY')
    })
  })

  // 测试 SQL 压缩
  describe('sqlCompress', () => {
    it('should compress SQL', () => {
      const input = "SELECT  *  FROM  users"
      const output = sqlCompress(input)
      expect(output).toBe('SELECT * FROM users')
    })

    it('should remove single line comments', () => {
      const input = "SELECT * FROM users -- comment"
      const output = sqlCompress(input)
      expect(output).not.toContain('--')
    })

    it('should compress WHERE clause', () => {
      const input = "SELECT * FROM users WHERE age > 18"
      const output = sqlCompress(input)
      expect(output).toContain('SELECT * FROM users WHERE age > 18')
    })
  })

  // 测试 SQL 有效性验证
  describe('isValidSql', () => {
    it('should return true for SELECT', () => {
      expect(isValidSql('SELECT * FROM users')).toBe(true)
    })

    it('should return true for INSERT', () => {
      expect(isValidSql('INSERT INTO users VALUES (1, "张三")')).toBe(true)
    })

    it('should return true for UPDATE', () => {
      expect(isValidSql('UPDATE users SET name = "张三"')).toBe(true)
    })

    it('should return true for empty string', () => {
      expect(isValidSql('')).toBe(true)
    })

    it('should return false for plain text', () => {
      expect(isValidSql('Hello World')).toBe(false)
    })
  })
})
