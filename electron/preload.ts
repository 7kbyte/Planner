import { contextBridge, ipcRenderer } from 'electron'

/**
 * 预加载脚本 - 通过 contextBridge 安全地暴露 API 给渲染进程
 *
 * 渲染进程可以通过 window.electronAPI 访问以下方法
 */

// 类型定义（简化版，完整类型见 src/vite-env.d.ts）
export interface ElectronAPI {
  getAppVersion: () => Promise<string>
  getPlatform: () => Promise<{
    platform: string
    arch: string
    version: string
  }>
  platform: NodeJS.Platform
  // 任务 CRUD
  loadTasks: () => Promise<import('../src/types/task').Task[]>
  addTask: (task: import('../src/types/task').Task) => Promise<void>
  updateTask: (task: import('../src/types/task').Task) => Promise<void>
  deleteTask: (id: string) => Promise<void>
  // 重复模板 CRUD
  loadTemplates: () => Promise<import('../src/types/task').RepeatTemplate[]>
  addTemplate: (tmpl: import('../src/types/task').RepeatTemplate) => Promise<import('../src/types/task').Task | null>
  updateTemplate: (tmpl: import('../src/types/task').RepeatTemplate) => Promise<void>
  deleteTemplate: (id: string) => Promise<void>
  // 测试通知
  sendTestNotification: () => Promise<void>
}

const electronAPI: ElectronAPI = {
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  getPlatform: () => ipcRenderer.invoke('get-platform'),
  platform: process.platform,

  // 任务 CRUD
  loadTasks: () => ipcRenderer.invoke('tasks:load'),
  addTask: (task) => ipcRenderer.invoke('tasks:add', task),
  updateTask: (task) => ipcRenderer.invoke('tasks:update', task),
  deleteTask: (id) => ipcRenderer.invoke('tasks:delete', id),

  // 重复模板 CRUD
  loadTemplates: () => ipcRenderer.invoke('templates:load'),
  addTemplate: (tmpl) => ipcRenderer.invoke('templates:add', tmpl),
  updateTemplate: (tmpl) => ipcRenderer.invoke('templates:update', tmpl),
  deleteTemplate: (id) => ipcRenderer.invoke('templates:delete', id),

  // 测试通知
  sendTestNotification: () => ipcRenderer.invoke('trigger-test-notification'),
}

// 通过 contextBridge 暴露到渲染进程
contextBridge.exposeInMainWorld('electronAPI', electronAPI)
