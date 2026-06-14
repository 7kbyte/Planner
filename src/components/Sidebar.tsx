import { NavLink } from 'react-router-dom'
import {
  CalendarDaysIcon,
  QueueListIcon,
  CheckCircleIcon,
  ChartBarIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline'

// ==================== 导航项配置 ====================

const navItems = [
  { to: '/', label: '今日', icon: CalendarDaysIcon },
  { to: '/all', label: '所有任务', icon: QueueListIcon },
  { to: '/completed', label: '已完成', icon: CheckCircleIcon },
  { to: '/statistics', label: '统计分析', icon: ChartBarIcon },
] as const

// ==================== 组件 ====================

export default function Sidebar() {
  return (
    <aside className="
      w-64 h-screen sticky top-0
      flex flex-col
      bg-gray-50 dark:bg-gray-900
      border-r border-gray-200 dark:border-gray-800
      transition-colors duration-300
    ">
      {/* ---- 应用标题 ---- */}
      <div className="px-5 pt-7 pb-5">
        <div className="flex items-center gap-2.5">
          <span className="text-2xl">📋</span>
          <div>
            <h1 className="text-base font-bold text-gray-900 dark:text-white tracking-tight">
              Daily Planner
            </h1>
            <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">
              日常计划管理
            </p>
          </div>
        </div>
      </div>

      {/* ---- 导航链接 ---- */}
      <nav className="flex-1 px-3 space-y-0.5">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
              transition-all duration-200
              ${
                isActive
                  ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm ring-1 ring-gray-200/60 dark:ring-gray-700/60'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100/60 dark:hover:bg-gray-800/60'
              }`
            }
          >
            <Icon className="w-5 h-5 shrink-0" />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* ---- 左下角设置 ---- */}
      <div className="p-3">
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
            transition-all duration-200
            ${
              isActive
                ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm ring-1 ring-gray-200/60 dark:ring-gray-700/60'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100/60 dark:hover:bg-gray-800/60'
            }`
          }
        >
          <Cog6ToothIcon className="w-5 h-5 shrink-0" />
          <span>设置</span>
        </NavLink>
      </div>
    </aside>
  )
}
