import { useState, useEffect, useMemo } from 'react'
import { useTasks } from '../context/TaskContext'
import type { RepeatTemplate, Task, TaskFormData } from '../types/task'
import TaskCard from '../components/TaskCard'
import PendingTemplateCard from '../components/PendingTemplateCard'
import AddTaskModal from '../components/AddTaskModal'
import ConfirmDialog from '../components/ConfirmDialog'

export default function AllTasksPage() {
  const { tasks, loading: tasksLoading, toggleTask, updateTask, deleteTask } = useTasks()
  const [templates, setTemplates] = useState<RepeatTemplate[]>([])
  const [templatesLoading, setTemplatesLoading] = useState(true)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [deleteTargetTask, setDeleteTargetTask] = useState<Task | null>(null)

  useEffect(() => {
    (async () => {
      try { if (window.electronAPI) setTemplates(await window.electronAPI.loadTemplates()) }
      finally { setTemplatesLoading(false) }
    })()
  }, [])

  const loading = tasksLoading || templatesLoading

  const { incomplete, completed, pendingTemplates } = useMemo(() => {
    const inc = tasks.filter((t) => !t.completed)
    const comp = tasks.filter((t) => t.completed)
    const generatedIds = new Set(tasks.filter((t) => t.templateId).map((t) => t.templateId!))
    const pending = templates.filter((tmpl) => tmpl.enabled && !generatedIds.has(tmpl.id))
    return { incomplete: inc, completed: comp, pendingTemplates: pending }
  }, [tasks, templates])

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
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">📋 所有任务</h2>

      {!hasContent && (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">📭</div>
          <p className="text-gray-400 dark:text-gray-500 text-sm">还没有任何任务</p>
        </div>
      )}

      {incomplete.length > 0 && (
        <section className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-2 h-2 rounded-full bg-indigo-500" />
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              未完成 &middot; {incomplete.length}
            </h3>
          </div>
          {incomplete.map((task) => (
            <TaskCard key={task.id} task={task} onToggle={toggleTask}
              onEdit={(t) => setEditingTask(t)}
              onDelete={(t) => setDeleteTargetTask(t)} />
          ))}
        </section>
      )}

      {pendingTemplates.length > 0 && (
        <section className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              暂未开始 &middot; {pendingTemplates.length}
            </h3>
          </div>
          {pendingTemplates.map((tmpl) => (
            <PendingTemplateCard key={tmpl.id} template={tmpl} />
          ))}
        </section>
      )}

      {completed.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-4">
            <span className="w-2 h-2 rounded-full bg-green-500" />
            <h3 className="text-sm font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
              已完成 &middot; {completed.length}
            </h3>
          </div>
          {completed.map((task) => (
            <TaskCard key={task.id} task={task} onToggle={toggleTask}
              onEdit={(t) => setEditingTask(t)}
              onDelete={(t) => setDeleteTargetTask(t)} />
          ))}
        </section>
      )}

      <AddTaskModal
        isOpen={!!editingTask}
        onClose={() => setEditingTask(null)}
        onSave={(data: TaskFormData) => {
          if (editingTask) { updateTask({ ...editingTask, ...data }); setEditingTask(null) }
        }}
        task={editingTask}
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
          } else {
            deleteTask(deleteTargetTask.id)
          }
          setDeleteTargetTask(null)
        }}
        onCancel={() => setDeleteTargetTask(null)}
      />
    </div>
  )
}
