import { useState, useEffect, useMemo } from 'react'
import { useTasks } from '../context/TaskContext'
import type { RepeatTemplate, Task, TaskFormData } from '../types/task'
import TaskCard from '../components/TaskCard'
import TaskDetailPanel from '../components/TaskDetailPanel'
import PendingTemplateCard from '../components/PendingTemplateCard'
import AddTaskModal from '../components/AddTaskModal'
import AddRepeatModal from '../components/AddRepeatModal'
import ConfirmDialog from '../components/ConfirmDialog'
import EmptyState from '../components/EmptyState'

// ==================== 随机鼓励语 ====================

const ENCOURAGEMENTS = [
  '新的一天，继续前进！💪',
  '每一步都算数，加油！🌟',
  '今天的努力是明天的底气。',
  '专注当下，做好每一件小事。',
  '不积跬步，无以至千里。',
  '你比想象中更强大！',
  '今天也是闪闪发光的一天 ✨',
  '保持节奏，稳步前行。',
]

const pickEncouragement = (): string =>
  ENCOURAGEMENTS[Math.floor(Math.random() * ENCOURAGEMENTS.length)]

const getTodayStr = (): string => {
  const d = new Date()
  const weekDays = ['日', '一', '二', '三', '四', '五', '六']
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日 星期${weekDays[d.getDay()]}`
}

// ==================== 组件 ====================

export default function TodayPage() {
  const { tasks, loading: tasksLoading, toggleTask, addTask, addTaskDirect, updateTask, deleteTask, refreshTasks } = useTasks()
  const [templates, setTemplates] = useState<RepeatTemplate[]>([])
  const [templatesLoading, setTemplatesLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isRepeatModalOpen, setIsRepeatModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [editingTemplate, setEditingTemplate] = useState<RepeatTemplate | null>(null)
  const [deleteTargetTask, setDeleteTargetTask] = useState<Task | null>(null)
  const [deleteTargetTemplateId, setDeleteTargetTemplateId] = useState<string | null>(null)
  const [encouragement] = useState(pickEncouragement)
  const [, refresh] = useState(0) // 用于刷新模板列表
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)

  // 加载模板
  useEffect(() => {
    const load = async () => {
      try {
        if (window.electronAPI) {
          setTemplates(await window.electronAPI.loadTemplates())
        }
      } finally {
        setTemplatesLoading(false)
      }
    }
    load()
  }, [refresh])

  const loading = tasksLoading || templatesLoading

  const currentMinutes = new Date().getHours() * 60 + new Date().getMinutes()

  // 统一视图：任务 + 未生成模板
  const { incomplete, completed, pendingTemplates } = useMemo(() => {
    // 已生成的任务（含普通任务和模板生成的）
    const inc = tasks
      .filter((t) => !t.completed)
      .sort((a, b) => {
        const aOverdue = a.dueTime ? (() => { const [h,m] = a.dueTime.split(':').map(Number); return currentMinutes > h*60+m })() : false
        const bOverdue = b.dueTime ? (() => { const [h,m] = b.dueTime.split(':').map(Number); return currentMinutes > h*60+m })() : false
        if (aOverdue && !bOverdue) return -1
        if (!aOverdue && bOverdue) return 1
        return (a.dueTime || '99:99').localeCompare(b.dueTime || '99:99')
      })
    const comp = tasks.filter((t) => t.completed)

    // 有哪些模板今天已经生成了任务
    const generatedTemplateIds = new Set(
      tasks.filter((t) => t.templateId).map((t) => t.templateId!),
    )

    // 未生成的启用模板
    const pending = templates.filter((tmpl) => tmpl.enabled && !generatedTemplateIds.has(tmpl.id))

    return { incomplete: inc, completed: comp, pendingTemplates: pending }
  }, [tasks, templates, currentMinutes])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <span className="ml-3 text-sm text-gray-400">加载中…</span>
      </div>
    )
  }

  const hasContent = incomplete.length > 0 || completed.length > 0 || pendingTemplates.length > 0

  return (
    <div className="animate-fade-in">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
            📅 今日计划
          </h2>
          <div className="flex items-baseline gap-3 mt-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">{getTodayStr()}</span>
            <span className="text-sm text-indigo-500 dark:text-indigo-400 font-medium">{encouragement}</span>
          </div>
        </div>
      </div>

      {!hasContent && <EmptyState />}

      {/* 未完成任务 — 网格 */}
      {incomplete.length > 0 && (
        <section className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2 h-2 rounded-full bg-indigo-500" />
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              未完成 &middot; {incomplete.length}
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {incomplete.map((task) => (
              <TaskCard key={task.id} task={task} selected={selectedTask?.id === task.id}
                onToggle={toggleTask}
                onClick={(t) => setSelectedTask(selectedTask?.id === t.id ? null : t)} />
            ))}
          </div>
        </section>
      )}

      {/* 未生成的重复模板 — 网格 */}
      {pendingTemplates.length > 0 && (
        <section className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              暂未开始 &middot; {pendingTemplates.length}
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {pendingTemplates.map((tmpl) => (
              <PendingTemplateCard key={tmpl.id} template={tmpl}
                onEdit={(t) => { setEditingTemplate(t); setIsRepeatModalOpen(true) }}
                onDelete={(id) => setDeleteTargetTemplateId(id)} />
            ))}
          </div>
        </section>
      )}

      {/* 已完成任务 — 网格 */}
      {completed.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2 h-2 rounded-full bg-green-500" />
            <h3 className="text-sm font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
              已完成 &middot; {completed.length}
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {completed.map((task) => (
              <TaskCard key={task.id} task={task} selected={selectedTask?.id === task.id}
                onToggle={toggleTask}
                onClick={(t) => setSelectedTask(selectedTask?.id === t.id ? null : t)} />
            ))}
          </div>
        </section>
      )}

      {/* 详情面板 */}
      {selectedTask && (
        <div className="mt-6">
          <TaskDetailPanel
            task={selectedTask}
            onToggle={toggleTask}
            onEdit={(t) => { setEditingTask(t); setIsModalOpen(true) }}
            onDelete={(t) => setDeleteTargetTask(t)}
            onClose={() => setSelectedTask(null)}
          />
        </div>
      )}

      <AddTaskModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingTask(null) }}
        onSave={(data: TaskFormData) => {
          if (editingTask) {
            updateTask({ ...editingTask, ...data })
          } else {
            addTask(data)
          }
        }}
        task={editingTask}
      />
      <AddRepeatModal
        isOpen={isRepeatModalOpen}
        onClose={() => { setIsRepeatModalOpen(false); setEditingTemplate(null) }}
        onSave={async (data) => {
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
          setIsRepeatModalOpen(false)
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
