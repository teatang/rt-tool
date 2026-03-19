<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'
import { Key } from '@element-plus/icons-vue'
import { base64Encode, base64Decode } from '@/utils/base64'
import PageTitle from '../../components/PageTitle.vue'

const { t } = useI18n()

// 输入内容 - 默认示例
const input = ref('Hello World! 你好世界！')
// 输出内容
const output = ref('')

// 编码
const encode = () => {
  try {
    output.value = base64Encode(input.value)
  } catch {
    output.value = t('messages.error')
  }
}

// 解码
const decode = () => {
  try {
    output.value = base64Decode(input.value)
  } catch {
    output.value = t('messages.error')
  }
}

// 复制输出
const copyOutput = async () => {
  try {
    await navigator.clipboard.writeText(output.value)
    ElMessage.success(t('messages.copySuccess'))
  } catch {
    ElMessage.error(t('messages.copyFailed'))
  }
}

// 清空
const clear = () => {
  input.value = ''
  output.value = ''
}
</script>

<template>
  <div class="tool-container">
    <PageTitle
      :icon="Key"
      :title="t('tools.base64')"
      description="base64"
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
          />
          <div class="btn-group">
            <el-button type="primary" @click="encode">{{ t('actions.encode') }}</el-button>
            <el-button type="primary" @click="decode">{{ t('actions.decode') }}</el-button>
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
</style>
