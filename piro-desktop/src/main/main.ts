/**
 * Piro Desktop - Electron Main Process
 * Kiro-compatible AI coding IDE with Pi backend
 */

import { app, BrowserWindow, ipcMain, Menu, Tray, dialog, shell, nativeTheme } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import log from 'electron-log';
import { spawn, ChildProcess } from 'child_process';

// Configure logging
log.transports.file.level = 'info';
log.transports.console.level = 'debug';
log.info('Piro Desktop starting...');

// Global references
let mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null;
let piroCoreProcess: ChildProcess | null = null;

// Configuration
const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;
const piroCorePath = isDev 
  ? path.join(__dirname, '../../piro-core/src/index.ts')
  : path.join(process.resourcesPath, 'piro-core');

interface PiroConfig {
  port: number;
  host: string;
  model: {
    provider: string;
    model: string;
    apiKey?: string;
  };
  theme: 'dark' | 'light' | 'system';
  editor: {
    fontSize: number;
    fontFamily: string;
    tabSize: number;
    wordWrap: boolean;
  };
}

const defaultConfig: PiroConfig = {
  port: 3847,
  host: 'localhost',
  model: {
    provider: 'minimax',
    model: 'MiniMax-M2.7',
  },
  theme: 'dark',
  editor: {
    fontSize: 14,
    fontFamily: 'JetBrains Mono, Consolas, monospace',
    tabSize: 2,
    wordWrap: true,
  },
};

let config: PiroConfig = { ...defaultConfig };

// Get config path
function getConfigPath(): string {
  return path.join(app.getPath('userData'), 'config.json');
}

// Load configuration
function loadConfig(): void {
  const configPath = getConfigPath();
  try {
    if (fs.existsSync(configPath)) {
      const data = fs.readFileSync(configPath, 'utf-8');
      config = { ...defaultConfig, ...JSON.parse(data) };
      log.info('Configuration loaded');
    }
  } catch (error) {
    log.error('Failed to load config:', error);
  }
}

// Save configuration
function saveConfig(): void {
  const configPath = getConfigPath();
  try {
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    log.info('Configuration saved');
  } catch (error) {
    log.error('Failed to save config:', error);
  }
}

// Start Piro Core server
async function startPiroCore(): Promise<void> {
  log.info('Starting Piro Core...');
  
  const corePath = isDev 
    ? path.join(__dirname, '../../piro-core')
    : path.join(process.resourcesPath, 'piro-core');
  
  // Check if core exists
  const coreExists = fs.existsSync(corePath) || fs.existsSync(path.join(corePath, 'package.json'));
  
  if (!coreExists && !isDev) {
    log.warn('Piro Core not found in resources, running in standalone mode');
    return;
  }
  
  // Try to start with ts-node, fallback to node
  try {
    piroCoreProcess = spawn('npx', ['ts-node', 'src/index.ts'], {
      cwd: corePath,
      stdio: 'pipe',
      shell: true,
      env: { ...process.env, FORCE_COLOR: '0' },
    });
  } catch (e) {
    log.info('npx not available, trying direct node...');
    // Fallback - try running compiled version if it exists
    const distPath = path.join(corePath, 'dist', 'index.js');
    if (fs.existsSync(distPath)) {
      piroCoreProcess = spawn('node', [distPath], {
        cwd: corePath,
        stdio: 'pipe',
      });
    }
  }

  if (piroCoreProcess) {
    piroCoreProcess.stdout?.on('data', (data) => {
      log.info(`Piro Core: ${data}`);
    });

    piroCoreProcess.stderr?.on('data', (data) => {
      log.error(`Piro Core Error: ${data}`);
    });

    piroCoreProcess.on('error', (error) => {
      log.error('Failed to start Piro Core:', error);
    });

    // Wait for server to start (check health endpoint)
    const maxAttempts = 10;
    for (let i = 0; i < maxAttempts; i++) {
      try {
        await fetch(`http://localhost:${config.port}/health`);
        log.info('Piro Core is ready!');
        break;
      } catch {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  }
}

// Create main window
function createWindow(): void {
  log.info('Creating main window...');

  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 800,
    minHeight: 600,
    title: 'Piro',
    backgroundColor: '#1a1a2e',
    show: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
      webSecurity: true,
    },
  });

  // Load the app
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  }

  // Show when ready
  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
    log.info('Main window ready');
  });

  // Handle close
  mainWindow.on('close', (event) => {
    if (tray) {
      event.preventDefault();
      mainWindow?.hide();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Create system tray
function createTray(): void {
  // Create a simple 16x16 icon programmatically
  const iconSize = 16;
  const iconPath = path.join(__dirname, '../assets/tray-icon.png');
  
  // For now, skip tray icon in dev if it doesn't exist
  if (!fs.existsSync(iconPath)) {
    log.warn('Tray icon not found, skipping tray creation');
    return;
  }

  tray = new Tray(iconPath);
  tray.setToolTip('Piro');

  const contextMenu = Menu.buildFromTemplate([
    { label: 'Show Piro', click: () => mainWindow?.show() },
    { type: 'separator' },
    { label: 'New Chat', click: () => mainWindow?.webContents.send('new-chat') },
    { label: 'New Spec', click: () => mainWindow?.webContents.send('new-spec') },
    { type: 'separator' },
    { label: 'Quit', click: () => {
      tray?.destroy();
      tray = null;
      app.quit();
    }},
  ]);

  tray.setContextMenu(contextMenu);
  tray.on('click', () => mainWindow?.show());
}

// Create application menu
function createMenu(): void {
  const template: Electron.MenuItemConstructorOptions[] = [
    {
      label: 'File',
      submenu: [
        { label: 'New Chat', accelerator: 'CmdOrCtrl+N', click: () => mainWindow?.webContents.send('new-chat') },
        { label: 'New Spec', accelerator: 'CmdOrCtrl+Shift+N', click: () => mainWindow?.webContents.send('new-spec') },
        { label: 'Open Project...', accelerator: 'CmdOrCtrl+O', click: () => openProject() },
        { type: 'separator' },
        { label: 'Save', accelerator: 'CmdOrCtrl+S', click: () => mainWindow?.webContents.send('save') },
        { label: 'Save All', accelerator: 'CmdOrCtrl+Shift+S', click: () => mainWindow?.webContents.send('save-all') },
        { type: 'separator' },
        { role: 'quit' },
      ],
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'selectAll' },
      ],
    },
    {
      label: 'View',
      submenu: [
        { label: 'Toggle Sidebar', accelerator: 'CmdOrCtrl+B', click: () => mainWindow?.webContents.send('toggle-sidebar') },
        { label: 'Toggle Terminal', accelerator: 'CmdOrCtrl+`', click: () => mainWindow?.webContents.send('toggle-terminal') },
        { type: 'separator' },
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' },
      ],
    },
    {
      label: 'Piro',
      submenu: [
        { label: 'Generate Spec', accelerator: 'CmdOrCtrl+G', click: () => mainWindow?.webContents.send('generate-spec') },
        { label: 'Run Agent', submenu: [
          { label: 'Architect', click: () => mainWindow?.webContents.send('run-agent', 'architect') },
          { label: 'Implementer', click: () => mainWindow?.webContents.send('run-agent', 'implementer') },
          { label: 'Tester', click: () => mainWindow?.webContents.send('run-agent', 'tester') },
          { label: 'Docs Writer', click: () => mainWindow?.webContents.send('run-agent', 'docs-writer') },
          { label: 'Deployer', click: () => mainWindow?.webContents.send('run-agent', 'deployer') },
        ]},
        { type: 'separator' },
        { label: 'Manage Hooks', click: () => mainWindow?.webContents.send('manage-hooks') },
        { label: 'Powers', click: () => mainWindow?.webContents.send('manage-powers') },
        { type: 'separator' },
        { label: 'Deploy to Cloud', submenu: [
          { label: 'AWS', click: () => mainWindow?.webContents.send('deploy', 'aws') },
          { label: 'GCP', click: () => mainWindow?.webContents.send('deploy', 'gcp') },
          { label: 'Azure', click: () => mainWindow?.webContents.send('deploy', 'azure') },
        ]},
      ],
    },
    {
      label: 'Window',
      submenu: [
        { role: 'minimize' },
        { role: 'zoom' },
        { role: 'close' },
      ],
    },
    {
      label: 'Help',
      submenu: [
        { label: 'Documentation', click: () => shell.openExternal('https://kiro.dev/docs') },
        { label: 'Report Issue', click: () => shell.openExternal('https://github.com/kirodotdev/Kiro/issues') },
        { type: 'separator' },
        { label: 'About Piro', click: () => showAbout() },
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// Open project dialog
async function openProject(): Promise<void> {
  const result = await dialog.showOpenDialog(mainWindow!, {
    properties: ['openDirectory'],
    title: 'Open Project',
  });

  if (!result.canceled && result.filePaths.length > 0) {
    mainWindow?.webContents.send('open-project', result.filePaths[0]);
  }
}

// Show about dialog
function showAbout(): void {
  dialog.showMessageBox(mainWindow!, {
    type: 'info',
    title: 'About Piro',
    message: 'Piro',
    detail: 'Version 1.0.0\n\nKiro-compatible AI coding IDE with Pi backend\n\nBuilt with Electron + React',
  });
}

// IPC Handlers
function setupIPC(): void {
  // Get config
  ipcMain.handle('get-config', () => config);

  // Update config
  ipcMain.handle('update-config', (_, newConfig: Partial<PiroConfig>) => {
    config = { ...config, ...newConfig };
    saveConfig();
    mainWindow?.webContents.send('config-changed', config);
    return config;
  });

  // Get server URL
  ipcMain.handle('get-server-url', () => `http://${config.host}:${config.port}`);

  // Open project dialog
  ipcMain.handle('open-project-dialog', async () => {
    const result = await dialog.showOpenDialog(mainWindow!, {
      properties: ['openDirectory'],
      title: 'Open Project',
    });
    return result.canceled ? null : result.filePaths[0];
  });

  // Save file dialog
  ipcMain.handle('save-file-dialog', async (_, defaultPath: string) => {
    const result = await dialog.showSaveDialog(mainWindow!, {
      defaultPath,
      title: 'Save File',
    });
    return result.canceled ? null : result.filePath;
  });

  // Read file
  ipcMain.handle('read-file', async (_, filePath: string) => {
    try {
      return fs.readFileSync(filePath, 'utf-8');
    } catch (error) {
      log.error('Failed to read file:', error);
      return null;
    }
  });

  // Write file
  ipcMain.handle('write-file', async (_, filePath: string, content: string) => {
    try {
      fs.writeFileSync(filePath, content, 'utf-8');
      return true;
    } catch (error) {
      log.error('Failed to write file:', error);
      return false;
    }
  });

  // Get workspace files
  ipcMain.handle('get-workspace-files', async (_, workspacePath: string) => {
    try {
      const files: string[] = [];
      const walk = (dir: string) => {
        const items = fs.readdirSync(dir);
        for (const item of items) {
          if (item.startsWith('.') || item === 'node_modules') continue;
          const fullPath = path.join(dir, item);
          const stat = fs.statSync(fullPath);
          if (stat.isDirectory()) {
            walk(fullPath);
          } else {
            files.push(fullPath);
          }
        }
      };
      walk(workspacePath);
      return files;
    } catch (error) {
      log.error('Failed to get workspace files:', error);
      return [];
    }
  });

  // Open external URL
  ipcMain.handle('open-external', async (_, url: string) => {
    await shell.openExternal(url);
  });

  // Show notification
  ipcMain.handle('show-notification', (_, title: string, body: string) => {
    const { Notification } = require('electron');
    new Notification({ title, body }).show();
  });

  // Window controls
  ipcMain.handle('minimize-window', () => mainWindow?.minimize());
  ipcMain.handle('maximize-window', () => {
    if (mainWindow?.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow?.maximize();
    }
  });
  ipcMain.handle('close-window', () => mainWindow?.close());
  ipcMain.handle('is-maximized', () => mainWindow?.isMaximized());
}

// App ready
app.whenReady().then(async () => {
  log.info('App ready');
  
  loadConfig();
  await startPiroCore();
  createWindow();
  createMenu();
  createTray();
  setupIPC();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Handle all windows closed
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Handle quit
app.on('before-quit', () => {
  log.info('App quitting...');
  if (piroCoreProcess) {
    piroCoreProcess.kill();
  }
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  log.error('Uncaught exception:', error);
  dialog.showErrorBox('Error', `An unexpected error occurred: ${error.message}`);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  log.error('Unhandled rejection:', reason);
});