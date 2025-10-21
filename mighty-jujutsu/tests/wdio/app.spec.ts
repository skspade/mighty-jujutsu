/**
 * E2E tests for the Tauri application using WebdriverIO
 *
 * These tests run against the fully compiled Tauri app (Rust backend + React frontend)
 * using tauri-driver and WebdriverIO for browser automation.
 */

describe('Tauri App', () => {
  it('should load the app successfully', async () => {
    // Verify the main heading is visible
    const heading = await $('h1');
    await expect(heading).toBeDisplayed();
    await expect(heading).toHaveTextContaining('Welcome to Tauri + React');
  });

  it('should have all logo links', async () => {
    // Check that all three logos are present
    const viteLink = await $('a[href="https://vite.dev"]');
    const tauriLink = await $('a[href="https://tauri.app"]');
    const reactLink = await $('a[href="https://react.dev"]');

    await expect(viteLink).toBeDisplayed();
    await expect(tauriLink).toBeDisplayed();
    await expect(reactLink).toBeDisplayed();
  });

  it('should greet the user with entered name', async () => {
    // Find the input field and button
    const input = await $('#greet-input');
    const button = await $('button[type="submit"]');

    // Enter a name
    await input.setValue('WebdriverIO');

    // Click the greet button
    await button.click();

    // Wait for the greeting message to appear
    // The greet command returns "Hello, {name}! You've been greeted from Rust!"
    const greeting = await $('*=Hello, WebdriverIO!');
    await expect(greeting).toBeDisplayed();
  });

  it('should clear and greet again with different name', async () => {
    // Find the input field and button
    const input = await $('#greet-input');
    const button = await $('button[type="submit"]');

    // Clear the input and enter a new name
    await input.clearValue();
    await input.setValue('Tauri');

    // Click the greet button
    await button.click();

    // Verify the new greeting appears
    const greeting = await $('*=Hello, Tauri!');
    await expect(greeting).toBeDisplayed();
  });

  it('should handle empty input gracefully', async () => {
    // Find the input field and button
    const input = await $('#greet-input');
    const button = await $('button[type="submit"]');

    // Clear the input
    await input.clearValue();

    // Click the greet button with empty input
    await button.click();

    // The app should still greet (Rust code handles empty string)
    const greeting = await $('*=Hello, !');
    await expect(greeting).toBeDisplayed();
  });
});

describe('Tauri Backend Integration', () => {
  it('should successfully invoke Tauri commands', async () => {
    // This test verifies that the Tauri backend is running and responding
    const input = await $('#greet-input');
    const button = await $('button[type="submit"]');

    // Enter a test name
    await input.clearValue();
    await input.setValue('Backend Test');
    await button.click();

    // Verify the response includes the Rust greeting message
    const greeting = await $('*=You\'ve been greeted from Rust!');
    await expect(greeting).toBeDisplayed();
  });
});
