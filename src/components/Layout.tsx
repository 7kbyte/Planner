import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'

export default function Layout() {
  return (
    <div className="flex min-h-screen bg-warm-50 dark:bg-warm-950 transition-colors duration-500">
      <Sidebar />
      <main className="flex-1 overflow-hidden">
        <div className="h-full px-8 py-6">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
