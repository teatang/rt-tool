import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useDark, useToggle } from '@vueuse/core'

// 主题模式类型
export type ThemeMode = 'light' | 'dark' | 'system'

// 从 localStorage 读取保存的主题模式
const getStoredThemeMode = (): ThemeMode => {
  if (typeof window === 'undefined') return 'system'
  const stored = localStorage.getItem('theme-mode')
  if (stored === 'light' || stored === 'dark' || stored === 'system') {
    return stored
  }
  return 'system'
}

// 主题状态管理
export const useThemeStore = defineStore('theme', () => {
  // 使用 vueuse 的 useDark 监听深色模式
  const isDark = useDark({
    selector: 'html',
    attribute: 'class',
    valueDark: 'dark',
    valueLight: ''
  })
  const toggleDark = useToggle(isDark)

  // 当前主题模式 - 从 localStorage 读取
  const themeMode = ref<ThemeMode>(getStoredThemeMode())

  // 初始化主题
  const initTheme = () => {
    const mode = themeMode.value
    if (mode === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      isDark.value = prefersDark
    } else {
      isDark.value = mode === 'dark'
    }
  }

  // 设置主题
  const setTheme = (mode: ThemeMode) => {
    themeMode.value = mode
    localStorage.setItem('theme-mode', mode)

    if (mode === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      isDark.value = prefersDark
    } else {
      isDark.value = mode === 'dark'
    }
  }

  // 监听系统主题变化
  if (typeof window !== 'undefined') {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (themeMode.value === 'system') {
        isDark.value = e.matches
      }
    })

    // 页面加载后初始化主题
    initTheme()
  }

  return {
    isDark,
    themeMode,
    setTheme,
    toggleDark
  }
})
