<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'
import { PictureFilled } from '@element-plus/icons-vue'
import PageTitle from '../../components/PageTitle.vue'

const { t } = useI18n()

// 默认示例
const input = ref('<html><head><title>示例页面</title></head><body><h1>Hello World</h1><p>这是一个示例段落</p></body></html>')
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
    <PageTitle
      :icon="PictureFilled"
      :title="t('tools.html')"
      description="html"
      color="#909399"
    />
    <el-row :gutter="20">
      <!-- 左侧：输入 -->
      <el-col :span="12">
        <div class="panel">
          <div class="panel-header">{{ t('labels.input') }}</div>
          <el-input
            v-model="input"
            type="textarea"
            :rows="12"
          />
          <div class="btn-group">
            <el-button type="primary" @click="format">{{ t('actions.format') }}</el-button>
            <el-button type="primary" @click="compress">{{ t('actions.compress') }}</el-button>
            <el-button @click="clear">{{ t('actions.clear') }}</el-button>
          </div>
        </div>
      </el-col>

      <!-- 右侧：输出 -->
      <el-col :span="12">
        <div class="panel">
          <div class="panel-header">{{ t('labels.output') }}</div>
          <el-input
            v-model="output"
            type="textarea"
            :rows="12"
            readonly
            :class="{ 'error-text': !isValid }"
          />
          <div class="btn-group">
            <el-button @click="copyOutput">{{ t('actions.copy') }}</el-button>
          </div>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<style scoped>
.tool-container {
  max-width: 1200px;
}
.panel {
  display: flex;
  flex-direction: column;
}
.panel-header {
  font-size: 14px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin-bottom: 12px;
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
