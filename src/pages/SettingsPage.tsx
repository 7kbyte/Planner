import { useState, useCallback } from 'react'
import { THEME_PRESETS, applyTheme, saveTheme, loadTheme, type ThemeColorName } from '../services/theme'
import ColorPicker from '../components/ColorPicker'
import { SunIcon, MoonIcon, BellIcon } from '@heroicons/react/24/outline'

export default function SettingsPage() {
  const [themeColor, setThemeColor] = useState<ThemeColorName>(loadTheme)
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'))

  const handleColorChange = (name: ThemeColorName) => {
    setThemeColor(name)
    applyTheme(name)
    saveTheme(name)
  }

  const toggleDark = useCallback(() => {
    setIsDark((prev) => {
      const next = !prev
      document.documentElement.classList.toggle('dark', next)
      localStorage.setItem('theme', next ? 'dark' : 'light')
      return next
    })
  }, [])

  const sendTestNotification = () => {
    window.electronAPI?.sendTestNotification()
  }

  return (
    <div className="animate-fade-in">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">⚙️ 设置</h2>

      <div className="space-y-6">
        {/* 外观 */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 ring-1 ring-gray-200/60 dark:ring-gray-700/60">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">🌗 外观</h3>
          <button
            onClick={toggleDark}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors w-full"
          >
            {isDark
              ? <><SunIcon className="w-5 h-5" /><span>切换到浅色模式</span></>
              : <><MoonIcon className="w-5 h-5" /><span>切换到暗黑模式</span></>
            }
          </button>
        </div>

        {/* 主题色 */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 ring-1 ring-gray-200/60 dark:ring-gray-700/60">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">🎨 主题色</h3>
          <p className="text-xs text-gray-400 mb-5">选择你喜欢的主色调，应用内按钮、链接和高亮都会使用该颜色。</p>
          <ColorPicker value={themeColor} onChange={handleColorChange} />
          <div className="mt-6 p-4 rounded-xl bg-gray-50 dark:bg-gray-900">
            <p className="text-xs text-gray-400 mb-3">预览效果</p>
            <div className="flex flex-wrap gap-3">
              <button className="px-4 py-2 rounded-xl text-sm font-medium text-white shadow-sm" style={{ backgroundColor: THEME_PRESETS[themeColor].shades[500] }}>主要按钮</button>
              <div className="px-4 py-2 rounded-xl text-sm font-medium" style={{ backgroundColor: THEME_PRESETS[themeColor].shades[50], color: THEME_PRESETS[themeColor].shades[600] }}>标签样式</div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: THEME_PRESETS[themeColor].shades[500] }} />
                <span className="text-xs text-gray-500">指示点</span>
              </div>
            </div>
          </div>
        </div>

        {/* 通知 */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 ring-1 ring-gray-200/60 dark:ring-gray-700/60">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">🔔 通知</h3>
          <p className="text-xs text-gray-400 mb-4">测试桌面通知功能是否正常工作。</p>
          <button
            onClick={sendTestNotification}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors w-full"
          >
            <BellIcon className="w-5 h-5" />
            <span>发送测试通知</span>
          </button>
        </div>

        {/* 关于 */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 ring-1 ring-gray-200/60 dark:ring-gray-700/60">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">ℹ️ 关于</h3>
          <div className="text-xs text-gray-400 space-y-1">
            <p>Daily Planner v1.0.0</p>
            <p>技术栈：Electron + React + TypeScript + Tailwind CSS</p>
            <p>数据存储于本地，安全可靠。</p>
          </div>
        </div>
      </div>
    </div>
  )
}
