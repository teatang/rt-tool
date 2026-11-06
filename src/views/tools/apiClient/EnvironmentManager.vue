<script setup lang="ts">
import { ref, watch } from 'vue'
import { Plus, Delete, Setting } from '@element-plus/icons-vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import type { Environment, VariableItem } from '@/types/apiClient'
import KeyValueEditor from './KeyValueEditor.vue'

const props = defineProps<{
  visible: boolean
  environments: Environment[]
  globals: VariableItem[]
  activeEnvId: string | null
}>()

const emit = defineEmits<{
  (e: 'update:visible', val: boolean): void
  (e: 'update:environments', val: Environment[]): void
  (e: 'update:globals', val: VariableItem[]): void
  (e: 'update:activeEnvId', val: string | null): void
}>()

// 当前选中的选项卡：'global' 或某个环境的 id
const selectedTab = ref<string>('global')

// 本地草稿数据
const localGlobals = ref<VariableItem[]>([])
const localEnvironments = ref<Environment[]>([])

watch(
  () => props.visible,
  (val) => {
    if (val) {
      localGlobals.value = JSON.parse(JSON.stringify(props.globals || []))
      localEnvironments.value = JSON.parse(JSON.stringify(props.environments || []))
      if (props.activeEnvId && localEnvironments.value.some((e) => e.id === props.activeEnvId)) {
        selectedTab.value = props.activeEnvId
      } else {
        selectedTab.value = 'global'
      }
    }
  },
  { immediate: true }
)

const addEnvironment = () => {
  const newEnv: Environment = {
    id: `env_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    name: `新环境 ${localEnvironments.value.length + 1}`,
    variables: [
      {
        id: `var_${Date.now()}_1`,
        key: 'baseUrl',
        value: 'http://localhost:8080',
        enabled: true,
        description: '服务基础路径'
      }
    ]
  }
  localEnvironments.value.push(newEnv)
  selectedTab.value = newEnv.id
}

const deleteEnvironment = (envId: string) => {
  ElMessageBox.confirm('确定要删除该环境配置吗？删除后不可恢复。', '删除确认', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    localEnvironments.value = localEnvironments.value.filter((e) => e.id !== envId)
    if (props.activeEnvId === envId) {
      emit('update:activeEnvId', null)
    }
    selectedTab.value = 'global'
    ElMessage.success('环境已删除')
  }).catch(() => {})
}

const handleClose = () => {
  emit('update:globals', localGlobals.value)
  emit('update:environments', localEnvironments.value)
  emit('update:visible', false)
}
</script>

<template>
  <el-dialog
    :model-value="visible"
    title="环境变量管理"
    width="850px"
    destroy-on-close
    :before-close="handleClose"
  >
    <div class="env-manager-body">
      <!-- 左侧：环境列表 -->
      <div class="env-sidebar">
        <div class="env-list">
          <div
            :class="['env-item', { active: selectedTab === 'global' }]"
            @click="selectedTab = 'global'"
          >
            <el-icon><Setting /></el-icon>
            <span class="env-name">🌐 全局变量 (Global)</span>
          </div>

          <div class="env-divider">环境分组</div>

          <div
            v-for="env in localEnvironments"
            :key="env.id"
            :class="['env-item', { active: selectedTab === env.id }]"
            @click="selectedTab = env.id"
          >
            <span class="env-name">{{ env.name }}</span>
          </div>
        </div>

        <el-button
          class="add-env-btn"
          type="primary"
          plain
          size="small"
          :icon="Plus"
          @click="addEnvironment"
        >
          新增环境
        </el-button>
      </div>

      <!-- 右侧：变量编辑详情 -->
      <div class="env-content">
        <!-- 全局变量编辑 -->
        <template v-if="selectedTab === 'global'">
          <div class="env-content-header">
            <div class="env-title">🌐 全局变量</div>
            <el-text type="info" size="small">
              全局变量在所有环境中均生效。当环境局部变量有同名 Key 时，局部变量优先。
            </el-text>
          </div>
          <KeyValueEditor
            v-model="localGlobals"
            key-placeholder="变量名 (如 baseUrl)"
            value-placeholder="变量值"
            desc-placeholder="描述"
          />
        </template>

        <!-- 指定环境局部变量编辑 -->
        <template v-else>
          <div
            v-for="env in localEnvironments.filter((e) => e.id === selectedTab)"
            :key="env.id"
            class="env-detail"
          >
            <div class="env-content-header">
              <div class="env-name-input-wrapper">
                <el-input
                  v-model="env.name"
                  placeholder="环境名称 (如 开发环境)"
                  style="max-width: 260px;"
                />
                <el-button
                  type="danger"
                  link
                  :icon="Delete"
                  @click="deleteEnvironment(env.id)"
                >
                  删除该环境
                </el-button>
              </div>
              <el-text type="info" size="small">
                通过双花括号引用，如：<el-tag size="small" type="primary">&#123;&#123;baseUrl&#125;&#125;</el-tag>
              </el-text>
            </div>

            <KeyValueEditor
              v-model="env.variables"
              key-placeholder="变量名 (如 baseUrl)"
              value-placeholder="变量值"
              desc-placeholder="描述"
            />
          </div>
        </template>
      </div>
    </div>

    <template #footer>
      <el-button type="primary" @click="handleClose">完成</el-button>
    </template>
  </el-dialog>
</template>

<style scoped>
.env-manager-body {
  display: flex;
  min-height: 420px;
  gap: 16px;
}

.env-sidebar {
  width: 220px;
  border-right: 1px solid var(--el-border-color-light);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding-right: 12px;
}

.env-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.env-divider {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  margin: 12px 0 4px 8px;
  font-weight: 500;
}

.env-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  color: var(--el-text-color-primary);
  transition: all 0.2s;
}

.env-item:hover {
  background-color: var(--el-fill-color-light);
}

.env-item.active {
  background-color: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
  font-weight: 600;
}

.add-env-btn {
  margin-top: 16px;
  width: 100%;
}

.env-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
  overflow-y: auto;
  max-height: 500px;
}

.env-content-header {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.env-title {
  font-size: 15px;
  font-weight: 600;
}

.env-name-input-wrapper {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
</style>
