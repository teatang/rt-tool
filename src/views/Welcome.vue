<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import {
  Key,
  Link,
  Files,
  PictureFilled,
  TrendCharts,
  DocumentChecked,
  Search,
  EditPen,
  Film,
  Clock,
  Stamp,
  Lock,
  Grid
} from '@element-plus/icons-vue'

const { t } = useI18n()

interface Tool {
  nameKey: string
  descKey: string
  path: string
  icon: any
  color: string
}

const stringTools: Tool[] = [
  { nameKey: 'tools.base64', descKey: 'base64', path: '/base64', icon: Key, color: '#4caf50' },
  { nameKey: 'tools.url', descKey: 'url', path: '/url', icon: Link, color: '#2196f3' },
  { nameKey: 'tools.json', descKey: 'json', path: '/json', icon: Files, color: '#ff9800' },
  { nameKey: 'tools.html', descKey: 'html', path: '/html', icon: PictureFilled, color: '#f44336' },
  { nameKey: 'tools.sql', descKey: 'sql', path: '/sql', icon: TrendCharts, color: '#9c27b0' },
  { nameKey: 'tools.regex', descKey: 'regex', path: '/regex', icon: DocumentChecked, color: '#00bcd4' }
]

const fileTools: Tool[] = [
  { nameKey: 'tools.fileSearch', descKey: 'fileSearch', path: '/fileSearch', icon: Search, color: '#ff5722' },
  { nameKey: 'tools.fileRename', descKey: 'fileRename', path: '/fileRename', icon: EditPen, color: '#8bc34a' }
]

const otherTools: Tool[] = [
  { nameKey: 'tools.mermaid', descKey: 'mermaid', path: '/mermaid', icon: Film, color: '#e91e63' },
  { nameKey: 'tools.timestamp', descKey: 'timestamp', path: '/timestamp', icon: Clock, color: '#607d8b' },
  { nameKey: 'tools.uuid', descKey: 'uuid', path: '/uuid', icon: Stamp, color: '#673ab7' },
  { nameKey: 'tools.encrypt', descKey: 'encrypt', path: '/encrypt', icon: Lock, color: '#3f51b5' }
]

const games: Tool[] = [
  { nameKey: 'tools.tetris', descKey: 'tetris', path: '/tetris', icon: Grid, color: '#ffc107' }
]
</script>

<template>
  <div class="welcome-container">
    <h1 class="welcome-title">{{ t('app.title') }}</h1>
    <p class="welcome-subtitle">{{ t('nav.home') }}</p>

    <!-- 字符串工具 -->
    <div class="tool-section">
      <h2 class="section-title">{{ t('nav.string') }}</h2>
      <div class="tool-grid">
        <router-link
          v-for="tool in stringTools"
          :key="tool.path"
          :to="tool.path"
          class="tool-card"
        >
          <div class="tool-icon" :style="{ backgroundColor: tool.color }">
            <el-icon :size="28">
              <component :is="tool.icon" />
            </el-icon>
          </div>
          <div class="tool-info">
            <div class="tool-name">{{ t(tool.nameKey) }}</div>
            <div class="tool-desc">{{ t(`descriptions.${tool.descKey}`) }}</div>
          </div>
        </router-link>
      </div>
    </div>

    <!-- 文件工具 -->
    <div class="tool-section">
      <h2 class="section-title">{{ t('nav.file') }}</h2>
      <div class="tool-grid">
        <router-link
          v-for="tool in fileTools"
          :key="tool.path"
          :to="tool.path"
          class="tool-card"
        >
          <div class="tool-icon" :style="{ backgroundColor: tool.color }">
            <el-icon :size="28">
              <component :is="tool.icon" />
            </el-icon>
          </div>
          <div class="tool-info">
            <div class="tool-name">{{ t(tool.nameKey) }}</div>
            <div class="tool-desc">{{ t(`descriptions.${tool.descKey}`) }}</div>
          </div>
        </router-link>
      </div>
    </div>

    <!-- 其他工具 -->
    <div class="tool-section">
      <h2 class="section-title">{{ t('nav.other') }}</h2>
      <div class="tool-grid">
        <router-link
          v-for="tool in otherTools"
          :key="tool.path"
          :to="tool.path"
          class="tool-card"
        >
          <div class="tool-icon" :style="{ backgroundColor: tool.color }">
            <el-icon :size="28">
              <component :is="tool.icon" />
            </el-icon>
          </div>
          <div class="tool-info">
            <div class="tool-name">{{ t(tool.nameKey) }}</div>
            <div class="tool-desc">{{ t(`descriptions.${tool.descKey}`) }}</div>
          </div>
        </router-link>
      </div>
    </div>

    <!-- 小游戏 -->
    <div class="tool-section">
      <h2 class="section-title">{{ t('nav.games') }}</h2>
      <div class="tool-grid">
        <router-link
          v-for="tool in games"
          :key="tool.path"
          :to="tool.path"
          class="tool-card"
        >
          <div class="tool-icon" :style="{ backgroundColor: tool.color }">
            <el-icon :size="28">
              <component :is="tool.icon" />
            </el-icon>
          </div>
          <div class="tool-info">
            <div class="tool-name">{{ t(tool.nameKey) }}</div>
            <div class="tool-desc">{{ t(`descriptions.${tool.descKey}`) }}</div>
          </div>
        </router-link>
      </div>
    </div>
  </div>
</template>

<style scoped>
.welcome-container {
  max-width: 1200px;
  padding: 20px;
}

.welcome-title {
  font-size: 32px;
  font-weight: 700;
  color: var(--el-text-color-primary);
  margin-bottom: 8px;
}

.welcome-subtitle {
  font-size: 16px;
  color: var(--el-text-color-secondary);
  margin-bottom: 32px;
}

.tool-section {
  margin-bottom: 32px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin-bottom: 16px;
  padding-left: 8px;
  border-left: 4px solid var(--el-color-primary);
}

.tool-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

.tool-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: var(--el-fill-color-light);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid transparent;
  text-decoration: none;
}

.tool-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-color: var(--el-color-primary);
}

.tool-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  border-radius: 12px;
  color: #fff;
  flex-shrink: 0;
}

.tool-info {
  flex: 1;
  min-width: 0;
}

.tool-name {
  font-size: 16px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin-bottom: 4px;
}

.tool-desc {
  font-size: 13px;
  color: var(--el-text-color-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
