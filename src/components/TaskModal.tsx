import { useState, useEffect, useRef, useCallback } from 'react'
import type { Task, TaskFormData, Weekday } from '../types/task'
import { WEEKDAY_NAMES } from '../types/task'

interface Props {
  isOpen: boolean
  onClose: () => void
  onSave: (data: TaskFormData) => void
  task?: Task | null
  /** 预设排程日期（从时间线点击时填入） */
  presetDate?: string
  presetTime?: string
}

export default function TaskModal({ isOpen, onClose, onSave, task, presetDate, presetTime }: Props) {
  const overlayRef = useRef<HTMLDivElement>(null)
  const isEditing = !!task

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<Task['priority']>('medium')
  const [scheduledDate, setScheduledDate] = useState('')
  const [scheduledTime, setScheduledTime] = useState('')
  const [duration, setDuration] = useState('')
  const [reminder, setReminder] = useState(false)
  const [tag, setTag] = useState('')
  const [repeatEnabled, setRepeatEnabled] = useState(false)
  const [repeatWeekdays, setRepeatWeekdays] = useState<number[]>([1, 2, 3, 4, 5])

  const resetForm = useCallback(() => {
    if (task) {
      setTitle(task.title)
      setDescription(task.description || '')
      setPriority(task.priority)
      setScheduledDate(task.scheduledDate || '')
      setScheduledTime(task.scheduledTime || '')
      setDuration(task.duration?.toString() || '')
      setReminder(task.reminder ?? false)
      setTag(task.tag || '')
      setRepeatEnabled(task.repeatEnabled)
      if (task.repeatConfig) {
        setRepeatWeekdays(task.repeatConfig.weekdays)
      }
    } else {
      setTitle('')
      setDescription('')
      setPriority('medium')
      setScheduledDate(presetDate || '')
      setScheduledTime(presetTime || '')
      setDuration('')
      setReminder(false)
      setTag('')
      setRepeatEnabled(false)
      setRepeatWeekdays([1, 2, 3, 4, 5])
    }
  }, [task, presetDate, presetTime])

  useEffect(() => { if (isOpen) resetForm() }, [isOpen, resetForm])
  useEffect(() => {
    if (!isOpen) return
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [isOpen, onClose])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    onSave({
      title: title.trim(),
      description: description.trim() || undefined,
      priority,
      scheduledDate: repeatEnabled ? undefined : (scheduledDate || undefined),
      scheduledTime: scheduledTime || undefined,
      duration: duration ? parseInt(duration) : undefined,
      reminder,
      tag: tag.trim() || undefined,
      repeatEnabled,
      repeatConfig: repeatEnabled ? { weekdays: repeatWeekdays, completedDates: task?.repeatConfig?.completedDates ?? [] } : undefined,
    })
    onClose()
  }

  if (!isOpen) return null

  return (
    <div ref={overlayRef} onClick={e => { if (e.target === overlayRef.current) onClose() }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg mx-4 bg-white dark:bg-gray-800 rounded-2xl shadow-xl ring-1 ring-gray-200/60 dark:ring-gray-700/60 p-6 max-h-[90vh] overflow-y-auto"
        style={{ animation: 'modalIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)' }}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {isEditing ? '✏️ 编辑任务' : '✨ 新建任务'}
          </h3>
          <button onClick={onClose} className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
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
            <input type="text" value={title} onChange={e => setTitle(e.target.value)}
              placeholder="你想做什么？" className="input" maxLength={100} autoFocus />
          </div>

          {/* 描述 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">描述</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)}
              placeholder="添加备注…" rows={2} className="input resize-none" maxLength={200} />
          </div>

          {/* 优先级 + 标签 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">优先级</label>
              <div className="flex gap-1.5">
                {(['low', 'medium', 'high'] as const).map(p => (
                  <button key={p} type="button" onClick={() => setPriority(p)}
                    className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${
                      priority === p
                        ? p === 'high' ? 'bg-red-500 text-white' : p === 'medium' ? 'bg-amber-500 text-white' : 'bg-green-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}>
                    {p === 'high' ? '🔥 高' : p === 'medium' ? '⚡ 中' : '🌱 低'}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">标签</label>
              <input type="text" value={tag} onChange={e => setTag(e.target.value)}
                placeholder="工作、个人…" className="input" maxLength={20} />
            </div>
          </div>

          {/* 时间 + 时长 + 提醒 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">时间</label>
              <input type="time" value={scheduledTime} onChange={e => setScheduledTime(e.target.value)} className="input" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">时长(分钟)</label>
              <input type="number" value={duration} onChange={e => setDuration(e.target.value)}
                placeholder="30" min={5} max={480} step={5} className="input" />
            </div>
          </div>

          {/* 提醒开关 */}
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={reminder} onChange={e => setReminder(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-indigo-500 focus:ring-indigo-500" />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              🔔 {scheduledTime ? `在 ${scheduledTime} 提醒` : '设置时间后开启提醒'}
            </span>
          </label>

          {/* 重复开关 */}
          <div className="border-t border-gray-100 dark:border-gray-700 pt-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={repeatEnabled} onChange={e => setRepeatEnabled(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-indigo-500 focus:ring-indigo-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">🔄 重复任务</span>
            </label>

            {repeatEnabled && (
              <div className="mt-3 ml-7 space-y-3 animate-slide-up">
                <div>
                  <label className="block text-xs text-gray-500 mb-1.5">重复日期</label>
                  <div className="flex gap-1">
                    {([0, 1, 2, 3, 4, 5, 6] as const).map(d => {
                      const active = repeatWeekdays.includes(d)
                      return (
                        <button key={d} type="button"
                          onClick={() => setRepeatWeekdays(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d])}
                          className={`flex-1 py-1.5 rounded-md text-xs font-medium transition-all ${
                            active ? 'bg-indigo-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-500 hover:bg-gray-200'
                          }`}>
                          {WEEKDAY_NAMES[d]}
                        </button>
                      )
                    })}
                  </div>
                  <p className="text-[11px] text-gray-400 mt-1.5">
                    {repeatWeekdays.length === 0 ? '未选择' : repeatWeekdays.length === 7 ? '每天' : `每周${repeatWeekdays.map(d => WEEKDAY_NAMES[d as Weekday]).join('、')}`}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* 按钮 */}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 transition-colors">
              取消
            </button>
            <button type="submit" disabled={!title.trim()}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white disabled:opacity-50 bg-accent-500 hover:bg-accent-600 transition-colors shadow-sm">
              {isEditing ? '保存' : '创建任务'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
