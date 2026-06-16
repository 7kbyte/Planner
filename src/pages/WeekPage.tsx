import { useMemo } from 'react'
import { useTasks } from '../context/TaskContext'
import type { Task } from '../types/task'
import { localDateStr } from '../types/task'
import WeekGridView from '../components/WeekGridView'

export default function WeekPage() {
  const { tasks, loading, expandForDate, toggleTask } = useTasks()

  // 展开本周所有日期的重复任务
  const weekExpandedTasks = useMemo(() => {
    const today = new Date()
    const dayOfWeek = today.getDay()
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
    const expanded: Task[] = [...tasks]

    for (let i = 0; i < 7; i++) {
      const d = new Date(today)
      d.setDate(d.getDate() + mondayOffset + i)
      const dateStr = localDateStr(d)
      expanded.push(...expandForDate(dateStr))
    }

    return expanded
  }, [tasks, expandForDate])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const today = new Date()
  const dayOfWeek = today.getDay()
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
  const monday = new Date(today); monday.setDate(monday.getDate() + mondayOffset)
  const sunday = new Date(monday); sunday.setDate(sunday.getDate() + 6)
  const fmtDate = (d: Date) => `${d.getMonth() + 1}月${d.getDate()}日`

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] animate-fade-in">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 shrink-0">
        📅 周视图
        <span className="ml-2 text-sm font-normal text-gray-400">
          {fmtDate(monday)} — {fmtDate(sunday)}
        </span>
      </h2>

      <div className="flex-1 min-h-0">
        <WeekGridView tasks={weekExpandedTasks} onToggle={toggleTask} />
      </div>
    </div>
  )
}
