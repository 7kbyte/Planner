import { contextBridge, ipcRenderer } from 'electron'

export interface ElectronAPI {
  getAppVersion: () => Promise<string>
  getPlatform: () => Promise<{ platform: string; arch: string; version: string }>
  platform: NodeJS.Platform
  // 任务 CRUD
  loadTasks: () => Promise<import('../src/types/task').Task[]>
  addTask: (task: import('../src/types/task').Task) => Promise<void>
  updateTask: (task: import('../src/types/task').Task) => Promise<void>
  deleteTask: (id: string) => Promise<void>
  // 测试通知
  sendTestNotification: () => Promise<void>
}

const electronAPI: ElectronAPI = {
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  getPlatform: () => ipcRenderer.invoke('get-platform'),
  platform: process.platform,
  loadTasks: () => ipcRenderer.invoke('tasks:load'),
  addTask: (task) => ipcRenderer.invoke('tasks:add', task),
  updateTask: (task) => ipcRenderer.invoke('tasks:update', task),
  deleteTask: (id) => ipcRenderer.invoke('tasks:delete', id),
  sendTestNotification: () => ipcRenderer.invoke('trigger-test-notification'),
}

contextBridge.exposeInMainWorld('electronAPI', electronAPI)
