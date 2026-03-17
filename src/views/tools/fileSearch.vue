<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { invoke } from '@tauri-apps/api/core'
import { open as openDialog } from '@tauri-apps/plugin-dialog'
import { openPath } from '@tauri-apps/plugin-opener'
import { ElMessage } from 'element-plus'

const { t } = useI18n()

const searchPath = ref('')
const keyword = ref('')
const results = ref<string[]>([])
const loading = ref(false)
const error = ref('')

// 选择文件夹
const selectFolder = async () => {
  try {
    const selected = await openDialog({
      directory: true,
      multiple: false,
      title: t('labels.selectFolder')
    })
    if (selected) {
      searchPath.value = selected as string
    }
  } catch {
    ElMessage.error(t('messages.error'))
  }
}

const search = async () => {
  if (!searchPath.value || !keyword.value) {
    return
  }

  loading.value = true
  error.value = ''
  results.value = []

  try {
    results.value = await invoke('search_files', {
      path: searchPath.value,
      keyword: keyword.value
    })
  } catch (e) {
    error.value = String(e)
  } finally {
    loading.value = false
  }
}

const openInExplorer = async (path: string) => {
  try {
    await openPath(path)
  } catch {
    ElMessage.error(t('messages.error'))
  }
}

const copyPath = async (path: string) => {
  try {
    await navigator.clipboard.writeText(path)
    ElMessage.success(t('messages.copySuccess'))
  } catch {
    ElMessage.error(t('messages.copyFailed'))
  }
}
</script>

<template>
  <div class="tool-container">
    <h2>{{ t('tools.fileSearch') }}</h2>
    <div class="search-form">
      <div class="path-input mb-4">
        <el-input
          v-model="searchPath"
          :placeholder="t('labels.searchPath')"
        />
        <el-button @click="selectFolder">{{ t('actions.selectFolder') }}</el-button>
      </div>
      <el-input
        v-model="keyword"
        :placeholder="t('labels.keyword')"
        @keyup.enter="search"
        class="mb-4"
      />
      <el-button type="primary" @click="search" :loading="loading">
        {{ t('actions.search') }}
      </el-button>
    </div>

    <div v-if="error" class="error-message">
      {{ error }}
    </div>

    <div v-else-if="results.length > 0" class="results">
      <div class="result-header">
        {{ t('labels.count') }}: {{ results.length }}
      </div>
      <div
        v-for="(result, index) in results"
        :key="index"
        class="result-item"
      >
        <span class="result-path">{{ result }}</span>
        <div class="result-actions">
          <el-button size="small" @click="openInExplorer(result)">
            Open
          </el-button>
          <el-button size="small" @click="copyPath(result)">
            {{ t('actions.copy') }}
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.tool-container {
  max-width: 800px;
}
.search-form {
  margin-bottom: 20px;
}
.path-input {
  display: flex;
  gap: 8px;
}
.mb-4 {
  margin-bottom: 16px;
}
.error-message {
  color: var(--el-color-danger);
  padding: 16px;
}
.results {
  border: 1px solid var(--el-border-color-light);
  border-radius: 4px;
}
.result-header {
  padding: 8px 16px;
  background-color: var(--el-fill-color-light);
  font-weight: bold;
  border-bottom: 1px solid var(--el-border-color-light);
}
.result-item {
  padding: 8px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--el-border-color-light);
}
.result-item:last-child {
  border-bottom: none;
}
.result-path {
  font-family: monospace;
  font-size: 13px;
  word-break: break-all;
}
.result-actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}
</style>
