# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

RT Tool is a Tauri v2 desktop application with a Vue 3 + TypeScript frontend - a developer toolkit providing string processing, file operations, and utility tools.

## Commands

```bash
# Install dependencies
pnpm install

# Run frontend dev server (Vite)
pnpm dev

# Build frontend for production
pnpm build

# Run Tauri app in development mode
pnpm tauri dev

# Build Tauri app for production
pnpm tauri build

# Run tests
pnpm test

# Run tests with UI
pnpm test:ui
```

## Architecture

- **Frontend**: Vue 3 with `<script setup>` SFCs, TypeScript, Vite
- **Backend**: Rust with Tauri v2
- **State Management**: Pinia
- **UI Components**: Element Plus
- **Styling**: TailwindCSS
- **i18n**: vue-i18n (en/zh)
- **Package Manager**: pnpm

### Directory Structure

- `src/` - Vue 3 frontend source
  - `views/tools/` - Tool components (base64, json, encrypt, fileSearch, fileRename, etc.)
  - `router/` - Vue Router configuration
  - `stores/` - Pinia stores (theme)
  - `i18n/` - Internationalization (en, zh)
  - `layouts/` - Layout components
- `src-tauri/` - Rust backend
  - `src/lib.rs` - Tauri commands (greet, search_files, rename_file)
  - `src/main.rs` - Entry point
  - `tauri.conf.json` - Tauri configuration

### Frontend-Backend Communication

Frontend calls Rust commands via `@tauri-apps/api/core` `invoke()`:

```typescript
import { invoke } from "@tauri-apps/api/core";

const result = await invoke("command_name", { arg1: "value" });
```

Rust commands are defined with `#[tauri::command]` attribute in `src-tauri/src/lib.rs`.

### Available Tools

- **String**: Base64, URL encode/decode, JSON format/compress, HTML format, SQL format, Regex tester
- **File**: File search (recursive keyword search), batch file rename
- **Other**: Mermaid diagram editor, timestamp converter, UUID generator, MD5/SHA encryption
