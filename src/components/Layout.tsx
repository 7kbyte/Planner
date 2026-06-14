import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'

export default function Layout() {
  const location = useLocation()
  const isStatistics = location.pathname === '/statistics'

  return (
    <div className="flex min-h-screen bg-white dark:bg-gray-800 transition-colors duration-300">
      {/* 左侧边栏 */}
      <Sidebar />

      {/* 右侧内容区 */}
      <main className="flex-1 overflow-y-auto">
        <div
          className={`
            mx-auto px-6 sm:px-8 py-8
            ${isStatistics ? 'max-w-6xl' : 'max-w-3xl'}
          `}
        >
          <Outlet />
        </div>
      </main>
    </div>
  )
}
