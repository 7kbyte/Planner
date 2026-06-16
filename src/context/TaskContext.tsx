import { createContext, useContext, useState, useEffect, useCallback, useMemo, type ReactNode } from 'react'
import type { Task, TaskFormData } from '../types/task'
import { localDateStr } from '../types/task'

// ==================== 类型 ====================

interface TaskContextValue {
  tasks: Task[]
  loading: boolean
  addTask: (data: TaskFormData) => Promise<Task>
  updateTask: (task: Task) => Promise<void>
  /** 切换完成状态（自动识别普通任务/重复任务） */
  toggleTask: (id: string) => Promise<void>
  /** 删除任务 */
  deleteTask: (id: string) => Promise<void>
  /** 安排任务到指定日期/时间 */
  scheduleTask: (id: string, date: string, time?: string) => Promise<void>
  /** 取消安排（移回收件箱） */
  unscheduleTask: (id: string) => Promise<void>
  /** 刷新 */
  refreshTasks: () => Promise<void>
  /** 今日时间线任务（含重复任务展开） */
  todayScheduled: Task[]
  /** 对指定日期展开重复任务 */
  expandForDate: (date: string) => Task[]
}

// ==================== 工具 ====================

const generateId = (): string => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

const SEP = '--rt--'

/** 从虚拟 ID 中提取原始 repeat task ID */
function parseRepeatVirtualId(id: string): { originalId: string; date: string } | null {
  const idx = id.indexOf(SEP)
  if (idx === -1) return null
  return { originalId: id.slice(0, idx), date: id.slice(idx + SEP.length) }
}

// ==================== Context ====================

const TaskContext = createContext<TaskContextValue | null>(null)

export function TaskProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

  const loadFromDB = useCallback(async () => {
    try {
      if (window.electronAPI) setTasks(await window.electronAPI.loadTasks())
    } catch (err) {
      console.error('[TaskContext] 加载失败:', err)
    }
  }, [])

  useEffect(() => { loadFromDB().finally(() => setLoading(false)) }, [loadFromDB])
  useEffect(() => {
    const onFocus = () => loadFromDB()
    window.addEventListener('focus', onFocus)
    return () => window.removeEventListener('focus', onFocus)
  }, [loadFromDB])

  const refreshTasks = useCallback(async () => { await loadFromDB() }, [loadFromDB])

  // ===== CRUD =====

  const addTask = useCallback(async (data: TaskFormData): Promise<Task> => {
    const isRepeat = data.repeatEnabled ?? false
    const newTask: Task = {
      ...data,
      id: generateId(),
      completed: false,
      createdAt: new Date().toISOString(),
      inboxOrder: Date.now(),
      repeatEnabled: isRepeat,
      // 一次性任务默认设为今天
      scheduledDate: isRepeat ? undefined : (data.scheduledDate ?? localDateStr()),
    }
    if (newTask.repeatEnabled && !newTask.repeatConfig) {
      newTask.repeatConfig = { weekdays: [1, 2, 3, 4, 5], completedDates: [] }
    }
    setTasks(prev => [newTask, ...prev])
    try { if (window.electronAPI) await window.electronAPI.addTask(newTask) }
    catch (err) { console.error('[TaskContext] 添加失败:', err); setTasks(prev => prev.filter(t => t.id !== newTask.id)) }
    return newTask
  }, [])

  const updateTask = useCallback(async (task: Task) => {
    setTasks(prev => prev.map(t => t.id === task.id ? task : t))
    if (window.electronAPI) {
      window.electronAPI.updateTask(task).catch(e => console.error('[TaskContext] 更新失败:', e))
    }
  }, [])

  const toggleTask = useCallback(async (id: string) => {
    // 检查是否为重复任务的虚拟实例
    const parsed = parseRepeatVirtualId(id)
    if (parsed) {
      // 重复任务：切换 completedDates
      setTasks(prev => prev.map(t => {
        if (t.id !== parsed.originalId) return t
        const cfg = t.repeatConfig ?? { weekdays: [], completedDates: [] }
        const dates = cfg.completedDates.includes(parsed.date)
          ? cfg.completedDates.filter(d => d !== parsed.date)
          : [...cfg.completedDates, parsed.date]
        const updated = { ...t, repeatConfig: { ...cfg, completedDates: dates } }
        if (window.electronAPI) window.electronAPI.updateTask(updated).catch(e => console.error(e))
        return updated
      }))
      return
    }

    // 普通任务
    setTasks(prev => {
      const target = prev.find(t => t.id === id)
      if (!target) return prev
      const isCompleting = !target.completed
      const updated = prev.map(t =>
        t.id === id ? { ...t, completed: isCompleting, completedAt: isCompleting ? new Date().toISOString() : undefined } : t
      )
      const toggled = updated.find(t => t.id === id)!
      if (window.electronAPI) window.electronAPI.updateTask(toggled).catch(e => console.error(e))
      return updated
    })
  }, [])

  const deleteTask = useCallback(async (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id))
    try { if (window.electronAPI) await window.electronAPI.deleteTask(id) }
    catch (err) { console.error('[TaskContext] 删除失败:', err) }
  }, [])

  const scheduleTask = useCallback(async (id: string, date: string, time?: string) => {
    setTasks(prev => prev.map(t =>
      t.id === id ? { ...t, scheduledDate: date, scheduledTime: time ?? t.scheduledTime } : t
    ))
    const task = tasks.find(t => t.id === id)
    if (task && window.electronAPI) {
      window.electronAPI.updateTask({ ...task, scheduledDate: date, scheduledTime: time ?? task.scheduledTime }).catch(e => console.error(e))
    }
  }, [tasks])

  const unscheduleTask = useCallback(async (id: string) => {
    setTasks(prev => prev.map(t =>
      t.id === id ? { ...t, scheduledDate: undefined, scheduledTime: undefined } : t
    ))
    const task = tasks.find(t => t.id === id)
    if (task && window.electronAPI) {
      window.electronAPI.updateTask({ ...task, scheduledDate: undefined, scheduledTime: undefined }).catch(e => console.error(e))
    }
  }, [tasks])

  // ===== 重复任务展开 =====

  /** 在指定日期展开重复任务为虚拟 Task 实例 */
  const expandForDate = useCallback((date: string): Task[] => {
    const d = new Date(date + 'T00:00:00')
    const weekday = d.getDay()
    const instances: Task[] = []

    for (const t of tasks) {
      if (!t.repeatEnabled || !t.repeatConfig) continue
      if (!t.repeatConfig.weekdays.includes(weekday)) continue
      const isCompleted = t.repeatConfig.completedDates.includes(date)
      instances.push({
        ...t,
        id: `${t.id}${SEP}${date}`,   // 虚拟 ID
        scheduledDate: date,
        completed: isCompleted,
        completedAt: isCompleted ? date : undefined,
      })
    }

    return instances.sort((a, b) => (a.scheduledTime || '99:99').localeCompare(b.scheduledTime || '99:99'))
  }, [tasks])

  // ===== 计算视图 =====

  const todayStr = useMemo(() => localDateStr(), [])

  const todayScheduled = useMemo(() => {
    const regular = tasks
      .filter(t => !t.repeatEnabled && t.scheduledDate === todayStr)
    const expanded = expandForDate(todayStr)
    return [...regular, ...expanded]
      .sort((a, b) => (a.scheduledTime || '99:99').localeCompare(b.scheduledTime || '99:99'))
  }, [tasks, todayStr, expandForDate])

  return (
    <TaskContext.Provider value={{
      tasks, loading, addTask, updateTask, toggleTask, deleteTask,
      scheduleTask, unscheduleTask, refreshTasks, todayScheduled,
      expandForDate,
    }}>
      {children}
    </TaskContext.Provider>
  )
}

export function useTasks(): TaskContextValue {
  const ctx = useContext(TaskContext)
  if (!ctx) throw new Error('useTasks 必须在 <TaskProvider> 内部使用')
  return ctx
}
