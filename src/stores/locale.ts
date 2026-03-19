import { defineStore } from 'pinia'
import { ref } from 'vue'
import i18n from '../i18n'

export const useLocaleStore = defineStore('locale', () => {
  // 从 localStorage 读取保存的语言设置
  const getStoredLocale = (): string => {
    if (typeof window === 'undefined') return 'zh'
    const stored = localStorage.getItem('locale')
    if (stored === 'zh' || stored === 'en') {
      return stored
    }
    return 'zh'
  }

  // 当前语言
  const locale = ref<string>(getStoredLocale())

  // 初始化 i18n 语言
  i18n.global.locale.value = locale.value as 'en' | 'zh'

  // 设置语言
  const setLocale = (lang: string) => {
    locale.value = lang
    localStorage.setItem('locale', lang)
    i18n.global.locale.value = lang as 'en' | 'zh'
  }

  return {
    locale,
    setLocale
  }
})
