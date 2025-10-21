# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Architecture

This is a **Tauri v2 desktop application** with a React + TypeScript frontend. The project follows a dual-language architecture:

- **Frontend**: React 19 + TypeScript + Vite
  - Located in `src/`
  - Uses Vite for dev server and bundling
  - TypeScript configured with strict mode enabled

- **Backend**: Rust
  - Tauri v2 app with library crate structure (`mighty_jujutsu_lib`)
  - Entry point: `src-tauri/src/main.rs` calls `lib.rs::run()`
  - Tauri commands registered in `lib.rs` (example: `greet` command)
  - Uses `tauri-plugin-opener` for external URL handling

## Version Control

This repository uses **jujutsu (jj)** for all version control operations. Jujutsu is configured in colocate mode, which means it works alongside git and maintains compatibility.

**Configuration:**
- User: skspade
- Email: skspade@pm.me
- Main bookmark: `main` (tracked from `main@origin`)

**Common jj commands:**

```bash
# View current state
jj status
jj log

# Create a new change
jj new

# Describe the current change
jj describe -m "Your commit message"

# Track remote bookmarks
jj bookmark track <bookmark>@origin

# Push changes
jj git push

# Pull changes
jj git fetch

# Update working copy author
jj metaedit --update-author
```

**Note:** Always use `jj` commands instead of `git` commands for version control operations in this repository.

## Development Commands

All commands should be run from the **root directory**:

```bash
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

- **Tauri config**: `src-tauri/tauri.conf.json`
  - Dev server runs on `localhost:1420`
  - Frontend dist outputs to `../dist`

- **TypeScript**: Strict mode with `noUnusedLocals` and `noUnusedParameters` enabled
  - Do not use underscore prefixes for unused variables
  - Remove unused code entirely

- **Vite config**: `vite.config.ts`
  - Fixed port 1420 for Tauri compatibility
  - Ignores `src-tauri` directory from watch

## Rust Backend Architecture

The backend is organized into modular components:

- **JJ Integration Layer** (`src-tauri/src/jj/`):
  - `JJExecutor`: Executes jj CLI commands asynchronously via tokio
  - `JJParser`: Parses jj command output into structured data

- **Commands** (`src-tauri/src/commands/`): Tauri commands organized by domain
  - `repository.rs`: Basic repo operations (status, init, diff)
  - `history.rs`: Log and history viewing
  - `changes.rs`: Creating and describing changes
  - `bookmarks.rs`: Bookmark management
  - `remote.rs`: Git fetch/push operations

- **Models** (`src-tauri/src/models/`): Serde-serializable types representing jj concepts (Repository, Commit, Change, Bookmark)

- **Error Handling** (`src-tauri/src/error.rs`): Custom error types using thiserror

## Testing

### Rust Unit Tests

Run all Rust unit tests from the `src-tauri` directory:

```bash
cd src-tauri
cargo test
```

Each command module includes integration tests that verify jj command execution and parsing.

### End-to-End Tests (Playwright)

The project uses Playwright to test the compiled Tauri app via Chrome DevTools Protocol.

**Prerequisites:**
- Build the app once: `pnpm tauri build --debug`
- Install browsers: `pnpx playwright install chromium`

**Run E2E tests** (from the root directory):

```bash
# Run all tests (headless)
pnpm test:e2e

# Run with Playwright UI (recommended for development)
pnpm test:e2e:ui

# Run in headed mode (see app window)
pnpm test:e2e:headed

# Debug tests with Playwright Inspector
pnpm test:e2e:debug
```

**Test location:** `tests/`
- Tests use a `TauriApp` helper class to launch and connect to the Tauri binary
- See `tests/README.md` for comprehensive E2E testing guide

## Adding Tauri Commands

To add new Rust backend commands callable from frontend:

1. Create command function in appropriate module under `src-tauri/src/commands/`
2. Add `#[tauri::command]` attribute and implement using `JJExecutor`
3. Export from `commands/mod.rs` and import in `lib.rs`
4. Register in `invoke_handler` using `tauri::generate_handler![command_name]`
5. Add integration tests in the command module using `#[cfg(test)]`
6. Call from frontend using `invoke()` from `@tauri-apps/api/core`
