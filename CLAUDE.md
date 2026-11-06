# CLAUDE.md

本文件为 Claude Code (claude.ai/code) 在本仓库中工作时提供指导。

## 项目概述

RT Tool 是一个基于 Tauri v2 的桌面应用，前端使用 Vue 3 + TypeScript，提供字符串处理、文件操作和实用工具等功能。

## 常用命令

```bash
# 安装依赖
pnpm install

# 运行前端开发服务器 (Vite)
pnpm dev

# 构建前端生产版本
pnpm build

# 以开发模式运行 Tauri 应用
pnpm tauri dev

# 构建 Tauri 生产版本
pnpm tauri build

# 运行测试
pnpm test

# 以 UI 模式运行测试
pnpm test:ui

# 发布版本（递增版本号、同步 Cargo.toml、创建 git tag）
pnpm release
```

**版本管理**：版本号存储在 `package.json` 中，需要同步到 `src-tauri/Cargo.toml`。发布时 `scripts/release.ts` 脚本会自动处理。

**Git Hooks**：提交信息通过 commitlint 验证（配置在 `.commitlintrc`）。

## 技术架构

- **前端**：Vue 3 + `<script setup>` SFCs、TypeScript、Vite
- **后端**：Rust + Tauri v2
- **状态管理**：Pinia
- **UI 组件库**：Element Plus
- **样式**：TailwindCSS v4
- **国际化**：vue-i18n (en/zh)
- **包管理器**：pnpm

### 目录结构

- `src/` - Vue 3 前端源码
  - `views/tools/` - 工具组件（base64、json、encrypt、fileSearch、fileRename、apiClient 等）
    - `apiClient/` - API 调试客户端子组件（CollectionSidebar、RequestTabs、RequestEditor、ResponseViewer、EnvironmentManager、KeyValueEditor）
  - `types/` - TypeScript 类型定义（apiClient.ts 等）
  - `utils/` - 纯 TypeScript 工具函数（含单元测试：urlParams、variableResolver、curlGenerator、tetris、json 等）
  - `router/` - Vue Router 配置
  - `stores/` - Pinia 状态管理（theme）
  - `i18n/` - 国际化配置（en、zh）
  - `layouts/` - 布局组件
- `src-tauri/` - Rust 后端源码
  - `src/lib.rs` - Tauri 命令与应用入口
  - `src/api_client.rs` - API 客户端后端实现（原生 HTTP 请求、数据持久化）
  - `src/tray.rs` - 系统托盘配置
  - `src/main.rs` - 入口文件
  - `tauri.conf.json` - Tauri 配置

### 前端与后端通信

前端通过 `@tauri-apps/api/core` 的 `invoke()` 调用 Rust 命令：

```typescript
import { invoke } from "@tauri-apps/api/core";

const result = await invoke("command_name", { arg1: "value" });
```

Rust 命令使用 `#[tauri::command]` 属性定义，位于 `src-tauri/src/lib.rs` 及子模块。

**Tauri 插件**：使用 `tauri-plugin-opener`（文件资源管理器定位）和 `tauri-plugin-dialog`（原生对话框）。

### 可用工具

- **字符串**：Base64、URL 编解码、JSON 格式化/压缩、HTML 格式化、SQL 格式化、正则测试
- **网络**：API 客户端（多 Tab 编辑、环境变量与全局变量 `{{varName}}` 解析、接口集合树形分组与历史记录、实际请求审查快照与等效 cURL 生成、响应头过滤与格式化响应体、Rust 原生网络发起绕过 CORS 跨域限制）
- **文件**：文件搜索（递归关键词搜索）、批量文件重命名
- **其他**：Mermaid 图表编辑器、时间戳转换、UUID 生成器、MD5/SHA 加密、俄罗斯方块小游戏

### Rust 命令 (src-tauri/src/lib.rs)

- `greet` - 测试命令
- `search_files` - 按关键词递归搜索文件
- `list_dir_files` - 按正则表达式列出匹配文件（非递归）
- `rename_file` - 单文件重命名（处理 Windows 跨驱动器移动）
- `batch_rename` - 批量重命名文件
- `reveal_in_explorer` - 在系统文件管理器中显示文件位置
- `api_client_send_http` - 执行 HTTP/HTTPS 请求（避开浏览器同源 CORS 限制，返回状态码、Headers、响应体、耗时及体积）
- `api_client_load_data` - 读取本地持久化的 API 客户端配置与请求集合数据
- `api_client_save_data` - 保存 API 客户端数据至本地存储文件
