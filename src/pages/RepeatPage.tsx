import { useState, useEffect, useCallback } from 'react'
import type { RepeatTemplate, RepeatTemplateFormData } from '../types/task'
import RepeatTemplateCard from '../components/RepeatTemplateCard'
import AddRepeatModal from '../components/AddRepeatModal'

const generateId = (): string => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export default function RepeatPage() {
  const [templates, setTemplates] = useState<RepeatTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        if (window.electronAPI) {
          setTemplates(await window.electronAPI.loadTemplates())
        }
      } catch (err) {
        console.error('[RepeatPage] 加载模板失败:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const toggleEnabled = useCallback(async (id: string) => {
    setTemplates((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t
        const updated = { ...t, enabled: !t.enabled }
        window.electronAPI?.updateTemplate(updated)
        return updated
      }),
    )
  }, [])

  const deleteTemplate = useCallback(async (id: string) => {
    setTemplates((prev) => prev.filter((t) => t.id !== id))
    window.electronAPI?.deleteTemplate(id)
  }, [])

  const addTemplate = useCallback(async (data: RepeatTemplateFormData) => {
    const tmpl: RepeatTemplate = {
      ...data,
      id: generateId(),
      enabled: true,
      createdAt: new Date().toISOString(),
    }
    setTemplates((prev) => [tmpl, ...prev])
    window.electronAPI?.addTemplate(tmpl)
  }, [])

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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">🔄 重复任务</h2>
          <p className="text-xs text-gray-400 mt-1">
            到达生成时间后自动创建今日待办任务
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 rounded-xl text-sm font-medium text-white shadow-sm transition-colors"
          style={{ backgroundColor: 'var(--color-primary-500)' }}
        >
          + 新建模板
        </button>
      </div>

      {templates.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">📋</div>
          <p className="text-gray-400 dark:text-gray-500 text-sm">还没有重复任务模板</p>
          <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">点击右上角按钮创建</p>
        </div>
      ) : (
        <div className="space-y-2">
          {templates.map((tmpl) => (
            <RepeatTemplateCard
              key={tmpl.id}
              template={tmpl}
              onToggle={toggleEnabled}
              onEdit={() => {}}
              onDelete={deleteTemplate}
            />
          ))}
        </div>
      )}

      <AddRepeatModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={addTemplate}
      />
    </div>
  )
}
