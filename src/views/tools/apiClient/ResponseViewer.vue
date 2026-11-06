<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  Clock,
  Files,
  DocumentCopy,
  Search
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import type { HttpResponseData } from '@/types/apiClient'
import { jsonFormat, isValidJson } from '@/utils/json'

const props = defineProps<{
  response: HttpResponseData | null
  loading: boolean
}>()

const activeTab = ref<'body' | 'headers' | 'raw'>('body')
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

    <!-- 无响应空白态 -->
    <div v-else-if="!response" class="response-empty">
      <el-icon class="empty-icon"><Files /></el-icon>
      <div class="empty-text">暂无响应数据，点击上方的【发送】按钮发起请求</div>
    </div>

    <!-- 异常/网络错误状态 -->
    <div v-else-if="response.error" class="response-error">
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
    </div>

    <!-- 正常响应结果 -->
    <div v-else class="response-content">
      <!-- 响应指标状态栏 -->
      <div class="response-status-bar">
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

      <!-- 响应结果 Tabs -->
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

        <!-- 响应头 -->
        <el-tab-pane name="headers">
          <template #label>
            <span>响应头 (Headers)</span>
            <el-badge
              v-if="response.headers?.length"
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
              :model-value="response.body"
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
</style>
