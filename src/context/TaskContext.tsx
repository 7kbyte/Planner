import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import type { Task, TaskFormData } from '../types/task'

// ==================== 类型定义 ====================

interface TaskContextValue {
  tasks: Task[]
  loading: boolean
  addTask: (data: TaskFormData) => Promise<void>
  addTaskDirect: (task: Task) => void
  updateTask: (task: Task) => Promise<void>
  toggleTask: (id: string) => Promise<void>
  deleteTask: (id: string) => Promise<void>
  refreshTasks: () => Promise<void>
}

// ==================== 工具函数 ====================

const generateId = (): string => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

// ==================== Context ====================

const TaskContext = createContext<TaskContextValue | null>(null)

export function TaskProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

  // 初始化：从主进程加载任务
  const loadTasksFromDB = useCallback(async () => {
    try {
      if (window.electronAPI) {
        const data = await window.electronAPI.loadTasks()
        setTasks(data)
      }
    } catch (err) {
      console.error('[TaskContext] 加载任务失败:', err)
    }
  }, [])

  useEffect(() => {
    loadTasksFromDB().finally(() => setLoading(false))
  }, [loadTasksFromDB])

  // 窗口聚焦时自动刷新（主进程定时器可能已生成新任务）
  useEffect(() => {
    const onFocus = () => { loadTasksFromDB() }
    window.addEventListener('focus', onFocus)
    return () => window.removeEventListener('focus', onFocus)
  }, [loadTasksFromDB])

  // 直接添加已生成的任务（无需乐观更新）
  const addTaskDirect = useCallback((task: Task) => {
    setTasks((prev) => [task, ...prev])
  }, [])

  // 手动刷新
  const refreshTasks = useCallback(async () => {
    await loadTasksFromDB()
  }, [loadTasksFromDB])

  // 添加任务
  const addTask = useCallback(async (data: TaskFormData) => {
    const newTask: Task = {
      ...data,
      id: generateId(),
      completed: false,
      createdAt: new Date().toISOString(),
    }
    // 乐观更新
    setTasks((prev) => [newTask, ...prev])
    try {
      if (window.electronAPI) {
        await window.electronAPI.addTask(newTask)
      }
    } catch (err) {
      console.error('[TaskContext] 添加任务失败:', err)
      // 回滚
      setTasks((prev) => prev.filter((t) => t.id !== newTask.id))
    }
  }, [])

  // 编辑任务
  const updateTask = useCallback(async (task: Task) => {
    setTasks((prev) => prev.map((t) => (t.id === task.id ? task : t)))
    if (window.electronAPI) {
      window.electronAPI.updateTask(task).catch((err) =>
        console.error('[TaskContext] 更新任务失败:', err),
      )
    }
  }, [])

  // 切换完成状态
  const toggleTask = useCallback(async (id: string) => {
    setTasks((prev) => {
      const target = prev.find((t) => t.id === id)
      if (!target) return prev

      const isCompleting = !target.completed

      const updated = prev.map((t) => {
        if (t.id !== id) return t
        return {
          ...t,
          completed: isCompleting,
          completedAt: isCompleting ? new Date().toISOString() : undefined,
        }
      })

      const toggled = updated.find((t) => t.id === id)!
      if (window.electronAPI) {
        window.electronAPI.updateTask(toggled).catch((err) =>
          console.error('[TaskContext] 更新任务失败:', err),
        )
      }

      return updated
    })
  }, [])

  // 删除任务
  const deleteTask = useCallback(async (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id))
    try {
      if (window.electronAPI) {
        await window.electronAPI.deleteTask(id)
      }
    } catch (err) {
      console.error('[TaskContext] 删除任务失败:', err)
    }
  }, [])

  return (
    <TaskContext.Provider value={{ tasks, loading, addTask, addTaskDirect, updateTask, toggleTask, deleteTask, refreshTasks }}>
      {children}
    </TaskContext.Provider>
  )
}

/** Hook：在任何子组件中访问任务上下文 */
export function useTasks(): TaskContextValue {
  const ctx = useContext(TaskContext)
  if (!ctx) {
    throw new Error('useTasks 必须在 <TaskProvider> 内部使用')
  }
  return ctx
}
