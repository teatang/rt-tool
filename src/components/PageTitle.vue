<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps<{
  icon: any
  title: string
  description?: string
  color?: string
}>()

const { t } = useI18n()

const iconColor = computed(() => props.color || '#409eff')

const descText = computed(() => {
  if (!props.description) return ''
  return t(`descriptions.${props.description}`)
})
</script>

<template>
  <div class="page-title">
    <div class="title-icon" :style="{ background: `linear-gradient(135deg, ${iconColor}20, ${iconColor}40)` }">
      <el-icon :size="24" :style="{ color: iconColor }">
        <component :is="icon" />
      </el-icon>
    </div>
    <div class="title-content">
      <h1 class="title-text">{{ title }}</h1>
      <p v-if="description" class="title-desc">{{ descText }}</p>
    </div>
  </div>
</template>

<style scoped>
.page-title {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
  padding: 20px 24px;
  background: var(--el-bg-color);
  border-radius: 12px;
  border: 1px solid var(--el-border-color-light);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.title-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  border-radius: 14px;
  flex-shrink: 0;
}

.title-content {
  flex: 1;
}

.title-text {
  margin: 0;
  font-size: 22px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  line-height: 1.4;
}

.title-desc {
  margin: 6px 0 0;
  font-size: 14px;
  color: var(--el-text-color-regular);
  line-height: 1.5;
}
</style>
