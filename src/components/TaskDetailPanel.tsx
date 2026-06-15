import { Task, PRIORITY_CONFIG } from '../types/task'

interface TaskDetailPanelProps {
  task: Task | null
  onToggle: (id: string) => void
  onEdit?: (task: Task) => void
  onDelete?: (task: Task) => void
  onClose: () => void
}

export default function TaskDetailPanel({ task, onToggle, onEdit, onDelete, onClose }: TaskDetailPanelProps) {
  if (!task) return null

  const { id, title, description, priority, dueTime, tag, completed, createdAt, completedAt, reminderTime, templateId } = task

  const isOverdue =
    !completed &&
    !!dueTime &&
    (() => {
      const now = new Date()
      const [h, m] = dueTime.split(':').map(Number)
      return now.getHours() * 60 + now.getMinutes() > h * 60 + m
    })()

  const fmtDate = (iso: string) => {
    const d = new Date(iso)
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md ring-1 ring-indigo-200 dark:ring-indigo-800 p-5 animate-slide-up">
      {/* 顶部：标题 + 关闭 */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-3 min-w-0">
          {/* 复选框 */}
          <button
            onClick={() => onToggle(id)}
            className={`
              shrink-0 w-6 h-6 rounded-full
              flex items-center justify-center
              border-2 transition-all duration-200
              ${completed
                ? 'bg-green-500 border-green-500'
                : 'border-gray-300 dark:border-gray-600 hover:border-indigo-400'
              }
            `}
          >
            {completed && (
              <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            )}
          </button>
          <h3 className={`text-lg font-semibold ${completed ? 'line-through text-gray-400' : 'text-gray-900 dark:text-white'}`}>
            {title}
          </h3>
        </div>
        <button onClick={onClose} className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* 元数据标签行 */}
      <div className="flex items-center gap-2 flex-wrap mb-3">
        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold ${PRIORITY_CONFIG[priority].color}`}>
          {PRIORITY_CONFIG[priority].label}优先级
        </span>
        {tag && (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
            #{tag}
          </span>
        )}
        {dueTime && (
          <span className={`inline-flex items-center gap-1 text-xs ${isOverdue ? 'text-red-500 font-medium' : 'text-gray-500'}`}>
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6l4 2m6-2a10 10 0 11-20 0 10 10 0 0120 0z" />
            </svg>
            {isOverdue ? '⚠ 已超时 ' : '最晚 '}{dueTime}
          </span>
        )}
        {completed && (
          <span className="inline-flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
            ✅ 已完成{completedAt ? `于 ${fmtDate(completedAt)}` : ''}
          </span>
        )}
        {reminderTime && (
          <span className="inline-flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
            🔔 {reminderTime} 提醒
          </span>
        )}
        {templateId && (
          <span className="inline-flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
            🔄 来自重复模板
          </span>
        )}
      </div>

      {/* 描述 */}
      {description && (
        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-4 bg-gray-50 dark:bg-gray-900 rounded-lg p-3">
          {description}
        </p>
      )}
      {!description && (
        <p className="text-xs text-gray-400 dark:text-gray-500 mb-4 italic">暂无描述</p>
      )}

      {/* 创建时间 */}
      <p className="text-[11px] text-gray-400 dark:text-gray-500 mb-4">
        创建于 {fmtDate(createdAt)}
      </p>

      {/* 操作按钮 */}
      <div className="flex items-center gap-2 pt-2 border-t border-gray-100 dark:border-gray-700">
        {onEdit && (
          <button
            onClick={() => onEdit(task)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            编辑
          </button>
        )}
        {onDelete && (
          <button
            onClick={() => onDelete(task)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            {templateId ? '删除模板' : '删除任务'}
          </button>
        )}
      </div>
    </div>
  )
}
