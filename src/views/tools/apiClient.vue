<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { Connection, Setting } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { invoke } from '@tauri-apps/api/core'
import PageTitle from '@/components/PageTitle.vue'
import type {
  ApiClientStorageData,
  ApiGroup,
  ApiRequestItem,
  Environment,
  HttpResponseData,
  VariableItem
} from '@/types/apiClient'
import { resolveRequest, createDefaultRequest } from '@/utils/variableResolver'
import CollectionSidebar from './apiClient/CollectionSidebar.vue'
import RequestEditor from './apiClient/RequestEditor.vue'
import ResponseViewer from './apiClient/ResponseViewer.vue'
import EnvironmentManager from './apiClient/EnvironmentManager.vue'

const { t } = useI18n()

// 存储数据状态
const groups = ref<ApiGroup[]>([])
const environments = ref<Environment[]>([])
const globals = ref<VariableItem[]>([])
const activeEnvId = ref<string | null>(null)
const currentGroupId = ref<string>('')
const currentRequest = ref<ApiRequestItem>(createDefaultRequest())

// 请求执行与响应状态
const isSending = ref(false)
const latestResponse = ref<HttpResponseData | null>(null)

// 环境变量弹窗可见性
const envManagerVisible = ref(false)

// 当前激活的环境对象
const activeEnvironment = computed<Environment | null>(() => {
  if (!activeEnvId.value) return null
  return environments.value.find((e) => e.id === activeEnvId.value) || null
})

// 初始化默认数据模板
const createInitialData = (): ApiClientStorageData => {
  const req1: ApiRequestItem = {
    id: `req_demo_1`,
    name: 'HTTPBin GET 示例',
    method: 'GET',
    url: '{{baseUrl}}/get',
    params: [
      { id: 'p1', key: 'tool', value: 'rt-tool', enabled: true, description: '客户端名称' },
      { id: 'p2', key: 'env', value: '{{envName}}', enabled: true, description: '当前环境' }
    ],
    headers: [
      { id: 'h1', key: 'Accept', value: 'application/json', enabled: true, description: '' }
    ],
    bodyType: 'none',
    bodyRaw: '',
    updatedAt: Date.now()
  }

  const req2: ApiRequestItem = {
    id: `req_demo_2`,
    name: 'JSON 数据提交示例',
    method: 'POST',
    url: '{{baseUrl}}/post',
    params: [],
    headers: [
      { id: 'h2', key: 'Content-Type', value: 'application/json', enabled: true, description: '' },
      { id: 'h3', key: 'Authorization', value: 'Bearer {{token}}', enabled: true, description: 'Token' }
    ],
    bodyType: 'json',
    bodyRaw: '{\n  "message": "Hello from RT Tool API Client",\n  "env": "{{envName}}"\n}',
    updatedAt: Date.now()
  }

  const defaultGroup: ApiGroup = {
    id: 'group_demo_1',
    name: '示例接口',
    requests: [req1, req2],
    isExpanded: true
  }

  const devEnv: Environment = {
    id: 'env_dev',
    name: '开发环境 (Dev)',
    variables: [
      { id: 'v1', key: 'baseUrl', value: 'https://httpbin.org', enabled: true, description: '接口域名' },
      { id: 'v2', key: 'envName', value: 'Development', enabled: true, description: '环境标识' }
    ]
  }

  const prodEnv: Environment = {
    id: 'env_prod',
    name: '生产环境 (Prod)',
    variables: [
      { id: 'v3', key: 'baseUrl', value: 'https://httpbin.org', enabled: true, description: '接口域名' },
      { id: 'v4', key: 'envName', value: 'Production', enabled: true, description: '环境标识' }
    ]
  }

  return {
    version: 1,
    activeEnvId: 'env_dev',
    globals: [
      { id: 'g1', key: 'token', value: 'demo_token_123456', enabled: true, description: '全局认证凭证' }
    ],
    environments: [devEnv, prodEnv],
    groups: [defaultGroup],
    activeRequestId: req1.id
  }
}

// 加载持久化数据
const loadData = async () => {
  try {
    const rawJson = await invoke<string>('api_client_load_data')
    let data: ApiClientStorageData | null = null

    if (rawJson && rawJson.trim()) {
      try {
        data = JSON.parse(rawJson)
      } catch (e) {
        console.error('Failed to parse api_client.json, fallback to default:', e)
      }
    }

    if (!data || !data.groups || data.groups.length === 0) {
      data = createInitialData()
      await saveDataDirect(data)
    }

    groups.value = data.groups || []
    environments.value = data.environments || []
    globals.value = data.globals || []
    activeEnvId.value = data.activeEnvId ?? null

    // 选中初始接口
    if (data.groups.length > 0 && data.groups[0].requests.length > 0) {
      currentGroupId.value = data.groups[0].id
      currentRequest.value = JSON.parse(JSON.stringify(data.groups[0].requests[0]))
    }
  } catch (err) {
    console.warn('Tauri invoke api_client_load_data failed (possibly browser mode), using default data:', err)
    const data = createInitialData()
    groups.value = data.groups
    environments.value = data.environments
    globals.value = data.globals
    activeEnvId.value = data.activeEnvId
    if (data.groups.length > 0 && data.groups[0].requests.length > 0) {
      currentGroupId.value = data.groups[0].id
      currentRequest.value = JSON.parse(JSON.stringify(data.groups[0].requests[0]))
    }
  }
}

// 保存数据到本地硬盘
const saveDataDirect = async (data: ApiClientStorageData) => {
  try {
    const jsonContent = JSON.stringify(data, null, 2)
    await invoke('api_client_save_data', { jsonContent })
  } catch (err) {
    console.error('Failed to save api client data to disk:', err)
  }
}

// 自动持久化保存防抖
let saveTimer: ReturnType<typeof setTimeout> | null = null
const triggerSave = () => {
  if (saveTimer) clearTimeout(saveTimer)
  saveTimer = setTimeout(() => {
    const data: ApiClientStorageData = {
      version: 1,
      activeEnvId: activeEnvId.value,
      globals: globals.value,
      environments: environments.value,
      groups: groups.value,
      activeRequestId: currentRequest.value.id
    }
    saveDataDirect(data)
  }, 500)
}

// 监听环境和分组数据变化自动保存
watch([environments, globals, activeEnvId], () => {
  triggerSave()
}, { deep: true })

// 侧边栏事件处理
const handleSelectRequest = (req: ApiRequestItem, groupId: string) => {
  currentGroupId.value = groupId
  currentRequest.value = JSON.parse(JSON.stringify(req))
  latestResponse.value = null
}

const handleNewRequest = (groupId?: string) => {
  const targetGroupId = groupId || currentGroupId.value || groups.value[0]?.id
  if (!targetGroupId) {
    ElMessage.warning('请先创建分组')
    return
  }

  const newReq = createDefaultRequest(`新建接口 ${Date.now().toString().slice(-4)}`)
  const group = groups.value.find((g) => g.id === targetGroupId)
  if (group) {
    group.requests.push(newReq)
    group.isExpanded = true
    currentGroupId.value = targetGroupId
    currentRequest.value = JSON.parse(JSON.stringify(newReq))
    latestResponse.value = null
    triggerSave()
    ElMessage.success('已新建接口')
  }
}

const handleNewGroup = () => {
  const newGroup: ApiGroup = {
    id: `group_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    name: `新建分组 ${groups.value.length + 1}`,
    requests: [],
    isExpanded: true
  }
  groups.value.push(newGroup)
  currentGroupId.value = newGroup.id
  handleNewRequest(newGroup.id)
  triggerSave()
}

const handleRenameGroup = (groupId: string, newName: string) => {
  const group = groups.value.find((g) => g.id === groupId)
  if (group) {
    group.name = newName
    triggerSave()
  }
}

const handleDeleteGroup = (groupId: string) => {
  groups.value = groups.value.filter((g) => g.id !== groupId)
  if (currentGroupId.value === groupId) {
    if (groups.value.length > 0 && groups.value[0].requests.length > 0) {
      currentGroupId.value = groups.value[0].id
      currentRequest.value = JSON.parse(JSON.stringify(groups.value[0].requests[0]))
    } else {
      currentGroupId.value = ''
      currentRequest.value = createDefaultRequest()
    }
  }
  triggerSave()
}

const handleDeleteRequest = (groupId: string, requestId: string) => {
  const group = groups.value.find((g) => g.id === groupId)
  if (group) {
    group.requests = group.requests.filter((r) => r.id !== requestId)
    if (currentRequest.value.id === requestId) {
      if (group.requests.length > 0) {
        currentRequest.value = JSON.parse(JSON.stringify(group.requests[0]))
      } else {
        currentRequest.value = createDefaultRequest()
      }
    }
    triggerSave()
  }
}

const handleDuplicateRequest = (groupId: string, req: ApiRequestItem) => {
  const group = groups.value.find((g) => g.id === groupId)
  if (group) {
    const copy: ApiRequestItem = {
      ...JSON.parse(JSON.stringify(req)),
      id: `req_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      name: `${req.name} (副本)`,
      updatedAt: Date.now()
    }
    group.requests.push(copy)
    currentRequest.value = JSON.parse(JSON.stringify(copy))
    triggerSave()
    ElMessage.success('已复制接口')
  }
}

// 保存当前正在编辑的接口
const handleSaveCurrentRequest = () => {
  let targetGroup = groups.value.find((g) => g.id === currentGroupId.value)
  if (!targetGroup && groups.value.length > 0) {
    targetGroup = groups.value[0]
    currentGroupId.value = targetGroup.id
  }

  if (!targetGroup) {
    // 自动创建一个默认分组
    targetGroup = {
      id: `group_${Date.now()}`,
      name: '默认分组',
      requests: [],
      isExpanded: true
    }
    groups.value.push(targetGroup)
    currentGroupId.value = targetGroup.id
  }

  const existingIndex = targetGroup.requests.findIndex((r) => r.id === currentRequest.value.id)
  currentRequest.value.updatedAt = Date.now()
  if (existingIndex >= 0) {
    targetGroup.requests[existingIndex] = JSON.parse(JSON.stringify(currentRequest.value))
  } else {
    targetGroup.requests.push(JSON.parse(JSON.stringify(currentRequest.value)))
  }

  triggerSave()
  ElMessage.success('接口配置已保存')
}

// 另存为新接口
const handleSaveAs = (groupId: string, newName: string) => {
  const group = groups.value.find((g) => g.id === groupId)
  if (!group) return

  const newReq: ApiRequestItem = {
    ...JSON.parse(JSON.stringify(currentRequest.value)),
    id: `req_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    name: newName,
    updatedAt: Date.now()
  }

  group.requests.push(newReq)
  currentGroupId.value = groupId
  currentRequest.value = JSON.parse(JSON.stringify(newReq))
  triggerSave()
  ElMessage.success(`已另存为 "${newName}"`)
}

// 发送 HTTP 请求
const handleSendRequest = async () => {
  if (!currentRequest.value.url || !currentRequest.value.url.trim()) {
    ElMessage.warning('请输入请求 URL')
    return
  }

  // 1. 变量解析
  const resolved = resolveRequest(
    currentRequest.value,
    activeEnvironment.value,
    globals.value
  )

  isSending.value = true
  latestResponse.value = null

  try {
    // 2. 通过 Rust 后端执行 HTTP 请求（无 CORS 限制）
    const res = await invoke<{
      status: number
      status_text: string
      headers: [string, string][]
      body: string
      elapsed_ms: number
      size_bytes: number
    }>('api_client_send_http', {
      request: {
        method: resolved.method,
        url: resolved.url,
        headers: resolved.headers,
        body_type: resolved.bodyType,
        body: resolved.body || null,
        timeout_seconds: 30
      }
    })

    latestResponse.value = {
      status: res.status,
      statusText: res.status_text,
      headers: res.headers,
      body: res.body,
      elapsedMs: Number(res.elapsed_ms),
      sizeBytes: res.size_bytes,
      timestamp: Date.now()
    }
  } catch (err: any) {
    console.error('API send error:', err)
    latestResponse.value = {
      status: 0,
      statusText: 'Error',
      headers: [],
      body: '',
      elapsedMs: 0,
      sizeBytes: 0,
      timestamp: Date.now(),
      error: typeof err === 'string' ? err : err?.message || '请求执行失败'
    }
  } finally {
    isSending.value = false
  }
}

onMounted(() => {
  loadData()
})
</script>

<template>
  <div class="api-client-container">
    <!-- 顶部标题栏与环境切换 -->
    <div class="api-client-header">
      <PageTitle
        :icon="Connection"
        :title="t('tools.apiClient')"
        description="apiClient"
        color="#00bcd4"
      />

      <!-- 右上角环境配置栏 -->
      <div class="env-switcher-bar">
        <span class="env-label">当前环境:</span>
        <el-select
          v-model="activeEnvId"
          placeholder="无环境"
          clearable
          style="width: 170px;"
          size="default"
        >
          <el-option
            v-for="env in environments"
            :key="env.id"
            :label="env.name"
            :value="env.id"
          />
        </el-select>

        <el-button
          :icon="Setting"
          size="default"
          @click="envManagerVisible = true"
        >
          环境管理
        </el-button>
      </div>
    </div>

    <!-- 主体区域：左侧分组列表，右侧请求编辑与响应结果 -->
    <div class="api-client-main">
      <!-- 左侧：接口集合侧边栏 -->
      <CollectionSidebar
        :groups="groups"
        :active-request-id="currentRequest.id"
        @select-request="handleSelectRequest"
        @new-request="handleNewRequest"
        @new-group="handleNewGroup"
        @rename-group="handleRenameGroup"
        @delete-group="handleDeleteGroup"
        @delete-request="handleDeleteRequest"
        @duplicate-request="handleDuplicateRequest"
      />

      <!-- 右侧：工作台 -->
      <div class="workbench">
        <!-- 上半部分：请求配置编辑区 -->
        <RequestEditor
          v-model:request="currentRequest"
          :loading="isSending"
          :groups="groups"
          :current-group-id="currentGroupId"
          @send="handleSendRequest"
          @save="handleSaveCurrentRequest"
          @save-as="handleSaveAs"
        />

        <!-- 下半部分：响应结果查看区 -->
        <ResponseViewer
          :response="latestResponse"
          :loading="isSending"
        />
      </div>
    </div>

    <!-- 环境变量管理对话框 -->
    <EnvironmentManager
      v-model:visible="envManagerVisible"
      v-model:environments="environments"
      v-model:globals="globals"
      v-model:active-env-id="activeEnvId"
    />
  </div>
</template>

<style scoped>
.api-client-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
  height: calc(100vh - 100px);
}

.api-client-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.api-client-header :deep(.page-title) {
  margin-bottom: 0;
  flex: 1;
}

.env-switcher-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  background-color: var(--el-bg-color);
  padding: 10px 16px;
  border-radius: 12px;
  border: 1px solid var(--el-border-color-light);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.env-label {
  font-size: 13px;
  font-weight: 500;
  color: var(--el-text-color-regular);
}

.api-client-main {
  display: flex;
  flex: 1;
  gap: 16px;
  overflow: hidden;
}

.workbench {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
  overflow-y: auto;
  padding-right: 4px;
}
</style>
