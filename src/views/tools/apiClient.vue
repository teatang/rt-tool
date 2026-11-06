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
  VariableItem,
  ApiTabItem,
  RequestHistoryItem,
  SentRequestDetail
} from '@/types/apiClient'
import { resolveRequest, createDefaultRequest } from '@/utils/variableResolver'
import { generateCurlCommand } from '@/utils/curlGenerator'
import {
  extractUrlBaseAndParams,
  mergeParamsWithExisting,
  parseFormUrlEncoded
} from '@/utils/urlParams'
import CollectionSidebar from './apiClient/CollectionSidebar.vue'
import RequestTabs from './apiClient/RequestTabs.vue'
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

// 多标签页状态
const tabs = ref<ApiTabItem[]>([])
const activeTabId = ref<string>('')

// 请求历史记录
const history = ref<RequestHistoryItem[]>([])

// 环境变量弹窗可见性
const envManagerVisible = ref(false)

// 当前激活的环境对象
const activeEnvironment = computed<Environment | null>(() => {
  if (!activeEnvId.value) return null
  return environments.value.find((e) => e.id === activeEnvId.value) || null
})

// 当前激活的标签页
const currentTab = computed<ApiTabItem | null>(() => {
  return tabs.value.find((t) => t.tabId === activeTabId.value) || null
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

// 创建新标签页助手函数
const createNewTab = (req?: ApiRequestItem, groupId?: string): ApiTabItem => {
  const requestItem = req ? JSON.parse(JSON.stringify(req)) : createDefaultRequest()
  return {
    tabId: `tab_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    requestId: req?.id,
    groupId: groupId || currentGroupId.value,
    title: requestItem.name || '新接口',
    isDirty: false,
    request: requestItem,
    response: null,
    sentRequest: null,
    isLoading: false
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

    // 初始化第一个标签页
    if (data.groups.length > 0 && data.groups[0].requests.length > 0) {
      const firstReq = data.groups[0].requests[0]
      currentGroupId.value = data.groups[0].id
      const initialTab = createNewTab(firstReq, data.groups[0].id)
      tabs.value = [initialTab]
      activeTabId.value = initialTab.tabId
    } else {
      const initialTab = createNewTab()
      tabs.value = [initialTab]
      activeTabId.value = initialTab.tabId
    }
  } catch (err) {
    console.warn('Tauri invoke api_client_load_data failed (possibly browser mode), using default data:', err)
    const data = createInitialData()
    groups.value = data.groups
    environments.value = data.environments
    globals.value = data.globals
    activeEnvId.value = data.activeEnvId
    if (data.groups.length > 0 && data.groups[0].requests.length > 0) {
      const firstReq = data.groups[0].requests[0]
      currentGroupId.value = data.groups[0].id
      const initialTab = createNewTab(firstReq, data.groups[0].id)
      tabs.value = [initialTab]
      activeTabId.value = initialTab.tabId
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
      activeRequestId: currentTab.value?.requestId || null
    }
    saveDataDirect(data)
  }, 500)
}

// 监听环境和分组数据变化自动保存
watch([environments, globals, activeEnvId], () => {
  triggerSave()
}, { deep: true })

// 标签页管理
const handleSelectTab = (tabId: string) => {
  activeTabId.value = tabId
  const tab = tabs.value.find((t) => t.tabId === tabId)
  if (tab && tab.groupId) {
    currentGroupId.value = tab.groupId
  }
}

const handleCloseTab = (tabId: string) => {
  const index = tabs.value.findIndex((t) => t.tabId === tabId)
  if (index === -1) return

  tabs.value.splice(index, 1)

  // 若关闭的是最后一个打开的标签，则自动新建一个默认空白标签
  if (tabs.value.length === 0) {
    const freshTab = createNewTab()
    tabs.value.push(freshTab)
    activeTabId.value = freshTab.tabId
    return
  }

  // 若关闭的是当前激活标签，激活相邻标签
  if (activeTabId.value === tabId) {
    const nextIndex = Math.min(index, tabs.value.length - 1)
    activeTabId.value = tabs.value[nextIndex].tabId
    if (tabs.value[nextIndex].groupId) {
      currentGroupId.value = tabs.value[nextIndex].groupId!
    }
  }
}

const handleNewTab = () => {
  const newTab = createNewTab()
  tabs.value.push(newTab)
  activeTabId.value = newTab.tabId
}

// 侧边栏事件：点击某个已保存接口时打开或激活标签页
const handleSelectRequest = (req: ApiRequestItem, groupId: string) => {
  currentGroupId.value = groupId

  // 检查是否已经在标签页中打开
  const existingTab = tabs.value.find((t) => t.requestId === req.id)
  if (existingTab) {
    activeTabId.value = existingTab.tabId
    return
  }

  // 若当前标签是空白且未被修改，则直接在当前标签加载
  if (
    currentTab.value &&
    !currentTab.value.requestId &&
    !currentTab.value.isDirty &&
    !currentTab.value.request.url
  ) {
    currentTab.value.requestId = req.id
    currentTab.value.groupId = groupId
    currentTab.value.title = req.name || '未命名接口'
    currentTab.value.request = JSON.parse(JSON.stringify(req))
    currentTab.value.response = null
    currentTab.value.sentRequest = null
    currentTab.value.isDirty = false
    return
  }

  // 否则新开一个标签页
  const newTab = createNewTab(req, groupId)
  tabs.value.push(newTab)
  activeTabId.value = newTab.tabId
}

// 侧边栏点击新建接口
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

    // 打开对应标签页
    const newTab = createNewTab(newReq, targetGroupId)
    tabs.value.push(newTab)
    activeTabId.value = newTab.tabId
    triggerSave()
    ElMessage.success('已新建接口并打开标签页')
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
  // 关闭所有属于该分组的标签页
  tabs.value = tabs.value.filter((t) => t.groupId !== groupId)
  if (tabs.value.length === 0) {
    handleNewTab()
  } else if (!tabs.value.some((t) => t.tabId === activeTabId.value)) {
    activeTabId.value = tabs.value[0].tabId
  }
  triggerSave()
}

const handleDeleteRequest = (groupId: string, requestId: string) => {
  const group = groups.value.find((g) => g.id === groupId)
  if (group) {
    group.requests = group.requests.filter((r) => r.id !== requestId)
    // 解除标签页关联或关闭
    for (const tab of tabs.value) {
      if (tab.requestId === requestId) {
        tab.requestId = undefined
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
    // 打开副本标签
    const tab = createNewTab(copy, groupId)
    tabs.value.push(tab)
    activeTabId.value = tab.tabId
    triggerSave()
    ElMessage.success('已复制接口')
  }
}

// 历史记录点击：在当前或新标签页中打开历史请求，各项参数匹配到对应 input
const handleSelectHistory = (historyItem: RequestHistoryItem) => {
  let restoredRequest: ApiRequestItem

  if (historyItem.request) {
    // 1. 若历史项中记录了当时的请求草稿快照，深拷贝恢复
    restoredRequest = JSON.parse(JSON.stringify(historyItem.request))
    restoredRequest.id = `req_hist_${Date.now()}`
    restoredRequest.name = historyItem.name
    restoredRequest.updatedAt = historyItem.timestamp

    // 确保 URL 中的 GET 参数与 params 保持同步匹配
    if (restoredRequest.url && restoredRequest.url.includes('?')) {
      const validParams = (restoredRequest.params || []).filter((p) => p.key && p.key.trim() !== '')
      if (validParams.length === 0) {
        const { params } = extractUrlBaseAndParams(restoredRequest.url)
        if (params.length > 0) {
          restoredRequest.params = mergeParamsWithExisting(params, restoredRequest.params || [])
        }
      }
    }
  } else {
    // 2. 兼容历史项仅有 sentRequest 的情况：反向解析各项参数匹配到对应 input
    const { params } = extractUrlBaseAndParams(historyItem.sentRequest.url)

    const restoredHeaders = (historyItem.sentRequest.headers || []).map((h, idx) => ({
      id: `h_${Date.now()}_${idx}`,
      key: h.key,
      value: h.value,
      enabled: true,
      description: ''
    }))

    const bodyType = historyItem.sentRequest.bodyType as any
    let restoredBodyRaw = ''
    let restoredBodyUrlEncoded: any[] = []

    if (bodyType === 'x-www-form-urlencoded') {
      restoredBodyUrlEncoded = parseFormUrlEncoded(historyItem.sentRequest.body || '')
    } else if (bodyType === 'json' || bodyType === 'raw') {
      restoredBodyRaw = historyItem.sentRequest.body || ''
    }

    restoredRequest = {
      id: `req_hist_${Date.now()}`,
      name: historyItem.name,
      method: historyItem.sentRequest.method as any,
      url: historyItem.sentRequest.url,
      params: params.length > 0
        ? mergeParamsWithExisting(params)
        : [{ id: `p_${Date.now()}_default`, key: '', value: '', enabled: true, description: '' }],
      headers: restoredHeaders.length > 0
        ? restoredHeaders
        : [{ id: `h_${Date.now()}_default`, key: '', value: '', enabled: true, description: '' }],
      bodyType: bodyType || 'none',
      bodyRaw: restoredBodyRaw,
      bodyUrlEncoded: restoredBodyUrlEncoded,
      description: '',
      updatedAt: historyItem.timestamp
    }
  }

  // 若当前标签是空白且未被修改，则直接在当前标签加载
  if (
    currentTab.value &&
    !currentTab.value.requestId &&
    !currentTab.value.isDirty &&
    !currentTab.value.request.url
  ) {
    currentTab.value.title = `${historyItem.name} (历史)`
    currentTab.value.request = restoredRequest
    currentTab.value.response = historyItem.response
    currentTab.value.sentRequest = historyItem.sentRequest
    currentTab.value.isDirty = false
    ElMessage.success('已载入历史请求各项参数')
    return
  }

  const tab: ApiTabItem = {
    tabId: `tab_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    title: `${historyItem.name} (历史)`,
    isDirty: false,
    request: restoredRequest,
    response: historyItem.response,
    sentRequest: historyItem.sentRequest,
    isLoading: false
  }

  tabs.value.push(tab)
  activeTabId.value = tab.tabId
  ElMessage.success('已载入历史请求各项参数并打开新标签页')
}

const handleClearHistory = () => {
  history.value = []
}

// 正在编辑的当前请求更新时，标记当前标签为 dirty
const handleRequestUpdate = (updatedReq: ApiRequestItem) => {
  if (!currentTab.value) return
  currentTab.value.request = updatedReq
  currentTab.value.title = updatedReq.name || '未命名接口'
  currentTab.value.isDirty = true
}

// 保存当前正在编辑的接口
const handleSaveCurrentRequest = () => {
  if (!currentTab.value) return
  let targetGroup = groups.value.find((g) => g.id === (currentTab.value?.groupId || currentGroupId.value))
  if (!targetGroup && groups.value.length > 0) {
    targetGroup = groups.value[0]
    currentGroupId.value = targetGroup.id
    currentTab.value.groupId = targetGroup.id
  }

  if (!targetGroup) {
    targetGroup = {
      id: `group_${Date.now()}`,
      name: '默认分组',
      requests: [],
      isExpanded: true
    }
    groups.value.push(targetGroup)
    currentGroupId.value = targetGroup.id
    currentTab.value.groupId = targetGroup.id
  }

  const reqToSave = currentTab.value.request
  reqToSave.updatedAt = Date.now()

  const existingIndex = targetGroup.requests.findIndex(
    (r) => r.id === (currentTab.value?.requestId || reqToSave.id)
  )

  if (existingIndex >= 0) {
    targetGroup.requests[existingIndex] = JSON.parse(JSON.stringify(reqToSave))
  } else {
    currentTab.value.requestId = reqToSave.id
    targetGroup.requests.push(JSON.parse(JSON.stringify(reqToSave)))
  }

  currentTab.value.isDirty = false
  triggerSave()
  ElMessage.success('接口配置已保存')
}

// 另存为新接口
const handleSaveAs = (groupId: string, newName: string) => {
  if (!currentTab.value) return
  const group = groups.value.find((g) => g.id === groupId)
  if (!group) return

  const newReq: ApiRequestItem = {
    ...JSON.parse(JSON.stringify(currentTab.value.request)),
    id: `req_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    name: newName,
    updatedAt: Date.now()
  }

  group.requests.push(newReq)
  currentGroupId.value = groupId
  currentTab.value.requestId = newReq.id
  currentTab.value.groupId = groupId
  currentTab.value.title = newName
  currentTab.value.isDirty = false
  triggerSave()
  ElMessage.success(`已另存为 "${newName}"`)
}

// 发送 HTTP 请求
const handleSendRequest = async () => {
  if (!currentTab.value) return
  const req = currentTab.value.request

  if (!req.url || !req.url.trim()) {
    ElMessage.warning('请输入请求 URL')
    return
  }

  // 1. 变量解析与请求组装
  const resolved = resolveRequest(
    req,
    activeEnvironment.value,
    globals.value
  )

  // 2. 生成等效 cURL 命令行
  const curlCmd = generateCurlCommand(
    resolved.method,
    resolved.url,
    resolved.headers,
    resolved.bodyType,
    resolved.body
  )

  // 3. 构建发送快照
  const sentDetail: SentRequestDetail = {
    method: resolved.method,
    url: resolved.url,
    headers: resolved.headers.map((h) => ({ key: h.key, value: h.value })),
    bodyType: resolved.bodyType,
    body: resolved.body,
    sentAt: Date.now(),
    curlCommand: curlCmd
  }

  currentTab.value.sentRequest = sentDetail
  currentTab.value.isLoading = true
  currentTab.value.response = null

  try {
    // 4. 调用 Rust 后端发送 HTTP 请求
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

    const respData = {
      status: res.status,
      statusText: res.status_text,
      headers: res.headers,
      body: res.body,
      elapsedMs: Number(res.elapsed_ms),
      sizeBytes: res.size_bytes,
      timestamp: Date.now()
    }

    currentTab.value.response = respData

    // 5. 记录到历史列表
    history.value.unshift({
      id: `hist_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      name: currentTab.value.title || req.name || '未命名接口',
      request: JSON.parse(JSON.stringify(req)),
      sentRequest: sentDetail,
      response: respData,
      timestamp: Date.now()
    })

    // 保留最多 100 条历史
    if (history.value.length > 100) {
      history.value.pop()
    }
  } catch (err: any) {
    console.error('API send error:', err)
    const errorRespData = {
      status: 0,
      statusText: 'Error',
      headers: [] as [string, string][],
      body: '',
      elapsedMs: 0,
      sizeBytes: 0,
      timestamp: Date.now(),
      error: typeof err === 'string' ? err : err?.message || '请求执行失败'
    }

    currentTab.value.response = errorRespData

    history.value.unshift({
      id: `hist_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      name: currentTab.value.title || req.name || '未命名接口',
      request: JSON.parse(JSON.stringify(req)),
      sentRequest: sentDetail,
      response: errorRespData,
      timestamp: Date.now()
    })
  } finally {
    currentTab.value.isLoading = false
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

    <!-- 主体区域：左侧分组与历史侧边栏，右侧多标签工作台 -->
    <div class="api-client-main">
      <!-- 左侧：集合与历史列表侧边栏 -->
      <CollectionSidebar
        :groups="groups"
        :active-request-id="currentTab?.requestId"
        :history="history"
        @select-request="handleSelectRequest"
        @new-request="handleNewRequest"
        @new-group="handleNewGroup"
        @rename-group="handleRenameGroup"
        @delete-group="handleDeleteGroup"
        @delete-request="handleDeleteRequest"
        @duplicate-request="handleDuplicateRequest"
        @select-history="handleSelectHistory"
        @clear-history="handleClearHistory"
      />

      <!-- 右侧：工作台 -->
      <div class="workbench">
        <!-- 标签页栏 -->
        <RequestTabs
          :tabs="tabs"
          :active-tab-id="activeTabId"
          @select-tab="handleSelectTab"
          @close-tab="handleCloseTab"
          @new-tab="handleNewTab"
        />

        <div v-if="currentTab" class="tab-workbench-content">
          <!-- 上半部分：请求配置编辑区 -->
          <RequestEditor
            :request="currentTab.request"
            :loading="currentTab.isLoading"
            :groups="groups"
            :current-group-id="currentTab.groupId"
            @update:request="handleRequestUpdate"
            @send="handleSendRequest"
            @save="handleSaveCurrentRequest"
            @save-as="handleSaveAs"
          />

          <!-- 下半部分：响应结果查看与实际发送请求检查区 -->
          <ResponseViewer
            :response="currentTab.response"
            :loading="currentTab.isLoading"
            :sent-request="currentTab.sentRequest"
          />
        </div>
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
  background-color: var(--el-bg-color);
  border-radius: 8px;
  border: 1px solid var(--el-border-color-light);
  overflow: hidden;
  min-width: 0;
}

.tab-workbench-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
  overflow-y: auto;
  padding: 16px;
  min-width: 0;
}

.tab-workbench-content::after {
  content: '';
  display: block;
  height: 4px;
  flex-shrink: 0;
}
</style>
