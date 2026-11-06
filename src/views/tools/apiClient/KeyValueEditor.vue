<script setup lang="ts">
import { Plus, Delete } from '@element-plus/icons-vue'
import type { KeyValueItem } from '@/types/apiClient'

const props = withDefaults(
  defineProps<{
    modelValue: KeyValueItem[]
    keyPlaceholder?: string
    valuePlaceholder?: string
    descPlaceholder?: string
    showDescription?: boolean
    keySuggestions?: string[]
  }>(),
  {
    keyPlaceholder: '参数名',
    valuePlaceholder: '参数值',
    descPlaceholder: '描述（可选）',
    showDescription: true,
    keySuggestions: () => []
  }
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: KeyValueItem[]): void
}>()

const updateItem = (index: number, field: keyof KeyValueItem, val: any) => {
  const newList = [...props.modelValue]
  newList[index] = { ...newList[index], [field]: val }
  emit('update:modelValue', newList)
}

const addItem = () => {
  const newItem: KeyValueItem = {
    id: `kv_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    key: '',
    value: '',
    enabled: true,
    description: ''
  }
  emit('update:modelValue', [...props.modelValue, newItem])
}

const removeItem = (index: number) => {
  const newList = props.modelValue.filter((_, i) => i !== index)
  emit('update:modelValue', newList)
}

const clearAll = () => {
  emit('update:modelValue', [])
}

const handleEnabledChange = (index: number, val: boolean) => {
  updateItem(index, 'enabled', val)
}

const handleKeyChange = (index: number, val: string) => {
  updateItem(index, 'key', val)
}

const handleValueChange = (index: number, val: string) => {
  updateItem(index, 'value', val)
}

const handleDescChange = (index: number, val: string) => {
  updateItem(index, 'description', val)
}

const querySearch = (queryString: string, cb: (results: { value: string }[]) => void) => {
  if (!props.keySuggestions || props.keySuggestions.length === 0) {
    cb([])
    return
  }
  const results = props.keySuggestions
    .filter((s) => s.toLowerCase().includes(queryString.toLowerCase()))
    .map((s) => ({ value: s }))
  cb(results)
}
</script>

<template>
  <div class="key-value-editor">
    <div v-if="modelValue.length === 0" class="empty-hint">
      <el-text type="info" size="small">暂无配置项，点击下方按钮添加</el-text>
    </div>

    <div v-else class="kv-list">
      <div v-for="(item, index) in modelValue" :key="item.id" class="kv-row">
        <!-- 启用开关 -->
        <el-checkbox
          :model-value="item.enabled"
          class="kv-checkbox"
          @update:model-value="(val: any) => handleEnabledChange(index, Boolean(val))"
        />

        <!-- Key 输入（支持自动补全） -->
        <div class="kv-input-key">
          <el-autocomplete
            v-if="keySuggestions && keySuggestions.length > 0"
            :model-value="item.key"
            :fetch-suggestions="querySearch"
            :placeholder="keyPlaceholder"
            size="default"
            clearable
            @update:model-value="(val: any) => handleKeyChange(index, String(val || ''))"
          />
          <el-input
            v-else
            :model-value="item.key"
            :placeholder="keyPlaceholder"
            size="default"
            clearable
            @update:model-value="(val: any) => handleKeyChange(index, String(val || ''))"
          />
        </div>

        <!-- Value 输入 -->
        <div class="kv-input-value">
          <el-input
            :model-value="item.value"
            :placeholder="valuePlaceholder"
            size="default"
            clearable
            @update:model-value="(val: any) => handleValueChange(index, String(val || ''))"
          />
        </div>

        <!-- 描述输入 -->
        <div v-if="showDescription" class="kv-input-desc">
          <el-input
            :model-value="item.description"
            :placeholder="descPlaceholder"
            size="default"
            clearable
            @update:model-value="(val: any) => handleDescChange(index, String(val || ''))"
          />
        </div>

        <!-- 删除按钮 -->
        <el-button
          type="danger"
          link
          :icon="Delete"
          title="删除"
          @click="removeItem(index)"
        />
      </div>
    </div>

    <!-- 底部操作按钮 -->
    <div class="kv-actions">
      <el-button type="primary" link :icon="Plus" size="small" @click="addItem">
        添加一行
      </el-button>
      <el-button
        v-if="modelValue.length > 0"
        type="info"
        link
        size="small"
        @click="clearAll"
      >
        清空全部
      </el-button>
    </div>
  </div>
</template>

<style scoped>
.key-value-editor {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.empty-hint {
  padding: 16px 0;
  text-align: center;
}

.kv-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.kv-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.kv-checkbox {
  margin-right: 0;
}

.kv-input-key {
  flex: 1.2;
}

.kv-input-value {
  flex: 1.5;
}

.kv-input-desc {
  flex: 1;
}

.kv-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  padding-top: 4px;
}
</style>
