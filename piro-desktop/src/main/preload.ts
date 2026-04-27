/**
 * Preload script - Exposes APIs to renderer
 * Runs in sandboxed context
 */

import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';

// Expose protected APIs to renderer
contextBridge.exposeInMainWorld('piroAPI', {
  // Config
  getConfig: () => ipcRenderer.invoke('get-config'),
  updateConfig: (config: Record<string, unknown>) => ipcRenderer.invoke('update-config', config),
  getServerUrl: () => ipcRenderer.invoke('get-server-url'),
  
  // File operations
  openProjectDialog: () => ipcRenderer.invoke('open-project-dialog'),
  saveFileDialog: (defaultPath: string) => ipcRenderer.invoke('save-file-dialog', defaultPath),
  readFile: (path: string) => ipcRenderer.invoke('read-file', path),
  writeFile: (path: string, content: string) => ipcRenderer.invoke('write-file', path, content),
  getWorkspaceFiles: (path: string) => ipcRenderer.invoke('get-workspace-files', path),
  
  // External
  openExternal: (url: string) => ipcRenderer.invoke('open-external', url),
  showNotification: (title: string, body: string) => ipcRenderer.invoke('show-notification', title, body),
  
  // Window controls
  minimizeWindow: () => ipcRenderer.invoke('minimize-window'),
  maximizeWindow: () => ipcRenderer.invoke('maximize-window'),
  closeWindow: () => ipcRenderer.invoke('close-window'),
  isMaximized: () => ipcRenderer.invoke('is-maximized'),
  
  // IPC event listeners
  on: (channel: string, callback: (...args: unknown[]) => void) => {
    const validChannels = [
      'new-chat',
      'new-spec',
      'save',
      'save-all',
      'toggle-sidebar',
      'toggle-terminal',
      'generate-spec',
      'run-agent',
      'manage-hooks',
      'manage-powers',
      'deploy',
      'open-project',
      'config-changed',
    ];
    
    if (validChannels.includes(channel)) {
      ipcRenderer.on(channel, (_event: IpcRendererEvent, ...args: unknown[]) => callback(...args));
    }
  },
  
  removeListener: (channel: string, callback: (...args: unknown[]) => void) => {
    ipcRenderer.removeListener(channel, callback as (...args: unknown[]) => void);
  },
});