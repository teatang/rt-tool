# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Tauri v2 desktop application with a Vue 3 + TypeScript frontend. The project is a minimal starter template with a single example "greet" command demonstrating the frontend-backend communication pattern.

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
```

## Architecture

- **Frontend**: Vue 3 with `<script setup>` SFCs, TypeScript, Vite
- **Backend**: Rust with Tauri v2
- **Package Manager**: pnpm

### Directory Structure

- `src/` - Vue 3 frontend source (TypeScript)
- `src-tauri/` - Rust backend source
  - `src/lib.rs` - Main Tauri app logic with commands
  - `src/main.rs` - Entry point
  - `tauri.conf.json` - Tauri configuration

### Frontend-Backend Communication

Frontend calls Rust commands via `@tauri-apps/api/core` `invoke()`:

```typescript
import { invoke } from "@tauri-apps/api/core";

const result = await invoke("command_name", { arg1: "value" });
```

Rust commands are defined with `#[tauri::command]` attribute in `src-tauri/src/lib.rs`.
