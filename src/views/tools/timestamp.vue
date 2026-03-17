<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'

const { t, locale } = useI18n()

const timestamp = ref('')
const customDate = ref('')
const currentTimestamp = ref(0)
const currentDate = ref('')

let intervalId: number | undefined

const updateCurrentTime = () => {
  const now = new Date()
  currentTimestamp.value = Math.floor(now.getTime() / 1000)
  // 根据当前语言格式化日期
  currentDate.value = now.toLocaleString(locale.value === 'zh' ? 'zh-CN' : 'en-US')
}

onMounted(() => {
  updateCurrentTime()
  intervalId = window.setInterval(updateCurrentTime, 1000)
})

onUnmounted(() => {
  if (intervalId) {
    clearInterval(intervalId)
  }
})

const convertToDate = () => {
  if (!timestamp.value) return ''

  try {
    const ts = parseInt(timestamp.value)
    const date = new Date(ts * 1000)
    return date.toLocaleString(locale.value === 'zh' ? 'zh-CN' : 'en-US')
  } catch {
    return t('messages.error')
  }
}

const convertToTimestamp = () => {
  if (!customDate.value) return ''

  try {
    const date = new Date(customDate.value)
    return Math.floor(date.getTime() / 1000)
  } catch {
    return t('messages.error')
  }
}

const copyTimestamp = async () => {
  try {
    await navigator.clipboard.writeText(String(currentTimestamp.value))
    ElMessage.success(t('messages.copySuccess'))
  } catch {
    ElMessage.error(t('messages.copyFailed'))
  }
}
</script>

<template>
  <div class="tool-container">
    <h2>{{ t('tools.timestamp') }}</h2>

    <el-card class="mb-4">
      <template #header>
        <span>{{ t('actions.now') }}</span>
      </template>
      <el-descriptions :column="2" border>
        <el-descriptions-item :label="t('labels.timestamp')">
          {{ currentTimestamp }}
        </el-descriptions-item>
        <el-descriptions-item :label="t('labels.date')">
          {{ currentDate }}
        </el-descriptions-item>
      </el-descriptions>
      <el-button class="mt-4" @click="copyTimestamp">
        {{ t('actions.copy') }}
      </el-button>
    </el-card>

    <el-row :gutter="20">
      <el-col :span="12">
        <el-card>
          <template #header>
            <span>{{ t('labels.timestampToDate') }}</span>
          </template>
          <el-input
            v-model="timestamp"
            :placeholder="t('labels.enterTimestamp')"
            class="mb-4"
          />
          <el-button type="primary" @click="convertToDate">
            {{ t('actions.convert') }}
          </el-button>
          <div class="result mt-4">
            {{ convertToDate() }}
          </div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card>
          <template #header>
            <span>{{ t('labels.dateToTimestamp') }}</span>
          </template>
          <el-input
            v-model="customDate"
            :placeholder="t('labels.enterDate')"
            class="mb-4"
          />
          <el-button type="primary" @click="convertToTimestamp">
            {{ t('actions.convert') }}
          </el-button>
          <div class="result mt-4">
            {{ convertToTimestamp() }}
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<style scoped>
.tool-container {
  max-width: 1000px;
}
.mb-4 {
  margin-bottom: 16px;
}
.mt-4 {
  margin-top: 16px;
}
.result {
  font-family: monospace;
  font-size: 16px;
  padding: 8px;
  background-color: var(--el-fill-color-light);
  border-radius: 4px;
}
</style>
