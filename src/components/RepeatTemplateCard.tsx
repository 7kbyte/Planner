import type { RepeatTemplate } from '../types/task'
import { PRIORITY_CONFIG, WEEKDAY_NAMES } from '../types/task'

interface Props {
  template: RepeatTemplate
  onToggle: (id: string) => void
  onEdit: (template: RepeatTemplate) => void
  onDelete: (id: string) => void
}

export default function RepeatTemplateCard({ template, onToggle, onEdit, onDelete }: Props) {
  const { id, title, description, priority, dueTime, generateTime, tag, weekdays, enabled, lastGeneratedDate } = template

  const generatedToday = lastGeneratedDate === new Date().toISOString().slice(0, 10)

  const weekdaysLabel = weekdays.length === 0 ? '未设置'
    : weekdays.length === 7 ? '每天'
    : weekdays.map((d) => WEEKDAY_NAMES[d as keyof typeof WEEKDAY_NAMES]).join('、')

  return (
    <div
      className={`
        bg-white dark:bg-gray-800 rounded-xl p-4
        ring-1 ring-gray-200/60 dark:ring-gray-700/60
        transition-all duration-200
        ${!enabled ? 'opacity-50' : 'hover:shadow-sm'}
      `}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-[15px] font-medium text-gray-900 dark:text-gray-100">{title}</h3>
            <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold ${PRIORITY_CONFIG[priority].color}`}>
              {PRIORITY_CONFIG[priority].label}
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
              🔁 {weekdaysLabel}
            </span>
          </div>

          {description && <p className="mt-1 text-[13px] text-gray-500 dark:text-gray-400">{description}</p>}

          <div className="mt-2 flex items-center gap-3 flex-wrap text-xs text-gray-400">
            <span>⏰ 生成 {generateTime}</span>
            {dueTime && <span>📌 打卡截止 {dueTime}</span>}
            {generatedToday && <span className="text-green-500">✅ 今日已生成</span>}
            {tag && <span className="text-indigo-500">#{tag}</span>}
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button onClick={() => onEdit(template)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors" title="编辑">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={() => onToggle(id)}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
              enabled
                ? 'bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400 hover:bg-green-100'
                : 'bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500 hover:bg-gray-200'
            }`}
          >
            {enabled ? '启用' : '已停'}
          </button>
          <button
            onClick={() => onDelete(id)}
            className="p-1 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
