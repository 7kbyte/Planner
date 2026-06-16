import { useTasks } from '../context/TaskContext'
import ScheduleList from '../components/ScheduleList'

export default function TodayPage() {
  const { loading, todayScheduled, toggleTask } = useTasks()

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] animate-fade-in">
      <h2 className="text-2xl font-bold text-warm-800 dark:text-warm-200 mb-4 shrink-0">
        📅 今日
        <span className="ml-2 text-sm font-normal text-gray-400">
          {new Date().toLocaleDateString('zh-CN', { month: 'long', day: 'numeric', weekday: 'short' })}
        </span>
      </h2>

      <div className="flex-1 min-h-0">
        <ScheduleList tasks={todayScheduled} onToggle={toggleTask} />
      </div>
    </div>
  )
}
