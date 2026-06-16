/**
 * 统一任务数据模型
 *
 * 一切皆 Task。重复只是属性，排程靠日期+时间。
 * - 未安排 scheduledDate 的任务 → 出现在"收件箱"中
 * - 安排了 scheduledDate 的任务 → 出现在时间线/周视图上
 * - repeatEnabled 的任务 → 直接按 weekdays 映射到对应日期显示
 */

// ==================== 星期 ====================

export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6

export const WEEKDAY_NAMES: Record<Weekday, string> = {
  0: '日', 1: '一', 2: '二', 3: '三', 4: '四', 5: '五', 6: '六',
}

// ==================== 重复配置 ====================

export interface RepeatConfig {
  weekdays: number[]          // 在哪些星期几出现
  completedDates: string[]    // 已完成的日期列表 (ISO)，用于追踪每日完成状态
}

// ==================== Task ====================

export interface Task {
  id: string
  title: string
  description?: string
  priority: 'low' | 'medium' | 'high'
  tag?: string

  // 排程
  scheduledDate?: string    // ISO 日期 — undefined = 收件箱（重复任务也为 undefined）
  scheduledTime?: string    // "14:30" — undefined = 全天/未安排
  duration?: number         // 预估耗时（分钟）

  // 状态
  completed: boolean
  completedAt?: string
  createdAt: string
  inboxOrder: number        // 收件箱排序

  // 提醒
  reminder: boolean         // 是否在 scheduledTime 时提醒
  lastNotifiedDate?: string

  // 重复
  repeatEnabled: boolean
  repeatConfig?: RepeatConfig
}

/** 新建/编辑任务时的表单数据 */
export type TaskFormData = Omit<Task, 'id' | 'completed' | 'completedAt' | 'createdAt' | 'lastNotifiedDate' | 'inboxOrder'>

// ==================== 配置 ====================

export const PRIORITY_CONFIG = {
  high:   { label: '高', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', dot: 'bg-red-500' },
  medium: { label: '中', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', dot: 'bg-amber-500' },
  low:    { label: '低', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', dot: 'bg-green-500' },
} as const

export const TIMELINE_HOURS = Array.from({ length: 19 }, (_, i) => i + 6) // 6:00–24:00

/** 获取本地日期字符串 "YYYY-MM-DD"（不受时区影响） */
export function localDateStr(d: Date = new Date()): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
