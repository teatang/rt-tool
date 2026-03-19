<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'
import { DocumentChecked } from '@element-plus/icons-vue'
import { testRegex as testRegexUtil, highlightMatches } from '@/utils/regex'
import PageTitle from '../../components/PageTitle.vue'

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

// 生成带高亮的文本HTML
const highlightedText = computed(() => {
  return highlightMatches(pattern.value, testString.value, flags.value, !!error.value)
})

const testRegex = () => {
  const result = testRegexUtil(pattern.value, testString.value, flags.value)
  matches.value = result.matches
  error.value = result.error
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
    <PageTitle
      :icon="DocumentChecked"
      :title="t('tools.regex')"
      description="regex"
      color="#67c23a"
    />
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
        <!-- 原始文本高亮显示 -->
        <div class="highlight-panel">
          <div class="panel-header">{{ t('labels.testString') }}</div>
          <div class="highlighted-text" v-html="highlightedText"></div>
        </div>
        <!-- 匹配结果列表 -->
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
        <div v-else-if="testString && !error" class="no-match">
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
.highlight-panel {
  border: 1px solid var(--el-border-color-light);
  border-radius: 4px;
  margin-bottom: 16px;
}
.panel-header {
  padding: 8px 16px;
  background-color: var(--el-fill-color-light);
  font-weight: 600;
  border-bottom: 1px solid var(--el-border-color-light);
}
.highlighted-text {
  padding: 16px;
  white-space: pre-wrap;
  word-break: break-all;
  font-family: monospace;
  line-height: 1.6;
}
.highlighted-text :deep(mark.highlight) {
  background-color: var(--el-color-primary-light-8);
  color: var(--el-color-primary);
  padding: 2px 4px;
  border-radius: 3px;
  font-weight: 600;
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
