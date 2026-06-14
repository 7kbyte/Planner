import { useMemo } from 'react'
import { useTasks } from '../context/TaskContext'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import ContributionHeatmap from '../components/ContributionHeatmap'

// ==================== 工具 ====================

const WEEKDAY_NAMES = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']

// ==================== 组件 ====================

export default function StatisticsPage() {
  const { tasks, loading } = useTasks()

  const stats = useMemo(() => {
    const total = tasks.length
    const completed = tasks.filter((t) => t.completed).length
    const incomplete = total - completed
    const rate = total > 0 ? Math.round((completed / total) * 100) : 0

    const byPriority = {
      high: tasks.filter((t) => t.priority === 'high').length,
      medium: tasks.filter((t) => t.priority === 'medium').length,
      low: tasks.filter((t) => t.priority === 'low').length,
    }

    const overdue = tasks.filter((t) => {
      if (!t.dueTime || t.completed) return false
      const [h, m] = t.dueTime.split(':').map(Number)
      const now = new Date()
      return now.getHours() * 60 + now.getMinutes() > h * 60 + m
    }).length

    return { total, completed, incomplete, rate, byPriority, overdue }
  }, [tasks])

  // 本周每日完成数（recharts 柱状图数据）
  const weeklyChartData = useMemo(() => {
    const today = new Date()
    const dayOfWeek = today.getDay() // 0=Sun
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek

    const days: { name: string; count: number; fill: string }[] = []
    for (let i = 0; i < 7; i++) {
      const d = new Date(today)
      d.setDate(d.getDate() + mondayOffset + i)
      const iso = d.toISOString().slice(0, 10)
      const count = tasks.filter(
        (t) => t.completed && t.completedAt?.slice(0, 10) === iso,
      ).length
      const isToday = i === (dayOfWeek === 0 ? 6 : dayOfWeek - 1)
      days.push({
        name: WEEKDAY_NAMES[d.getDay()],
        count,
        fill: isToday ? '#6366f1' : '#a5b4fc', // indigo
      })
    }
    return days
  }, [tasks])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <span className="ml-3 text-sm text-gray-400">加载中…</span>
      </div>
    )
  }

  return (
    <div className="animate-fade-in">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        📊 统计分析
      </h2>

      {tasks.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">📊</div>
          <p className="text-gray-400 dark:text-gray-500 text-sm">
            还没有任务数据，添加任务后查看统计
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {/* ===== 概览卡片 ===== */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-5 text-center ring-1 ring-gray-200/60 dark:ring-gray-700/60">
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
              <p className="text-xs text-gray-400 mt-1">总计</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-5 text-center ring-1 ring-gray-200/60 dark:ring-gray-700/60">
              <p className="text-3xl font-bold text-green-500">{stats.completed}</p>
              <p className="text-xs text-gray-400 mt-1">已完成</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-5 text-center ring-1 ring-gray-200/60 dark:ring-gray-700/60">
              <p className="text-3xl font-bold text-red-500">{stats.overdue}</p>
              <p className="text-xs text-gray-400 mt-1">已过期</p>
            </div>
          </div>

          {/* ===== 完成率 ===== */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-5 ring-1 ring-gray-200/60 dark:ring-gray-700/60">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">完成率</p>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-bold text-indigo-500">{stats.rate}%</span>
              <span className="text-sm text-gray-400 pb-1">
                ({stats.completed}/{stats.total})
              </span>
            </div>
            <div className="w-full h-3 bg-gray-100 dark:bg-gray-700 rounded-full mt-3 overflow-hidden">
              <div
                className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                style={{ width: `${stats.rate}%` }}
              />
            </div>
          </div>

          {/* ===== recharts 本周柱状图 ===== */}
          {stats.completed > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-5 ring-1 ring-gray-200/60 dark:ring-gray-700/60">
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
                📊 本周完成趋势
              </p>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={weeklyChartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 11, fill: '#9ca3af' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fontSize: 11, fill: '#9ca3af' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 10,
                      border: 'none',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      fontSize: 12,
                    }}
                    formatter={(value) => [`${value} 个任务`, '完成数']}
                  />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]} barSize={28}>
                    {weeklyChartData.map((entry, idx) => (
                      <Cell key={idx} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* ===== 贡献热力图 ===== */}
          {stats.completed > 0 && <ContributionHeatmap tasks={tasks} months={3} />}

          {/* ===== 优先级分布 ===== */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-5 ring-1 ring-gray-200/60 dark:ring-gray-700/60">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">优先级分布</p>
            <div className="space-y-2">
              {(['high', 'medium', 'low'] as const).map((p) => {
                const count = stats.byPriority[p]
                const pct = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0
                const color =
                  p === 'high' ? 'bg-red-500' : p === 'medium' ? 'bg-amber-500' : 'bg-green-500'
                const label = p === 'high' ? '🔥 高' : p === 'medium' ? '⚡ 中' : '🌱 低'
                return (
                  <div key={p} className="flex items-center gap-3">
                    <span className="text-xs w-10 text-gray-500">{label}</span>
                    <div className="flex-1 h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${color} rounded-full transition-all duration-500`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-400 w-8 text-right">{count}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
