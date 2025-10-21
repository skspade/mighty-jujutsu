# E2E Testing Guide for Tauri Applications on macOS

## Summary

This document explains the challenges and solutions for end-to-end testing of Tauri applications on macOS.

## Key Findings

### Tauri Build Status: ✅ SUCCESS

The Tauri application builds successfully in debug mode:
- **Build command**: `pnpm tauri build --debug`
- **Binary location**: `/Users/seanspade/WebstormProjects/mighty-jujutsu/src-tauri/target/debug/mighty-jujutsu`
- **App bundle**: `/Users/seanspade/WebstormProjects/mighty-jujutsu/src-tauri/target/debug/bundle/macos/mighty-jujutsu.app`
- **Build time**: ~25 seconds (incremental builds)
- **Bundle size**: 24MB

### E2E Testing Challenges: ❌ PLATFORM LIMITATION

**Critical Discovery**: Traditional Tauri E2E testing approaches **DO NOT work on macOS**.

#### Why Testing Fails on macOS

1. **tauri-driver is not supported on macOS**
   - Official Tauri WebDriver testing tool
   - Only works on Linux and Windows
   - Error: "tauri-driver is not supported on this platform"

2. **WebKit on macOS lacks Chrome DevTools Protocol (CDP) support**
   - macOS Tauri apps use WebKit for the WebView
   - WebKit doesn't expose CDP the same way Chromium does
   - Playwright's CDP connection approach fails
   - Error: "Tauri app did not start within 5000ms"

3. **No WebDriver protocol support**
   - WebKit on macOS doesn't implement the WebDriver protocol properly
   - This is a fundamental platform limitation, not a configuration issue

## Alternative Testing Strategies

Given the platform limitations, here are recommended approaches for testing Tauri apps during development:

### 1. Frontend Unit & Integration Testing (Recommended)

Test the React frontend independently using Vite's dev server:

```bash
# Start Vite dev server
pnpm dev

# In another terminal, run Playwright tests against localhost:1420
pnpm playwright test --config playwright.frontend.config.ts
```

**Advantages**:
- Fast test execution
- Full Playwright features work
- Easy debugging with browser DevTools
- CI/CD friendly

**Create** `playwright.frontend.config.ts`:
```typescript
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/frontend',
  use: {
    baseURL: 'http://localhost:1420',
  },
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:1420',
    reuseExistingServer: !process.env.CI,
  },
});
```

### 2. Mock Tauri APIs for Frontend Tests

Use `@tauri-apps/api/mocks` to mock Tauri commands in frontend tests:

```typescript
import { mockIPC } from '@tauri-apps/api/mocks';

test.beforeAll(() => {
  mockIPC((cmd, args) => {
    if (cmd === 'greet') {
      return `Hello, ${args.name}! You've been greeted from Rust!`;
    }
  });
});
```

### 3. Test on Linux/Windows (CI/CD)

For full integration testing with the actual Tauri backend:

```yaml
# .github/workflows/test.yml
name: E2E Tests

on: [push, pull_request]

jobs:
  test-linux:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Install dependencies
        run: |
          sudo apt-get update
          sudo apt-get install -y webkit2gtk-4.1
      - name: Install Rust
        uses: actions-rs/toolchain@v1
      - name: Install tauri-driver
        run: cargo install tauri-driver
      - name: Run E2E tests
        run: pnpm test:e2e
```

### 4. Manual Testing on macOS

For now, manual testing remains the most practical approach on macOS:

```bash
# Build and run the app
pnpm tauri build --debug
open src-tauri/target/debug/bundle/macos/mighty-jujutsu.app

# Or run in dev mode with hot reload
pnpm tauri dev
```

### 5. Rust Backend Unit Tests

Test Tauri commands directly in Rust:

```rust
// src-tauri/src/lib.rs
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_greet_command() {
        let result = greet("Test".to_string());
        assert_eq!(result, "Hello, Test! You've been greeted from Rust!");
    }
}
```

Run Rust tests:
```bash
cd src-tauri
cargo test
```

## Testing Setup in This Project

### Current Setup

1. **Playwright Tests** (`tests/app.spec.ts`)
   - Attempts to use CDP to connect to Tauri
   - ❌ Does not work on macOS (WebKit limitation)
   - ✅ Could work if modified to test Vite dev server

2. **WebdriverIO Tests** (`tests/wdio/app.spec.ts`)
   - Uses tauri-driver for WebDriver protocol
   - ❌ Does not work on macOS (platform not supported)
   - ✅ Works on Linux/Windows in CI/CD

### Recommended Next Steps

1. **For local development (macOS)**:
   - Configure Playwright to test against Vite dev server
   - Mock Tauri API calls for frontend testing
   - Add Rust unit tests for backend logic

2. **For CI/CD (Linux)**:
   - Keep WebdriverIO + tauri-driver setup
   - Run full integration tests on Linux runners
   - Ensure consistent behavior across platforms

3. **For production confidence**:
   - Manual testing on macOS before releases
   - Automated tests on Linux in CI/CD
   - Consider manual QA checklist for platform-specific features

## Test Coverage Strategy

```
┌─────────────────────────────────────────────────────┐
│                   Test Pyramid                       │
├─────────────────────────────────────────────────────┤
│  Manual Testing (macOS)                             │
│  - Pre-release verification                         │
│  - Platform-specific features                       │
├─────────────────────────────────────────────────────┤
│  E2E Tests (Linux CI/CD)                            │
│  - Full app integration                             │
│  - Tauri commands + UI                              │
│  - WebdriverIO + tauri-driver                       │
├─────────────────────────────────────────────────────┤
│  Integration Tests (Frontend)                       │
│  - Playwright vs Vite dev server                    │
│  - Mocked Tauri APIs                                │
│  - User workflows                                   │
├─────────────────────────────────────────────────────┤
│  Unit Tests                                         │
│  - React components (Vitest/Jest)                   │
│  - Rust backend (cargo test)                        │
│  - Business logic                                   │
└─────────────────────────────────────────────────────┘
```

## Resources

- [Tauri Testing Guide](https://tauri.app/develop/tests/)
- [tauri-driver Documentation](https://github.com/tauri-apps/tauri/tree/dev/tooling/webdriver)
- [WebdriverIO with Tauri](https://tauri.app/develop/tests/webdriver/example/webdriverio/)
- [Playwright Documentation](https://playwright.dev/)

## Conclusion

**Tauri builds successfully**, but **E2E testing on macOS is not currently possible** due to platform limitations with WebKit and tauri-driver. The recommended approach is to:

1. Test frontend with Playwright against Vite dev server locally
2. Run full E2E tests with tauri-driver on Linux in CI/CD
3. Perform manual testing on macOS for platform-specific verification

This hybrid approach provides good test coverage while working within platform constraints.
