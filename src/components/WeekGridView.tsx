import type { Task } from '../types/task'
import { localDateStr } from '../types/task'

const WEEKDAY_LABELS = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
const START_HOUR = 6
const END_HOUR = 22
const TOTAL_HOURS = END_HOUR - START_HOUR
const HOUR_HEIGHT = 40 // 每小时像素高度
const HOUR_MARKS = [6, 8, 10, 12, 14, 16, 18, 20, 22]

interface Props {
  tasks: Task[]
  onToggle: (id: string) => void
}

export default function WeekGridView({ tasks, onToggle }: Props) {
  const today = new Date()
  const dayOfWeek = today.getDay()
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek

  const weekDays: { label: string; date: string; isToday: boolean; dayTasks: Task[] }[] = []
  for (let i = 0; i < 7; i++) {
    const d = new Date(today)
    d.setDate(d.getDate() + mondayOffset + i)
    const iso = localDateStr(d)
    weekDays.push({
      label: `${WEEKDAY_LABELS[i]} ${d.getMonth() + 1}/${d.getDate()}`,
      date: iso,
      isToday: iso === localDateStr(),
      dayTasks: tasks.filter(t => t.scheduledDate === iso),
    })
  }

  const timelineHeight = TOTAL_HOURS * HOUR_HEIGHT

  /** 将 "HH:mm" 转为相对于 START_HOUR 的像素偏移 */
  const timeToTop = (time: string) => {
    const [h, m] = time.split(':').map(Number)
    return (h - START_HOUR + m / 60) * HOUR_HEIGHT
  }

  const totalIncomplete = tasks.filter(t => !t.completed).length
  const totalComplete = tasks.filter(t => t.completed).length

  return (
    <div className="gradient-card flex flex-col h-full overflow-hidden">
      {/* 表头 */}
      <div className="grid grid-cols-[36px_repeat(7,1fr)] border-b border-warm-200/60 dark:border-warm-700/40 shrink-0">
        <div className="px-1 py-3" />
        {weekDays.map(day => (
          <div key={day.date}
            className={`px-1 py-3 text-center border-l border-warm-200/40 dark:border-warm-700/30 transition-colors ${
              day.isToday ? 'bg-accent-50/60 dark:bg-accent-900/20' : ''
            }`}>
            <p className={`text-xs font-semibold leading-tight ${day.isToday ? 'text-accent-600 dark:text-accent-400' : 'text-warm-500 dark:text-warm-400'}`}>
              {day.label.split(' ')[0]}
            </p>
            <p className={`text-xs ${day.isToday ? 'text-accent-500 font-bold' : 'text-warm-400'}`}>
              {day.label.split(' ')[1]}
            </p>
          </div>
        ))}
      </div>

      {/* 主体：时间轴网格 */}
      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-[36px_repeat(7,1fr)]" style={{ minHeight: `${timelineHeight}px` }}>
          {/* 时间刻度列 */}
          <div className="relative border-r border-warm-100/50 dark:border-warm-800/30">
            {HOUR_MARKS.map(h => (
              <div
                key={h}
                className="absolute right-1 text-[9px] text-warm-400 dark:text-warm-500 leading-none"
                style={{ top: `${(h - START_HOUR) * HOUR_HEIGHT - 5}px` }}
              >
                {String(h).padStart(2, '0')}
              </div>
            ))}
          </div>

          {/* 7 列日期 */}
          {weekDays.map(day => (
            <div
              key={day.date}
              className={`relative border-l border-warm-200/30 dark:border-warm-700/20 ${
                day.isToday ? 'bg-accent-50/20 dark:bg-accent-900/5' : ''
              }`}
              style={{ minHeight: `${timelineHeight}px` }}
            >
              {/* 小时参考线 */}
              {HOUR_MARKS.map(h => (
                <div
                  key={h}
                  className="absolute left-0 right-0 border-t border-warm-100/40 dark:border-warm-800/20"
                  style={{ top: `${(h - START_HOUR) * HOUR_HEIGHT}px` }}
                />
              ))}

              {/* 任务块 */}
              {day.dayTasks.map(task => {
                const top = task.scheduledTime ? timeToTop(task.scheduledTime) : timeToTop('08:00')
                const height = task.duration
                  ? Math.max(24, (task.duration / 60) * HOUR_HEIGHT)
                  : 26 // 默认高度

                return (
                  <div
                    key={task.id}
                    className={`
                      absolute left-0.5 right-0.5 rounded-md px-1.5 py-0.5
                      text-[11px] leading-tight overflow-hidden
                      group transition-all duration-150 hover:z-10 hover:shadow-md
                      ${task.completed
                        ? 'bg-warm-100/70 dark:bg-warm-800/40 text-warm-400 dark:text-warm-500 line-through'
                        : task.priority === 'high'
                          ? 'bg-rose-100/80 dark:bg-rose-950/50 text-rose-800 dark:text-rose-200 border-l-2 border-rose-400'
                        : task.priority === 'medium'
                          ? 'bg-amber-100/80 dark:bg-amber-950/50 text-amber-800 dark:text-amber-200 border-l-2 border-amber-400'
                          : 'bg-emerald-100/80 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-200 border-l-2 border-emerald-400'}
                    `}
                    style={{ top: `${top}px`, height: `${height}px` }}
                    title={task.scheduledTime ? `${task.scheduledTime} ${task.title}${task.duration ? ` (${task.duration}min)` : ''}` : task.title}
                  >
                    <div className="flex items-center gap-0.5 h-full min-w-0">
                      <button
                        onClick={e => { e.stopPropagation(); onToggle(task.id) }}
                        className={`shrink-0 w-3 h-3 rounded-full border flex items-center justify-center ${
                          task.completed
                            ? 'border-transparent bg-gradient-to-br from-accent-400 to-accent-500'
                            : 'border-warm-300/70 dark:border-warm-600/70 hover:scale-110'
                        }`}>
                        {task.completed && (
                          <svg className="w-1.5 h-1.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"
                            strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
                            <path d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </button>
                      <span className="truncate flex-1">{task.title}</span>
                      {task.repeatEnabled && <span className="text-[8px] shrink-0 opacity-60">🔄</span>}
                    </div>
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>

      {/* 底部统计 */}
      <div className="px-4 py-2 border-t border-warm-200/60 dark:border-warm-700/40 text-[11px] text-warm-400 flex items-center gap-3 shrink-0">
        <span className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-accent-400" />
          {totalIncomplete} 待完成
        </span>
        <span className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          {totalComplete} 已完成
        </span>
      </div>
    </div>
  )
}
