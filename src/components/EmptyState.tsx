/** 空状态插画 — 今天没有任务 */
export default function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-in">
      {/* 简约插画 SVG */}
      <svg
        className="w-48 h-48 mb-6 text-gray-200 dark:text-gray-700"
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* 桌面/日历 */}
        <rect x="30" y="50" width="140" height="110" rx="12" stroke="currentColor" strokeWidth="2.5" />
        <rect x="30" y="50" width="140" height="28" rx="12" stroke="currentColor" strokeWidth="2.5" />
        {/* 日历红点 */}
        <circle cx="55" cy="64" r="4" fill="#f43f5e" opacity="0.6" />
        {/* 勾选框 */}
        <rect x="55" y="100" width="90" height="8" rx="4" fill="currentColor" opacity="0.3" />
        <rect x="55" y="120" width="60" height="8" rx="4" fill="currentColor" opacity="0.2" />
        <rect x="55" y="140" width="75" height="8" rx="4" fill="currentColor" opacity="0.15" />
        {/* 完成对勾 */}
        <circle cx="160" cy="104" r="16" stroke="currentColor" strokeWidth="2" opacity="0.4" />
        <path d="M152 104L157 109L168 98" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.3" />
      </svg>

      <h3 className="text-lg font-medium text-gray-400 dark:text-gray-500 mb-2">
        今天没有任务
      </h3>
      <p className="text-sm text-gray-400 dark:text-gray-500 max-w-xs">
        好好休息一下吧 🍵
        <br />
        或者点击右下角的 + 按钮添加新任务。
      </p>
    </div>
  )
}
