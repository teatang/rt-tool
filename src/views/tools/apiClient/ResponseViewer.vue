<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  Clock,
  Files,
  DocumentCopy,
  Search,
  Position
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import type { HttpResponseData, SentRequestDetail } from '@/types/apiClient'
import { jsonFormat, isValidJson } from '@/utils/json'

const props = defineProps<{
  response: HttpResponseData | null
  loading: boolean
  sentRequest?: SentRequestDetail | null
}>()

const activeTab = ref<'body' | 'sent' | 'headers' | 'raw'>('body')
const headerSearch = ref('')

const isJson = computed(() => {
  if (!props.response?.body) return false
  return isValidJson(props.response.body)
})

const formattedBody = computed(() => {
  if (!props.response?.body) return ''
  if (isJson.value) {
    try {
      return jsonFormat(props.response.body, 2)
    } catch {
      return props.response.body
    }
  }
  return props.response.body
})

const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}

const getStatusTagType = (status: number): 'success' | 'warning' | 'danger' | 'info' => {
  if (status >= 200 && status < 300) return 'success'
  if (status >= 300 && status < 400) return 'warning'
  if (status >= 400 && status < 500) return 'warning'
  if (status >= 500) return 'danger'
  return 'info'
}

const copyText = async (text: string, label = '内容') => {
  try {
    await navigator.clipboard.writeText(text)
    ElMessage.success(`${label}已复制到剪贴板`)
  } catch {
    ElMessage.error('复制失败')
  }
}

const filteredHeaders = computed(() => {
  if (!props.response?.headers) return []
  const q = headerSearch.value.trim().toLowerCase()
  if (!q) return props.response.headers
  return props.response.headers.filter(
    ([k, v]) => k.toLowerCase().includes(q) || v.toLowerCase().includes(q)
  )
})
</script>

<template>
  <div class="response-viewer">
    <!-- 正在加载状态 -->
    <div v-if="loading" class="response-loading">
      <el-icon class="is-loading loading-icon"><Clock /></el-icon>
      <div class="loading-text">正在发送请求，请稍候...</div>
    </div>

    <!-- 无响应空白态（如果此时有 sentRequest 依然可以查看） -->
    <div v-else-if="!response && !sentRequest" class="response-empty">
      <el-icon class="empty-icon"><Files /></el-icon>
      <div class="empty-text">暂无响应数据，点击上方的【发送】按钮发起请求</div>
    </div>

    <!-- 异常/网络错误状态 -->
    <div v-else-if="response && response.error" class="response-error">
      <el-alert
        title="网络请求失败"
        type="error"
        :description="response.error"
        show-icon
        :closable="false"
      />
      <div class="error-meta">
        <el-tag size="small" type="info">耗时: {{ response.elapsedMs }} ms</el-tag>
      </div>

      <!-- 出错时也可以检查发出的请求 -->
      <div v-if="sentRequest" class="error-sent-check">
        <div class="sent-section-title">检查发出的请求：</div>
        <div class="sent-url-box">
          <el-tag size="small" type="primary" effect="dark" class="sent-method-tag">{{ sentRequest.method }}</el-tag>
          <span class="sent-url-text">{{ sentRequest.url }}</span>
          <el-button link :icon="DocumentCopy" size="small" @click="copyText(sentRequest.url, 'URL')" />
        </div>
      </div>
    </div>

    <!-- 正常响应结果 -->
    <div v-else class="response-content">
      <!-- 响应指标状态栏 -->
      <div v-if="response" class="response-status-bar">
        <div class="status-tags">
          <!-- 状态码 Badge -->
          <el-tag
            :type="getStatusTagType(response.status)"
            size="large"
            effect="dark"
            class="status-code-tag"
          >
            {{ response.status }} {{ response.statusText }}
          </el-tag>

          <!-- 耗时 -->
          <el-tag size="default" type="info" class="meta-tag">
            <el-icon><Clock /></el-icon>
            <span>{{ response.elapsedMs }} ms</span>
          </el-tag>

          <!-- 体积 -->
          <el-tag size="default" type="info" class="meta-tag">
            <el-icon><Files /></el-icon>
            <span>{{ formatBytes(response.sizeBytes) }}</span>
          </el-tag>

          <!-- JSON 标识 -->
          <el-tag v-if="isJson" size="small" type="success" effect="plain">
            JSON
          </el-tag>
        </div>

        <div class="status-actions">
          <el-button
            size="small"
            :icon="DocumentCopy"
            @click="copyText(formattedBody, '响应体')"
          >
            复制响应
          </el-button>
        </div>
      </div>

      <!-- 响应与请求检查 Tabs -->
      <el-tabs v-model="activeTab" class="response-tabs">
        <!-- 响应体 -->
        <el-tab-pane label="响应体 (Body)" name="body">
          <div class="response-body-wrapper">
            <el-input
              :model-value="formattedBody"
              type="textarea"
              :rows="12"
              readonly
              class="response-code-textarea"
            />
          </div>
        </el-tab-pane>

        <!-- 实际发出的请求详情检查（核心增强） -->
        <el-tab-pane name="sent">
          <template #label>
            <span>实际请求 (Sent)</span>
            <el-icon v-if="sentRequest" style="margin-left: 4px; color: var(--el-color-primary)"><Position /></el-icon>
          </template>

          <div v-if="sentRequest" class="sent-request-wrapper">
            <!-- 完整 URL -->
            <div class="sent-section">
              <div class="sent-section-title">完整请求地址 (Resolved URL)</div>
              <div class="sent-url-box">
                <el-tag size="small" type="primary" effect="dark" class="sent-method-tag">{{ sentRequest.method }}</el-tag>
                <span class="sent-url-text">{{ sentRequest.url }}</span>
                <el-button link :icon="DocumentCopy" size="small" @click="copyText(sentRequest.url, 'URL')" />
              </div>
            </div>

            <!-- cURL 命令 -->
            <div class="sent-section">
              <div class="sent-section-header">
                <div class="sent-section-title">等效 cURL 命令行</div>
                <el-button size="small" :icon="DocumentCopy" @click="copyText(sentRequest.curlCommand, 'cURL')">复制 cURL</el-button>
              </div>
              <el-input
                :model-value="sentRequest.curlCommand"
                type="textarea"
                :rows="4"
                readonly
                class="response-code-textarea"
              />
            </div>

            <!-- 实际发送的 Headers -->
            <div class="sent-section">
              <div class="sent-section-title">实际发送请求头 (Headers)</div>
              <el-table
                :data="sentRequest.headers"
                size="small"
                stripe
                border
                class="headers-table"
                style="width: 100%"
              >
                <el-table-column prop="key" label="Header" width="220">
                  <template #default="{ row }">
                    <span class="header-name">{{ row.key }}</span>
                  </template>
                </el-table-column>
                <el-table-column prop="value" label="Value">
                  <template #default="{ row }">
                    <div class="header-val-cell">
                      <span class="header-val">{{ row.value }}</span>
                      <el-button link size="small" :icon="DocumentCopy" @click="copyText(row.value, row.key)" />
                    </div>
                  </template>
                </el-table-column>
              </el-table>
            </div>

            <!-- 实际发送的 Body -->
            <div v-if="sentRequest.body" class="sent-section">
              <div class="sent-section-header">
                <div class="sent-section-title">实际发送请求体 (Body)</div>
                <el-button size="small" :icon="DocumentCopy" @click="copyText(sentRequest.body, '请求体')">复制请求体</el-button>
              </div>
              <el-input
                :model-value="sentRequest.body"
                type="textarea"
                :rows="6"
                readonly
                class="response-code-textarea"
              />
            </div>
          </div>

          <div v-else class="empty-sent-hint">
            <el-text type="info" size="small">尚未发送请求，发送后可在此检查真实发出的完整 URL、请求头与请求体快照</el-text>
          </div>
        </el-tab-pane>

        <!-- 响应头 -->
        <el-tab-pane name="headers">
          <template #label>
            <span>响应头 (Headers)</span>
            <el-badge
              v-if="response?.headers?.length"
              :value="response.headers.length"
              class="header-badge"
              type="info"
            />
          </template>

          <div class="response-headers-wrapper">
            <div class="headers-filter">
              <el-input
                v-model="headerSearch"
                placeholder="过滤响应头"
                size="small"
                :prefix-icon="Search"
                clearable
                style="max-width: 240px;"
              />
            </div>

            <el-table
              :data="filteredHeaders"
              size="small"
              stripe
              border
              class="headers-table"
              style="width: 100%"
            >
              <el-table-column label="Header" width="240">
                <template #default="{ row }">
                  <span class="header-name">{{ row[0] }}</span>
                </template>
              </el-table-column>
              <el-table-column label="Value">
                <template #default="{ row }">
                  <div class="header-val-cell">
                    <span class="header-val">{{ row[1] }}</span>
                    <el-button
                      link
                      size="small"
                      :icon="DocumentCopy"
                      @click="copyText(row[1], row[0])"
                    />
                  </div>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-tab-pane>

        <!-- 原始响应 Raw -->
        <el-tab-pane label="原始输出 (Raw)" name="raw">
          <div class="response-body-wrapper">
            <el-input
              :model-value="response?.body || ''"
              type="textarea"
              :rows="12"
              readonly
              class="response-code-textarea"
            />
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<style scoped>
.response-viewer {
  background-color: var(--el-bg-color);
  padding: 16px;
  border-radius: 8px;
  border: 1px solid var(--el-border-color-light);
  min-height: 240px;
  display: flex;
  flex-direction: column;
}

.response-loading,
.response-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 0;
  color: var(--el-text-color-secondary);
  gap: 12px;
}

.loading-icon,
.empty-icon {
  font-size: 32px;
  color: var(--el-text-color-placeholder);
}

.loading-text,
.empty-text {
  font-size: 13px;
}

.response-error {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.error-meta {
  display: flex;
  gap: 8px;
}

.error-sent-check {
  margin-top: 12px;
  padding: 12px;
  background-color: var(--el-fill-color-light);
  border-radius: 6px;
}

.response-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.response-status-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.status-tags {
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-code-tag {
  font-weight: 700;
  letter-spacing: 0.5px;
}

.meta-tag {
  display: flex;
  align-items: center;
  gap: 4px;
}

.header-badge {
  margin-left: 4px;
}

.response-body-wrapper {
  margin-top: 8px;
}

.response-code-textarea :deep(textarea) {
  font-family: Menlo, Monaco, Consolas, 'Courier New', monospace;
  font-size: 13px;
  line-height: 1.5;
  background-color: var(--el-fill-color-light);
}

.response-headers-wrapper {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 8px;
}

.header-name {
  font-weight: 600;
  font-family: monospace;
}

.header-val-cell {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-val {
  font-family: monospace;
  font-size: 12px;
  word-break: break-all;
}

/* 实际请求检查样式 */
.sent-request-wrapper {
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin-top: 8px;
}

.sent-section {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.sent-section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.sent-section-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.sent-url-box {
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: var(--el-fill-color-light);
  padding: 8px 12px;
  border-radius: 6px;
  border: 1px solid var(--el-border-color-lighter);
}

.sent-method-tag {
  font-weight: 700;
}

.sent-url-text {
  flex: 1;
  font-family: monospace;
  font-size: 13px;
  color: var(--el-text-color-primary);
  word-break: break-all;
}

.empty-sent-hint {
  padding: 30px 0;
  text-align: center;
}
</style>
