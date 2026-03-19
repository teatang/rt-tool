import CryptoJS from 'crypto-js'

// UUID 版本类型
export type UuidVersion = 'v1' | 'v3' | 'v4' | 'v5'

// 预定义命名空间
export const UUID_NAMESPACES = {
  URL: '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
  OID: '6ba7b811-9dad-11d1-80b4-00c04fd430c8',
  X500: '6ba7b812-9dad-11d1-80b4-00c04fd430c8'
} as const

/**
 * 生成 UUID v4 (随机)
 */
export function generateUuidV4(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

/**
 * 生成 UUID v1 (基于时间戳)
 */
export function generateUuidV1(): string {
  const now = Date.now()
  const timeLow = (now & 0xffffffff).toString(16).padStart(8, '0')
  const timeMid = ((now >> 32) & 0xffff).toString(16).padStart(4, '0')
  const timeHiAndVersion = ((now >> 48) & 0x0fff) | 0x1000 // version 1
  const clockSeqHiAndReserved = (Math.floor(Math.random() * 16384) & 0x3fff) | 0x8000
  const clockSeqLow = clockSeqHiAndReserved & 0xff
  const node = Array.from({ length: 6 }, () =>
    Math.floor(Math.random() * 256).toString(16).padStart(2, '0')
  ).join('')

  return `${timeLow}-${timeMid}-${timeHiAndVersion.toString(16).padStart(4, '0')}-${clockSeqHiAndReserved.toString(16).padStart(4, '0')}-${clockSeqLow.toString(16).padStart(2, '0')}${node}`
}

/**
 * 生成 UUID v3 (MD5)
 */
export function generateUuidV3(namespace: string, name: string): string {
  return generateUuidV3V5(namespace, name, false)
}

/**
 * 生成 UUID v5 (SHA-1)
 */
export function generateUuidV5(namespace: string, name: string): string {
  return generateUuidV3V5(namespace, name, true)
}

/**
 * 生成 UUID v3/v5 (基于命名空间和名称的哈希)
 */
function generateUuidV3V5(namespace: string, name: string, isV5: boolean): string {
  if (!name) {
    throw new Error('Name is required for UUID v3/v5')
  }

  const hash = isV5
    ? CryptoJS.SHA1(namespace + name).toString()
    : CryptoJS.MD5(namespace + name).toString()

  // 从哈希中提取 UUID 格式
  const timeLow = hash.substring(0, 8)
  const timeMid = hash.substring(8, 12)
  const timeHiAndVersion = parseInt(hash.substring(12, 16), 16)
  const version = isV5 ? 0x5000 : 0x3000
  const clockSeqHiAndReserved = (parseInt(hash.substring(16, 18), 16) & 0x3f) | 0x80
  const clockSeqLow = hash.substring(18, 20)
  const node = hash.substring(20, 32)

  return `${timeLow}-${timeMid}-${(timeHiAndVersion & 0x0fff | version).toString(16).padStart(4, '0')}-${clockSeqHiAndReserved.toString(16).padStart(2, '0')}${clockSeqLow}-${node}`
}

/**
 * 生成 UUID (根据版本)
 */
export function generateUuid(version: UuidVersion, namespace?: string, name?: string): string {
  switch (version) {
    case 'v4':
      return generateUuidV4()
    case 'v1':
      return generateUuidV1()
    case 'v3':
      if (!namespace || !name) {
        throw new Error('Namespace and name are required for UUID v3')
      }
      return generateUuidV3(namespace, name)
    case 'v5':
      if (!namespace || !name) {
        throw new Error('Namespace and name are required for UUID v5')
      }
      return generateUuidV5(namespace, name)
    default:
      throw new Error(`Unknown UUID version: ${version}`)
  }
}

/**
 * 验证 UUID 格式
 */
export function isValidUuid(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return uuidRegex.test(uuid)
}
