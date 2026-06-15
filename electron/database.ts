/**
 * 主进程数据库模块 — 使用 lowdb v5 (JSON file) 持久化任务数据
 *
 * lowdb v5 是 ESM-only，在 CJS 主进程中通过动态 import() 加载。
 */
import { app } from 'electron'
import path from 'node:path'
import type { Task, RepeatTemplate } from '../src/types/task'

// ==================== 数据库类型 ====================

interface DBSchema {
  tasks: Task[]
  templates: RepeatTemplate[]
}

// ==================== 内部状态 ====================

let db: Awaited<ReturnType<typeof createLowDB>> | null = null

/** 获取数据库数据（保证非空） */
function data(): DBSchema {
  if (!db?.data) throw new Error('数据库未初始化')
  return db.data
}

// 动态导入 lowdb (ESM-only)
async function createLowDB(filePath: string) {
  const { Low } = await import('lowdb')
  const { JSONFile } = await import('lowdb/node')
  const adapter = new JSONFile<DBSchema>(filePath)
  const instance = new Low<DBSchema>(adapter)
  await instance.read()
  // 文件不存在时，初始化默认数据
  instance.data ||= { tasks: [], templates: [] }
  await instance.write()
  return instance
}

// ==================== 公共 API ====================

/** 初始化数据库（应用启动时调用一次） */
export async function initDatabase(): Promise<void> {
  const filePath = path.join(app.getPath('userData'), 'tasks.json')
  console.log('[database]', '数据文件路径:', filePath)
  db = await createLowDB(filePath)

  // ===== 数据迁移：旧 repeat 字段 → 新 weekdays 数组 =====
  let migrated = 0
  for (const tmpl of data().templates) {
    if ((tmpl as any).repeat && !tmpl.weekdays) {
      const oldRepeat: string = (tmpl as any).repeat
      if (oldRepeat === 'daily') {
        tmpl.weekdays = [0, 1, 2, 3, 4, 5, 6]
      } else if (oldRepeat === 'weekly') {
        tmpl.weekdays = [1, 2, 3, 4, 5]
      } else {
        tmpl.weekdays = [1] // monthly → 默认周一
      }
      delete (tmpl as any).repeat
      migrated++
    }
  }
  if (migrated > 0) {
    await db.write()
    console.log('[database]', `已迁移 ${migrated} 个旧模板的 repeat → weekdays`)
  }

  console.log('[database]', `已加载 ${data().tasks.length} 条任务, ${data().templates.length} 个模板`)
}

/** 获取所有任务（先重新读取文件以获取最新数据） */
export async function loadTasks(): Promise<Task[]> {
  if (!db) return []
  await db.read()
  db.data ||= { tasks: [], templates: [] }
  return data().tasks
}

/** 添加一条任务 */
export async function addTask(task: Task): Promise<void> {
  if (!db) throw new Error('数据库未初始化')
  data().tasks.push(task)
  await db.write()
}

/** 更新一条任务（按 id 匹配） */
export async function updateTask(task: Task): Promise<void> {
  if (!db) throw new Error('数据库未初始化')
  const idx = data().tasks.findIndex((t) => t.id === task.id)
  if (idx !== -1) {
    data().tasks[idx] = task
    await db.write()
  }
}

/** 删除一条任务 */
export async function deleteTask(id: string): Promise<void> {
  if (!db) throw new Error('数据库未初始化')
  const d = data()
  d.tasks = d.tasks.filter((t) => t.id !== id)
  await db.write()
}

// ==================== 重复模板 CRUD ====================

export async function loadTemplates(): Promise<RepeatTemplate[]> {
  if (!db) return []
  await db.read()
  db.data ||= { tasks: [], templates: [] }
  return data().templates
}

export async function addTemplate(tmpl: RepeatTemplate): Promise<void> {
  if (!db) throw new Error('数据库未初始化')
  data().templates.push(tmpl)
  await db.write()
}

export async function updateTemplate(tmpl: RepeatTemplate): Promise<void> {
  if (!db) throw new Error('数据库未初始化')
  const idx = data().templates.findIndex((t) => t.id === tmpl.id)
  if (idx !== -1) {
    data().templates[idx] = tmpl
    await db.write()
  }
}

export async function deleteTemplate(id: string): Promise<void> {
  if (!db) throw new Error('数据库未初始化')
  const d = data()
  // 删除模板
  d.templates = d.templates.filter((t) => t.id !== id)
  // 同步删除该模板生成的所有任务
  d.tasks = d.tasks.filter((t) => t.templateId !== id)
  await db.write()
}
