import { createI18n } from 'vue-i18n'
import en from './locales/en'
import zh from './locales/zh'

// 创建 i18n 实例
const i18n = createI18n({
  legacy: false, // 使用组合式 API 模式
  locale: 'zh',  // 默认语言
  fallbackLocale: 'en', // 备用语言
  messages: {
    en,
    zh
  }
})

export default i18n
