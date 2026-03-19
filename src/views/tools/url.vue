<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'
import { Link } from '@element-plus/icons-vue'
import PageTitle from '../../components/PageTitle.vue'

const { t } = useI18n()

// 默认示例
const input = ref('https://www.example.com/path?name=张三&age=25')
const output = ref('')

const encode = () => {
  try {
    output.value = encodeURIComponent(input.value)
  } catch {
    output.value = t('messages.error')
  }
}

const decode = () => {
  try {
    output.value = decodeURIComponent(input.value)
  } catch {
    output.value = t('messages.error')
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
}
</script>

<template>
  <div class="tool-container">
    <PageTitle
      :icon="Link"
      :title="t('tools.url')"
      description="url"
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
