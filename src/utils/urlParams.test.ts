import { describe, it, expect } from 'vitest'
import {
  safeDecode,
  parseQueryParams,
  extractUrlBaseAndParams,
  mergeParamsWithExisting,
  buildUrlWithParams,
  parseFormUrlEncoded
} from './urlParams'

describe('urlParams utils', () => {
  it('safeDecode should decode properly and fallback on error', () => {
    expect(safeDecode('hello%20world')).toBe('hello world')
    expect(safeDecode('100%25')).toBe('100%')
    expect(safeDecode('malformed%99%zz')).toBe('malformed%99%zz')
    expect(safeDecode('')).toBe('')
  })

  it('parseQueryParams should parse query string to key-value items', () => {
    const items = parseQueryParams('?page=1&limit=20&search=vue%203')
    expect(items.length).toBe(3)
    expect(items[0].key).toBe('page')
    expect(items[0].value).toBe('1')
    expect(items[1].key).toBe('limit')
    expect(items[1].value).toBe('20')
    expect(items[2].key).toBe('search')
    expect(items[2].value).toBe('vue 3')
  })

  it('parseQueryParams should preserve template variables', () => {
    const items = parseQueryParams('env={{envName}}&token={{token}}')
    expect(items.length).toBe(2)
    expect(items[0].key).toBe('env')
    expect(items[0].value).toBe('{{envName}}')
    expect(items[1].key).toBe('token')
    expect(items[1].value).toBe('{{token}}')
  })

  it('parseQueryParams should handle key-only and empty parameters', () => {
    const items = parseQueryParams('flag&other=&')
    expect(items.length).toBe(2)
    expect(items[0].key).toBe('flag')
    expect(items[0].value).toBe('')
    expect(items[1].key).toBe('other')
    expect(items[1].value).toBe('')
  })

  it('extractUrlBaseAndParams should separate base URL and query parameters', () => {
    const res = extractUrlBaseAndParams('https://api.example.com/users?id=123&status=active')
    expect(res.baseUrl).toBe('https://api.example.com/users')
    expect(res.hasQuery).toBe(true)
    expect(res.params.length).toBe(2)
    expect(res.params[0].key).toBe('id')
    expect(res.params[0].value).toBe('123')
    expect(res.params[1].key).toBe('status')
    expect(res.params[1].value).toBe('active')
  })

  it('extractUrlBaseAndParams should handle URL without query string', () => {
    const res = extractUrlBaseAndParams('https://api.example.com/users')
    expect(res.baseUrl).toBe('https://api.example.com/users')
    expect(res.hasQuery).toBe(false)
    expect(res.params.length).toBe(0)
  })

  it('mergeParamsWithExisting should keep descriptions of existing params', () => {
    const existing = [
      { id: 'p_1', key: 'page', value: '1', enabled: true, description: '页码' }
    ]
    const parsed = [
      { id: 'p_new', key: 'page', value: '2', enabled: true, description: '' },
      { id: 'p_new2', key: 'size', value: '10', enabled: true, description: '' }
    ]

    const merged = mergeParamsWithExisting(parsed, existing)
    expect(merged.length).toBe(3) // 2 params + 1 trailing empty row
    expect(merged[0].id).toBe('p_1')
    expect(merged[0].key).toBe('page')
    expect(merged[0].value).toBe('2')
    expect(merged[0].description).toBe('页码')
    expect(merged[1].key).toBe('size')
    expect(merged[1].value).toBe('10')
  })

  it('buildUrlWithParams should construct full URL from base and enabled params', () => {
    const params = [
      { id: '1', key: 'page', value: '1', enabled: true, description: '' },
      { id: '2', key: 'ignored', value: 'no', enabled: false, description: '' },
      { id: '3', key: 'sort', value: 'desc', enabled: true, description: '' }
    ]
    const url = buildUrlWithParams('https://api.example.com/users', params)
    expect(url).toBe('https://api.example.com/users?page=1&sort=desc')
  })

  it('buildUrlWithParams should return base URL if no params enabled', () => {
    const params = [
      { id: '1', key: '', value: '', enabled: true, description: '' },
      { id: '2', key: 'ignored', value: 'no', enabled: false, description: '' }
    ]
    const url = buildUrlWithParams('https://api.example.com/users?old=1', params)
    expect(url).toBe('https://api.example.com/users')
  })

  it('parseFormUrlEncoded should parse urlencoded body', () => {
    const items = parseFormUrlEncoded('username=alice&password=secret%26code')
    expect(items.length).toBe(2)
    expect(items[0].key).toBe('username')
    expect(items[0].value).toBe('alice')
    expect(items[1].key).toBe('password')
    expect(items[1].value).toBe('secret&code')
  })
})
