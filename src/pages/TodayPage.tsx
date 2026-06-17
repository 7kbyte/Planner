import { useState } from 'react'
import { useTasks } from '../context/TaskContext'
import ScheduleList from '../components/ScheduleList'

export default function TodayPage() {
  const { loading, todayScheduled, unscheduledTasks, toggleTask, quickAddTask } = useTasks()
  const [quickTitle, setQuickTitle] = useState('')
  const [quickDesc, setQuickDesc] = useState('')

  const handleQuickAdd = async () => {
    if (!quickTitle.trim()) return
    await quickAddTask(quickTitle, quickDesc)
    setQuickTitle('')
    setQuickDesc('')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-6 h-6 border-2 border-accent-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] animate-fade-in">
      <h2 className="text-2xl font-bold text-warm-800 dark:text-warm-200 mb-3 shrink-0">
        📅 今日
        <span className="ml-2 text-sm font-normal text-warm-400">
          {new Date().toLocaleDateString('zh-CN', { month: 'long', day: 'numeric', weekday: 'short' })}
        </span>
      </h2>

      {/* 快速记录条 */}
      <div className="flex gap-2 mb-4 shrink-0">
        <div className="flex-1 flex gap-2">
          <input
            type="text"
            value={quickTitle}
            onChange={e => setQuickTitle(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleQuickAdd() }}
            placeholder="快速记录…"
            className="w-36 px-3 py-2 rounded-xl glass text-sm text-warm-800 dark:text-warm-200 placeholder-warm-400 focus:outline-none focus:ring-2 focus:ring-accent-400/40"
          />
          <input
            type="text"
            value={quickDesc}
            onChange={e => setQuickDesc(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleQuickAdd() }}
            placeholder="描述（可选）"
            className="flex-1 px-3 py-2 rounded-xl glass text-sm text-warm-800 dark:text-warm-200 placeholder-warm-400 focus:outline-none focus:ring-2 focus:ring-accent-400/40"
          />
        </div>
        <button
          onClick={handleQuickAdd}
          disabled={!quickTitle.trim()}
          className="px-4 py-2 rounded-xl text-sm font-medium text-white bg-accent-500 hover:bg-accent-600 disabled:opacity-40 transition-colors shrink-0"
        >
          记录
        </button>
      </div>

      {/* 未安排任务 */}
      {unscheduledTasks.length > 0 && (
        <div className="mb-4 shrink-0">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm">📥</span>
            <span className="text-xs font-semibold text-warm-500 uppercase tracking-wider">待处理</span>
            <span className="text-[10px] text-warm-400 bg-warm-100 dark:bg-warm-800 px-1.5 py-0.5 rounded-full">
              {unscheduledTasks.length}
            </span>
          </div>
          <div className="space-y-2">
            {unscheduledTasks.map(task => (
              <div key={task.id}
                className={`group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300
                  ${task.completed ? 'glass-card opacity-50' : 'glass-card hover:shadow-md'}`}>
                <button
                  onClick={() => toggleTask(task.id)}
                  className={`shrink-0 w-5 h-5 mt-0.5 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                    task.completed
                      ? 'border-transparent bg-gradient-to-br from-accent-500 to-accent-600'
                      : 'border-warm-300 dark:border-warm-600 hover:border-accent-400 hover:scale-110'
                  }`}>
                  {task.completed && (
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>

                <div className="flex-1 min-w-0 flex items-baseline gap-1.5 min-w-0">
                  <span className={`text-sm font-semibold truncate ${
                    task.completed ? 'line-through text-warm-400' : 'text-warm-800 dark:text-warm-100'
                  }`}>
                    {task.title}
                  </span>
                  {task.description && (
                    <span className="text-sm text-warm-400 dark:text-warm-500 truncate hidden sm:inline">
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
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    task.priority === 'high' ? 'bg-rose-400' : task.priority === 'medium' ? 'bg-amber-400' : 'bg-emerald-400'
                  }`} />
                </div>

                {/* hover 渐变条 */}
                <div className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-1 h-8 rounded-full bg-gradient-to-b from-accent-400 to-accent-600" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 今日日程 */}
      <div className="flex-1 min-h-0">
        <ScheduleList tasks={todayScheduled} onToggle={toggleTask} />
      </div>
    </div>
  )
}
