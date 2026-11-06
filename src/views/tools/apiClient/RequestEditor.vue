<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import {
  Position,
  DocumentChecked,
  FolderAdd,
  MagicStick,
  Delete
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { ApiRequestItem, HttpMethod, ApiRequestBodyType, ApiGroup, KeyValueItem } from '@/types/apiClient'
import { jsonFormat, jsonCompress, isValidJson } from '@/utils/json'
import {
  extractUrlBaseAndParams,
  mergeParamsWithExisting,
  buildUrlWithParams
} from '@/utils/urlParams'
import KeyValueEditor from './KeyValueEditor.vue'

const props = defineProps<{
  request: ApiRequestItem
  loading: boolean
  groups: ApiGroup[]
  currentGroupId?: string
}>()

const emit = defineEmits<{
  (e: 'update:request', req: ApiRequestItem): void
  (e: 'send'): void
  (e: 'save'): void
  (e: 'saveAs', groupId: string, name: string): void
}>()

const activeTab = ref<'params' | 'headers' | 'body' | 'desc'>('params')

const httpMethods: HttpMethod[] = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS']

const commonHeaders = [
  'Content-Type',
  'Authorization',
  'Accept',
  'User-Agent',
  'Cache-Control',
  'X-Requested-With',
  'Accept-Language',
  'Accept-Encoding'
]

const enabledParamsCount = computed(() => {
  return (props.request.params || []).filter((p) => p.enabled && p.key.trim()).length
})

const enabledHeadersCount = computed(() => {
  return (props.request.headers || []).filter((h) => h.enabled && h.key.trim()).length
})

const isJsonValid = computed(() => {
  if (!props.request.bodyRaw || props.request.bodyRaw.trim() === '') return true
  return isValidJson(props.request.bodyRaw)
})

const updateField = <K extends keyof ApiRequestItem>(field: K, value: ApiRequestItem[K]) => {
  emit('update:request', {
    ...props.request,
    [field]: value
  })
}

const handleNameChange = (val: string) => updateField('name', val)

const handleUrlChange = (val: string) => {
  const { params, hasQuery } = extractUrlBaseAndParams(val)

  if (hasQuery) {
    // URL 中包含 GET 参数，自动解析并同步匹配到 Params 中
    const mergedParams = mergeParamsWithExisting(params, props.request.params || [])
    emit('update:request', {
      ...props.request,
      url: val,
      params: mergedParams
    })
  } else {
    // 检查之前是否曾含有 query 参数，若此前有而现在被用户删去，则清空 Params
    const hadQuery = (props.request.url || '').includes('?')
    if (hadQuery) {
      emit('update:request', {
        ...props.request,
        url: val,
        params: [
          {
            id: `param_${Date.now()}_default`,
            key: '',
            value: '',
            enabled: true,
            description: ''
          }
        ]
      })
    } else {
      updateField('url', val)
    }
  }
}

const handleParamsChange = (newParams: KeyValueItem[]) => {
  const newUrl = buildUrlWithParams(props.request.url, newParams)
  emit('update:request', {
    ...props.request,
    url: newUrl,
    params: newParams
  })
}

// 当外部载入或切换包含 GET 参数的 URL 且当前 Params 为空时，自动提取补齐
watch(
  () => props.request.url,
  (newUrl) => {
    if (newUrl && newUrl.includes('?')) {
      const currentValidParams = (props.request.params || []).filter((p) => p.key && p.key.trim() !== '')
      if (currentValidParams.length === 0) {
        const { params } = extractUrlBaseAndParams(newUrl)
        if (params.length > 0) {
          emit('update:request', {
            ...props.request,
            params: mergeParamsWithExisting(params, props.request.params || [])
          })
        }
      }
    }
  },
  { immediate: true }
)

const handleBodyTypeChange = (val: any) => updateField('bodyType', val as ApiRequestBodyType)
const handleBodyRawChange = (val: string) => updateField('bodyRaw', val)
const handleDescChange = (val: string) => updateField('description', val)

const handleMethodChange = (method: HttpMethod) => {
  updateField('method', method)
  // 针对 POST/PUT 默认切到 body json 模式（如果当前是 none）
  if ((method === 'POST' || method === 'PUT') && props.request.bodyType === 'none') {
    updateField('bodyType', 'json')
    activeTab.value = 'body'
  }
}

const formatBodyJson = () => {
  if (!props.request.bodyRaw) return
  try {
    const formatted = jsonFormat(props.request.bodyRaw, 2)
    updateField('bodyRaw', formatted)
    ElMessage.success('JSON 格式化成功')
  } catch {
    ElMessage.error('无效的 JSON 格式，无法格式化')
  }
}

const compressBodyJson = () => {
  if (!props.request.bodyRaw) return
  try {
    const compressed = jsonCompress(props.request.bodyRaw)
    updateField('bodyRaw', compressed)
    ElMessage.success('JSON 压缩成功')
  } catch {
    ElMessage.error('无效的 JSON 格式，无法压缩')
  }
}

const handleSaveAs = () => {
  if (props.groups.length === 0) {
    ElMessage.warning('请先创建分组')
    return
  }
  ElMessageBox.prompt('请输入接口另存为的名称：', '另存为新接口', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    inputValue: `${props.request.name || '接口'} (副本)`,
    inputValidator: (val) => (val && val.trim() ? true : '接口名称不能为空')
  }).then(({ value }) => {
    const targetGroupId = props.currentGroupId || props.groups[0]?.id
    if (targetGroupId) {
      emit('saveAs', targetGroupId, value.trim())
    }
  }).catch(() => {})
}
</script>

<template>
  <div class="request-editor">
    <!-- 顶部：接口名称与保存操作 -->
    <div class="editor-top-bar">
      <el-input
        :model-value="request.name"
        placeholder="接口名称"
        class="req-name-input"
        @update:model-value="handleNameChange"
      />

      <div class="top-actions">
        <el-button
          :icon="DocumentChecked"
          size="default"
          @click="emit('save')"
        >
          保存
        </el-button>
        <el-button
          :icon="FolderAdd"
          size="default"
          @click="handleSaveAs"
        >
          另存为
        </el-button>
      </div>
    </div>

    <!-- URL 与 发送栏 -->
    <div class="url-bar">
      <el-select
        :model-value="request.method"
        class="method-select"
        style="width: 120px;"
        @update:model-value="handleMethodChange"
      >
        <el-option
          v-for="m in httpMethods"
          :key="m"
          :label="m"
          :value="m"
        />
      </el-select>

      <el-input
        :model-value="request.url"
        placeholder="输入请求 URL，如 {{baseUrl}}/api/users 或 https://httpbin.org/get"
        class="url-input"
        clearable
        @update:model-value="handleUrlChange"
        @keyup.enter="emit('send')"
      />

      <el-button
        type="primary"
        class="send-btn"
        :loading="loading"
        :icon="Position"
        @click="emit('send')"
      >
        发送
      </el-button>
    </div>

    <!-- 参数与请求体配置 Tabs -->
    <div class="config-tabs-wrapper">
      <el-tabs v-model="activeTab" class="config-tabs">
        <!-- Query Params -->
        <el-tab-pane name="params">
          <template #label>
            <span>Params</span>
            <el-badge
              v-if="enabledParamsCount > 0"
              :value="enabledParamsCount"
              class="tab-badge"
              type="primary"
            />
          </template>
          <div class="tab-pane-content">
            <KeyValueEditor
              :model-value="request.params || []"
              key-placeholder="参数名 (Key)"
              value-placeholder="参数值 (Value)"
              desc-placeholder="描述"
              @update:model-value="handleParamsChange"
            />
          </div>
        </el-tab-pane>

        <!-- Headers -->
        <el-tab-pane name="headers">
          <template #label>
            <span>Headers</span>
            <el-badge
              v-if="enabledHeadersCount > 0"
              :value="enabledHeadersCount"
              class="tab-badge"
              type="primary"
            />
          </template>
          <div class="tab-pane-content">
            <KeyValueEditor
              :model-value="request.headers || []"
              key-placeholder="请求头 (Header)"
              value-placeholder="值 (Value)"
              desc-placeholder="描述"
              :key-suggestions="commonHeaders"
              @update:model-value="(val) => updateField('headers', val)"
            />
          </div>
        </el-tab-pane>

        <!-- Body -->
        <el-tab-pane label="Body" name="body">
          <div class="tab-pane-content">
            <!-- Body 类型单选 -->
            <div class="body-type-selector">
              <el-radio-group
                :model-value="request.bodyType"
                size="small"
                @update:model-value="handleBodyTypeChange"
              >
                <el-radio-button value="none">none</el-radio-button>
                <el-radio-button value="json">json</el-radio-button>
                <el-radio-button value="x-www-form-urlencoded">x-www-form-urlencoded</el-radio-button>
                <el-radio-button value="raw">raw</el-radio-button>
              </el-radio-group>

              <!-- JSON 操作辅助按钮 -->
              <div v-if="request.bodyType === 'json'" class="json-tools">
                <el-button
                  size="small"
                  link
                  type="primary"
                  :icon="MagicStick"
                  @click="formatBodyJson"
                >
                  格式化
                </el-button>
                <el-button
                  size="small"
                  link
                  type="info"
                  @click="compressBodyJson"
                >
                  压缩
                </el-button>
                <el-button
                  size="small"
                  link
                  type="danger"
                  :icon="Delete"
                  @click="updateField('bodyRaw', '')"
                >
                  清空
                </el-button>
                <el-tag
                  v-if="request.bodyRaw && !isJsonValid"
                  size="small"
                  type="danger"
                  effect="plain"
                >
                  JSON 格式错误
                </el-tag>
              </div>
            </div>

            <!-- Body 编辑区 -->
            <div v-if="request.bodyType === 'none'" class="empty-body-hint">
              <el-text type="info" size="small">该请求不携带请求体</el-text>
            </div>

            <div v-else-if="request.bodyType === 'json' || request.bodyType === 'raw'" class="body-editor">
              <el-input
                :model-value="request.bodyRaw"
                type="textarea"
                :rows="8"
                :placeholder="request.bodyType === 'json' ? '{\n  &quot;key&quot;: &quot;value&quot;\n}' : '请输入文本内容'"
                class="code-textarea"
                @update:model-value="handleBodyRawChange"
              />
            </div>

            <div v-else-if="request.bodyType === 'x-www-form-urlencoded'" class="body-editor">
              <KeyValueEditor
                :model-value="request.bodyUrlEncoded || []"
                key-placeholder="参数名"
                value-placeholder="参数值"
                :show-description="false"
                @update:model-value="(val) => updateField('bodyUrlEncoded', val)"
              />
            </div>
          </div>
        </el-tab-pane>

        <!-- Description -->
        <el-tab-pane label="说明" name="desc">
          <div class="tab-pane-content">
            <el-input
              :model-value="request.description || ''"
              type="textarea"
              :rows="4"
              placeholder="接口说明或备注信息..."
              @update:model-value="handleDescChange"
            />
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<style scoped>
.request-editor {
  display: flex;
  flex-direction: column;
  gap: 12px;
  background-color: var(--el-bg-color);
  padding: 16px;
  border-radius: 8px;
  border: 1px solid var(--el-border-color-light);
}

.editor-top-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.req-name-input {
  max-width: 320px;
  font-weight: 600;
}

.top-actions {
  display: flex;
  gap: 8px;
}

.url-bar {
  display: flex;
  align-items: center;
  gap: 8px;
}

.url-input {
  flex: 1;
}

.send-btn {
  width: 90px;
  font-weight: 600;
}

.config-tabs-wrapper {
  margin-top: 4px;
}

.tab-badge {
  margin-left: 4px;
}

.tab-pane-content {
  padding-top: 8px;
  min-height: 160px;
}

.body-type-selector {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.json-tools {
  display: flex;
  align-items: center;
  gap: 8px;
}

.empty-body-hint {
  padding: 30px 0;
  text-align: center;
}

.code-textarea :deep(textarea) {
  font-family: Menlo, Monaco, Consolas, 'Courier New', monospace;
  font-size: 13px;
  line-height: 1.5;
}
</style>
