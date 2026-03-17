<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'

const { t } = useI18n()

const input = ref('')
const output = ref('')
const isValid = ref(true)

const format = () => {
  try {
    // Simple HTML formatting
    let formatted = input.value
      .replace(/></g, '>\n<')
      .replace(/^\s+/gm, '')
      .trim()
    output.value = formatted
    isValid.value = true
  } catch {
    isValid.value = false
    output.value = t('messages.invalidHtml')
  }
}

const compress = () => {
  try {
    // HTML compression - remove extra whitespace
    let compressed = input.value
      .replace(/>\s+</g, '><')
      .replace(/\s+/g, ' ')
      .trim()
    output.value = compressed
    isValid.value = true
  } catch {
    isValid.value = false
    output.value = t('messages.invalidHtml')
  }
}

const copyOutput = async () => {
  try {
    await navigator.clipboard.writeText(output.value)
    ElMessage.success(t('messages.copySuccess'))
  } catch {
    ElMessage.error(t('messages.copyFailed'))
  }
}

const clear = () => {
  input.value = ''
  output.value = ''
  isValid.value = true
}
</script>

<template>
  <div class="tool-container">
    <h2>{{ t('tools.html') }}</h2>
    <el-row :gutter="20">
      <el-col :span="12">
        <el-input
          v-model="input"
          type="textarea"
          :rows="10"
          :placeholder="t('labels.input')"
        />
        <div class="btn-group">
          <el-button type="primary" @click="format">{{ t('actions.format') }}</el-button>
          <el-button type="primary" @click="compress">{{ t('actions.compress') }}</el-button>
          <el-button @click="clear">{{ t('actions.clear') }}</el-button>
        </div>
      </el-col>
      <el-col :span="12">
        <el-input
          v-model="output"
          type="textarea"
          :rows="10"
          :placeholder="t('labels.output')"
          readonly
          :class="{ 'error-text': !isValid }"
        />
        <div class="btn-group">
          <el-button @click="copyOutput">{{ t('actions.copy') }}</el-button>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<style scoped>
.tool-container {
  max-width: 1200px;
}
.btn-group {
  margin-top: 16px;
  display: flex;
  gap: 8px;
}
.error-text :deep(textarea) {
  color: var(--el-color-danger);
}
</style>
