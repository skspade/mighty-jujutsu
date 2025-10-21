import { defineConfig } from '@playwright/test';

/**
 * Playwright configuration for Tauri E2E testing
 *
 * This configuration connects to the Tauri app via Chrome DevTools Protocol (CDP)
 * instead of launching a browser directly. The Tauri app must be started with
 * remote debugging enabled before tests run.
 */
export default defineConfig({
  testDir: './tests',

  // Tauri app startup can take time, especially on first run
  timeout: 60000,

  // Run tests in serial (Tauri app can only have one instance with CDP on port 9222)
  fullyParallel: false,
  workers: 1,

  // Fail the build on CI if you accidentally left test.only in the source code
  forbidOnly: !!process.env.CI,

  // Retry on CI only
  retries: process.env.CI ? 2 : 0,

  // Reporter to use
  reporter: 'html',

  use: {
    // Base URL - not used for Tauri but good to have for consistency
    baseURL: 'http://localhost:9222',

    // Collect trace when retrying the failed test
    trace: 'on-first-retry',

    // Screenshots on failure
    screenshot: 'only-on-failure',

    // Video on failure
    video: 'retain-on-failure',
  },

  // Configure projects if you need to test different scenarios
  projects: [
    {
      name: 'tauri-app',
      use: {
        // Disable web-first assertions timeout since we're testing a desktop app
        actionTimeout: 10000,
      },
    },
  ],
});
