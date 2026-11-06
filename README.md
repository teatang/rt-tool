# RT 工具

一个包含多种开发者工具的 Tauri 桌面应用。

## 功能特性

### 字符串工具
- **Base64** - Base64 编码与解码
- **URL 编码** - URL 编码与解码
- **JSON** - JSON 格式化和压缩，支持自定义缩进
- **HTML** - HTML 格式化和压缩
- **SQL** - SQL 格式化和压缩
- **正则** - 正则表达式测试，支持高亮显示匹配结果

### 网络工具
- **API 客户端** - 轻量便捷的接口调试工具：
  - **多标签页工作台** - 支持多接口并行编辑与快速切换
  - **常用 HTTP 方法** - 支持 GET、POST、PUT、DELETE、PATCH、HEAD、OPTIONS
  - **多类型参数配置** - Query 参数与 URL 双向同步、Headers 智能补齐、Body 支持 none/JSON/x-www-form-urlencoded/raw，内置 JSON 校验与格式化
  - **环境与全局变量** - 支持多套环境变量与全局变量，通过 `{{varName}}` 模板动态替换
  - **真实请求审查 (Sent)** - 自动捕获实际发出的请求快照（解析后完整 URL、真实 Headers 与 Body），提供一键复制等效 cURL 命令行
  - **结构化响应展示** - 响应体格式化预览、响应头快速搜索过滤、耗时与传输大小精确统计
  - **分组与历史记录** - 接口分组树形管理、请求历史自动归档与一键快速重新载入
  - **无 CORS 跨域限制** - 由 Rust 底层原生发送 HTTP 请求，不受浏览器同源策略限制

### 文件工具
- **文件搜索** - 按关键词递归搜索目录中的文件
- **文件重命名** - 通过正则表达式匹配文件，支持分组引用批量重命名，可手动编辑预览

### 其他工具
- **Mermaid** - Mermaid 图表编辑器
- **时间戳** - 时间戳转换，支持当前时间实时更新
- **UUID** - UUID 生成器，支持 v1/v3/v4/v5 版本
- **加密** - MD5/SHA/HMAC 加密

### 小游戏
- **俄罗斯方块** - 经典俄罗斯方块游戏，支持：
  - 7 种经典方块（I、O、T、S、Z、J、L）
  - 幽灵方块预览落点位置
  - 等级系统（每消除 10 行升一级，速度加快）
  - 最高分持久化保存
  - 深色/浅色模式
  - 精致的动画特效（落地光晕、得分弹出、升级脉冲）

### 主题系统
- 支持浅色/深色模式
- 支持跟随系统主题
- 设置自动持久化保存

### 国际化
- 支持中文/英文切换
- 语言设置自动持久化保存

## 技术栈

- **前端**: Vue 3 + TypeScript
- **状态管理**: Pinia
- **UI 组件库**: Element Plus
- **样式**: TailwindCSS v4
- **桌面框架**: Tauri v2
- **国际化**: vue-i18n
- **测试框架**: Vitest
- **加密库**: CryptoJS
- **包管理器**: pnpm

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

# 运行单元测试
pnpm test

# 运行单元测试 (UI 模式)
pnpm test:ui
```

## 项目结构

```
rt-tool/
├── src/                    # Vue 前端源码
│   ├── components/         # 可复用组件
│   ├── layouts/           # 布局组件
│   ├── router/            # Vue Router 配置
│   ├── stores/           # Pinia 状态管理
│   ├── styles/            # 全局样式
│   ├── utils/             # 工具函数 (含单元测试)
│   ├── views/            # 页面组件
│   │   └── tools/        # 工具组件
│   ├── i18n/             # 国际化配置
│   ├── App.vue
│   └── main.ts
├── src-tauri/             # Rust 后端源码
│   ├── src/
│   │   ├── lib.rs        # Tauri 命令
│   │   └── main.rs
│   └── tauri.conf.json
├── .github/
│   └── workflows/         # GitHub Actions 构建配置
├── package.json
├── vite.config.ts
├── tsconfig.json
└── vitest.config.ts
```

## 工具函数 (src/utils/)

项目将工具的核心逻辑提取到独立的 TypeScript 文件中，便于单元测试：

- `base64.ts` - Base64 编码/解码
- `url.ts` - URL 编码/解码
- `json.ts` - JSON 格式化和压缩
- `html.ts` - HTML 格式化和压缩
- `sql.ts` - SQL 格式化和压缩
- `regex.ts` - 正则表达式测试
- `encrypt.ts` - 加密工具
- `timestamp.ts` - 时间戳转换
- `uuid.ts` - UUID 生成
- `curlGenerator.ts` - 等效 cURL 命令行生成
- `urlParams.ts` - URL Query 参数提取、合并与双向同步
- `variableResolver.ts` - 环境变量与全局变量动态解析与实际请求快照构建
- `tetris.ts` - 俄罗斯方块游戏核心逻辑

每个工具函数都有对应的 `.test.ts` 单元测试文件。

## 下载安装

从 [Releases](https://github.com/teatang/rt-tool/releases) 页面下载对应平台的安装包：

- **macOS**: `.dmg` 安装包
- **Windows**: `.exe` / `.nsis` 安装包
- **Linux**: `.AppImage` / `.deb` 安装包

## 许可证

本项目基于 [MIT](LICENSE) 许可证开源。
