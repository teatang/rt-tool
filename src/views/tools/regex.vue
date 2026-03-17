<script setup lang="ts">
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'

const { t } = useI18n()

// 默认示例
const pattern = ref('\\d+')
const testString = ref('Hello123World456!')
const flags = ref({
  g: true,
  i: false,
  m: false
})

const matches = ref<string[]>([])
const error = ref('')

const testRegex = () => {
  matches.value = []
  error.value = ''

  if (!pattern.value || !testString.value) {
    return
  }

  try {
    const flagStr = Object.entries(flags.value)
      .filter(([_, v]) => v)
      .map(([k]) => k)
      .join('')
    const regex = new RegExp(pattern.value, flagStr)

    if (flags.value.g) {
      const results = testString.value.match(regex)
      if (results) {
        matches.value = results
      }
    } else {
      const match = testString.value.match(regex)
      if (match) {
        matches.value = [match[0]]
      }
    }
  } catch (e) {
    error.value = (e as Error).message
  }
}

watch([pattern, testString, flags], testRegex, { deep: true, immediate: true })

const copyMatch = async (match: string) => {
  try {
    await navigator.clipboard.writeText(match)
    ElMessage.success(t('messages.copySuccess'))
  } catch {
    ElMessage.error(t('messages.copyFailed'))
  }
}
</script>

<template>
  <div class="tool-container">
    <h2>{{ t('tools.regex') }}</h2>
    <el-row :gutter="20">
      <el-col :span="12">
        <el-input
          v-model="pattern"
          :placeholder="t('labels.pattern')"
          class="mb-4"
        />
        <div class="flags mb-4">
          <el-checkbox v-model="flags.g">g (global)</el-checkbox>
          <el-checkbox v-model="flags.i">i (case insensitive)</el-checkbox>
          <el-checkbox v-model="flags.m">m (multiline)</el-checkbox>
        </div>
        <el-input
          v-model="testString"
          type="textarea"
          :rows="8"
          :placeholder="t('labels.testString')"
        />
      </el-col>
      <el-col :span="12">
        <div v-if="error" class="error-message">
          {{ error }}
        </div>
        <div v-else-if="matches.length > 0" class="matches">
          <div class="match-header">
            <span>Matches ({{ matches.length }})</span>
          </div>
          <div
            v-for="(match, index) in matches"
            :key="index"
            class="match-item"
            @click="copyMatch(match)"
          >
            <span class="match-index">{{ index + 1 }}.</span>
            <span class="match-text">{{ match }}</span>
          </div>
        </div>
        <div v-else class="no-match">
          {{ t('messages.noMatch') }}
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
.flags {
  display: flex;
  gap: 16px;
}
.error-message {
  color: var(--el-color-danger);
  padding: 16px;
}
.matches {
  border: 1px solid var(--el-border-color-light);
  border-radius: 4px;
}
.match-header {
  padding: 8px 16px;
  background-color: var(--el-fill-color-light);
  font-weight: bold;
  border-bottom: 1px solid var(--el-border-color-light);
}
.match-item {
  padding: 8px 16px;
  cursor: pointer;
  display: flex;
  gap: 8px;
  border-bottom: 1px solid var(--el-border-color-light);
}
.match-item:last-child {
  border-bottom: none;
}
.match-item:hover {
  background-color: var(--el-fill-color);
}
.match-index {
  color: var(--el-color-primary);
}
.match-text {
  font-weight: bold;
}
.no-match {
  color: var(--el-color-info);
  padding: 16px;
  text-align: center;
}
</style>
