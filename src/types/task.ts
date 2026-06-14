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
  lastNotifiedDate?: string // ISO 日期，上次通知日期
  templateId?: string      // 关联的重复模板 ID（由模板生成的任务）
}

export type TaskFormData = Omit<Task, 'id' | 'completed' | 'createdAt' | 'completedAt' | 'lastNotifiedDate' | 'templateId'>

// ==================== RepeatTemplate ====================

export type RepeatType = 'daily' | 'weekly' | 'monthly'

export interface RepeatTemplate {
  id: string
  title: string
  description?: string
  priority: 'low' | 'medium' | 'high'
  dueTime?: string          // 生成的 Task 的打卡截止时间
  generateTime: string      // 每日生成时间 "08:00"
  tag?: string
  repeat: RepeatType         // 重复频率
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

export const REPEAT_CONFIG = {
  daily:   { label: '每天',   icon: '🔄' },
  weekly:  { label: '每周',   icon: '📅' },
  monthly: { label: '每月',   icon: '🗓️' },
} as const
