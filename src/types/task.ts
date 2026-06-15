/**
 * 任务数据模型
 *
 * 两套管理系统：
 * 1. Task — 今日待办任务实例（由用户创建或 RepeatTemplate 自动生成）
 * 2. RepeatTemplate — 重复任务模板（到达生成时间时自动创建 Task 实例）
 */

// ==================== Task ====================

export interface Task {
  id: string
  title: string
  description?: string
  priority: 'low' | 'medium' | 'high'
  dueTime?: string         // 最晚打卡时间 "22:00"
  tag?: string             // 如 "工作"、"个人"
  completed: boolean
  createdAt: string        // ISO 时间戳
  completedAt?: string     // ISO 时间戳，完成时记录
  reminderTime?: string    // 提醒时间 "HH:mm"，为空表示不提醒
  lastNotifiedDate?: string // ISO 日期，上次提醒日期（避免重复提醒）
  templateId?: string      // 关联的重复模板 ID（由模板生成的任务）
}

export type TaskFormData = Omit<Task, 'id' | 'completed' | 'createdAt' | 'completedAt' | 'lastNotifiedDate' | 'templateId'>

// ==================== RepeatTemplate ====================

/** 星期几 (0=周日, 1=周一, ..., 6=周六) */
export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6

export const WEEKDAY_NAMES: Record<Weekday, string> = {
  0: '日', 1: '一', 2: '二', 3: '三', 4: '四', 5: '五', 6: '六',
}

export interface RepeatTemplate {
  id: string
  title: string
  description?: string
  priority: 'low' | 'medium' | 'high'
  dueTime?: string          // 生成的 Task 的打卡截止时间
  generateTime: string      // 每日生成时间 "08:00"
  reminderTime?: string     // 提醒时间 "HH:mm"，为空表示不提醒
  tag?: string
  weekdays: number[]         // 在哪些星期几重复 (0=周日, 1=周一...)
  enabled: boolean           // 是否启用
  lastGeneratedDate?: string // 上次生成日期（ISO），避免当天重复生成
  createdAt: string
}

export type RepeatTemplateFormData = Omit<RepeatTemplate, 'id' | 'enabled' | 'lastGeneratedDate' | 'createdAt'>

// ==================== 配置 ====================

export const PRIORITY_CONFIG = {
  high:   { label: '高',   color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
  medium: { label: '中',   color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
  low:    { label: '低',   color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
} as const
