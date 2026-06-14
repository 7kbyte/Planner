import { useEffect } from 'react'
import { HashRouter, Routes, Route } from 'react-router-dom'
import { TaskProvider } from './context/TaskContext'
import { applyTheme, loadTheme } from './services/theme'
import Layout from './components/Layout'
import TodayPage from './pages/TodayPage'
import AllTasksPage from './pages/AllTasksPage'
import CompletedPage from './pages/CompletedPage'
import StatisticsPage from './pages/StatisticsPage'
import SettingsPage from './pages/SettingsPage'

export default function App() {
  useEffect(() => {
    applyTheme(loadTheme())
  }, [])

  return (
    <TaskProvider>
      <HashRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<TodayPage />} />
            <Route path="all" element={<AllTasksPage />} />
            <Route path="completed" element={<CompletedPage />} />
            <Route path="statistics" element={<StatisticsPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
        </Routes>
      </HashRouter>
    </TaskProvider>
  )
}
