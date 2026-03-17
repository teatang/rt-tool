<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'
import CryptoJS from 'crypto-js'

const { t } = useI18n()

// 输入内容
const input = ref('')
// 输出内容
const output = ref('')

// 编码
const encode = () => {
  try {
    output.value = CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(input.value))
  } catch {
    output.value = t('messages.error')
  }
}

// 解码
const decode = () => {
  try {
    const decoded = CryptoJS.enc.Base64.parse(input.value)
    output.value = CryptoJS.enc.Utf8.stringify(decoded)
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
    <h2>{{ t('tools.base64') }}</h2>
    <el-row :gutter="20">
      <el-col :span="12">
        <el-input
          v-model="input"
          type="textarea"
          :rows="10"
          :placeholder="t('labels.input')"
        />
        <div class="btn-group">
          <el-button type="primary" @click="encode">{{ t('actions.encode') }}</el-button>
          <el-button type="primary" @click="decode">{{ t('actions.decode') }}</el-button>
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
</style>
