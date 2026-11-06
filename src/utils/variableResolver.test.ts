import { describe, it, expect } from 'vitest'
import {
  buildVariableMap,
  resolveVariables,
  resolveRequest,
  createDefaultRequest
} from './variableResolver'
import type { Environment, VariableItem, ApiRequestItem } from '../types/apiClient'

describe('variableResolver utils', () => {
  const globals: VariableItem[] = [
    { id: '1', key: 'baseUrl', value: 'https://api.example.com', enabled: true },
    { id: '2', key: 'token', value: 'global_token_123', enabled: true },
    { id: '3', key: 'version', value: 'v1', enabled: true },
    { id: '4', key: 'disabledVar', value: 'disabled', enabled: false }
  ]

  const devEnv: Environment = {
    id: 'env_dev',
    name: '开发环境',
    variables: [
      { id: 'e1', key: 'baseUrl', value: 'http://localhost:3000', enabled: true },
      { id: 'e2', key: 'envName', value: 'dev', enabled: true }
    ]
  }

  it('buildVariableMap should override global with environment variable', () => {
    const map = buildVariableMap(devEnv, globals)
    expect(map.get('baseUrl')).toBe('http://localhost:3000') // overridden by dev
    expect(map.get('token')).toBe('global_token_123') // inherited from global
    expect(map.get('envName')).toBe('dev') // from dev
    expect(map.has('disabledVar')).toBe(false) // disabled ignored
  })

  it('resolveVariables should replace {{var}} with whitespace tolerance', () => {
    const template = '{{baseUrl}}/api/{{ version }}/users?token={{token}}'
    const resolved = resolveVariables(template, devEnv, globals)
    expect(resolved).toBe('http://localhost:3000/api/v1/users?token=global_token_123')
  })

  it('resolveVariables should keep unresolved variables unchanged', () => {
    const template = '{{baseUrl}}/unknown/{{not_exist}}'
    const resolved = resolveVariables(template, devEnv, globals)
    expect(resolved).toBe('http://localhost:3000/unknown/{{not_exist}}')
  })

  it('resolveVariables should support nested variables', () => {
    const customGlobals: VariableItem[] = [
      { id: '1', key: 'protocol', value: 'https', enabled: true },
      { id: '2', key: 'domain', value: 'api.io', enabled: true },
      { id: '3', key: 'host', value: '{{protocol}}://{{domain}}', enabled: true }
    ]
    const template = '{{host}}/users'
    const resolved = resolveVariables(template, null, customGlobals)
    expect(resolved).toBe('https://api.io/users')
  })

  it('resolveRequest should build complete URL, headers, and body with params', () => {
    const request: ApiRequestItem = {
      id: 'req_1',
      name: 'Get User Profile',
      method: 'POST',
      url: '{{baseUrl}}/users',
      params: [
        { id: 'p1', key: 'role', value: '{{envName}}', enabled: true },
        { id: 'p2', key: 'active', value: 'true', enabled: true },
        { id: 'p3', key: 'ignored', value: 'no', enabled: false }
      ],
      headers: [
        { id: 'h1', key: 'Authorization', value: 'Bearer {{token}}', enabled: true },
        { id: 'h2', key: 'X-Env', value: '{{envName}}', enabled: true },
        { id: 'h3', key: 'X-Disabled', value: 'none', enabled: false }
      ],
      bodyType: 'json',
      bodyRaw: '{"user": "admin", "env": "{{envName}}"}',
      updatedAt: Date.now()
    }

    const resolved = resolveRequest(request, devEnv, globals)
    expect(resolved.url).toBe('http://localhost:3000/users?role=dev&active=true')
    expect(resolved.headers).toEqual([
      { key: 'Authorization', value: 'Bearer global_token_123', enabled: true },
      { key: 'X-Env', value: 'dev', enabled: true }
    ])
    expect(resolved.body).toBe('{"user": "admin", "env": "dev"}')
  })

  it('createDefaultRequest should create a valid request item', () => {
    const req = createDefaultRequest('测试接口')
    expect(req.name).toBe('测试接口')
    expect(req.method).toBe('GET')
    expect(req.params.length).toBeGreaterThan(0)
    expect(req.headers.length).toBeGreaterThan(0)
  })
})
