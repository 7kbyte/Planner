import { useState, useEffect, useMemo } from 'react'
import { useTasks } from '../context/TaskContext'
import type { RepeatTemplate, Task, TaskFormData, RepeatTemplateFormData } from '../types/task'
import TaskCard from '../components/TaskCard'
import TaskDetailPanel from '../components/TaskDetailPanel'
import PendingTemplateCard from '../components/PendingTemplateCard'
import AddTaskModal from '../components/AddTaskModal'
import AddRepeatModal from '../components/AddRepeatModal'
import ConfirmDialog from '../components/ConfirmDialog'

// ==================== 筛选类型 ====================

type StatusFilter = 'all' | 'incomplete' | 'completed'
type DateFilter = 'all' | 'today' | 'week' | 'month'
type TimeSort = 'none' | 'asc' | 'desc'

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: '全部' },
  { value: 'incomplete', label: '未完成' },
  { value: 'completed', label: '已完成' },
]

const DATE_OPTIONS: { value: DateFilter; label: string }[] = [
  { value: 'all', label: '全部时间' },
  { value: 'today', label: '今天' },
  { value: 'week', label: '本周' },
  { value: 'month', label: '本月' },
]

// ==================== 工具函数 ====================

function matchesDateFilter(task: Task, filter: DateFilter): boolean {
  if (filter === 'all') return true
  const d = new Date(task.createdAt)
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  if (filter === 'today') return d >= today
  const weekStart = new Date(today.getTime() - today.getDay() * 86400000)
  if (filter === 'week') return d >= weekStart
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  if (filter === 'month') return d >= monthStart
  return true
}

// ==================== 组件 ====================

export default function AllTasksPage() {
  const { tasks, loading: tasksLoading, toggleTask, addTask, addTaskDirect, updateTask, deleteTask, refreshTasks } = useTasks()
  const [templates, setTemplates] = useState<RepeatTemplate[]>([])
  const [templatesLoading, setTemplatesLoading] = useState(true)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [deleteTargetTask, setDeleteTargetTask] = useState<Task | null>(null)
  const [deleteTargetTemplateId, setDeleteTargetTemplateId] = useState<string | null>(null)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isAddRepeatModalOpen, setIsAddRepeatModalOpen] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<RepeatTemplate | null>(null)
  const [, refresh] = useState(0)

  // 筛选状态
  const [keyword, setKeyword] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [dateFilter, setDateFilter] = useState<DateFilter>('all')
  const [timeSort, setTimeSort] = useState<TimeSort>('none')

  useEffect(() => {
    (async () => {
      try { if (window.electronAPI) setTemplates(await window.electronAPI.loadTemplates()) }
      finally { setTemplatesLoading(false) }
    })()
  }, [refresh])

  const loading = tasksLoading || templatesLoading

  // 筛选 + 排序
  const { filteredIncomplete, filteredCompleted, pendingTemplates, stats } = useMemo(() => {
    // 按完成状态拆分
    let inc = tasks.filter((t) => !t.completed)
    let comp = tasks.filter((t) => t.completed)

    // 关键字筛选
    if (keyword.trim()) {
      const kw = keyword.trim().toLowerCase()
      inc = inc.filter((t) =>
        t.title.toLowerCase().includes(kw) || (t.description || '').toLowerCase().includes(kw) || (t.tag || '').toLowerCase().includes(kw),
      )
      comp = comp.filter((t) =>
        t.title.toLowerCase().includes(kw) || (t.description || '').toLowerCase().includes(kw) || (t.tag || '').toLowerCase().includes(kw),
      )
    }

    // 日期筛选
    inc = inc.filter((t) => matchesDateFilter(t, dateFilter))
    comp = comp.filter((t) => matchesDateFilter(t, dateFilter))

    // 时间排序
    if (timeSort !== 'none') {
      const byDueTime = (a: Task, b: Task) => {
        const aTime = a.dueTime || '99:99'
        const bTime = b.dueTime || '99:99'
        return timeSort === 'asc' ? aTime.localeCompare(bTime) : bTime.localeCompare(aTime)
      }
      inc = [...inc].sort(byDueTime)
      comp = [...comp].sort(byDueTime)
    }

    // 未生成模板
    const generatedIds = new Set(tasks.filter((t) => t.templateId).map((t) => t.templateId!))
    const pending = templates.filter((tmpl) => tmpl.enabled && !generatedIds.has(tmpl.id))

    const totalMatch = inc.length + comp.length

    return {
      filteredIncomplete: inc,
      filteredCompleted: comp,
      pendingTemplates: pending,
      stats: { incomplete: inc.length, completed: comp.length, pending: pending.length, total: totalMatch },
    }
  }, [tasks, templates, keyword, dateFilter, timeSort])

  // 根据状态筛选决定显示哪些
  const showIncomplete = statusFilter === 'all' || statusFilter === 'incomplete'
  const showCompleted = statusFilter === 'all' || statusFilter === 'completed'

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
      <div className="flex items-end justify-between mb-5">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">📋 所有任务</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => { setEditingTask(null); setIsAddModalOpen(true) }}
            className="px-4 py-2 rounded-xl text-sm font-medium text-white shadow-sm transition-colors"
            style={{ backgroundColor: 'var(--color-primary-500)' }}
          >
            + 添加任务
          </button>
          <button
            onClick={() => { setEditingTemplate(null); setIsAddRepeatModalOpen(true) }}
            className="px-4 py-2 rounded-xl text-sm font-medium border border-dashed border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            🔄 重复模板
          </button>
        </div>
      </div>

      {/* ===== 筛选栏 ===== */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm ring-1 ring-gray-200/60 dark:ring-gray-700/60 p-4 mb-6 space-y-3">
        {/* 第一行：搜索 + 排序 */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="搜索任务标题、描述、标签…"
              className="w-full pl-10 pr-4 py-2 rounded-lg text-sm bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-colors"
            />
            {keyword && (
              <button
                onClick={() => setKeyword('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* 时间排序 */}
          <select
            value={timeSort}
            onChange={(e) => setTimeSort(e.target.value as TimeSort)}
            className="py-2 px-3 rounded-lg text-sm bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-colors"
          >
            <option value="none">⏱ 默认排序</option>
            <option value="asc">⏱ 时间升序</option>
            <option value="desc">⏱ 时间降序</option>
          </select>
        </div>

        {/* 第二行：状态 + 日期 筛选 */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* 状态 */}
          <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-900 rounded-lg p-0.5">
            {STATUS_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setStatusFilter(opt.value)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  statusFilter === opt.value
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <span className="text-gray-300 dark:text-gray-600">|</span>

          {/* 日期范围 */}
          <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-900 rounded-lg p-0.5">
            {DATE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setDateFilter(opt.value)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  dateFilter === opt.value
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* 结果计数 */}
          {(keyword || dateFilter !== 'all') && (
            <span className="text-xs text-gray-400 dark:text-gray-500 ml-auto">
              找到 {stats.total} 项
            </span>
          )}
        </div>
      </div>

      {/* ===== 空结果 ===== */}
      {stats.total === 0 && pendingTemplates.length === 0 && (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">
            {keyword || dateFilter !== 'all' ? '🔍' : '📭'}
          </div>
          <p className="text-gray-400 dark:text-gray-500 text-sm">
            {keyword || dateFilter !== 'all' ? '没有匹配的任务' : '还没有任何任务'}
          </p>
        </div>
      )}

      {/* ===== 未完成任务 ===== */}
      {showIncomplete && filteredIncomplete.length > 0 && (
        <section className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2 h-2 rounded-full bg-indigo-500" />
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              未完成 &middot; {stats.incomplete}
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredIncomplete.map((task) => (
              <TaskCard key={task.id} task={task} selected={selectedTask?.id === task.id}
                onToggle={toggleTask}
                onClick={(t) => setSelectedTask(selectedTask?.id === t.id ? null : t)} />
            ))}
          </div>
        </section>
      )}

      {/* ===== 未生成模板 ===== */}
      {statusFilter !== 'completed' && pendingTemplates.length > 0 && (
        <section className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              暂未开始 &middot; {stats.pending}
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {pendingTemplates.map((tmpl) => (
              <PendingTemplateCard key={tmpl.id} template={tmpl}
                onEdit={(t) => { setEditingTemplate(t); setIsAddRepeatModalOpen(true) }}
                onDelete={(id) => setDeleteTargetTemplateId(id)} />
            ))}
          </div>
        </section>
      )}

      {/* ===== 已完成任务 ===== */}
      {showCompleted && filteredCompleted.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2 h-2 rounded-full bg-green-500" />
            <h3 className="text-sm font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
              已完成 &middot; {stats.completed}
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredCompleted.map((task) => (
              <TaskCard key={task.id} task={task} selected={selectedTask?.id === task.id}
                onToggle={toggleTask}
                onClick={(t) => setSelectedTask(selectedTask?.id === t.id ? null : t)} />
            ))}
          </div>
        </section>
      )}

      {/* ===== 详情面板 ===== */}
      {selectedTask && (
        <div className="mt-6">
          <TaskDetailPanel
            task={selectedTask}
            onToggle={toggleTask}
            onEdit={(t) => setEditingTask(t)}
            onDelete={(t) => setDeleteTargetTask(t)}
            onClose={() => setSelectedTask(null)}
          />
        </div>
      )}

      <AddTaskModal
        isOpen={isAddModalOpen || !!editingTask}
        onClose={() => { setIsAddModalOpen(false); setEditingTask(null) }}
        onSave={(data: TaskFormData) => {
          if (editingTask) {
            updateTask({ ...editingTask, ...data })
          } else {
            addTask(data)
          }
          setIsAddModalOpen(false)
          setEditingTask(null)
        }}
        task={editingTask}
      />

      <AddRepeatModal
        isOpen={isAddRepeatModalOpen || !!editingTemplate}
        onClose={() => { setIsAddRepeatModalOpen(false); setEditingTemplate(null) }}
        onSave={async (data: RepeatTemplateFormData) => {
          if (editingTemplate) {
            const updated = { ...editingTemplate, ...data }
            await window.electronAPI?.updateTemplate(updated)
          } else {
            const tmpl: RepeatTemplate = {
              ...data,
              id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
              enabled: true,
              createdAt: new Date().toISOString(),
            }
            const generatedTask = await window.electronAPI?.addTemplate(tmpl)
            if (generatedTask) {
              addTaskDirect(generatedTask)
            }
          }
          setIsAddRepeatModalOpen(false)
          setEditingTemplate(null)
          refresh((n) => n + 1)
        }}
        template={editingTemplate}
      />

      <ConfirmDialog
        isOpen={!!deleteTargetTask}
        title="确认删除"
        message={
          deleteTargetTask?.templateId
            ? '此任务由重复模板生成，删除模板后将不再自动生成。确定删除模板吗？'
            : '删除后无法恢复，确定要删除这个任务吗？'
        }
        onConfirm={async () => {
          if (!deleteTargetTask) return
          if (deleteTargetTask.templateId) {
            await window.electronAPI?.deleteTemplate(deleteTargetTask.templateId)
            refreshTasks()
            refresh((n) => n + 1)
          } else {
            deleteTask(deleteTargetTask.id)
          }
          setDeleteTargetTask(null)
        }}
        onCancel={() => setDeleteTargetTask(null)}
      />

      <ConfirmDialog
        isOpen={!!deleteTargetTemplateId}
        title="确认删除"
        message="删除后该模板将不再自动生成任务，确定删除吗？"
        onConfirm={async () => {
          if (deleteTargetTemplateId) {
            await window.electronAPI?.deleteTemplate(deleteTargetTemplateId)
            setDeleteTargetTemplateId(null)
            refreshTasks()
            refresh((n) => n + 1)
          }
        }}
        onCancel={() => setDeleteTargetTemplateId(null)}
      />
    </div>
  )
}
