<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'

const { t } = useI18n()

const input = ref('')
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
    <h2>{{ t('tools.url') }}</h2>
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
