import { useState, useEffect } from 'react'
import { NavLink } from 'react-router-dom'

const navItems = [
  { to: '/', label: '今日', icon: '📅' },
  { to: '/week', label: '周视图', icon: '📆' },
  { to: '/all', label: '所有任务', icon: '📋' },
  { to: '/stats', label: '统计', icon: '📊' },
] as const

function useClock() {
  const [now, setNow] = useState(new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])
  return {
    time: now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false }),
    date: now.toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' }),
    weekday: ['日', '一', '二', '三', '四', '五', '六'][now.getDay()],
  }
}

export default function Sidebar() {
  const clock = useClock()

  return (
    <aside className="w-64 h-screen sticky top-0 flex flex-col bg-gradient-to-b from-warm-50 via-white to-accent-50/20 dark:from-warm-950 dark:via-warm-950 dark:to-accent-950/30 border-r border-warm-200/60 dark:border-warm-700/40">
      {/* 标题 */}
      <div className="px-5 pt-6 pb-4">
        <div className="flex items-center gap-2.5">
          <span className="text-2xl">📋</span>
          <div>
            <h1 className="text-base font-bold text-gray-900 dark:text-white">Daily Planner</h1>
            <p className="text-[11px] text-gray-400 dark:text-gray-500">日程 & 待办</p>
          </div>
        </div>
      </div>

      {/* 时钟 */}
      <div className="px-5 pb-4">
        <div className="glass rounded-xl px-3 py-2.5">
          <div className="text-2xl font-mono font-bold text-warm-900 dark:text-warm-100 tracking-wider tabular-nums">
            {clock.time}
          </div>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-[11px] text-gray-500 dark:text-gray-400">{clock.date}</span>
            <span className="text-[11px] px-1.5 py-0.5 rounded-md bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 font-medium">
              周{clock.weekday}
            </span>
          </div>
        </div>
      </div>

      {/* 导航 */}
      <nav className="flex-1 px-3 space-y-0.5">
        {navItems.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'glass shadow-sm text-accent-700 dark:text-accent-300'
                  : 'text-warm-500 dark:text-warm-400 hover:text-warm-700 dark:hover:text-warm-200 hover:bg-warm-100/60 dark:hover:bg-warm-800/40'
              }`
            }
          >
            <span className="w-5 text-center">{icon}</span>
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* 设置 */}
      <div className="p-3">
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
              isActive
                ? 'glass shadow-sm text-accent-700 dark:text-accent-300'
                : 'text-warm-500 dark:text-warm-400 hover:text-warm-700 dark:hover:text-warm-200 hover:bg-warm-100/60 dark:hover:bg-warm-800/40'
            }`
          }
        >
          <span className="w-5 text-center">⚙️</span>
          <span>设置</span>
        </NavLink>
      </div>
    </aside>
  )
}
