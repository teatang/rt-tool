<script setup lang="ts">
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'
import { Files } from '@element-plus/icons-vue'
import PageTitle from '../../components/PageTitle.vue'

const { t } = useI18n()

// 默认示例
const input = ref('{"name":"张三","age":25,"city":"北京","hobbies":["读书","编程","音乐"]}')
const output = ref('')
const isValid = ref(true)
const indent = ref(2) // 默认2个空格

// 空格数选项
const indentOptions = [
  { value: 1, label: '1' },
  { value: 2, label: '2' },
  { value: 4, label: '4' }
]

// 监听缩进变化，自动格式化
watch(indent, () => {
  if (input.value) {
    format()
  }
})

const format = () => {
  try {
    const parsed = JSON.parse(input.value)
    output.value = JSON.stringify(parsed, null, indent.value)
    isValid.value = true
  } catch {
    isValid.value = false
    output.value = t('messages.invalidJson')
  }
}

const compress = () => {
  try {
    const parsed = JSON.parse(input.value)
    output.value = JSON.stringify(parsed)
    isValid.value = true
  } catch {
    isValid.value = false
    output.value = t('messages.invalidJson')
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
      :icon="Files"
      :title="t('tools.json')"
      description="json"
      color="#67c23a"
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
            :placeholder="t('labels.input')"
            @input="isValid = true"
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
            :placeholder="t('labels.output')"
            readonly
            :class="{ 'error-text': !isValid }"
          />
          <div class="output-actions">
            <div class="indent-selector">
              <span class="indent-label">{{ t('labels.indent') }}:</span>
              <el-select v-model="indent" style="width: 80px">
                <el-option
                  v-for="option in indentOptions"
                  :key="option.value"
                  :label="option.label"
                  :value="option.value"
                />
              </el-select>
            </div>
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
  height: 100%;
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
.output-actions {
  margin-top: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.indent-selector {
  display: flex;
  align-items: center;
  gap: 8px;
}
.indent-label {
  font-size: 14px;
  color: var(--el-text-color-regular);
}
.error-text :deep(textarea) {
  color: var(--el-color-danger);
}
</style>
