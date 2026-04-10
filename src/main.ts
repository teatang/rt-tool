import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import en from 'element-plus/es/locale/lang/en'
import i18n from './i18n'
import pinia from './stores'
import router from './router'
import App from './App.vue'
import './styles/main.css'
import { listen } from '@tauri-apps/api/event'
import { useLocaleStore } from './stores/locale'
import { useThemeStore } from './stores/theme'
import { ElMessage } from 'element-plus'

// 获取浏览器语言
const browserLang = navigator.language.toLowerCase()
const locale = browserLang.includes('zh') ? zhCn : en

const app = createApp(App)

// 注册插件
app.use(ElementPlus, { locale })
app.use(pinia)
app.use(i18n)
app.use(router)

// 挂载应用
app.mount('#app')

// 监听托盘菜单事件
const localeStore = useLocaleStore()
const themeStore = useThemeStore()

// 监听设置语言事件
listen<string>('tray-set-language', (event) => {
  const lang = event.payload
  localeStore.setLocale(lang)
  ElMessage({
    message: lang === 'zh' ? '已切换到中文' : 'Language changed to English',
    duration: 2000
  })
})

// 监听设置主题事件
listen<string>('tray-set-theme', (event) => {
  const mode = event.payload as 'light' | 'dark' | 'system'
  themeStore.setTheme(mode)
  ElMessage({
    message: mode === 'dark' ? '已切换到深色模式' : mode === 'light' ? '已切换到浅色模式' : '已切换到跟随系统',
    duration: 2000
  })
})
