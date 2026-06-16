import { useMemo } from 'react'
import { useTasks } from '../context/TaskContext'
import { localDateStr } from '../types/task'
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import ContributionHeatmap from '../components/ContributionHeatmap'

export default function StatisticsPage() {
  const { tasks, loading } = useTasks()

  // ===== 连续打卡天数 =====
  const streak = useMemo(() => {
    // 收集所有有完成记录的日期
    const completedDates = new Set<string>()
    for (const t of tasks) {
      if (t.completed && t.completedAt) {
        completedDates.add(t.completedAt.slice(0, 10))
      }
      // 重复任务的 completedDates
      if (t.repeatEnabled && t.repeatConfig) {
        for (const d of t.repeatConfig.completedDates) {
          completedDates.add(d)
        }
      }
    }

    const today = localDateStr()
    // 从昨天开始往回数（今天还没结束，不计入）
    const check = new Date()
    check.setDate(check.getDate() - 1)
    let count = 0
    while (true) {
      const iso = localDateStr(check)
      if (completedDates.has(iso)) {
        count++
        check.setDate(check.getDate() - 1)
      } else {
        break
      }
    }
    // 如果今天也有完成，+1
    if (completedDates.has(today)) count++
    return count
  }, [tasks])

  // ===== 本周完成率 + 每日数据 =====
  const { weeklyRate } = useMemo(() => {
    const totalTasks = tasks.filter(t => !t.repeatEnabled || t.repeatConfig).length
    const completed = tasks.filter(t => t.completed).length
    const rate = totalTasks > 0 ? Math.round((completed / totalTasks) * 100) : 0
    return { weeklyRate: rate }
  }, [tasks])

  // ===== 连续 7 天趋势线数据（完成数 + 完成率） =====
  const trendData = useMemo(() => {
    const days: { label: string; count: number; rate: number }[] = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const iso = localDateStr(d)
      const weekday = d.getDay()

      // 当天总任务数（含重复任务按 weekday 展开）
      let totalForDay = 0
      let completedForDay = 0

      for (const t of tasks) {
        if (t.repeatEnabled && t.repeatConfig) {
          if (t.repeatConfig.weekdays.includes(weekday)) {
            totalForDay++
            if (t.repeatConfig.completedDates.includes(iso)) completedForDay++
          }
        } else if (t.scheduledDate === iso || (!t.scheduledDate && !t.repeatEnabled)) {
          // 一次性任务：当天安排 或 未安排（收件箱中的也算）
          totalForDay++
          if (t.completed && t.completedAt?.slice(0, 10) === iso) completedForDay++
        }
      }

      days.push({
        label: `${d.getMonth() + 1}/${d.getDate()}`,
        count: completedForDay,
        rate: totalForDay > 0 ? Math.round((completedForDay / totalForDay) * 100) : 0,
      })
    }
    return days
  }, [tasks])


  // ===== 环形图数据 =====
  const ringCircumference = 2 * Math.PI * 40
  const ringOffset = ringCircumference - (weeklyRate / 100) * ringCircumference

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-6 h-6 border-2 border-accent-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="animate-fade-in">
      <h2 className="text-2xl font-bold text-warm-800 dark:text-warm-200 mb-6">📊 我的表现</h2>

      {tasks.length === 0 ? (
        <div className="gradient-card flex items-center justify-center py-20">
          <div className="text-center">
            <div className="text-5xl mb-3 animate-float">📊</div>
            <p className="text-sm text-warm-400">还没有任务数据，开始添加吧</p>
          </div>
        </div>
      ) : (
        <div className="space-y-5">
          {/* ===== 第一行：连续打卡 + 完成率环 ===== */}
          <div className="grid grid-cols-2 gap-5">
            {/* 连续打卡 */}
            <div className="gradient-card p-6 flex flex-col items-center justify-center text-center">
              <p className="text-sm text-warm-400 mb-2">连续打卡</p>
              <div className="flex items-baseline gap-1">
                <span className="text-5xl font-bold text-accent-500">{streak}</span>
                <span className="text-lg text-warm-400">天</span>
              </div>
              <p className="mt-2 text-2xl">
                {streak >= 30 ? '🔥🔥🔥' : streak >= 14 ? '🔥🔥' : streak >= 7 ? '🔥' : streak > 0 ? '💪' : '😴'}
              </p>
              {streak === 0 && (
                <p className="text-xs text-warm-400 mt-1">今天开始打卡吧</p>
              )}
            </div>

            {/* 完成率环 */}
            <div className="gradient-card p-6 flex flex-col items-center justify-center text-center">
              <p className="text-sm text-warm-400 mb-2">本周完成率</p>
              <div className="relative w-28 h-28">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" fill="none"
                    className="stroke-warm-200 dark:stroke-warm-700" strokeWidth="10" />
                  <circle cx="50" cy="50" r="40" fill="none"
                    stroke="url(#ringGrad)" strokeWidth="10" strokeLinecap="round"
                    strokeDasharray={`${ringCircumference} ${ringCircumference}`}
                    strokeDashoffset={ringOffset}
                    className="transition-all duration-1000 ease-out" />
                  <defs>
                    <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#8b5cf6" />
                      <stop offset="100%" stopColor="#a78bfa" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold text-accent-600 dark:text-accent-400">{weeklyRate}</span>
                  <span className="text-[11px] text-warm-400">%</span>
                </div>
              </div>
            </div>
          </div>

          {/* ===== 连续 7 天趋势线 ===== */}
          <div className="gradient-card p-5">
            <p className="text-sm font-semibold text-warm-700 dark:text-warm-300 mb-3">📈 近 7 天完成趋势</p>
            <ResponsiveContainer width="100%" height={200}>
              <ComposedChart data={trendData} margin={{ top: 8, right: 12, left: 8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb22" />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#a89988' }} axisLine={false} tickLine={false} />
                <YAxis yAxisId="count" allowDecimals={false} tick={{ fontSize: 11, fill: '#a89988' }} axisLine={false} tickLine={false} width={24} />
                <YAxis yAxisId="rate" orientation="right" domain={[0, 100]} tick={{ fontSize: 11, fill: '#a78bfa' }} axisLine={false} tickLine={false} width={32} unit="%" />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                    fontSize: 13, padding: '8px 12px',
                  }}
                />
                <Bar yAxisId="count" dataKey="count" name="完成数" fill="#8b5cf6" radius={[3, 3, 0, 0]} barSize={18} opacity={0.7} />
                <Line yAxisId="rate" type="monotone" dataKey="rate" name="完成率" stroke="#f59e0b" strokeWidth={2}
                  dot={{ r: 3, fill: '#f59e0b', strokeWidth: 0 }}
                  activeDot={{ r: 5, fill: '#f59e0b', strokeWidth: 2, stroke: '#fff' }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {/* ===== 贡献热力图（近 1 年） ===== */}
          <ContributionHeatmap tasks={tasks} months={12} />
        </div>
      )}
    </div>
  )
}
