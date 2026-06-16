import { useState, useMemo } from 'react'
import { useTasks } from '../context/TaskContext'
import type { Task, TaskFormData } from '../types/task'
import { PRIORITY_CONFIG, WEEKDAY_NAMES } from '../types/task'
import TaskModal from '../components/TaskModal'
import ConfirmDialog from '../components/ConfirmDialog'

export default function AllTasksPage() {
  const { tasks, loading, addTask, updateTask, deleteTask, refreshTasks } = useTasks()
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Task | null>(null)
  const [filter, setFilter] = useState<'all' | 'oneTime' | 'repeat'>('all')

  const handleSave = async (data: TaskFormData) => {
    if (editingTask) {
      await updateTask({ ...editingTask, ...data })
    } else {
      await addTask(data)
    }
    refreshTasks()
  }

  const handleDelete = async () => {
    if (deleteTarget) {
      await deleteTask(deleteTarget.id)
      setDeleteTarget(null)
    }
  }

  const { oneTimeTasks, repeatTasks } = useMemo(() => {
    return {
      oneTimeTasks: tasks.filter(t => !t.repeatEnabled),
      repeatTasks: tasks.filter(t => t.repeatEnabled),
    }
  }, [tasks])

  const filterOptions = [
    { value: 'all' as const, label: '全部', count: tasks.length },
    { value: 'oneTime' as const, label: '一次性任务', count: oneTimeTasks.length },
    { value: 'repeat' as const, label: '重复任务', count: repeatTasks.length },
  ]

  const visibleTasks = filter === 'all' ? tasks
    : filter === 'oneTime' ? oneTimeTasks
    : repeatTasks

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="animate-fade-in h-[calc(100vh-4rem)] flex flex-col">
      {/* 顶栏 */}
      <div className="flex items-center justify-between mb-4 shrink-0">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">📋 所有任务</h2>
        <button
          onClick={() => { setEditingTask(null); setIsModalOpen(true) }}
          className="px-4 py-2 rounded-xl text-sm font-medium text-white bg-accent-500 hover:bg-accent-600 shadow-sm transition-colors"
        >
          + 新建任务
        </button>
      </div>

      {/* 筛选栏 */}
      <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-0.5 mb-4 shrink-0 self-start">
        {filterOptions.map(opt => (
          <button
            key={opt.value}
            onClick={() => setFilter(opt.value)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              filter === opt.value
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            {opt.label} <span className="ml-1 opacity-60">{opt.count}</span>
          </button>
        ))}
      </div>

      {/* 任务列表 */}
      <div className="flex-1 overflow-y-auto space-y-1">
        {visibleTasks.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-3 animate-float">📋</div>
            <p className="text-sm text-warm-500 dark:text-warm-400">暂无任务</p>
          </div>
        ) : (
          visibleTasks.map(task => (
            <div
              key={task.id}
              className="group flex items-center gap-3 px-4 py-3 rounded-xl glass-card"
            >
              {/* 类型图标 */}
              <span className="text-sm shrink-0 w-6 text-center">
                {task.repeatEnabled ? '🔄' : '📌'}
              </span>

              {/* 内容 */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-medium truncate ${task.completed ? 'line-through text-gray-400' : 'text-gray-800 dark:text-gray-200'}`}>
                    {task.title}
                  </span>
                  <span className={`shrink-0 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold ${PRIORITY_CONFIG[task.priority].color}`}>
                    {PRIORITY_CONFIG[task.priority].label}
                  </span>
                  {task.tag && (
                    <span className="shrink-0 text-[10px] px-1.5 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500">
                      {task.tag}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 mt-0.5 text-[11px] text-gray-400">
                  {task.scheduledDate && (
                    <span>📅 {task.scheduledDate}{task.scheduledTime ? ` ${task.scheduledTime}` : ''}</span>
                  )}
                  {!task.scheduledDate && !task.repeatEnabled && (
                    <span>📥 收件箱</span>
                  )}
                  {task.repeatEnabled && task.repeatConfig && (
                    <span className="text-purple-500">
                      🔁 {task.repeatConfig.weekdays.length === 7 ? '每天'
                        : task.repeatConfig.weekdays.map(d => WEEKDAY_NAMES[d as keyof typeof WEEKDAY_NAMES]).join('、')}
                    </span>
                  )}
                  {task.duration && <span>⏱ {task.duration}分钟</span>}
                  {task.reminder && <span>🔔 提醒</span>}
                </div>
              </div>

              {/* 操作按钮 */}
              <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => { setEditingTask(task); setIsModalOpen(true) }}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
                  title="编辑"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  onClick={() => setDeleteTarget(task)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  title="删除"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <TaskModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingTask(null) }}
        onSave={handleSave}
        task={editingTask}
      />

      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="删除任务"
        message={`确定要删除「${deleteTarget?.title ?? ''}」吗？${deleteTarget?.repeatEnabled ? '该重复任务的所有关联数据将被移除。' : '此操作不可撤销。'}`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
