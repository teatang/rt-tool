import { describe, it, expect } from 'vitest'
import { generateCurlCommand } from './curlGenerator'

describe('curlGenerator', () => {
  it('should generate basic GET curl command', () => {
    const curl = generateCurlCommand('GET', 'https://api.example.com/users')
    expect(curl).toBe("curl \\\n  'https://api.example.com/users'")
  })

  it('should generate POST curl command with headers and json body', () => {
    const curl = generateCurlCommand(
      'POST',
      'https://api.example.com/users',
      [
        { key: 'Authorization', value: 'Bearer 123456', enabled: true },
        { key: 'Disabled-Header', value: 'test', enabled: false }
      ],
      'json',
      '{"name": "Alice"}'
    )

    expect(curl).toContain("-X POST")
    expect(curl).toContain("'https://api.example.com/users'")
    expect(curl).toContain("-H 'Authorization: Bearer 123456'")
    expect(curl).not.toContain("Disabled-Header")
    expect(curl).toContain("-H 'Content-Type: application/json'")
    expect(curl).toContain("--data-raw '{\"name\": \"Alice\"}'")
  })

  it('should escape single quotes properly', () => {
    const curl = generateCurlCommand(
      'POST',
      'https://api.example.com/query',
      [],
      'raw',
      "it's a test"
    )
    expect(curl).toContain("'it'\\''s a test'")
  })
})
