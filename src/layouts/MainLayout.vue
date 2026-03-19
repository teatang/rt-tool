<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { useThemeStore } from '../stores/theme'
import { useLocaleStore } from '../stores/locale'

// 引入 Element Plus 图标 - 每个工具使用独特的图标
import {
  Document,
  EditPen,
  FolderOpened,
  Tools,
  Key,
  Link,
  Files,
  Search,
  DocumentChecked,
  PictureFilled,
  Clock,
  Lock,
  Fold,
  Expand,
  Stamp,
  TrendCharts,
  Film,
  Sunny,
  Moon,
  Monitor
} from '@element-plus/icons-vue'

const { t } = useI18n()
const themeStore = useThemeStore()
const localeStore = useLocaleStore()
const route = useRoute()

// 当前选中的菜单 - 使用 ref 并监听路由变化
const activeMenu = ref('base64')

// 监听路由变化更新菜单选中状态
watch(
  () => route.path,
  (path) => {
    activeMenu.value = path.startsWith('/') ? path.slice(1) : path || 'base64'
  },
  { immediate: true }
)

// 侧边栏是否折叠
const isCollapse = ref(false)

// 菜单项配置 - 每个工具都有独特的图标
const menuItems = computed(() => [
  {
    name: 'string',
    label: t('nav.string'),
    icon: Document,
    children: [
      { name: 'base64', label: t('tools.base64'), icon: Key },           // 加密相关
      { name: 'url', label: t('tools.url'), icon: Link },                // 链接
      { name: 'json', label: t('tools.json'), icon: Files },            // 文件集合
      { name: 'html', label: t('tools.html'), icon: PictureFilled },    // 图片/HTML
      { name: 'sql', label: t('tools.sql'), icon: TrendCharts },         // 数据/图表
      { name: 'regex', label: t('tools.regex'), icon: DocumentChecked }           // 搜索/匹配
    ]
  },
  {
    name: 'file',
    label: t('nav.file'),
    icon: FolderOpened,
    children: [
      { name: 'fileSearch', label: t('tools.fileSearch'), icon: Search },      // 搜索
      { name: 'fileRename', label: t('tools.fileRename'), icon: EditPen }      // 编辑
    ]
  },
  {
    name: 'other',
    label: t('nav.other'),
    icon: Tools,
    children: [
      { name: 'mermaid', label: t('tools.mermaid'), icon: Film },         // 图表/流程图
      { name: 'timestamp', label: t('tools.timestamp'), icon: Clock },    // 时间
      { name: 'uuid', label: t('tools.uuid'), icon: Stamp },              // 唯一标识
      { name: 'encrypt', label: t('tools.encrypt'), icon: Lock }           // 锁定/加密
    ]
  }
])

// 切换主题
const changeTheme = (mode: 'light' | 'dark' | 'system') => {
  themeStore.setTheme(mode)
}

// 切换语言并保存到 localStorage
const changeLocale = (lang: string) => {
  localeStore.setLocale(lang)
}

// 页面加载后初始化主题
onMounted(() => {
  themeStore.setTheme(themeStore.themeMode)
})
</script>

<template>
  <el-container class="main-container">
    <!-- 侧边栏 -->
    <el-aside :width="isCollapse ? '64px' : '220px'" class="sidebar">
      <div class="logo">
        <el-icon class="logo-icon"><Tools /></el-icon>
        <span v-if="!isCollapse" class="logo-text">{{ t('app.title') }}</span>
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
            :icon="isCollapse ? Expand : Fold"
            @click="isCollapse = !isCollapse"
            text
          />
        </div>
        <div class="header-right">
          <!-- 语言切换 -->
          <div class="locale-switch">
            <button
              :class="['locale-btn', { active: localeStore.locale === 'zh' }]"
              @click="changeLocale('zh')"
            >
              中
            </button>
            <button
              :class="['locale-btn', { active: localeStore.locale === 'en' }]"
              @click="changeLocale('en')"
            >
              EN
            </button>
          </div>

          <!-- 主题切换 -->
          <div class="theme-switch">
            <el-tooltip :content="t('theme.light')" placement="bottom">
              <button
                :class="['theme-btn', { active: themeStore.themeMode === 'light' }]"
                @click="changeTheme('light')"
              >
                <el-icon><Sunny /></el-icon>
              </button>
            </el-tooltip>
            <el-tooltip :content="t('theme.dark')" placement="bottom">
              <button
                :class="['theme-btn', { active: themeStore.themeMode === 'dark' }]"
                @click="changeTheme('dark')"
              >
                <el-icon><Moon /></el-icon>
              </button>
            </el-tooltip>
            <el-tooltip :content="t('theme.system')" placement="bottom">
              <button
                :class="['theme-btn', { active: themeStore.themeMode === 'system' }]"
                @click="changeTheme('system')"
              >
                <el-icon><Monitor /></el-icon>
              </button>
            </el-tooltip>
          </div>
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
  display: flex;
  flex-direction: column;
}

.logo {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border-bottom: 1px solid var(--el-border-color-light);
}

.logo-icon {
  font-size: 24px;
  color: var(--el-color-primary);
}

.logo-text {
  font-size: 18px;
  font-weight: bold;
  color: var(--el-text-color-primary);
}

.sidebar-menu {
  border-right: none;
  flex: 1;
}

/* 选中菜单项的高亮样式 */
.sidebar-menu :deep(.el-menu-item.is-active) {
  background-color: var(--el-color-primary-light-9) !important;
  color: var(--el-color-primary) !important;
  font-weight: 600;
}

.sidebar-menu :deep(.el-menu-item.is-active .el-icon) {
  color: var(--el-color-primary) !important;
}

/* 菜单项 hover 样式 */
.sidebar-menu :deep(.el-menu-item:hover) {
  background-color: var(--el-fill-color-light) !important;
}

/* 子菜单标题高亮 */
.sidebar-menu :deep(.el-sub-menu.is-active > .el-sub-menu__title) {
  color: var(--el-color-primary) !important;
}

.sidebar-menu :deep(.el-sub-menu.is-active > .el-sub-menu__title .el-icon) {
  color: var(--el-color-primary) !important;
}

/* 深色模式下的选中高亮 */
html.dark .sidebar-menu :deep(.el-menu-item.is-active) {
  background-color: rgba(64, 158, 255, 0.15) !important;
  color: var(--el-color-primary) !important;
}

html.dark .sidebar-menu :deep(.el-menu-item.is-active .el-icon) {
  color: var(--el-color-primary) !important;
}

html.dark .sidebar-menu :deep(.el-menu-item:hover) {
  background-color: var(--el-fill-color-light) !important;
}

html.dark .sidebar-menu :deep(.el-sub-menu.is-active > .el-sub-menu__title) {
  color: var(--el-color-primary) !important;
}

html.dark .sidebar-menu :deep(.el-sub-menu.is-active > .el-sub-menu__title .el-icon) {
  color: var(--el-color-primary) !important;
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
  gap: 12px;
}

/* 语言切换按钮组 */
.locale-switch {
  display: flex;
  background: var(--el-fill-color-light);
  border-radius: 8px;
  padding: 3px;
  gap: 2px;
}

.locale-btn {
  padding: 6px 12px;
  border: none;
  background: transparent;
  color: var(--el-text-color-secondary);
  font-size: 13px;
  font-weight: 500;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.25s ease;
}

.locale-btn:hover {
  color: var(--el-text-color-primary);
}

.locale-btn.active {
  background: var(--el-bg-color);
  color: var(--el-color-primary);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

/* 主题切换按钮组 */
.theme-switch {
  display: flex;
  background: var(--el-fill-color-light);
  border-radius: 8px;
  padding: 3px;
  gap: 2px;
}

.theme-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  color: var(--el-text-color-secondary);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.25s ease;
}

.theme-btn:hover {
  color: var(--el-text-color-primary);
  background: var(--el-fill-color);
}

.theme-btn.active {
  background: var(--el-bg-color);
  color: var(--el-color-primary);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.theme-btn .el-icon {
  font-size: 16px;
}

.main-content {
  background-color: var(--el-bg-color-page);
  padding: 20px;
  overflow-y: auto;
}
</style>
