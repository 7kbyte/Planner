import { useState, useEffect, useRef, useCallback } from 'react'
import type { RepeatTemplateFormData, RepeatTemplate } from '../types/task'
import { WEEKDAY_NAMES } from '../types/task'

interface Props {
  isOpen: boolean
  onClose: () => void
  onSave: (data: RepeatTemplateFormData) => void
  template?: RepeatTemplate | null
}

export default function AddRepeatModal({ isOpen, onClose, onSave, template }: Props) {
  const overlayRef = useRef<HTMLDivElement>(null)
  const isEditing = !!template
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium')
  const [generateTime, setGenerateTime] = useState('08:00')
  const [dueTime, setDueTime] = useState('')
  const [reminderTime, setReminderTime] = useState('')
  const [tag, setTag] = useState('')
  const [weekdays, setWeekdays] = useState<number[]>([1, 2, 3, 4, 5]) // 默认工作日

  const resetForm = useCallback(() => {
    if (template) {
      setTitle(template.title)
      setDescription(template.description || '')
      setPriority(template.priority)
      setGenerateTime(template.generateTime)
      setDueTime(template.dueTime || '')
      setReminderTime(template.reminderTime || '')
      setTag(template.tag || '')
      setWeekdays(template.weekdays)
    } else {
      setTitle('')
      setDescription('')
      setPriority('medium')
      setGenerateTime('08:00')
      setDueTime('')
      setReminderTime('')
      setTag('')
      setWeekdays([1, 2, 3, 4, 5])
    }
  }, [template])

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
      generateTime,
      dueTime: dueTime || undefined,
      reminderTime: reminderTime || undefined,
      tag: tag.trim() || undefined,
      weekdays,
    })
    onClose()
  }

  if (!isOpen) return null

  return (
    <div ref={overlayRef} onClick={(e) => { if (e.target === overlayRef.current) onClose() }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl mx-4 bg-white dark:bg-gray-800 rounded-2xl shadow-xl ring-1 ring-gray-200/60 dark:ring-gray-700/60 p-6"
        style={{ animation: 'modalIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)' }}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{isEditing ? '✏️ 编辑模板' : '🔄 新建重复模板'}</h3>
          <button onClick={onClose} className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">模板名称 <span className="text-red-500">*</span></label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="例如：每日晨跑" className="input" maxLength={100} autoFocus />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">描述</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="添加备注..." rows={2} className="input resize-none" maxLength={200} />
          </div>

          {/* 第一行：优先级 + 标签 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">优先级</label>
              <div className="flex gap-1.5">
                {(['low', 'medium', 'high'] as const).map((p) => (
                  <button key={p} type="button" onClick={() => setPriority(p)} className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${priority === p ? (p === 'high' ? 'bg-red-500 text-white shadow-sm' : p === 'medium' ? 'bg-amber-500 text-white shadow-sm' : 'bg-green-500 text-white shadow-sm') : 'bg-gray-100 dark:bg-gray-700 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-600'}`}>
                    {p === 'high' ? '🔥 高' : p === 'medium' ? '⚡ 中' : '🌱 低'}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">标签</label>
              <input type="text" value={tag} onChange={(e) => setTag(e.target.value)} placeholder="如：健康、工作" className="input" maxLength={20} />
            </div>
          </div>

          {/* 第二行：生成时间 + 打卡 + 提醒 */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">每日生成时间</label>
              <input type="time" value={generateTime} onChange={(e) => setGenerateTime(e.target.value)} className="input" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">最晚打卡</label>
              <input type="time" value={dueTime} onChange={(e) => setDueTime(e.target.value)} className="input" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">提醒时间</label>
              <input type="time" value={reminderTime} onChange={(e) => setReminderTime(e.target.value)} className="input" />
              <p className="text-[11px] text-gray-400 mt-1">不填不提醒</p>
            </div>
          </div>

          {/* 重复日期 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">重复日期</label>
            <div className="flex gap-1.5">
              {([0, 1, 2, 3, 4, 5, 6] as const).map((d) => {
                const active = weekdays.includes(d)
                return (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setWeekdays((prev) => prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d])}
                    className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${
                      active
                        ? 'bg-indigo-500 text-white shadow-sm'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {WEEKDAY_NAMES[d]}
                  </button>
                )
              })}
            </div>
            <p className="text-[11px] text-gray-400 mt-1.5">
              {weekdays.length === 0 ? '未选择重复日期' : weekdays.length === 7 ? '每天重复' : `每周${weekdays.map((d) => WEEKDAY_NAMES[d as keyof typeof WEEKDAY_NAMES]).join('、')}重复`}
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">取消</button>
            <button type="submit" disabled={!title.trim()} className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
              style={{ backgroundColor: 'var(--color-primary-500)' }}>
              {isEditing ? '保存修改' : '创建模板'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
