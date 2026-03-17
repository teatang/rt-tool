<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'

const { t } = useI18n()

const count = ref(1)
const uuids = ref<string[]>([])

const generate = () => {
  uuids.value = []
  for (let i = 0; i < count.value; i++) {
    uuids.value.push(generateUUID())
  }
}

const generateUUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

const copyUuid = async (uuid: string) => {
  try {
    await navigator.clipboard.writeText(uuid)
    ElMessage.success(t('messages.copySuccess'))
  } catch {
    ElMessage.error(t('messages.copyFailed'))
  }
}

const copyAll = async () => {
  try {
    await navigator.clipboard.writeText(uuids.value.join('\n'))
    ElMessage.success(t('messages.copySuccess'))
  } catch {
    ElMessage.error(t('messages.copyFailed'))
  }
}
</script>

<template>
  <div class="tool-container">
    <h2>{{ t('tools.uuid') }}</h2>
    <div class="generate-form">
      <el-input-number v-model="count" :min="1" :max="100" />
      <el-button type="primary" @click="generate">
        {{ t('actions.generate') }}
      </el-button>
    </div>

    <div v-if="uuids.length > 0" class="results">
      <div class="result-header">
        <span>{{ t('labels.count') }}: {{ uuids.length }}</span>
        <el-button size="small" @click="copyAll">
          {{ t('actions.copy') }}
        </el-button>
      </div>
      <div
        v-for="(uuid, index) in uuids"
        :key="index"
        class="result-item"
        @click="copyUuid(uuid)"
      >
        <span class="uuid-text">{{ uuid }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.tool-container {
  max-width: 800px;
}
.generate-form {
  display: flex;
  gap: 16px;
  margin-bottom: 20px;
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
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.result-item {
  padding: 8px 16px;
  cursor: pointer;
  border-bottom: 1px solid var(--el-border-color-light);
}
.result-item:last-child {
  border-bottom: none;
}
.result-item:hover {
  background-color: var(--el-fill-color);
}
.uuid-text {
  font-family: monospace;
  font-size: 14px;
}
</style>
