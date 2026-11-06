export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS'

export interface KeyValueItem {
  id: string
  key: string
  value: string
  enabled: boolean
  description?: string
}

export type ApiRequestBodyType = 'none' | 'json' | 'raw' | 'x-www-form-urlencoded'

export interface ApiRequestItem {
  id: string
  name: string
  method: HttpMethod
  url: string
  params: KeyValueItem[]
  headers: KeyValueItem[]
  bodyType: ApiRequestBodyType
  bodyRaw: string
  bodyUrlEncoded?: KeyValueItem[]
  description?: string
  updatedAt: number
}

export interface ApiGroup {
  id: string
  name: string
  requests: ApiRequestItem[]
  isExpanded?: boolean
}

export interface VariableItem {
  id: string
  key: string
  value: string
  enabled: boolean
  description?: string
}

export interface Environment {
  id: string
  name: string
  variables: VariableItem[]
}

export interface ApiClientStorageData {
  version: number
  activeEnvId: string | null
  globals: VariableItem[]
  environments: Environment[]
  groups: ApiGroup[]
  activeRequestId?: string | null
}

export interface HttpResponseData {
  status: number
  statusText: string
  headers: [string, string][]
  body: string
  elapsedMs: number
  sizeBytes: number
  timestamp: number
  error?: string
}
