import { app, BrowserWindow, shell, ipcMain, Notification, Tray, Menu, nativeImage } from 'electron'
import path from 'node:path'
import fs from 'node:fs'
import type { Task } from '../src/types/task'
import { initDatabase, loadTasks, addTask, updateTask, deleteTask, loadTemplates, addTemplate, updateTemplate, deleteTemplate } from './database'

// 禁用 Windows 7 的 GPU 加速
app.disableHardwareAcceleration()

// 获取 Vite dev server URL（开发模式）
const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']

let mainWindow: BrowserWindow | null = null
let appTray: Tray | null = null
let isQuitting = false

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1100,
    height: 750,
    minWidth: 800,
    minHeight: 550,
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

ipcMain.handle('tasks:load', async () => {
  return loadTasks()
})

ipcMain.handle('tasks:add', async (_event, task) => {
  await addTask(task)
})

ipcMain.handle('tasks:update', async (_event, task) => {
  await updateTask(task)
})

ipcMain.handle('tasks:delete', async (_event, id: string) => {
  await deleteTask(id)
})

// ========== 重复模板 CRUD IPC ==========

ipcMain.handle('templates:load', async () => {
  return loadTemplates()
})

ipcMain.handle('templates:add', async (_event, tmpl) => {
  const now = currentTimeStr()
  const today = todayStr()

  // 检查今天是否在重复日列表中
  const todayWeekday = new Date().getDay()
  const shouldGenerateToday = tmpl.weekdays && tmpl.weekdays.includes(todayWeekday)

  // 如果当前时间已过生成时间且今天是重复日，先标记 lastGeneratedDate 再写入，
  // 避免 checkAndNotify 定时器在 addTemplate 与 updateTemplate 之间
  // 读到未标记的模板而重复生成任务（竞态条件修复）
  if (tmpl.generateTime <= now && tmpl.enabled && shouldGenerateToday) {
    tmpl.lastGeneratedDate = today
  }
  await addTemplate(tmpl)

  if (tmpl.generateTime <= now && tmpl.enabled && shouldGenerateToday) {
    const newTask: Task = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      title: tmpl.title,
      description: tmpl.description,
      priority: tmpl.priority,
      dueTime: tmpl.dueTime,
      tag: tmpl.tag,
      reminderTime: tmpl.reminderTime,
      completed: false,
      createdAt: new Date().toISOString(),
      templateId: tmpl.id,
    }
    await addTask(newTask)
    console.log(`[template] 新建模板已立即生成任务: "${tmpl.title}"`)
    return newTask // 返回生成的任务给渲染进程
  }
  return null
})

ipcMain.handle('templates:update', async (_event, tmpl) => {
  await updateTemplate(tmpl)
})

ipcMain.handle('templates:delete', async (_event, id: string) => {
  await deleteTemplate(id)
})

// ========== 通知系统 ==========

const NOTIFICATION_INTERVAL = 5 * 60 * 1000 // 5 分钟
let notificationTimer: ReturnType<typeof setInterval> | null = null

/** 获取当前日期的 ISO 字符串 */
function todayStr(): string {
  return new Date().toISOString().slice(0, 10)
}

/** 获取当前时间 HH:mm */
function currentTimeStr(): string {
  const now = new Date()
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
}

/** 发送一条桌面通知 */
function sendNotification(title: string, body: string): void {
  if (!Notification.isSupported()) {
    console.log('[notification] 当前平台不支持 Notification')
    return
  }

  const notification = new Notification({ title, body, silent: false })

  // 点击通知 → 聚焦应用窗口
  notification.on('click', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore()
      mainWindow.show()
      mainWindow.focus()
    }
  })

  notification.show()
}

/** 检查并发送到期的任务提醒 + 生成重复任务模板 */
async function checkAndNotify(): Promise<void> {
  try {
    const tasks = await loadTasks()
    const templates = await loadTemplates()
    const today = todayStr()
    const now = currentTimeStr()

    console.log(`[notification] 开始检查 (${now}) — ${tasks.length} 个任务, ${templates.length} 个模板`)

    // ===== 1. 检查重复模板，生成今日任务实例 =====
    let generatedCount = 0
    for (const tmpl of templates) {
      if (!tmpl.enabled) continue
      if (tmpl.lastGeneratedDate === today) continue // 今天已生成
      if (tmpl.generateTime > now) continue          // 还没到生成时间
      if (!tmpl.weekdays || !tmpl.weekdays.includes(new Date().getDay())) continue // 今天不在重复日

      // 防御性检查：是否已存在该模板今天生成的任务
      // （防止与 templates:add handler 竞态导致重复生成）
      const alreadyGenerated = tasks.some((t) => t.templateId === tmpl.id)
      if (alreadyGenerated) {
        // 同步 lastGeneratedDate，避免后续轮次再次检查
        tmpl.lastGeneratedDate = today
        await updateTemplate(tmpl)
        console.log(`[template] 跳过重复生成: "${tmpl.title}" (任务已存在)`)
        continue
      }

      // 创建任务实例
      const newTask: Task = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        title: tmpl.title,
        description: tmpl.description,
        priority: tmpl.priority,
        dueTime: tmpl.dueTime,
        tag: tmpl.tag,
        reminderTime: tmpl.reminderTime,
        completed: false,
        createdAt: new Date().toISOString(),
        templateId: tmpl.id,
      }
      await addTask(newTask)

      // 标记模板今天已生成
      tmpl.lastGeneratedDate = today
      await updateTemplate(tmpl)

      generatedCount++
      console.log(`[template] 已生成任务: "${tmpl.title}" (${tmpl.generateTime})${newTask.reminderTime ? ' ⏰提醒' + newTask.reminderTime : ''}`)
    }

    // 重新加载任务，以便 Section 2 能看到 Section 1 刚生成的任务
    let notifyTasks = tasks
    if (generatedCount > 0) {
      notifyTasks = await loadTasks()
      console.log(`[notification] 重新加载任务（新增 ${generatedCount} 个模板生成）`)
    }

    // ===== 2. 检查任务提醒通知 =====
    const candidates = notifyTasks.filter((t) => !t.completed && !!t.reminderTime)
    console.log(`[notification] 提醒候选: ${candidates.length} 个 (有reminderTime且未完成)`)

    for (const task of candidates) {
      if (task.reminderTime! > now) {
        console.log(`[notification] 跳过 "${task.title}" — 提醒时间 ${task.reminderTime} > 当前 ${now}`)
        continue
      }
      if (task.lastNotifiedDate === today) {
        console.log(`[notification] 跳过 "${task.title}" — 今日已提醒`)
        continue
      }

      // 发送通知
      sendNotification('⏰ 任务提醒', task.title)

      // 标记已提醒
      task.lastNotifiedDate = today
      await updateTask(task)

      console.log(`[notification] ✅ 已提醒: "${task.title}" (${task.reminderTime})`)
    }
  } catch (err) {
    console.error('[notification] 检查失败:', err)
  }
}

/** 启动通知定时器 */
function startNotificationChecker(): void {
  // 启动后立即检查一次
  checkAndNotify()
  // 之后每 5 分钟检查
  notificationTimer = setInterval(checkAndNotify, NOTIFICATION_INTERVAL)
  console.log('[notification] 定时器已启动（间隔', NOTIFICATION_INTERVAL / 60000, '分钟）')
}

/** 停止通知定时器 */
function stopNotificationChecker(): void {
  if (notificationTimer) {
    clearInterval(notificationTimer)
    notificationTimer = null
  }
}

// 测试通知 IPC
ipcMain.handle('trigger-test-notification', () => {
  sendNotification('🧪 测试通知', '如果你看到这条消息，说明桌面通知功能正常工作！')
  console.log('[notification] 已发送测试通知')
})
