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
  Edit
} from '@element-plus/icons-vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import type { ApiGroup, ApiRequestItem, HttpMethod } from '@/types/apiClient'

const props = defineProps<{
  groups: ApiGroup[]
  activeRequestId: string | null
}>()

const emit = defineEmits<{
  (e: 'selectRequest', req: ApiRequestItem, groupId: string): void
  (e: 'newRequest', groupId?: string): void
  (e: 'newGroup'): void
  (e: 'renameGroup', groupId: string, newName: string): void
  (e: 'deleteGroup', groupId: string): void
  (e: 'deleteRequest', groupId: string, requestId: string): void
  (e: 'duplicateRequest', groupId: string, req: ApiRequestItem): void
  (e: 'update:groups', groups: ApiGroup[]): void
}>()

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
</script>

<template>
  <div class="collection-sidebar">
    <!-- 顶部操作栏 -->
    <div class="sidebar-header">
      <div class="search-box">
        <el-input
          v-model="searchQuery"
          size="small"
          placeholder="搜索接口名称 / URL"
          :prefix-icon="Search"
          clearable
        />
      </div>
      <div class="action-buttons">
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
    </div>

    <!-- 分组与接口树形列表 -->
    <div class="group-tree">
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

.sidebar-header {
  padding: 12px;
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

.group-tree {
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
</style>
