/**
 * 主进程数据库模块 — 使用 lowdb v5 (JSON file)
 *
 * 单一数据集合：tasks — 一切皆 Task。
 * 重复是属性，排程靠 scheduledDate/scheduledTime。
 *
 * lowdb v5 是 ESM-only，通过动态 import() 加载。
 */
import { app } from 'electron'
import path from 'node:path'
import type { Task } from '../src/types/task'

// ==================== 数据库类型 ====================

interface DBSchema {
  tasks: Task[]
  /** @deprecated 旧字段，启动时自动迁移 */
  templates?: any[]
  /** @deprecated 旧字段，启动时自动迁移 */
  repeatTasks?: any[]
}

// ==================== 内部状态 ====================

let db: Awaited<ReturnType<typeof createLowDB>> | null = null

function data(): DBSchema {
  if (!db?.data) throw new Error('数据库未初始化')
  return db.data
}

async function createLowDB(filePath: string) {
  const { Low } = await import('lowdb')
  const { JSONFile } = await import('lowdb/node')
  const adapter = new JSONFile<DBSchema>(filePath)
  const instance = new Low<DBSchema>(adapter)
  await instance.read()
  instance.data ||= { tasks: [] }
  await instance.write()
  return instance
}

// ==================== 初始化 + 迁移 ====================

export async function initDatabase(): Promise<void> {
  const filePath = path.join(app.getPath('userData'), 'tasks.json')
  console.log('[database] 数据文件:', filePath)
  db = await createLowDB(filePath)

  let migrated = false

  // 迁移 1: 旧 repeatTasks/templates 只保留启用中的，合入 tasks
  const oldRTs = data().repeatTasks ?? data().templates ?? []
  if (oldRTs.length > 0) {
    for (const rt of oldRTs) {
      if (rt.enabled === false) continue
      // 检查是否已有此标题的重复任务
      const exists = data().tasks.some(t => t.repeatEnabled && t.title === rt.title)
      if (!exists) {
        const migratedTask: Task = {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
          title: rt.title,
          description: rt.description,
          priority: rt.priority ?? 'medium',
          tag: rt.tag,
          scheduledDate: undefined,
          scheduledTime: rt.dueTime ?? rt.scheduledTime,
          completed: false,
          createdAt: rt.createdAt ?? new Date().toISOString(),
          inboxOrder: Date.now(),
          reminder: !!rt.reminderTime,
          repeatEnabled: true,
          repeatConfig: {
            weekdays: rt.weekdays ?? [1, 2, 3, 4, 5],
            completedDates: [],
          },
        }
        data().tasks.push(migratedTask)
      }
    }
    delete data().repeatTasks
    delete data().templates
    migrated = true
    console.log('[database] 已迁移旧重复任务 → 统一 Task 模型')
  }

  // 迁移 2: 清理旧字段
  for (const t of data().tasks) {
    if (t.inboxOrder === undefined) t.inboxOrder = Date.now()
    if (t.repeatEnabled === undefined) t.repeatEnabled = false
    // 清理废弃字段
    for (const key of ['templateId', 'repeatTaskId', 'sourceRepeatId', 'lastGeneratedDate', 'dueDate', 'dueTime']) {
      if ((t as any)[key] !== undefined) {
        if (key === 'dueDate' && !t.scheduledDate) t.scheduledDate = (t as any).dueDate
        if (key === 'dueTime' && !t.scheduledTime) t.scheduledTime = (t as any).dueTime
        delete (t as any)[key]
        migrated = true
      }
    }
    // 确保 repeatConfig 有 completedDates
    if (t.repeatConfig && !t.repeatConfig.completedDates) {
      t.repeatConfig.completedDates = []
      migrated = true
    }
    // 迁移 reminderTime → reminder
    if ((t as any).reminderTime !== undefined) {
      t.reminder = !!(t as any).reminderTime
      delete (t as any).reminderTime
      migrated = true
    }
    // 移除旧的 generateTime
    if (t.repeatConfig && (t.repeatConfig as any).generateTime) {
      delete (t.repeatConfig as any).generateTime
      migrated = true
    }
  }

  if (migrated) await db.write()
  console.log('[database] 已加载', data().tasks.length, '条任务')
}

// ==================== CRUD ====================

export async function loadTasks(): Promise<Task[]> {
  if (!db) return []
  await db.read()
  db.data ||= { tasks: [] }
  return data().tasks
}

export async function addTask(task: Task): Promise<void> {
  if (!db) throw new Error('数据库未初始化')
  data().tasks.push(task)
  await db.write()
}

export async function updateTask(task: Task): Promise<void> {
  if (!db) throw new Error('数据库未初始化')
  const idx = data().tasks.findIndex(t => t.id === task.id)
  if (idx !== -1) { data().tasks[idx] = task; await db.write() }
}

export async function deleteTask(id: string): Promise<void> {
  if (!db) throw new Error('数据库未初始化')
  data().tasks = data().tasks.filter(t => t.id !== id)
  await db.write()
}
