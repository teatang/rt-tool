<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { invoke } from '@tauri-apps/api/core'
import { ElMessage } from 'element-plus'

const { t } = useI18n()

const oldPath = ref('')
const newPath = ref('')
const loading = ref(false)
const error = ref('')
const success = ref(false)

const rename = async () => {
  if (!oldPath.value || !newPath.value) {
    return
  }

  loading.value = true
  error.value = ''
  success.value = false

  try {
    await invoke('rename_file', {
      oldPath: oldPath.value,
      newPath: newPath.value
    })
    success.value = true
    ElMessage.success(t('messages.success'))
  } catch (e) {
    error.value = String(e)
  } finally {
    loading.value = false
  }
}

const clear = () => {
  oldPath.value = ''
  newPath.value = ''
  error.value = ''
  success.value = false
}
</script>

<template>
  <div class="tool-container">
    <h2>{{ t('tools.fileRename') }}</h2>
    <div class="rename-form">
      <el-input
        v-model="oldPath"
        :placeholder="t('labels.oldName')"
        class="mb-4"
      />
      <el-input
        v-model="newPath"
        :placeholder="t('labels.newName')"
        class="mb-4"
      />
      <div class="btn-group">
        <el-button type="primary" @click="rename" :loading="loading">
          {{ t('actions.rename') }}
        </el-button>
        <el-button @click="clear">{{ t('actions.clear') }}</el-button>
      </div>
    </div>

    <div v-if="error" class="error-message">
      {{ error }}
    </div>
  </div>
</template>

<style scoped>
.tool-container {
  max-width: 600px;
}
.rename-form {
  margin-bottom: 20px;
}
.mb-4 {
  margin-bottom: 16px;
}
.btn-group {
  display: flex;
  gap: 8px;
}
.error-message {
  color: var(--el-color-danger);
  padding: 16px;
}
</style>
