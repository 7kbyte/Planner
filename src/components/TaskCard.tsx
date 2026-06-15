import { Task, PRIORITY_CONFIG } from '../types/task'

interface TaskCardProps {
  task: Task
  selected?: boolean
  onToggle: (id: string) => void
  onClick?: (task: Task) => void
}

export default function TaskCard({ task, selected = false, onToggle, onClick }: TaskCardProps) {
  const { id, title, description, priority, dueTime, tag, completed } = task

  const isOverdue =
    !completed &&
    !!dueTime &&
    (() => {
      const now = new Date()
      const [h, m] = dueTime.split(':').map(Number)
      return now.getHours() * 60 + now.getMinutes() > h * 60 + m
    })()

  return (
    <div
      onClick={() => onClick?.(task)}
      className={`
        group relative bg-white dark:bg-gray-800
        rounded-xl shadow-sm ring-1
        p-3.5 cursor-pointer
        transition-all duration-200
        flex flex-col justify-between
        min-h-[96px]
        ${completed ? 'opacity-55' : ''}
        ${selected
          ? 'ring-2 ring-indigo-500 dark:ring-indigo-400 shadow-md scale-[1.02]'
          : 'ring-gray-200/60 dark:ring-gray-700/60 hover:ring-indigo-300 dark:hover:ring-indigo-600 hover:shadow-md'
        }
      `}
    >
      {/* 顶部行：标题 + 复选框 */}
      <div className="flex items-start gap-2">
        <h3
          className={`
            text-sm font-medium leading-snug flex-1 min-w-0
            line-clamp-2
            transition-all duration-300
            ${completed ? 'line-through text-gray-400 dark:text-gray-500' : 'text-gray-900 dark:text-gray-100'}
          `}
          title={title}
        >
          {title}
        </h3>

        {/* 复选框 */}
        <button
          onClick={(e) => { e.stopPropagation(); onToggle(id) }}
          className={`
            shrink-0 w-5 h-5 rounded-full
            flex items-center justify-center
            border-2 transition-all duration-200
            ${completed
              ? 'bg-green-500 border-green-500'
              : 'border-gray-300 dark:border-gray-600 hover:border-indigo-400'
            }
          `}
          aria-label={completed ? '取消完成' : '标记完成'}
        >
          {completed && (
            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </button>
      </div>

      {/* 底部行：标签 + 时间 + 优先级 */}
      <div className="flex items-center gap-2 mt-2 flex-wrap">
        {/* 优先级 */}
        <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold ${PRIORITY_CONFIG[priority].color}`}>
          {PRIORITY_CONFIG[priority].label}
        </span>

        {/* 截止时间 */}
        {dueTime && (
          <span className={`inline-flex items-center gap-0.5 text-[11px] ${isOverdue ? 'text-red-500 font-medium' : 'text-gray-400'} ${completed ? 'line-through' : ''}`}>
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6l4 2m6-2a10 10 0 11-20 0 10 10 0 0120 0z" />
            </svg>
            {dueTime}
          </span>
        )}

        {/* 标签 */}
        {tag && (
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-indigo-50 text-indigo-500 dark:bg-indigo-900/30 dark:text-indigo-400 truncate max-w-[80px]">
            {tag}
          </span>
        )}

        {/* 描述指示 */}
        {description && (
          <span className="text-[11px] text-gray-300 dark:text-gray-600" title="有描述">
            📝
          </span>
        )}

        {/* 提醒指示 */}
        {task.reminderTime && (
          <span className="text-[11px] text-amber-400 ml-auto" title={`提醒 ${task.reminderTime}`}>
            🔔
          </span>
        )}
      </div>
    </div>
  )
}
