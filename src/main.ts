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
