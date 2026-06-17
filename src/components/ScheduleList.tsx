import type { Task } from '../types/task'

interface Props {
  tasks: Task[]
  onToggle: (id: string) => void
}

/** 紧凑日程列表 — 渐变卡片 + 玻璃时间条 + 完成率环 */
export default function ScheduleList({ tasks, onToggle }: Props) {
  const now = new Date()
  const currentMinutes = now.getHours() * 60 + now.getMinutes()
  const completedCount = tasks.filter(t => t.completed).length
  const completionRate = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0

  if (tasks.length === 0) {
    return (
      <div className="gradient-card flex items-center justify-center py-20">
        <div className="text-center">
          <div className="text-5xl mb-4 animate-float">🌤️</div>
          <p className="text-sm text-warm-500 dark:text-warm-400">今天还没有安排任务</p>
          <p className="text-xs text-warm-400/70 dark:text-warm-500/70 mt-1">
            前往「所有任务」添加
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="gradient-card flex flex-col h-full">
      {/* === 头部：完成率环 + 玻璃时间条 === */}
      <div className="p-4 pb-8">
        <div className="flex items-center gap-4">
          {/* 完成率环形图 */}
          <div className="relative w-16 h-16 shrink-0">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 56 56">
              <circle cx="28" cy="28" r="24" fill="none"
                className="stroke-warm-200 dark:stroke-warm-700" strokeWidth="6" />
              <circle cx="28" cy="28" r="24" fill="none"
                stroke="url(#completionGradient)" strokeWidth="6" strokeLinecap="round"
                strokeDasharray={`${completionRate * 1.51} 151`}
                className="transition-all duration-700 ease-out" />
              <defs>
                <linearGradient id="completionGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="var(--color-accent-400)" />
                  <stop offset="100%" stopColor="var(--color-accent-600)" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-base font-bold text-accent-600 dark:text-accent-400">{completionRate}</span>
              <span className="text-[10px] text-warm-400">%</span>
            </div>
          </div>

          {/* 右侧信息 */}
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-2">
              <span className="text-sm font-semibold text-warm-800 dark:text-warm-200">
                今日进度
              </span>
              <span className="text-xs text-warm-400">
                {completedCount}/{tasks.length} 已完成
              </span>
            </div>
            {/* 玻璃态时间条 */}
            <div className="mt-2.5 h-3.5 glass rounded-full relative mb-5">
              <div
                className="absolute inset-y-0 left-0 rounded-full transition-all duration-700 ease-out"
                style={{
                  width: `${Math.min(100, (currentMinutes / (24 * 60)) * 100)}%`,
                  background: 'linear-gradient(90deg, var(--color-accent-400), var(--color-accent-500), #c084fc)',
                }}
              />
              {tasks.filter(t => t.scheduledTime).map(t => {
                const [h, m] = t.scheduledTime!.split(':').map(Number)
                const pct = ((h * 60 + m) / (24 * 60)) * 100
                return (
                  <div key={t.id} className="group absolute" style={{ left: `${pct}%`, top: '50%', transform: 'translate(-50%, -50%)' }}>
                    {/* 圆点 */}
                    <div className={`w-3 h-3 rounded-full ring-2 ring-white dark:ring-warm-800 cursor-pointer transition-transform group-hover:scale-150 ${
                      t.completed
                        ? 'bg-warm-300 dark:bg-warm-600'
                        : t.priority === 'high' ? 'bg-rose-400'
                        : t.priority === 'medium' ? 'bg-amber-400'
                        : 'bg-accent-500'
                    }`} />
                    {/* 悬浮气泡 */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 rounded-lg
                                    bg-warm-800 dark:bg-warm-100 text-white dark:text-warm-800 text-xs font-medium
                                    whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all duration-200
                                    pointer-events-none shadow-lg">
                      <span className="text-[11px] opacity-70 mr-1.5">{t.scheduledTime}</span>
                      {t.title}
                      {/* 气泡三角 */}
                      <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0
                                      border-l-4 border-r-4 border-t-4
                                      border-l-transparent border-r-transparent border-t-warm-800 dark:border-t-warm-100" />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* === 任务列表 === */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-2">
        {tasks.map((task, i) => {
          const isCurrent = task.scheduledTime && (() => {
            const [h, m] = task.scheduledTime.split(':').map(Number)
            const taskMins = h * 60 + m
            const nextTask = tasks[i + 1]
            const nextMins = nextTask?.scheduledTime
              ? (() => { const [nh, nm] = nextTask.scheduledTime.split(':').map(Number); return nh * 60 + nm })()
              : 24 * 60
            return currentMinutes >= taskMins && currentMinutes < nextMins
          })()

          return (
            <div
              key={task.id}
              className={`
                group flex items-center gap-4 px-4 py-3.5 rounded-xl
                transition-all duration-300
                ${isCurrent
                  ? 'glass shadow-md ring-1 ring-accent-300/50 dark:ring-accent-700/30 animate-pulse-ring'
                  : 'glass-card hover:shadow-md'}
                ${task.completed ? 'opacity-50' : ''}
              `}
            >
              {/* 复选框 */}
              <button
                onClick={() => onToggle(task.id)}
                className={`shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                  task.completed
                    ? 'border-transparent bg-gradient-to-br from-accent-500 to-accent-600'
                    : 'border-warm-300 dark:border-warm-600 hover:border-accent-400 hover:scale-110'
                }`}
              >
                {task.completed && (
                  <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"
                    strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>

              {/* 时间戳 */}
              <div className="w-14 shrink-0 text-right">
                {task.scheduledTime ? (
                  <span className={`text-sm font-mono font-semibold tracking-tight ${
                    isCurrent ? 'text-accent-600 dark:text-accent-400' : 'text-warm-400 dark:text-warm-500'
                  }`}>
                    {task.scheduledTime}
                  </span>
                ) : (
                  <span className="text-xs text-warm-300 dark:text-warm-600 italic">全天</span>
                )}
                {task.duration && (
                  <span className="block text-[10px] text-warm-400/70">{task.duration}min</span>
                )}
              </div>

              {/* 内容：标题 + 描述同行 */}
              <div className="flex-1 min-w-0 flex items-baseline gap-1.5">
                <span className={`text-[15px] font-semibold truncate ${
                  task.completed
                    ? 'line-through text-warm-400 dark:text-warm-500'
                    : 'text-warm-800 dark:text-warm-100'
                }`}>
                  {task.title}
                </span>
                {task.description && (
                  <span className="text-[15px] text-warm-400 dark:text-warm-500 truncate hidden sm:inline">
                    — {task.description}
                  </span>
                )}
              </div>

              {/* 右侧元数据 */}
              <div className="flex items-center gap-2 shrink-0 ml-2">
                {task.tag && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-accent-50 dark:bg-accent-900/30 text-accent-600 dark:text-accent-400">
                    {task.tag}
                  </span>
                )}
                <span className={`w-2 h-2 rounded-full ${
                  task.priority === 'high' ? 'bg-rose-400 shadow-sm shadow-rose-400/40'
                  : task.priority === 'medium' ? 'bg-amber-400 shadow-sm shadow-amber-400/40'
                  : 'bg-emerald-400 shadow-sm shadow-emerald-400/40'
                }`} />
                {task.repeatEnabled && <span className="text-xs opacity-50" title="重复任务">🔄</span>}
                {task.reminder && <span className="text-xs opacity-50" title="已开启提醒">🔔</span>}
              </div>

              {/* hover 指示 */}
              <div className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="w-1 h-10 rounded-full bg-gradient-to-b from-accent-400 to-accent-600" />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
