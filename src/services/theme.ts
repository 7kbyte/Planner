/** 暗黑模式切换 */

export function toggleDarkMode(): boolean {
  const next = !document.documentElement.classList.contains('dark')
  document.documentElement.classList.toggle('dark', next)
  localStorage.setItem('theme', next ? 'dark' : 'light')
  return next
}

export function loadDarkMode(): boolean {
  const stored = localStorage.getItem('theme')
  if (stored === 'dark') {
    document.documentElement.classList.add('dark')
    return true
  }
  if (stored === 'light') {
    document.documentElement.classList.remove('dark')
    return false
  }
  // 默认跟随系统
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  document.documentElement.classList.toggle('dark', prefersDark)
  return prefersDark
}
