# RT 工具

一个包含多种开发者工具的 Tauri 桌面应用。

## 功能特性

### 字符串工具
- **Base64** - Base64 编码与解码
- **URL 编码** - URL 编码与解码
- **JSON** - JSON 格式化和压缩
- **HTML** - HTML 格式化和压缩
- **SQL** - SQL 格式化和压缩
- **正则** - 正则表达式测试

### 文件工具
- **文件搜索** - 按关键词搜索文件
- **文件重命名** - 批量重命名文件

### 其他工具
- **Mermaid** - Mermaid 图表编辑器
- **时间戳** - 时间戳转换
- **UUID** - UUID 生成器
- **加密** - MD5/SHA 加密

## 技术栈

- **前端**: Vue 3 + TypeScript
- **状态管理**: Pinia
- **UI 组件库**: Element Plus
- **样式**: TailwindCSS
- **桌面框架**: Tauri v2
- **国际化**: vue-i18n

## 常用命令

```bash
# 安装依赖
pnpm install

# 运行前端开发服务器
pnpm dev

# 构建前端
pnpm build

# 运行 Tauri 开发模式
pnpm tauri dev

# 构建 Tauri 生产版本
pnpm tauri build
```

## 项目结构

```
rt-tool/
├── src/                    # Vue 前端源码
│   ├── components/         # 可复用组件
│   ├── layouts/            # 布局组件
│   ├── router/             # Vue Router 配置
│   ├── stores/             # Pinia 状态管理
│   ├── styles/             # 全局样式
│   ├── views/              # 页面组件
│   │   └── tools/          # 工具组件
│   ├── i18n/               # 国际化配置
│   ├── __tests__/          # 单元测试
│   ├── App.vue
│   └── main.ts
├── src-tauri/              # Rust 后端源码
│   ├── src/
│   │   ├── lib.rs          # Tauri 命令
│   │   └── main.rs
│   └── tauri.conf.json
├── package.json
├── vite.config.ts
└── tsconfig.json
```
