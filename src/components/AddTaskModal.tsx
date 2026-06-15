import { useState, useEffect, useRef, useCallback } from 'react'
import { Task, TaskFormData } from '../types/task'

interface AddTaskModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: TaskFormData) => void
  task?: Task | null  // 编辑模式：传入已有任务
}

export default function AddTaskModal({ isOpen, onClose, onSave, task }: AddTaskModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null)
  const isEditing = !!task

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<Task['priority']>('medium')
  const [dueTime, setDueTime] = useState('')
  const [reminderTime, setReminderTime] = useState('')
  const [tag, setTag] = useState('')

  const resetForm = useCallback(() => {
    if (task) {
      setTitle(task.title)
      setDescription(task.description || '')
      setPriority(task.priority)
      setDueTime(task.dueTime || '')
      setReminderTime(task.reminderTime || '')
      setTag(task.tag || '')
    } else {
      setTitle('')
      setDescription('')
      setPriority('medium')
      setDueTime('')
      setReminderTime('')
      setTag('')
    }
  }, [task])

  // 打开时重置 & 关闭时重置
  useEffect(() => {
    if (isOpen) resetForm()
  }, [isOpen, resetForm])

  // Esc 关闭
  useEffect(() => {
    if (!isOpen) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [isOpen, onClose])

  // 点击遮罩关闭
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose()
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    onSave({
      title: title.trim(),
      description: description.trim() || undefined,
      priority,
      dueTime: dueTime || undefined,
      reminderTime: reminderTime || undefined,
      tag: tag.trim() || undefined,
    })
    onClose()
  }

  if (!isOpen) return null

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="
        fixed inset-0 z-50 flex items-center justify-center
        bg-black/40 backdrop-blur-sm
        animate-fade-in
      "
    >
      {/* 模态框 */}
      <div
        className="
          relative w-full max-w-2xl mx-4
          bg-white dark:bg-gray-800
          rounded-2xl shadow-xl ring-1 ring-gray-200/60 dark:ring-gray-700/60
          p-6
        "
        style={{ animation: 'modalIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)' }}
      >
        {/* 标题栏 */}
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {isEditing ? '✏️ 编辑任务' : '✨ 新建任务'}
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 标题 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              任务名称 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="例如：完成项目方案"
              className="input"
              maxLength={100}
              autoFocus
            />
          </div>

          {/* 描述 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              描述
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="添加备注说明..."
              rows={2}
              className="input resize-none"
              maxLength={200}
            />
          </div>

          {/* 三列：优先级 + 最晚打卡 + 提醒时间 */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                优先级
              </label>
              <div className="flex gap-1.5">
                {(['low', 'medium', 'high'] as const).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    className={`
                      flex-1 py-2 rounded-lg text-xs font-medium
                      transition-all duration-200
                      ${priority === p
                        ? p === 'high'
                          ? 'bg-red-500 text-white shadow-sm'
                          : p === 'medium'
                            ? 'bg-amber-500 text-white shadow-sm'
                            : 'bg-green-500 text-white shadow-sm'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }
                    `}
                  >
                    {p === 'high' ? '🔥 高' : p === 'medium' ? '⚡ 中' : '🌱 低'}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                最晚打卡
              </label>
              <input
                type="time"
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                提醒时间
              </label>
              <input
                type="time"
                value={reminderTime}
                onChange={(e) => setReminderTime(e.target.value)}
                className="input"
              />
              <p className="text-[11px] text-gray-400 mt-1">不填不提醒</p>
            </div>
          </div>

          {/* 标签 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              标签
            </label>
            <input
              type="text"
              value={tag}
              onChange={(e) => setTag(e.target.value)}
              placeholder="如：工作、个人、学习"
              className="input"
              maxLength={20}
            />
          </div>

          {/* 按钮 */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium
                         bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400
                         hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={!title.trim()}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium
                         bg-indigo-500 text-white
                         hover:bg-indigo-600 active:bg-indigo-700
                         disabled:opacity-50 disabled:cursor-not-allowed
                         transition-colors shadow-sm shadow-indigo-500/25"
            >
              {isEditing ? '保存修改' : '添加任务'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
