<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'
import CryptoJS from 'crypto-js'

const { t } = useI18n()

// 默认示例
const input = ref('Hello World!')
const output = ref('')
const algorithm = ref('md5')
const secret = ref('')

const algorithms = [
  { value: 'md5', label: 'MD5' },
  { value: 'sha1', label: 'SHA1' },
  { value: 'sha256', label: 'SHA256' },
  { value: 'sha512', label: 'SHA512' },
  { value: 'hmac-md5', label: 'HMAC-MD5' },
  { value: 'hmac-sha1', label: 'HMAC-SHA1' },
  { value: 'hmac-sha256', label: 'HMAC-SHA256' }
]

const encrypt = () => {
  if (!input.value) return

  try {
    switch (algorithm.value) {
      case 'md5':
        output.value = CryptoJS.MD5(input.value).toString()
        break
      case 'sha1':
        output.value = CryptoJS.SHA1(input.value).toString()
        break
      case 'sha256':
        output.value = CryptoJS.SHA256(input.value).toString()
        break
      case 'sha512':
        output.value = CryptoJS.SHA512(input.value).toString()
        break
      case 'hmac-md5':
        output.value = secret.value
          ? CryptoJS.HmacMD5(input.value, secret.value).toString()
          : 'Secret key required'
        break
      case 'hmac-sha1':
        output.value = secret.value
          ? CryptoJS.HmacSHA1(input.value, secret.value).toString()
          : 'Secret key required'
        break
      case 'hmac-sha256':
        output.value = secret.value
          ? CryptoJS.HmacSHA256(input.value, secret.value).toString()
          : 'Secret key required'
        break
    }
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
  secret.value = ''
}
</script>

<template>
  <div class="tool-container">
    <h2>{{ t('tools.encrypt') }}</h2>
    <el-row :gutter="20">
      <el-col :span="12">
        <el-select v-model="algorithm" class="mb-4" @change="encrypt">
          <el-option
            v-for="algo in algorithms"
            :key="algo.value"
            :label="algo.label"
            :value="algo.value"
          />
        </el-select>
        <el-input
          v-if="algorithm.startsWith('hmac')"
          v-model="secret"
          type="password"
          :placeholder="'Secret Key'"
          class="mb-4"
          @input="encrypt"
        />
        <el-input
          v-model="input"
          type="textarea"
          :rows="8"
          :placeholder="t('labels.input')"
          @input="encrypt"
        />
        <div class="btn-group">
          <el-button @click="clear">{{ t('actions.clear') }}</el-button>
        </div>
      </el-col>
      <el-col :span="12">
        <el-input
          v-model="output"
          type="textarea"
          :rows="12"
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
.mb-4 {
  margin-bottom: 16px;
}
.btn-group {
  margin-top: 16px;
  display: flex;
  gap: 8px;
}
</style>
