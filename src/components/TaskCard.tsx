import { Task, PRIORITY_CONFIG } from '../types/task'

interface TaskCardProps {
  task: Task
  onToggle: (id: string) => void
  onEdit?: (task: Task) => void
  onDelete?: (task: Task) => void
}

export default function TaskCard({ task, onToggle, onEdit, onDelete }: TaskCardProps) {
  const { id, title, description, priority, dueTime, tag, completed } = task

  // 是否超过打卡时间
  const now = new Date()
  const currentMinutes = now.getHours() * 60 + now.getMinutes()
  const isOverdue =
    !completed &&
    !!dueTime &&
    (() => {
      const [h, m] = dueTime.split(':').map(Number)
      return currentMinutes > h * 60 + m
    })()

  return (
    <div
      className={`
        group relative bg-white dark:bg-gray-800
        rounded-xl shadow-sm ring-1 ring-gray-200/60 dark:ring-gray-700/60
        p-4 sm:p-5 mb-3
        transition-all duration-500 ease-in-out
        ${completed ? 'opacity-60 scale-[0.98]' : 'hover:shadow-md'}
      `}
    >
      <div className="flex items-start gap-3">
        {/* ---- 圆形复选框 ---- */}
        <button
          onClick={() => onToggle(id)}
          className={`
            shrink-0 w-6 h-6 mt-0.5 rounded-full
            flex items-center justify-center
            border-2 transition-all duration-300 ease-out
            ${
              completed
                ? 'bg-green-500 border-green-500 scale-100'
                : 'border-gray-300 dark:border-gray-600 hover:border-indigo-400 dark:hover:border-indigo-500'
            }
          `}
          aria-label={completed ? '取消完成' : '标记完成'}
        >
          {completed && (
            <svg
              className="w-3.5 h-3.5 text-white animate-check"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M5 13l4 4L19 7"
              />
            </svg>
          )}
        </button>

        {/* ---- 任务内容 ---- */}
        <div className="flex-1 min-w-0">
          {/* 标题行 */}
          <div className="flex items-center gap-2 flex-wrap">
            <h3
              className={`
                text-[15px] font-medium leading-snug
                transition-all duration-300
                ${completed ? 'line-through text-gray-400 dark:text-gray-500' : 'text-gray-900 dark:text-gray-100'}
              `}
            >
              {title}
            </h3>

            {/* 优先级标签 */}
            <span
              className={`
                inline-flex items-center px-2 py-0.5 rounded-md
                text-[11px] font-semibold tracking-wide
                ${PRIORITY_CONFIG[priority].color}
                transition-opacity duration-300
                ${completed ? 'opacity-60' : ''}
              `}
            >
              {PRIORITY_CONFIG[priority].label}
            </span>
          </div>

          {/* 描述 */}
          {description && (
            <p
              className={`
                mt-1 text-[13px] leading-relaxed
                transition-all duration-300
                ${completed ? 'line-through text-gray-400 dark:text-gray-500' : 'text-gray-500 dark:text-gray-400'}
              `}
            >
              {description}
            </p>
          )}

          {/* 底部 meta 信息 */}
          <div className="mt-2.5 flex items-center gap-3 flex-wrap">
            {/* 打卡时间 */}
            {dueTime && (
              <span
                className={`
                  inline-flex items-center gap-1 text-xs
                  ${isOverdue ? 'text-red-500 dark:text-red-400 font-medium' : 'text-gray-400 dark:text-gray-500'}
                  ${completed ? 'line-through' : ''}
                `}
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 6v6l4 2m6-2a10 10 0 11-20 0 10 10 0 0120 0z" />
                </svg>
                {isOverdue && '⚠ '}最晚 {dueTime}
                {isOverdue && ' (已超时)'}
              </span>
            )}

            {/* 标签 */}
            {tag && (
              <span
                className={`
                  inline-flex items-center px-2 py-0.5 rounded-full
                  text-[11px] bg-indigo-50 text-indigo-600
                  dark:bg-indigo-900/30 dark:text-indigo-400
                  transition-opacity duration-300
                  ${completed ? 'opacity-50' : ''}
                `}
              >
                #{tag}
              </span>
            )}
          </div>
        </div>

        {/* 操作按钮（悬停显示） */}
        <div className="shrink-0 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          {onEdit && (
            <button
              onClick={(e) => { e.stopPropagation(); onEdit(task) }}
              className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
              title="编辑"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
          )}
          {onDelete && (
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(task) }}
              className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              title={task.templateId ? '删除重复模板' : '删除任务'}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
