import { useEffect } from 'react'
import { HashRouter, Routes, Route } from 'react-router-dom'
import { TaskProvider } from './context/TaskContext'
import { loadDarkMode } from './services/theme'
import Layout from './components/Layout'
import TodayPage from './pages/TodayPage'
import WeekPage from './pages/WeekPage'
import AllTasksPage from './pages/AllTasksPage'
import StatisticsPage from './pages/StatisticsPage'
import SettingsPage from './pages/SettingsPage'

export default function App() {
  useEffect(() => {
    loadDarkMode()
  }, [])

  return (
    <TaskProvider>
      <HashRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<TodayPage />} />
            <Route path="week" element={<WeekPage />} />
            <Route path="all" element={<AllTasksPage />} />
            <Route path="stats" element={<StatisticsPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
        </Routes>
      </HashRouter>
    </TaskProvider>
  )
}
