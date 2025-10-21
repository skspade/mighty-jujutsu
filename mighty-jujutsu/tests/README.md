# End-to-End Testing with Playwright

This directory contains Playwright end-to-end tests for the Tauri desktop application.

## Overview

The tests run against the fully compiled Tauri app, testing both the Rust backend and React frontend together. This is achieved using **Chrome DevTools Protocol (CDP)** to connect Playwright to the Tauri app's webview.

## Prerequisites

1. **Build the Tauri app** in debug mode:
   ```bash
   pnpm tauri build --debug
   ```

   Or simply run the dev command once to trigger a debug build:
   ```bash
   pnpm tauri dev
   ```

2. **Install Playwright browsers** (if not already done):
   ```bash
   pnpx playwright install chromium
   ```

## Running Tests

### Run all tests (headless)
```bash
pnpm test:e2e
```

### Run tests with Playwright UI
```bash
pnpm test:e2e:ui
```

### Run tests in headed mode (see the app window)
```bash
pnpm test:e2e:headed
```

### Debug tests with Playwright Inspector
```bash
pnpm test:e2e:debug
```

## How It Works

### Chrome DevTools Protocol (CDP) Connection

Unlike traditional web testing, Tauri apps are desktop applications. To test them with Playwright:

1. **Launch Tauri with debugging enabled**: The `TauriApp` helper class launches the Tauri binary with environment variables that enable remote debugging:
   - **macOS/Linux**: `WEBKIT_INSPECTOR_SERVER=127.0.0.1:9222`
   - **Windows**: `WEBVIEW2_ADDITIONAL_BROWSER_ARGUMENTS=--remote-debugging-port=9222`

2. **Connect Playwright via CDP**: Playwright connects to the debugging port using `chromium.connectOverCDP()` instead of launching its own browser.

3. **Get the webview page**: The Tauri app's webview is exposed as a Playwright Page object, allowing normal Playwright interactions.

### Test Structure

```typescript
import { test, expect } from '@playwright/test';
import { TauriApp } from './helpers/tauri';

let tauriApp: TauriApp;
let page: Page;

test.beforeAll(async () => {
  // Launch the Tauri app before tests
  tauriApp = new TauriApp();
  page = await tauriApp.launch();
});

test.afterAll(async () => {
  // Clean up: close the app
  await tauriApp.close();
});

test('should test something', async () => {
  // Use standard Playwright API
  await page.locator('button').click();
  await expect(page.locator('h1')).toBeVisible();
});
```

## Configuration

### Playwright Config (`playwright.config.ts`)

- **Workers**: Set to 1 (only one Tauri instance can run on the debug port)
- **Timeout**: 60 seconds (Tauri app startup can take time)
- **Retry**: Enabled on CI

### Tauri Helper (`tests/helpers/tauri.ts`)

The `TauriApp` class provides:
- Automatic binary path detection (debug or release builds)
- Platform-specific debugging setup
- Graceful app startup and shutdown
- Error handling and timeouts

Configuration options:
```typescript
const app = new TauriApp({
  binaryPath: '/custom/path/to/app',  // Optional: custom binary path
  debugPort: 9222,                     // Optional: custom debug port
  startupTimeout: 10000,               // Optional: custom startup timeout
});
```

## Troubleshooting

### App doesn't start

**Error**: "Tauri app did not start within timeout"

**Solution**:
1. Build the app first: `pnpm tauri build --debug`
2. Increase `startupTimeout` in TauriApp config
3. Check that the binary path is correct (see logs)

### Can't connect to debugging port

**Error**: "Failed to connect to Tauri app"

**Solution**:
1. Make sure no other instance of the app is running
2. Check that port 9222 is not in use
3. On macOS, ensure `WEBKIT_DISABLE_DMABUF_RENDERER=1` is set

### Tests run but fail

**Issue**: Tests fail on specific assertions

**Solution**:
1. Use `pnpm test:e2e:headed` to see what's happening
2. Use `pnpm test:e2e:debug` to step through tests
3. Check Playwright screenshots in `test-results/` directory

### Multiple tests fail

**Issue**: First test passes, subsequent tests fail

**Cause**: The Tauri app is shared across tests within a suite

**Solution**:
- Keep tests independent (don't rely on state from previous tests)
- Reset app state in `beforeEach` if needed
- Or use separate test files for isolated test suites

## Platform Notes

### macOS
- Uses WebKit-based webview
- Requires `WEBKIT_DISABLE_DMABUF_RENDERER=1` for compatibility
- App bundle is nested: `app.app/Contents/MacOS/app`

### Linux
- Uses WebKit (GTK)
- Binary path: `target/debug/mighty-jujutsu`

### Windows
- Uses WebView2 (Chromium-based)
- Different environment variable: `WEBVIEW2_ADDITIONAL_BROWSER_ARGUMENTS`
- Binary path: `target/debug/mighty-jujutsu.exe`

## Writing Tests

### Test Tauri Commands

To test Tauri backend commands:

```typescript
test('should call Tauri command', async () => {
  const input = page.locator('#input');
  const button = page.locator('#submit');

  await input.fill('test data');
  await button.click();

  // Verify the result from Rust backend
  await expect(page.locator('#result')).toContainText('Expected response');
});
```

### Test UI Interactions

Standard Playwright selectors work:

```typescript
test('should interact with UI', async () => {
  await page.click('button');
  await page.fill('input[type="text"]', 'value');
  await expect(page.locator('h1')).toBeVisible();
});
```

### Test Navigation

```typescript
test('should navigate', async () => {
  await page.click('a[href="/about"]');
  await expect(page).toHaveURL(/.*about/);
});
```

## Resources

- [Playwright Documentation](https://playwright.dev)
- [Tauri Testing Guide](https://v2.tauri.app/develop/tests/)
- [Chrome DevTools Protocol](https://chromedevtools.github.io/devtools-protocol/)
