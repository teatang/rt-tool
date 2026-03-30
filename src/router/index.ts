import { createRouter, createWebHistory } from 'vue-router'

// 路由配置
const routes = [
  {
    path: '/',
    redirect: '/base64'
  },
  // 字符串工具
  {
    path: '/base64',
    name: 'base64',
    component: () => import('../views/tools/base64.vue')
  },
  {
    path: '/url',
    name: 'url',
    component: () => import('../views/tools/url.vue')
  },
  {
    path: '/json',
    name: 'json',
    component: () => import('../views/tools/json.vue')
  },
  {
    path: '/html',
    name: 'html',
    component: () => import('../views/tools/html.vue')
  },
  {
    path: '/sql',
    name: 'sql',
    component: () => import('../views/tools/sql.vue')
  },
  {
    path: '/regex',
    name: 'regex',
    component: () => import('../views/tools/regex.vue')
  },
  // 文件工具
  {
    path: '/fileSearch',
    name: 'fileSearch',
    component: () => import('../views/tools/fileSearch.vue')
  },
  {
    path: '/fileRename',
    name: 'fileRename',
    component: () => import('../views/tools/fileRename.vue')
  },
  // 其他工具
  {
    path: '/mermaid',
    name: 'mermaid',
    component: () => import('../views/tools/mermaid.vue')
  },
  {
    path: '/timestamp',
    name: 'timestamp',
    component: () => import('../views/tools/timestamp.vue')
  },
  {
    path: '/uuid',
    name: 'uuid',
    component: () => import('../views/tools/uuid.vue')
  },
  {
    path: '/encrypt',
    name: 'encrypt',
    component: () => import('../views/tools/encrypt.vue')
  },
  // 小游戏
  {
    path: '/tetris',
    name: 'tetris',
    component: () => import('../views/tools/tetris.vue')
  }
]

// 创建路由实例
const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
