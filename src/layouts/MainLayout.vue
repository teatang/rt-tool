<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useThemeStore } from '../stores/theme'

const { t, locale } = useI18n()
const themeStore = useThemeStore()

// 侧边栏是否折叠
const isCollapse = ref(false)

// 菜单项配置
const menuItems = computed(() => [
  {
    name: 'string',
    label: t('nav.string'),
    icon: 'Document',
    children: [
      { name: 'base64', label: t('tools.base64'), icon: 'Key' },
      { name: 'url', label: t('tools.url'), icon: 'Link' },
      { name: 'json', label: t('tools.json'), icon: 'Document' },
      { name: 'html', label: t('tools.html'), icon: 'Markup' },
      { name: 'sql', label: t('tools.sql'), icon: 'Database' },
      { name: 'regex', label: t('tools.regex'), icon: 'Search' }
    ]
  },
  {
    name: 'file',
    label: t('nav.file'),
    icon: 'Folder',
    children: [
      { name: 'fileSearch', label: t('tools.fileSearch'), icon: 'Search' },
      { name: 'fileRename', label: t('tools.fileRename'), icon: 'Edit' }
    ]
  },
  {
    name: 'other',
    label: t('nav.other'),
    icon: 'Tools',
    children: [
      { name: 'mermaid', label: t('tools.mermaid'), icon: 'Picture' },
      { name: 'timestamp', label: t('tools.timestamp'), icon: 'Clock' },
      { name: 'uuid', label: t('tools.uuid'), icon: 'Key' },
      { name: 'encrypt', label: t('tools.encrypt'), icon: 'Lock' }
    ]
  }
])

// 当前选中的菜单
const activeMenu = ref('base64')

// 主题选项
const themeOptions = [
  { value: 'light', label: t('theme.light') },
  { value: 'dark', label: t('theme.dark') },
  { value: 'system', label: t('theme.system') }
]

// 切换主题
const changeTheme = (mode: 'light' | 'dark' | 'system') => {
  themeStore.setTheme(mode)
}

// 切换语言
const changeLocale = () => {
  locale.value = locale.value === 'zh' ? 'en' : 'zh'
}
</script>

<template>
  <el-container class="main-container">
    <!-- 侧边栏 -->
    <el-aside :width="isCollapse ? '64px' : '220px'" class="sidebar">
      <div class="logo">
        <span v-if="!isCollapse">{{ t('app.title') }}</span>
        <span v-else>RT</span>
      </div>
      <el-menu
        :default-active="activeMenu"
        :collapse="isCollapse"
        class="sidebar-menu"
        router
      >
        <template v-for="item in menuItems" :key="item.name">
          <el-sub-menu :index="item.name">
            <template #title>
              <el-icon><component :is="item.icon" /></el-icon>
              <span>{{ item.label }}</span>
            </template>
            <el-menu-item
              v-for="child in item.children"
              :key="child.name"
              :index="child.name"
            >
              <el-icon><component :is="child.icon" /></el-icon>
              <span>{{ child.label }}</span>
            </el-menu-item>
          </el-sub-menu>
        </template>
      </el-menu>
    </el-aside>

    <!-- 主容器 -->
    <el-container>
      <!-- 头部 -->
      <el-header class="header">
        <div class="header-left">
          <el-button
            :icon="isCollapse ? 'Expand' : 'Fold'"
            @click="isCollapse = !isCollapse"
            text
          />
        </div>
        <div class="header-right">
          <!-- 切换语言按钮 -->
          <el-button @click="changeLocale" text>
            {{ locale === 'zh' ? 'EN' : '中' }}
          </el-button>
          <!-- 主题选择器 -->
          <el-select
            :model-value="themeStore.themeMode"
            @change="changeTheme"
            style="width: 100px"
          >
            <el-option
              v-for="option in themeOptions"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>
        </div>
      </el-header>

      <!-- 主内容区 -->
      <el-main class="main-content">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<style scoped>
.main-container {
  height: 100vh;
}

.sidebar {
  background-color: var(--el-bg-color);
  border-right: 1px solid var(--el-border-color-light);
  transition: width 0.3s;
}

.logo {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: bold;
  border-bottom: 1px solid var(--el-border-color-light);
}

.sidebar-menu {
  border-right: none;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: var(--el-bg-color);
  border-bottom: 1px solid var(--el-border-color-light);
  padding: 0 16px;
}

.header-left,
.header-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.main-content {
  background-color: var(--el-bg-color-page);
  padding: 20px;
  overflow-y: auto;
}
</style>
