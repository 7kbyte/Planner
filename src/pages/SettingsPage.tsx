import { useState, useCallback } from 'react'
import { toggleDarkMode, loadDarkMode } from '../services/theme'

export default function SettingsPage() {
  const [isDark, setIsDark] = useState(loadDarkMode)

  const handleToggleDark = useCallback(() => {
    setIsDark(toggleDarkMode())
  }, [])

  return (
    <div className="animate-fade-in">
      <h2 className="text-xl font-bold text-warm-800 dark:text-warm-200 mb-6">⚙️ 设置</h2>

      <div className="space-y-4">
        {/* 外观 */}
        <div className="gradient-card p-5">
          <h3 className="text-sm font-semibold text-warm-700 dark:text-warm-300 mb-4">🌗 外观</h3>
          <button onClick={handleToggleDark}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium
                       glass hover:shadow-md transition-all">
            {isDark
              ? <><span className="text-lg">☀️</span><span className="text-warm-700 dark:text-warm-300">切换到浅色模式</span></>
              : <><span className="text-lg">🌙</span><span className="text-warm-700 dark:text-warm-300">切换到暗黑模式</span></>
            }
          </button>
        </div>

        {/* 通知 */}
        <div className="gradient-card p-5">
          <h3 className="text-sm font-semibold text-warm-700 dark:text-warm-300 mb-4">🔔 通知</h3>
          <p className="text-xs text-warm-400 mb-4">测试桌面通知功能是否正常。</p>
          <button onClick={() => window.electronAPI?.sendTestNotification()}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium
                       glass hover:shadow-md transition-all text-warm-700 dark:text-warm-300">
            <span className="text-lg">🔔</span>
            <span>发送测试通知</span>
          </button>
        </div>

        {/* 关于 */}
        <div className="gradient-card p-5">
          <h3 className="text-sm font-semibold text-warm-700 dark:text-warm-300 mb-3">ℹ️ 关于</h3>
          <div className="text-xs text-warm-400 space-y-1">
            <p>Daily Planner v1.0.0</p>
            <p>Electron + React + TypeScript + Tailwind CSS</p>
            <p>本地存储，无需网络。</p>
          </div>
        </div>
      </div>
    </div>
  )
}
