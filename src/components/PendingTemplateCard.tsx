import type { RepeatTemplate } from '../types/task'
import { PRIORITY_CONFIG, REPEAT_CONFIG } from '../types/task'

interface Props {
  template: RepeatTemplate
  onEdit?: (template: RepeatTemplate) => void
  onDelete?: (id: string) => void
}

export default function PendingTemplateCard({ template, onEdit, onDelete }: Props) {
  const { title, description, priority, dueTime, generateTime, tag, repeat } = template

  return (
    <div className="
      bg-white/60 dark:bg-gray-800/60
      rounded-xl p-4 mb-3
      border-2 border-dashed border-gray-200 dark:border-gray-700
      transition-all duration-200
    ">
      <div className="flex items-start gap-3">
        {/* 时钟图标（不显示复选框） */}
        <div className="shrink-0 w-6 h-6 mt-0.5 rounded-full flex items-center justify-center bg-gray-100 dark:bg-gray-700">
          <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-[15px] font-medium text-gray-400 dark:text-gray-500">
              {title}
            </h3>
            <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold opacity-60 ${PRIORITY_CONFIG[priority].color}`}>
              {PRIORITY_CONFIG[priority].label}
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] bg-purple-50/60 text-purple-400 dark:bg-purple-900/20 dark:text-purple-500">
              {REPEAT_CONFIG[repeat].icon} {REPEAT_CONFIG[repeat].label}
            </span>
          </div>

          {description && (
            <p className="mt-1 text-[13px] text-gray-300 dark:text-gray-600">{description}</p>
          )}

          <div className="mt-2.5 flex items-center gap-3 flex-wrap">
            <span className="inline-flex items-center gap-1 text-xs text-gray-400">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              暂未开始 · 将于 {generateTime} 生成
            </span>
            {dueTime && (
              <span className="text-xs text-gray-400">📌 截止 {dueTime}</span>
            )}
            {tag && <span className="text-xs text-gray-400">#{tag}</span>}
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="shrink-0 flex items-center gap-0.5">
          {onEdit && (
            <button onClick={() => onEdit(template)}
              className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors" title="编辑">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
          )}
          {onDelete && (
            <button onClick={() => onDelete(template.id)}
              className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors" title="删除">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
