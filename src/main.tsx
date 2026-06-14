import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

// 初始化暗黑模式：检查 localStorage 或系统偏好
const initDarkMode = () => {
  const stored = localStorage.getItem('theme')
  if (stored === 'dark' || (!stored && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
}

initDarkMode()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
