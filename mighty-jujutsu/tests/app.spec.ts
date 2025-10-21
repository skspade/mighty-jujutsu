import { test, expect, type Page } from '@playwright/test';
import { TauriApp } from './helpers/tauri';

/**
 * E2E tests for the Tauri application
 *
 * These tests run against the fully compiled Tauri app (Rust backend + React frontend)
 * using Chrome DevTools Protocol for browser automation.
 */

let tauriApp: TauriApp;
let page: Page;

test.beforeAll(async () => {
  // Launch the Tauri app before running tests
  tauriApp = new TauriApp();
  page = await tauriApp.launch();

  // Wait for the app to be fully loaded
  await page.waitForLoadState('domcontentloaded');
});

test.afterAll(async () => {
  // Clean up: close the Tauri app
  await tauriApp.close();
});

test.describe('Tauri App', () => {
  test('should load the app successfully', async () => {
    // Verify the main heading is visible
    const heading = page.locator('h1');
    await expect(heading).toContainText('Welcome to Tauri + React');
  });

  test('should have all logo links', async () => {
    // Check that all three logos are present
    const viteLink = page.locator('a[href="https://vite.dev"]');
    const tauriLink = page.locator('a[href="https://tauri.app"]');
    const reactLink = page.locator('a[href="https://react.dev"]');

    await expect(viteLink).toBeVisible();
    await expect(tauriLink).toBeVisible();
    await expect(reactLink).toBeVisible();
  });

  test('should greet the user with entered name', async () => {
    // Find the input field and button
    const input = page.locator('#greet-input');
    const button = page.locator('button[type="submit"]');

    // Enter a name
    await input.fill('Playwright');

    // Click the greet button
    await button.click();

    // Wait for the greeting message to appear
    // The greet command returns "Hello, {name}! You've been greeted from Rust!"
    const greeting = page.locator('text=Hello, Playwright!');
    await expect(greeting).toBeVisible({ timeout: 5000 });
  });

  test('should clear and greet again with different name', async () => {
    // Find the input field and button
    const input = page.locator('#greet-input');
    const button = page.locator('button[type="submit"]');

    // Clear the input and enter a new name
    await input.clear();
    await input.fill('Tauri');

    // Click the greet button
    await button.click();

    // Verify the new greeting appears
    const greeting = page.locator('text=Hello, Tauri!');
    await expect(greeting).toBeVisible({ timeout: 5000 });
  });

  test('should handle empty input gracefully', async () => {
    // Find the input field and button
    const input = page.locator('#greet-input');
    const button = page.locator('button[type="submit"]');

    // Clear the input
    await input.clear();

    // Click the greet button with empty input
    await button.click();

    // The app should still greet (Rust code handles empty string)
    const greeting = page.locator('text=Hello, !');
    await expect(greeting).toBeVisible({ timeout: 5000 });
  });
});

test.describe('Tauri Backend Integration', () => {
  test('should successfully invoke Tauri commands', async () => {
    // This test verifies that the Tauri backend is running and responding
    const input = page.locator('#greet-input');
    const button = page.locator('button[type="submit"]');

    // Enter a test name
    await input.fill('Backend Test');
    await button.click();

    // Verify the response includes the Rust greeting message
    const greeting = page.locator('text=You\'ve been greeted from Rust!');
    await expect(greeting).toBeVisible({ timeout: 5000 });
  });
});
