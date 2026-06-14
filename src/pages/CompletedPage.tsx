import { useMemo } from 'react'
import { useTasks } from '../context/TaskContext'
import TaskCard from '../components/TaskCard'

export default function CompletedPage() {
  const { tasks, loading, toggleTask } = useTasks()

  const completed = useMemo(() => tasks.filter((t) => t.completed), [tasks])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <span className="ml-3 text-sm text-gray-400">加载中…</span>
      </div>
    )
  }

  return (
    <div className="animate-fade-in">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        ✅ 已完成
      </h2>

      {completed.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">🎯</div>
          <p className="text-gray-400 dark:text-gray-500 text-sm">
            还没有已完成的任务，去完成一些吧！
          </p>
        </div>
      ) : (
        <section>
          <div className="flex items-center gap-2 mb-4">
            <span className="w-2 h-2 rounded-full bg-green-500" />
            <h3 className="text-sm font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
              共 {completed.length} 项
            </h3>
          </div>
          {completed.map((task) => (
            <TaskCard key={task.id} task={task} onToggle={toggleTask} />
          ))}
        </section>
      )}
    </div>
  )
}
