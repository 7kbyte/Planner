import { app, BrowserWindow, shell, ipcMain, Notification, Tray, Menu, nativeImage } from 'electron'
import path from 'node:path'
import fs from 'node:fs'
import type { Task } from '../src/types/task'
import { initDatabase, loadTasks, addTask, updateTask, deleteTask } from './database'

// 禁用 Windows 7 的 GPU 加速
app.disableHardwareAcceleration()

// 获取 Vite dev server URL（开发模式）
const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']

let mainWindow: BrowserWindow | null = null
let appTray: Tray | null = null
let isQuitting = false

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1000,
    minHeight: 700,
    center: true,
    show: false, // 等 ready-to-show 再显示，避免白屏
    title: 'Daily Planner - 日常计划管理',
    autoHideMenuBar: true,
    backgroundColor: '#f9fafb',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  })

  // 窗口准备好后再显示
  mainWindow.on('ready-to-show', () => {
    mainWindow?.show()

    // 开发模式下自动打开 DevTools
    if (VITE_DEV_SERVER_URL) {
      mainWindow?.webContents.openDevTools({ mode: 'detach' })
    }
  })

  // 在外部浏览器中打开链接
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https:') || url.startsWith('http:')) {
      shell.openExternal(url)
    }
    return { action: 'deny' }
  })

  // 加载页面
  if (VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(VITE_DEV_SERVER_URL)
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
  }

  // 关闭窗口时最小化到托盘（而非退出）
  mainWindow.on('close', (event) => {
    if (!isQuitting) {
      event.preventDefault()
      mainWindow?.hide()
    }
  })
}

// ========== 系统托盘 ==========

/** 查找图标文件：优先 dist/（生产），其次 public/（开发） */
function getIconPath(filename: string): string {
  const distPath = path.join(__dirname, '../dist', filename)
  if (fs.existsSync(distPath)) return distPath
  return path.join(__dirname, '../public', filename)
}

function createTray(): void {
  let trayIcon: Electron.NativeImage

  const pngPath = getIconPath('icon.png')
  if (fs.existsSync(pngPath)) {
    trayIcon = nativeImage.createFromPath(pngPath).resize({ width: 32, height: 32 })
  } else {
    // 降级：纯色图标
    trayIcon = nativeImage.createEmpty()
  }

  appTray = new Tray(trayIcon)
  appTray.setToolTip('Daily Planner')

  const contextMenu = Menu.buildFromTemplate([
    {
      label: '显示窗口',
      click: () => {
        if (mainWindow) {
          mainWindow.show()
          mainWindow.focus()
        }
      },
    },
    { type: 'separator' },
    {
      label: '退出',
      click: () => {
        isQuitting = true
        app.quit()
      },
    },
  ])

  appTray.setContextMenu(contextMenu)

  appTray.on('double-click', () => {
    if (mainWindow) {
      mainWindow.show()
      mainWindow.focus()
    }
  })
}

// ========== 应用生命周期 ==========

app.whenReady().then(async () => {
  await initDatabase()

  createWindow()
  createTray()

  startNotificationChecker()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    } else {
      mainWindow?.show()
    }
  })
})

// 所有窗口关闭时不退出（托盘运行）
app.on('window-all-closed', () => {
  // 不退出，保持在托盘运行
})

// 退出前清理
app.on('before-quit', () => {
  isQuitting = true
  stopNotificationChecker()
  if (appTray) {
    appTray.destroy()
    appTray = null
  }
})

// ========== IPC 通信 ==========

// 示例：从渲染进程获取应用版本
ipcMain.handle('get-app-version', () => {
  return app.getVersion()
})

// 示例：获取平台信息
ipcMain.handle('get-platform', () => {
  return {
    platform: process.platform,
    arch: process.arch,
    version: process.getSystemVersion(),
  }
})

// ========== 任务 CRUD IPC ==========

ipcMain.handle('tasks:load', async () => loadTasks())

ipcMain.handle('tasks:add', async (_event, task: Task) => {
  await addTask(task)
})

ipcMain.handle('tasks:update', async (_event, task: Task) => {
  await updateTask(task)
})

ipcMain.handle('tasks:delete', async (_event, id: string) => {
  await deleteTask(id)
})

// ========== 通知系统 ==========

const NOTIFICATION_INTERVAL = 5 * 60 * 1000
let notificationTimer: ReturnType<typeof setInterval> | null = null

function todayStr(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function currentTimeStr(): string {
  const now = new Date()
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
}

function sendNotification(title: string, body: string): void {
  if (!Notification.isSupported()) return
  const notification = new Notification({ title, body, silent: false })
  notification.on('click', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore()
      mainWindow.show()
      mainWindow.focus()
    }
  })
  notification.show()
}

/** 检查到期提醒（重复任务按 weekday 匹配当天） */
async function checkAndNotify(): Promise<void> {
  try {
    const tasks = await loadTasks()
    const today = todayStr()
    const now = currentTimeStr()
    const todayWeekday = new Date().getDay()

    console.log(`[check] ${now} — ${tasks.length} 个任务`)

    // 筛选需要检查提醒的任务
    const candidates = tasks.filter(t => {
      if (t.completed) return false
      if (!t.reminder || !t.scheduledTime) return false
      if (t.scheduledTime > now) return false
      if (t.lastNotifiedDate === today) return false
      // 重复任务：仅当天匹配 weekday 才提醒
      if (t.repeatEnabled && t.repeatConfig) {
        if (!t.repeatConfig.weekdays.includes(todayWeekday)) return false
      }
      return true
    })

    for (const task of candidates) {
      const prefix = task.repeatEnabled ? '🔄 ' : ''
      sendNotification('⏰ 任务提醒', prefix + task.title)
      task.lastNotifiedDate = today
      await updateTask(task)
      console.log(`[notify] 已提醒: "${task.title}"`)
    }
  } catch (err) {
    console.error('[check] 失败:', err)
  }
}

function startNotificationChecker(): void {
  checkAndNotify()
  notificationTimer = setInterval(checkAndNotify, NOTIFICATION_INTERVAL)
}

function stopNotificationChecker(): void {
  if (notificationTimer) { clearInterval(notificationTimer); notificationTimer = null }
}

// 测试通知
ipcMain.handle('trigger-test-notification', () => {
  sendNotification('🧪 测试通知', '桌面通知功能正常工作！')
})
