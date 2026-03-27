<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { invoke } from '@tauri-apps/api/core'
import { open as openDialog } from '@tauri-apps/plugin-dialog'
import { ElMessage } from 'element-plus'
import { EditPen, FolderOpened } from '@element-plus/icons-vue'
import PageTitle from '../../components/PageTitle.vue'

interface FileItem {
  path: string
  old_name: string
  new_name: string
}

const { t } = useI18n()

const selectedDir = ref('')
const regexPattern = ref('')
const replacement = ref('')
const fileList = ref<FileItem[]>([])
const loading = ref(false)
const renaming = ref(false)
const regexError = ref('')

const hasChanges = computed(() => {
  return fileList.value.some(f => f.old_name !== f.new_name)
})

const matchCount = computed(() => fileList.value.length)

const changeCount = computed(() => {
  return fileList.value.filter(f => f.old_name !== f.new_name).length
})

const selectDirectory = async () => {
  try {
    const selected = await openDialog({
      directory: true,
      multiple: false,
      title: t('labels.selectDir')
    })
    if (selected) {
      selectedDir.value = selected as string
      if (regexPattern.value) {
        await loadFiles()
      }
    }
  } catch {
    ElMessage.error(t('messages.error'))
  }
}

const loadFiles = async () => {
  if (!selectedDir.value || !regexPattern.value) {
    return
  }

  regexError.value = ''
  loading.value = true

  try {
    fileList.value = await invoke('list_dir_files', {
      path: selectedDir.value,
      pattern: regexPattern.value
    })
    if (fileList.value.length === 0) {
      ElMessage.info(t('labels.noFiles'))
    }
  } catch (e) {
    regexError.value = String(e)
    fileList.value = []
  } finally {
    loading.value = false
  }
}

const applyReplacement = () => {
  if (!replacement.value || !regexPattern.value) {
    return
  }

  try {
    const regex = new RegExp(regexPattern.value, 'g')
    fileList.value = fileList.value.map(file => {
      const newName = file.old_name.replace(regex, replacement.value)
      return { ...file, new_name: newName }
    })
    regexError.value = ''
  } catch (e) {
    regexError.value = String(e)
  }
}

const updateNewName = (index: number, newName: string) => {
  fileList.value[index].new_name = newName
}

const executeRename = async () => {
  if (!hasChanges.value) {
    return
  }

  renaming.value = true

  try {
    const items = fileList.value
      .filter(f => f.old_name !== f.new_name)
      .map(f => {
        // 兼容 Windows 和 Unix 路径分隔符，统一使用正斜杠
        const normalizedPath = f.path.replace(/\\/g, '/')
        const lastSlash = normalizedPath.lastIndexOf('/')
        const dirPath = normalizedPath.substring(0, lastSlash)
        return {
          old_path: f.path,
          new_path: `${dirPath}/${f.new_name}`
        }
      })

    await invoke('batch_rename', { items })
    ElMessage.success(t('labels.renameSuccess'))
    await loadFiles()
  } catch (e) {
    ElMessage.error(`${t('labels.renameFailed')}: ${e}`)
  } finally {
    renaming.value = false
  }
}

watch(regexPattern, () => {
  if (selectedDir.value && regexPattern.value) {
    loadFiles()
  }
})
</script>

<template>
  <div class="tool-container">
    <PageTitle
      :icon="EditPen"
      :title="t('tools.fileRename')"
      :description="t('fileRename')"
      color="#67c23a"
    />

    <div class="rename-form">
      <div class="dir-input mb-4">
        <el-input
          v-model="selectedDir"
          :placeholder="t('labels.selectDir')"
          readonly
        />
        <el-button :icon="FolderOpened" @click="selectDirectory">
          {{ t('actions.selectFolder') }}
        </el-button>
      </div>

      <div class="regex-input mb-4">
        <el-input
          v-model="regexPattern"
          :placeholder="t('labels.regex')"
          class="mb-2"
        />
        <el-input
          v-model="replacement"
          :placeholder="t('labels.replacement')"
          @keyup.enter="applyReplacement"
        />
        <div v-if="regexError" class="error-text">{{ regexError }}</div>
      </div>

      <div class="action-row mb-4">
        <el-button type="primary" @click="applyReplacement" :disabled="!regexPattern || !replacement">
          {{ t('labels.preview') }}
        </el-button>
        <el-button
          type="success"
          @click="executeRename"
          :disabled="!hasChanges || renaming"
          :loading="renaming"
        >
          {{ t('labels.executeRename') }} ({{ changeCount }})
        </el-button>
        <span class="file-count" v-if="matchCount > 0">
          {{ t('labels.count') }}: {{ matchCount }}
        </span>
      </div>
    </div>

    <div v-if="fileList.length > 0" class="file-list">
      <div class="list-header">
        <span class="col-original">{{ t('labels.original') }}</span>
        <span class="col-arrow"></span>
        <span class="col-new">{{ t('labels.newName') }}</span>
      </div>
      <div
        v-for="(file, index) in fileList"
        :key="file.path"
        class="file-item"
        :class="{ 'has-change': file.old_name !== file.new_name }"
      >
        <span class="col-original">{{ file.old_name }}</span>
        <span class="col-arrow">→</span>
        <el-input
          class="col-new"
          v-model="fileList[index].new_name"
          @change="updateNewName(index, $event as string)"
        />
      </div>
    </div>

    <div v-else-if="selectedDir && regexPattern && !loading" class="empty-state">
      {{ t('labels.noFiles') }}
    </div>
  </div>
</template>

<style scoped>
.tool-container {
  max-width: 900px;
}
.rename-form {
  margin-bottom: 20px;
}
.dir-input {
  display: flex;
  gap: 8px;
}
.dir-input .el-input {
  flex: 1;
}
.regex-input {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.error-text {
  color: var(--el-color-danger);
  font-size: 12px;
}
.action-row {
  display: flex;
  gap: 8px;
  align-items: center;
}
.file-count {
  margin-left: 16px;
  color: var(--el-text-color-secondary);
  font-size: 14px;
}
.mb-4 {
  margin-bottom: 16px;
}
.mb-2 {
  margin-bottom: 8px;
}
.file-list {
  border: 1px solid var(--el-border-color-light);
  border-radius: 4px;
  overflow: hidden;
}
.list-header {
  display: flex;
  padding: 12px 16px;
  background-color: var(--el-fill-color-light);
  font-weight: bold;
  border-bottom: 1px solid var(--el-border-color-light);
}
.file-item {
  display: flex;
  align-items: center;
  padding: 8px 16px;
  border-bottom: 1px solid var(--el-border-color-light);
}
.file-item:last-child {
  border-bottom: none;
}
.file-item.has-change {
  background-color: var(--el-color-success-lighter);
}
.col-original {
  flex: 1;
  font-family: monospace;
  font-size: 13px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.col-arrow {
  width: 40px;
  text-align: center;
  color: var(--el-text-color-secondary);
}
.col-new {
  flex: 1;
}
.col-new :deep(.el-input__inner) {
  font-family: monospace;
  font-size: 13px;
}
.empty-state {
  text-align: center;
  padding: 40px;
  color: var(--el-text-color-secondary);
}
</style>
