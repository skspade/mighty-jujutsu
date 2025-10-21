# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Architecture

This is a **Tauri v2 desktop application** with a React + TypeScript frontend. The project follows a dual-language architecture:

- **Frontend (mighty-jujutsu/)**: React 19 + TypeScript + Vite
  - Located in `mighty-jujutsu/src/`
  - Uses Vite for dev server and bundling
  - TypeScript configured with strict mode enabled

- **Backend (mighty-jujutsu/src-tauri/)**: Rust
  - Tauri v2 app with library crate structure (`mighty_jujutsu_lib`)
  - Entry point: `src-tauri/src/main.rs` calls `lib.rs::run()`
  - Tauri commands registered in `lib.rs` (example: `greet` command)
  - Uses `tauri-plugin-opener` for external URL handling

## Development Commands

All commands should be run from the **`mighty-jujutsu/`** directory (not the root):

```bash
cd mighty-jujutsu

# Development (runs Vite dev server + Tauri)
pnpm dev

# Build frontend + Tauri app
pnpm build

# Preview production build
pnpm preview

# Tauri CLI (for Tauri-specific commands)
pnpm tauri [command]
```

## Package Manager

This project uses **pnpm** as specified in `tauri.conf.json` (see `beforeDevCommand` and `beforeBuildCommand`).

## Key Configuration

- **Tauri config**: `mighty-jujutsu/src-tauri/tauri.conf.json`
  - Dev server runs on `localhost:1420`
  - Frontend dist outputs to `../dist`

- **TypeScript**: Strict mode with `noUnusedLocals` and `noUnusedParameters` enabled
  - Do not use underscore prefixes for unused variables
  - Remove unused code entirely

- **Vite config**: `mighty-jujutsu/vite.config.ts`
  - Fixed port 1420 for Tauri compatibility
  - Ignores `src-tauri` directory from watch

## Adding Tauri Commands

To add new Rust backend commands callable from frontend:

1. Add `#[tauri::command]` function in `src-tauri/src/lib.rs`
2. Register in `invoke_handler` using `tauri::generate_handler![command_name]`
3. Call from frontend using `@tauri-apps/api` invoke functions
