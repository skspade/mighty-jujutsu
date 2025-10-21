import os from 'os';
import path from 'path';
import { spawn, spawnSync, type ChildProcess } from 'child_process';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

// Keep track of the tauri-driver process
let tauriDriver: ChildProcess | null = null;
let exit = false;

export const config: WebdriverIO.Config = {
  //
  // ====================
  // Runner Configuration
  // ====================
  //
  runner: 'local',
  host: '127.0.0.1',
  port: 4444,
  path: '/',

  //
  // ==================
  // Specify Test Files
  // ==================
  //
  specs: ['./tests/wdio/**/*.spec.ts'],
  exclude: [],

  //
  // ============
  // Capabilities
  // ============
  //
  maxInstances: 1,
  capabilities: [
    {
      maxInstances: 1,
      browserName: 'wry',
      'tauri:options': {
        application: path.resolve(__dirname, 'src-tauri/target/debug/bundle/macos/mighty-jujutsu.app'),
      },
    } as WebdriverIO.Capabilities,
  ],

  //
  // ===================
  // Test Configurations
  // ===================
  //
  logLevel: 'info',
  bail: 0,
  waitforTimeout: 10000,
  connectionRetryTimeout: 120000,
  connectionRetryCount: 3,
  framework: 'mocha',
  reporters: ['spec'],
  mochaOpts: {
    ui: 'bdd',
    timeout: 60000,
  },

  //
  // =====
  // Hooks
  // =====
  //
  /**
   * Gets executed once before all workers get launched.
   * Ensure the Tauri app is built before running tests.
   */
  onPrepare() {
    console.log('Building Tauri app in debug mode...');
    const result = spawnSync('pnpm', ['tauri', 'build', '--debug'], {
      cwd: __dirname,
      stdio: 'inherit',
      shell: true,
    });

    if (result.error || result.status !== 0) {
      throw new Error('Failed to build Tauri app');
    }
    console.log('Tauri app built successfully');
  },

  /**
   * Gets executed before a worker process is spawned and can be used to initialize specific service
   * for that worker as well as modify runtime environments in an async fashion.
   */
  async onWorkerStart() {
    console.log('Starting tauri-driver...');
    const tauriDriverPath = path.resolve(os.homedir(), '.cargo', 'bin', 'tauri-driver');

    tauriDriver = spawn(tauriDriverPath, [], {
      stdio: [null, process.stdout, process.stderr],
    });

    tauriDriver.on('error', (error) => {
      console.error('tauri-driver error:', error);
      process.exit(1);
    });

    tauriDriver.on('exit', (code) => {
      if (!exit) {
        console.error('tauri-driver exited with code:', code);
        process.exit(1);
      }
    });

    // Give tauri-driver time to start
    await new Promise((resolve) => setTimeout(resolve, 2000));
    console.log('tauri-driver started');
  },

  /**
   * Gets executed after all workers got shut down and the process is about to exit.
   */
  onComplete() {
    closeTauriDriver();
  },
};

function closeTauriDriver() {
  exit = true;
  if (tauriDriver) {
    console.log('Stopping tauri-driver...');
    tauriDriver.kill('SIGTERM');
    tauriDriver = null;
  }
}

// Ensure tauri-driver is closed when the process exits
function onShutdown(fn: () => void) {
  const cleanup = () => {
    try {
      fn();
    } finally {
      process.exit();
    }
  };

  process.on('exit', cleanup);
  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);
  process.on('SIGHUP', cleanup);
  process.on('SIGBREAK', cleanup);
}

onShutdown(() => {
  closeTauriDriver();
});
