import { type Page, type Browser, chromium, type BrowserContext } from '@playwright/test';
import { spawn, type ChildProcess } from 'child_process';
import { resolve, join, dirname } from 'path';
import { platform } from 'os';
import { fileURLToPath } from 'url';
import { existsSync } from 'fs';

/**
 * Configuration for Tauri app testing
 */
export interface TauriAppConfig {
  /** Path to the Tauri binary. If not provided, will use debug build. */
  binaryPath?: string;
  /** Port for Chrome DevTools Protocol debugging (default: 9222) */
  debugPort?: number;
  /** Time to wait for app to start in milliseconds (default: 5000) */
  startupTimeout?: number;
}

/**
 * Tauri app instance for E2E testing
 */
export class TauriApp {
  private process: ChildProcess | null = null;
  private browser: Browser | null = null;
  private context: BrowserContext | null = null;
  private page: Page | null = null;
  private config: Required<TauriAppConfig>;

  constructor(config: TauriAppConfig = {}) {
    this.config = {
      binaryPath: config.binaryPath || this.getDefaultBinaryPath(),
      debugPort: config.debugPort || 9222,
      startupTimeout: config.startupTimeout || 5000,
    };
  }

  /**
   * Get the default binary path based on the platform
   */
  private getDefaultBinaryPath(): string {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    // __dirname is tests/helpers, so go up twice to get to root
    const rootDir = resolve(__dirname, '../../');
    const targetDir = join(rootDir, 'src-tauri', 'target', 'debug');

    const platformPaths: Record<string, string> = {
      darwin: join(targetDir, 'mighty-jujutsu.app/Contents/MacOS/mighty-jujutsu'),
      linux: join(targetDir, 'mighty-jujutsu'),
      win32: join(targetDir, 'mighty-jujutsu.exe'),
    };

    const binaryPath = platformPaths[platform()];
    if (!binaryPath) {
      throw new Error(`Unsupported platform: ${platform()}`);
    }

    // On macOS, if the app bundle doesn't exist, try the standalone binary
    if (platform() === 'darwin' && !existsSync(binaryPath)) {
      const standaloneBinary = join(targetDir, 'mighty-jujutsu');
      if (existsSync(standaloneBinary)) {
        return standaloneBinary;
      }
    }

    return binaryPath;
  }

  /**
   * Launch the Tauri app with Chrome DevTools Protocol debugging enabled
   */
  async launch(): Promise<Page> {
    console.log(`Launching Tauri app from: ${this.config.binaryPath}`);

    // Environment variables for Tauri app
    const env: Record<string, string | undefined> = {
      ...process.env,
      // Enable remote debugging for CDP connection
      WEBKIT_DISABLE_DMABUF_RENDERER: '1', // macOS compatibility
    };

    // Platform-specific debugging setup
    if (platform() === 'darwin' || platform() === 'linux') {
      // macOS and Linux use WebKit
      env['WEBKIT_INSPECTOR_SERVER'] = `127.0.0.1:${this.config.debugPort}`;
    } else {
      // Windows uses WebView2 (Chromium-based)
      env['WEBVIEW2_ADDITIONAL_BROWSER_ARGUMENTS'] = `--remote-debugging-port=${this.config.debugPort}`;
    }

    // Spawn the Tauri app process
    this.process = spawn(this.config.binaryPath, [], {
      env,
      stdio: 'inherit',
    });

    // Handle process errors
    this.process.on('error', (error) => {
      console.error('Tauri app process error:', error);
      throw error;
    });

    // Wait for the app to start and debugging port to be available
    await this.waitForDebugger();

    // Connect Playwright to the Tauri app via CDP
    try {
      this.browser = await chromium.connectOverCDP(`http://127.0.0.1:${this.config.debugPort}`);
      const contexts = this.browser.contexts();

      if (contexts.length === 0) {
        throw new Error('No browser contexts found');
      }

      this.context = contexts[0];
      const pages = this.context.pages();

      if (pages.length === 0) {
        throw new Error('No pages found in the browser context');
      }

      this.page = pages[0];
      console.log('Successfully connected to Tauri app via CDP');

      return this.page;
    } catch (error) {
      console.error('Failed to connect to Tauri app:', error);
      await this.close();
      throw error;
    }
  }

  /**
   * Wait for the debugging port to become available
   */
  private async waitForDebugger(): Promise<void> {
    const startTime = Date.now();
    const checkInterval = 100;

    while (Date.now() - startTime < this.config.startupTimeout) {
      try {
        const response = await fetch(`http://127.0.0.1:${this.config.debugPort}/json/version`);
        if (response.ok) {
          console.log('Debugger is ready');
          return;
        }
      } catch {
        // Debugger not ready yet, continue waiting
      }

      await new Promise(resolve => setTimeout(resolve, checkInterval));
    }

    throw new Error(
      `Tauri app did not start within ${this.config.startupTimeout}ms. ` +
      'Make sure the app is built and the binary path is correct.'
    );
  }

  /**
   * Get the current page instance
   */
  getPage(): Page {
    if (!this.page) {
      throw new Error('Tauri app is not running. Call launch() first.');
    }
    return this.page;
  }

  /**
   * Close the Tauri app and cleanup resources
   */
  async close(): Promise<void> {
    console.log('Closing Tauri app...');

    // Close browser connection
    if (this.browser) {
      try {
        await this.browser.close();
      } catch (error) {
        console.error('Error closing browser:', error);
      }
      this.browser = null;
    }

    // Kill the Tauri process
    if (this.process) {
      this.process.kill('SIGTERM');

      // Wait a bit for graceful shutdown
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Force kill if still running
      if (!this.process.killed) {
        this.process.kill('SIGKILL');
      }

      this.process = null;
    }

    this.context = null;
    this.page = null;

    console.log('Tauri app closed');
  }
}

/**
 * Helper function to create and launch a Tauri app instance
 */
export async function launchTauriApp(config?: TauriAppConfig): Promise<{ app: TauriApp; page: Page }> {
  const app = new TauriApp(config);
  const page = await app.launch();
  return { app, page };
}
