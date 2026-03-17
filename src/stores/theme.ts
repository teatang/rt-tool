import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useDark, useToggle } from '@vueuse/core'

// 主题模式类型
export type ThemeMode = 'light' | 'dark' | 'system'

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

  // 当前主题模式
  const themeMode = ref<ThemeMode>('system')

  // 设置主题
  const setTheme = (mode: ThemeMode) => {
    themeMode.value = mode

    if (mode === 'system') {
      // 跟随系统主题
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
  }

  return {
    isDark,
    themeMode,
    setTheme,
    toggleDark
  }
})
