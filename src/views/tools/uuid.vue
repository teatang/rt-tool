<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'
import { Stamp } from '@element-plus/icons-vue'
import { generateUuid, UUID_NAMESPACES, type UuidVersion } from '@/utils/uuid'
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
const version = ref<UuidVersion>('v4')
// 生成数量
const count = ref(1)
// 命名空间 (用于 v3/v5)
const namespace = ref(UUID_NAMESPACES.URL)
const name = ref('')
// 生成结果
const uuids = ref<string[]>([])

// 预定义的命名空间
const namespaceOptions = [
  { value: UUID_NAMESPACES.URL, label: 'URL (6ba7b810-9dad-11d1-80b4-00c04fd430c8)' },
  { value: UUID_NAMESPACES.OID, label: 'OID (6ba7b811-9dad-11d1-80b4-00c04fd430c8)' },
  { value: UUID_NAMESPACES.X500, label: 'X500 (6ba7b812-9dad-11d1-80b4-00c04fd430c8)' }
]

// 生成 UUID
const generate = () => {
  uuids.value = []

  for (let i = 0; i < count.value; i++) {
    try {
      const uuid = generateUuid(version.value, namespace.value, name.value)
      uuids.value.push(uuid)
    } catch {
      ElMessage.error(t('messages.error'))
      break
    }
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
