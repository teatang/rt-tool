<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'

const { t } = useI18n()

const code = ref(`graph TD
    A[Start] --> B{Is it?}
    B -->|Yes| C[OK]
    B -->|No| D[End]`)

const preview = ref<HTMLDivElement>()

const renderMermaid = async () => {
  if (!preview.value) return

  try {
    const mermaid = await import('mermaid')
    mermaid.default.initialize({
      startOnLoad: false,
      theme: 'default'
    })

    preview.value.innerHTML = ''
    const { svg } = await mermaid.default.render('mermaid-diagram', code.value)
    preview.value.innerHTML = svg
  } catch {
    // Mermaid not loaded yet
  }
}

onMounted(() => {
  // Load mermaid dynamically
  const script = document.createElement('script')
  script.src = 'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js'
  script.onload = () => {
    renderMermaid()
  }
  document.head.appendChild(script)
})

const copyCode = async () => {
  try {
    await navigator.clipboard.writeText(code.value)
    ElMessage.success(t('messages.copySuccess'))
  } catch {
    ElMessage.error(t('messages.copyFailed'))
  }
}
</script>

<template>
  <div class="tool-container">
    <h2>{{ t('tools.mermaid') }}</h2>
    <el-row :gutter="20">
      <el-col :span="12">
        <el-input
          v-model="code"
          type="textarea"
          :rows="15"
          @input="renderMermaid"
        />
        <div class="btn-group">
          <el-button @click="copyCode">{{ t('actions.copy') }}</el-button>
        </div>
      </el-col>
      <el-col :span="12">
        <div ref="preview" class="preview"></div>
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
}
.preview {
  border: 1px solid var(--el-border-color-light);
  border-radius: 4px;
  padding: 20px;
  min-height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--el-bg-color);
}
</style>
