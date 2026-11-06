<script setup lang="ts">
import { Plus, Close } from '@element-plus/icons-vue'
import type { ApiTabItem, HttpMethod } from '@/types/apiClient'

defineProps<{
  tabs: ApiTabItem[]
  activeTabId: string
}>()

const emit = defineEmits<{
  (e: 'selectTab', tabId: string): void
  (e: 'closeTab', tabId: string): void
  (e: 'newTab'): void
}>()

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
  <div class="request-tabs-bar">
    <div class="tabs-scroll-container">
      <div
        v-for="tab in tabs"
        :key="tab.tabId"
        :class="['tab-item', { active: activeTabId === tab.tabId }]"
        @click="emit('selectTab', tab.tabId)"
      >
        <!-- Method Badge -->
        <span
          class="tab-method"
          :style="{ color: getMethodColor(tab.request.method) }"
        >
          {{ tab.request.method }}
        </span>

        <!-- Tab Title -->
        <span class="tab-title" :title="tab.title || tab.request.name">
          {{ tab.title || tab.request.name || '新接口' }}
        </span>

        <!-- Dirty Indicator -->
        <span v-if="tab.isDirty" class="dirty-dot" title="有未保存修改">•</span>

        <!-- Close Button -->
        <el-icon
          class="tab-close-icon"
          title="关闭标签"
          @click.stop="emit('closeTab', tab.tabId)"
        >
          <Close />
        </el-icon>
      </div>

      <!-- Add New Tab Button -->
      <button
        class="add-tab-btn"
        title="新建接口标签"
        type="button"
        @click="emit('newTab')"
      >
        <el-icon><Plus /></el-icon>
      </button>
    </div>
  </div>
</template>

<style scoped>
.request-tabs-bar {
  display: flex;
  align-items: center;
  background-color: var(--el-bg-color-page);
  border-bottom: 1px solid var(--el-border-color-light);
  overflow-x: auto;
  user-select: none;
}

.tabs-scroll-container {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 6px 0 6px;
  min-height: 38px;
}

.tab-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  background-color: var(--el-fill-color-light);
  border: 1px solid var(--el-border-color-light);
  border-bottom: none;
  border-radius: 6px 6px 0 0;
  cursor: pointer;
  max-width: 200px;
  font-size: 13px;
  color: var(--el-text-color-regular);
  transition: all 0.15s ease;
}

.tab-item:hover {
  background-color: var(--el-fill-color);
  color: var(--el-text-color-primary);
}

.tab-item.active {
  background-color: var(--el-bg-color);
  color: var(--el-color-primary);
  font-weight: 600;
  border-color: var(--el-border-color);
  border-bottom: 1px solid var(--el-bg-color);
  margin-bottom: -1px;
}

.tab-method {
  font-size: 11px;
  font-weight: 700;
  flex-shrink: 0;
}

.tab-title {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
}

.dirty-dot {
  color: var(--el-color-warning);
  font-size: 18px;
  line-height: 1;
  font-weight: bold;
}

.tab-close-icon {
  font-size: 12px;
  border-radius: 50%;
  padding: 2px;
  color: var(--el-text-color-secondary);
  opacity: 0.6;
  transition: all 0.15s;
}

.tab-item:hover .tab-close-icon {
  opacity: 1;
}

.tab-close-icon:hover {
  background-color: var(--el-fill-color-dark);
  color: var(--el-color-danger);
}

.add-tab-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: none;
  background: transparent;
  color: var(--el-text-color-secondary);
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.15s;
}

.add-tab-btn:hover {
  background-color: var(--el-fill-color);
  color: var(--el-color-primary);
}
</style>
