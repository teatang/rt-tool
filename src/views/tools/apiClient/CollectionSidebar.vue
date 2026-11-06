<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  Plus,
  Folder,
  FolderOpened,
  Search,
  MoreFilled,
  CopyDocument,
  Delete,
  Edit,
  Clock,
  Files
} from '@element-plus/icons-vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import type { ApiGroup, ApiRequestItem, HttpMethod, RequestHistoryItem } from '@/types/apiClient'

const props = withDefaults(
  defineProps<{
    groups: ApiGroup[]
    activeRequestId?: string | null
    history?: RequestHistoryItem[]
  }>(),
  {
    activeRequestId: null,
    history: () => []
  }
)

const emit = defineEmits<{
  (e: 'selectRequest', req: ApiRequestItem, groupId: string): void
  (e: 'newRequest', groupId?: string): void
  (e: 'newGroup'): void
  (e: 'renameGroup', groupId: string, newName: string): void
  (e: 'deleteGroup', groupId: string): void
  (e: 'deleteRequest', groupId: string, requestId: string): void
  (e: 'duplicateRequest', groupId: string, req: ApiRequestItem): void
  (e: 'update:groups', groups: ApiGroup[]): void
  (e: 'selectHistory', item: RequestHistoryItem): void
  (e: 'clearHistory'): void
}>()

const activeSidebarTab = ref<'collections' | 'history'>('collections')
const searchQuery = ref('')

// 搜索过滤后的分组
const filteredGroups = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()
  if (!query) return props.groups

  return props.groups
    .map((g) => {
      const matchGroupName = g.name.toLowerCase().includes(query)
      const matchedRequests = g.requests.filter(
        (r) =>
          r.name.toLowerCase().includes(query) ||
          r.url.toLowerCase().includes(query) ||
          r.method.toLowerCase().includes(query)
      )
      if (matchGroupName) {
        return g
      }
      if (matchedRequests.length > 0) {
        return {
          ...g,
          requests: matchedRequests,
          isExpanded: true
        }
      }
      return null
    })
    .filter(Boolean) as ApiGroup[]
})

// 搜索过滤后的历史记录
const filteredHistory = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()
  if (!query) return props.history

  return props.history.filter(
    (item) =>
      item.sentRequest.url.toLowerCase().includes(query) ||
      item.sentRequest.method.toLowerCase().includes(query) ||
      item.name.toLowerCase().includes(query)
  )
})

const toggleGroup = (group: ApiGroup) => {
  group.isExpanded = !group.isExpanded
}

const handleRenameGroup = (group: ApiGroup) => {
  ElMessageBox.prompt('请输入新的分组名称：', '重命名分组', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    inputValue: group.name,
    inputValidator: (val) => (val && val.trim() ? true : '分组名称不能为空')
  }).then(({ value }) => {
    emit('renameGroup', group.id, value.trim())
    ElMessage.success('重命名成功')
  }).catch(() => {})
}

const handleDeleteGroup = (group: ApiGroup) => {
  ElMessageBox.confirm(
    `确定要删除分组 "${group.name}" 及其包含的所有接口吗？`,
    '删除分组',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    emit('deleteGroup', group.id)
    ElMessage.success('分组已删除')
  }).catch(() => {})
}

const handleDeleteRequest = (groupId: string, req: ApiRequestItem) => {
  ElMessageBox.confirm(`确定要删除接口 "${req.name}" 吗？`, '删除接口', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    emit('deleteRequest', groupId, req.id)
    ElMessage.success('接口已删除')
  }).catch(() => {})
}

const handleClearHistory = () => {
  ElMessageBox.confirm('确定要清空全部请求历史记录吗？', '清空历史', {
    confirmButtonText: '清空',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    emit('clearHistory')
    ElMessage.success('历史记录已清空')
  }).catch(() => {})
}

const getMethodColor = (method: HttpMethod | string): string => {
  switch (method?.toUpperCase()) {
    case 'GET':
      return '#67c23a'
    case 'POST':
      return '#e6a23c'
    case 'PUT':
      return '#409eff'
    case 'DELETE':
      return '#f56c6c'
    case 'PATCH':
      return '#9c27b0'
    default:
      return '#909399'
  }
}

const formatTime = (ts: number) => {
  const d = new Date(ts)
  const h = String(d.getHours()).padStart(2, '0')
  const m = String(d.getMinutes()).padStart(2, '0')
  const s = String(d.getSeconds()).padStart(2, '0')
  return `${h}:${m}:${s}`
}
</script>

<template>
  <div class="collection-sidebar">
    <!-- 顶栏视图切换：集合 vs 历史 -->
    <div class="sidebar-tab-switch">
      <div
        :class="['switch-btn', { active: activeSidebarTab === 'collections' }]"
        @click="activeSidebarTab = 'collections'"
      >
        <el-icon><Files /></el-icon>
        <span>接口分组</span>
      </div>
      <div
        :class="['switch-btn', { active: activeSidebarTab === 'history' }]"
        @click="activeSidebarTab = 'history'"
      >
        <el-icon><Clock /></el-icon>
        <span>历史记录</span>
        <span v-if="history.length > 0" class="tab-count-badge">{{ history.length }}</span>
      </div>
    </div>

    <!-- 顶部搜索与操作栏 -->
    <div class="sidebar-header">
      <div class="search-box">
        <el-input
          v-model="searchQuery"
          size="small"
          :placeholder="activeSidebarTab === 'collections' ? '搜索接口名称 / URL' : '搜索历史请求'"
          :prefix-icon="Search"
          clearable
        />
      </div>

      <!-- 集合操作按钮 -->
      <div v-if="activeSidebarTab === 'collections'" class="action-buttons">
        <el-button
          type="primary"
          size="small"
          :icon="Plus"
          @click="emit('newRequest')"
        >
          新建接口
        </el-button>
        <el-button
          size="small"
          :icon="Folder"
          @click="emit('newGroup')"
        >
          新建分组
        </el-button>
      </div>

      <!-- 历史操作按钮 -->
      <div v-else class="action-buttons">
        <el-button
          size="small"
          :icon="Delete"
          :disabled="history.length === 0"
          style="width: 100%;"
          @click="handleClearHistory"
        >
          清空历史
        </el-button>
      </div>
    </div>

    <!-- 集合视图 -->
    <div v-if="activeSidebarTab === 'collections'" class="group-tree">
      <div v-if="filteredGroups.length === 0" class="empty-tree">
        <el-text type="info" size="small">未找到相关接口或分组</el-text>
      </div>

      <div
        v-for="group in filteredGroups"
        :key="group.id"
        class="group-node"
      >
        <!-- 分组头部 -->
        <div class="group-header" @click="toggleGroup(group)">
          <div class="group-title">
            <el-icon class="folder-icon">
              <component :is="group.isExpanded ? FolderOpened : Folder" />
            </el-icon>
            <span class="group-name" :title="group.name">{{ group.name }}</span>
            <span class="count-badge">{{ group.requests.length }}</span>
          </div>

          <div class="group-actions" @click.stop>
            <el-dropdown trigger="click">
              <el-button link :icon="MoreFilled" size="small" />
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item :icon="Plus" @click="emit('newRequest', group.id)">
                    在此分组新建接口
                  </el-dropdown-item>
                  <el-dropdown-item :icon="Edit" @click="handleRenameGroup(group)">
                    重命名分组
                  </el-dropdown-item>
                  <el-dropdown-item
                    divided
                    :icon="Delete"
                    style="color: var(--el-color-danger)"
                    @click="handleDeleteGroup(group)"
                  >
                    删除分组
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </div>

        <!-- 接口子列表 -->
        <div v-show="group.isExpanded" class="request-list">
          <div
            v-if="group.requests.length === 0"
            class="empty-request"
            @click="emit('newRequest', group.id)"
          >
            + 点击添加接口
          </div>

          <div
            v-for="req in group.requests"
            :key="req.id"
            :class="['request-item', { active: activeRequestId === req.id }]"
            @click="emit('selectRequest', req, group.id)"
          >
            <!-- 请求方法 Badge -->
            <span
              class="method-badge"
              :style="{ color: getMethodColor(req.method) }"
            >
              {{ req.method }}
            </span>

            <!-- 请求名称 -->
            <span class="request-name" :title="req.url || req.name">
              {{ req.name || '未命名接口' }}
            </span>

            <!-- 操作菜单 -->
            <div class="req-actions" @click.stop>
              <el-dropdown trigger="click">
                <el-button link :icon="MoreFilled" size="small" />
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item
                      :icon="CopyDocument"
                      @click="emit('duplicateRequest', group.id, req)"
                    >
                      复制接口
                    </el-dropdown-item>
                    <el-dropdown-item
                      :icon="Delete"
                      style="color: var(--el-color-danger)"
                      @click="handleDeleteRequest(group.id, req)"
                    >
                      删除接口
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 历史记录视图 -->
    <div v-else class="history-list-wrapper">
      <div v-if="filteredHistory.length === 0" class="empty-tree">
        <el-text type="info" size="small">暂无请求历史</el-text>
      </div>

      <div
        v-for="item in filteredHistory"
        :key="item.id"
        class="history-item"
        @click="emit('selectHistory', item)"
      >
        <div class="history-top-row">
          <span
            class="method-badge"
            :style="{ color: getMethodColor(item.sentRequest.method) }"
          >
            {{ item.sentRequest.method }}
          </span>

          <el-tag
            size="small"
            :type="item.response.status >= 200 && item.response.status < 300 ? 'success' : 'danger'"
            effect="plain"
            class="history-status-tag"
          >
            {{ item.response.status || 'Err' }}
          </el-tag>

          <span class="history-time">{{ formatTime(item.timestamp) }}</span>
        </div>

        <div class="history-url" :title="item.sentRequest.url">
          {{ item.sentRequest.url }}
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.collection-sidebar {
  width: 280px;
  min-width: 280px;
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: var(--el-bg-color);
  border-right: 1px solid var(--el-border-color-light);
  user-select: none;
}

.sidebar-tab-switch {
  display: flex;
  background-color: var(--el-fill-color-light);
  border-bottom: 1px solid var(--el-border-color-lighter);
  padding: 4px;
  gap: 4px;
}

.switch-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 6px 0;
  font-size: 12px;
  font-weight: 500;
  color: var(--el-text-color-secondary);
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.15s;
}

.switch-btn:hover {
  color: var(--el-text-color-primary);
}

.switch-btn.active {
  background-color: var(--el-bg-color);
  color: var(--el-color-primary);
  font-weight: 600;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.tab-count-badge {
  background-color: var(--el-fill-color);
  font-size: 10px;
  padding: 0 5px;
  border-radius: 10px;
}

.sidebar-header {
  padding: 10px 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.action-buttons .el-button {
  flex: 1;
}

.group-tree,
.history-list-wrapper {
  flex: 1;
  overflow-y: auto;
  padding: 6px 0;
}

.empty-tree {
  padding: 24px 12px;
  text-align: center;
}

.group-node {
  margin-bottom: 2px;
}

.group-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  cursor: pointer;
  border-radius: 4px;
  margin: 0 4px;
  transition: background-color 0.15s;
}

.group-header:hover {
  background-color: var(--el-fill-color-light);
}

.group-title {
  display: flex;
  align-items: center;
  gap: 6px;
  overflow: hidden;
  flex: 1;
}

.folder-icon {
  font-size: 15px;
  color: var(--el-color-warning);
}

.group-name {
  font-size: 13px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.count-badge {
  font-size: 11px;
  color: var(--el-text-color-secondary);
  background-color: var(--el-fill-color);
  padding: 1px 6px;
  border-radius: 10px;
}

.group-actions {
  opacity: 0.6;
}

.group-header:hover .group-actions {
  opacity: 1;
}

.request-list {
  padding-left: 16px;
}

.empty-request {
  padding: 6px 16px;
  font-size: 12px;
  color: var(--el-text-color-placeholder);
  cursor: pointer;
}

.empty-request:hover {
  color: var(--el-color-primary);
}

.request-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  margin: 1px 4px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.15s;
}

.request-item:hover {
  background-color: var(--el-fill-color-light);
}

.request-item.active {
  background-color: var(--el-color-primary-light-9);
}

.method-badge {
  font-size: 11px;
  font-weight: 700;
  width: 44px;
  flex-shrink: 0;
}

.request-name {
  font-size: 13px;
  color: var(--el-text-color-regular);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
}

.request-item.active .request-name {
  color: var(--el-color-primary);
  font-weight: 500;
}

.req-actions {
  opacity: 0;
  transition: opacity 0.15s;
}

.request-item:hover .req-actions {
  opacity: 1;
}

/* 历史列表项样式 */
.history-item {
  padding: 8px 12px;
  margin: 2px 4px;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.15s;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.history-item:hover {
  background-color: var(--el-fill-color-light);
}

.history-top-row {
  display: flex;
  align-items: center;
  gap: 6px;
}

.history-status-tag {
  font-size: 10px;
  padding: 0 4px;
  height: 18px;
  line-height: 16px;
}

.history-time {
  font-size: 11px;
  color: var(--el-text-color-secondary);
  margin-left: auto;
}

.history-url {
  font-family: monospace;
  font-size: 12px;
  color: var(--el-text-color-regular);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
