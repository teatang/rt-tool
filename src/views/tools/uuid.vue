<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'
import { Stamp } from '@element-plus/icons-vue'
import CryptoJS from 'crypto-js'
import PageTitle from '../../components/PageTitle.vue'

const { t } = useI18n()

// UUID 版本选项
const versionOptions = [
  { value: 'v4', label: 'UUID v4 (随机)' },
  { value: 'v1', label: 'UUID v1 (时间戳)' },
  { value: 'v3', label: 'UUID v3 (MD5)' },
  { value: 'v5', label: 'UUID v5 (SHA-1)' }
]

// 当前选择的版本
const version = ref('v4')
// 生成数量
const count = ref(1)
// 命名空间 (用于 v3/v5)
const namespace = ref('6ba7b810-9dad-11d1-80b4-00c04fd430c8') // URL namespace
const name = ref('')
// 生成结果
const uuids = ref<string[]>([])

// 预定义的命名空间
const namespaceOptions = [
  { value: '6ba7b810-9dad-11d1-80b4-00c04fd430c8', label: 'URL (6ba7b810-9dad-11d1-80b4-00c04fd430c8)' },
  { value: '6ba7b811-9dad-11d1-80b4-00c04fd430c8', label: 'OID (6ba7b811-9dad-11d1-80b4-00c04fd430c8)' },
  { value: '6ba7b812-9dad-11d1-80b4-00c04fd430c8', label: 'X500 (6ba7b812-9dad-11d1-80b4-00c04fd430c8)' }
]

// UUID v4 - 随机生成
const generateV4 = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

// UUID v1 - 基于时间戳
const generateV1 = (): string => {
  const now = Date.now()
  const timeLow = (now & 0xffffffff).toString(16).padStart(8, '0')
  const timeMid = ((now >> 32) & 0xffff).toString(16).padStart(4, '0')
  const timeHiAndVersion = ((now >> 48) & 0x0fff) | 0x1000 // version 1
  const clockSeqHiAndReserved = (Math.floor(Math.random() * 16384) & 0x3fff) | 0x8000
  const clockSeqLow = clockSeqHiAndReserved & 0xff
  const node = Array.from({ length: 6 }, () =>
    Math.floor(Math.random() * 256).toString(16).padStart(2, '0')
  ).join('')

  return `${timeLow}-${timeMid}-${timeHiAndVersion.toString(16).padStart(4, '0')}-${clockSeqHiAndReserved.toString(16).padStart(4, '0')}-${clockSeqLow.toString(16).padStart(2, '0')}${node}`
}

// UUID v3/v5 - 基于命名空间和名称的哈希
const generateV3V5 = (isV5: boolean): string => {
  if (!name.value) {
    return t('messages.error')
  }

  const hash = isV5
    ? CryptoJS.SHA1(namespace.value + name.value).toString()
    : CryptoJS.MD5(namespace.value + name.value).toString()

  // 从哈希中提取 UUID 格式
  const timeLow = hash.substring(0, 8)
  const timeMid = hash.substring(8, 12)
  const timeHiAndVersion = parseInt(hash.substring(12, 16), 16)
  const version = isV5 ? 0x5000 : 0x3000
  const clockSeqHiAndReserved = (parseInt(hash.substring(16, 18), 16) & 0x3f) | 0x80
  const clockSeqLow = hash.substring(18, 20)
  const node = hash.substring(20, 32)

  return `${timeLow}-${timeMid}-${(timeHiAndVersion & 0x0fff | version).toString(16).padStart(4, '0')}-${clockSeqHiAndReserved.toString(16).padStart(2, '0')}${clockSeqLow}-${node}`
}

// 生成 UUID
const generate = () => {
  uuids.value = []

  for (let i = 0; i < count.value; i++) {
    let uuid = ''
    switch (version.value) {
      case 'v4':
        uuid = generateV4()
        break
      case 'v1':
        uuid = generateV1()
        break
      case 'v3':
        uuid = generateV3V5(false)
        break
      case 'v5':
        uuid = generateV3V5(true)
        break
    }
    uuids.value.push(uuid)
  }
}

// 复制单个 UUID
const copyUuid = async (uuid: string) => {
  try {
    await navigator.clipboard.writeText(uuid)
    ElMessage.success(t('messages.copySuccess'))
  } catch {
    ElMessage.error(t('messages.copyFailed'))
  }
}

// 复制全部
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
    <PageTitle
      :icon="Stamp"
      :title="t('tools.uuid')"
      description="uuid"
      color="#9c27b0"
    />

    <!-- 版本选择 -->
    <div class="form-item">
      <span class="label">版本:</span>
      <el-select v-model="version" style="width: 200px">
        <el-option
          v-for="option in versionOptions"
          :key="option.value"
          :label="option.label"
          :value="option.value"
        />
      </el-select>
    </div>

    <!-- 命名空间和名称输入 (v3/v5) -->
    <template v-if="version === 'v3' || version === 'v5'">
      <div class="form-item">
        <span class="label">命名空间:</span>
        <el-select v-model="namespace" style="width: 400px" filterable allow-create>
          <el-option
            v-for="option in namespaceOptions"
            :key="option.value"
            :label="option.label"
            :value="option.value"
          />
        </el-select>
      </div>
      <div class="form-item">
        <span class="label">名称:</span>
        <el-input v-model="name" style="width: 300px" :placeholder="t('labels.keyword')" />
      </div>
    </template>

    <!-- 生成数量 -->
    <div class="form-item">
      <span class="label">数量:</span>
      <el-input-number v-model="count" :min="1" :max="100" />
      <el-button type="primary" @click="generate">
        {{ t('actions.generate') }}
      </el-button>
    </div>

    <!-- 结果列表 -->
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
.form-item {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}
.label {
  min-width: 60px;
  font-weight: 500;
}
.results {
  border: 1px solid var(--el-border-color-light);
  border-radius: 4px;
  margin-top: 20px;
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
