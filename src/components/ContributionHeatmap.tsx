import React, { useMemo } from 'react'
import type { Task } from '../types/task'
import { localDateStr } from '../types/task'

// ==================== 类型 ====================

interface HeatmapDay {
  date: string       // ISO "2026-06-15"
  dayOfWeek: number  // 0=Sun ... 6=Sat
  weekIndex: number  // 第几周（相对于最早日期）
  count: number
  level: 0 | 1 | 2 | 3 | 4
  label: string      // "6月15日"
}

interface ContributionHeatmapProps {
  tasks: Task[]
  months?: number // 默认 3 个月
}

// ==================== 工具函数 ====================

function getColorClass(level: number, isToday: boolean): string {
  if (level === 0) {
    return isToday
      ? 'bg-warm-200 dark:bg-warm-700 ring-2 ring-accent-400'
      : 'bg-warm-100 dark:bg-warm-800'
  }
  const colors = [
    '',
    'bg-accent-200 dark:bg-accent-900',
    'bg-accent-300 dark:bg-accent-700',
    'bg-accent-400 dark:bg-accent-600',
    'bg-accent-500 dark:bg-accent-500',
  ]
  return `${colors[level]} ${isToday ? 'ring-2 ring-accent-400' : ''}`
}

// ==================== 组件 ====================

export default function ContributionHeatmap({ tasks, months = 3 }: ContributionHeatmapProps) {
  const { grid, monthLabels, weekDayLabels, maxCount, todayISO } = useMemo(() => {
    const today = new Date()
    const todayISO = localDateStr()

    // 日期范围：过去 3 个月
    const startDate = new Date(today)
    startDate.setMonth(startDate.getMonth() - months)
    startDate.setDate(startDate.getDate() - (startDate.getDay())) // 对齐到周日

    const endDate = new Date(today)
    endDate.setDate(endDate.getDate() + (6 - endDate.getDay())) // 对齐到周六

    // 统计每天完成任务数
    const countMap = new Map<string, number>()
    for (const task of tasks) {
      if (!task.completed || !task.completedAt) continue
      const dateKey = task.completedAt.slice(0, 10)
      countMap.set(dateKey, (countMap.get(dateKey) ?? 0) + 1)
    }

    // 构建网格数据
    const days: HeatmapDay[] = []
    let max = 0
    const d = new Date(startDate)
    while (d <= endDate) {
      const iso = localDateStr(d)
      const count = countMap.get(iso) ?? 0
      if (count > max) max = count

      // 计算 level (0-4)
      let level: 0 | 1 | 2 | 3 | 4 = 0
      if (count > 0) {
        if (count >= 8) level = 4
        else if (count >= 5) level = 3
        else if (count >= 3) level = 2
        else level = 1
      }

      days.push({
        date: iso,
        dayOfWeek: d.getDay(),
        weekIndex: Math.floor((d.getTime() - startDate.getTime()) / (7 * 86400000)),
        count,
        level,
        label: `${d.getMonth() + 1}月${d.getDate()}日`,
      })
      d.setDate(d.getDate() + 1)
    }

    // 按列组织（每周一列）
    const totalWeeks = Math.ceil(days.length / 7)
    const grid: (HeatmapDay | null)[][] = Array.from({ length: 7 }, () =>
      Array.from({ length: totalWeeks }, () => null),
    )

    for (const day of days) {
      grid[day.dayOfWeek][day.weekIndex] = day
    }

    // 月份标签
    const monthLabels: { label: string; colStart: number }[] = []
    let lastMonth = -1
    for (let col = 0; col < totalWeeks; col++) {
      const cell = grid[0][col] ?? grid[1][col] ?? grid[6][col]
      if (!cell) continue
      const month = parseInt(cell.date.slice(5, 7), 10)
      if (month !== lastMonth) {
        monthLabels.push({ label: `${month}月`, colStart: col })
        lastMonth = month
      }
    }

    return {
      grid,
      monthLabels,
      weekDayLabels: ['日', '一', '二', '三', '四', '五', '六'],
      todayISO,
      maxCount: max,
    }
  }, [tasks, months])

  return (
    <div className="gradient-card p-5">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-semibold text-warm-700 dark:text-warm-300">
          📅 完成热力图（近{months}个月）
        </p>
        <span className="text-xs text-warm-400">
          共 {maxCount > 0 ? tasks.filter((t) => t.completed).length : 0} 次完成
        </span>
      </div>

      <div className="overflow-x-auto">
        <div className="inline-grid min-w-max"
          style={{
            gridTemplateColumns: `30px repeat(${grid[0].length}, 14px)`,
            gap: '2px',
          }}>
          {/* 第一行：空 + 月份标签 */}
          <div />
          {(() => {
            const cells: React.ReactNode[] = []
            for (let i = 0; i < monthLabels.length; i++) {
              const span = i < monthLabels.length - 1
                ? monthLabels[i + 1].colStart - monthLabels[i].colStart
                : grid[0].length - monthLabels[i].colStart
              cells.push(
                <div key={`m${i}`} className="text-[11px] text-warm-400 leading-none"
                  style={{ gridColumn: `span ${span}` }}>
                  {monthLabels[i].label}
                </div>
              )
            }
            return cells
          })()}

          {/* 第 2-8 行：星期标签 + 每行所有列的热力图格子 */}
          {grid.map((row, rowIdx) => (
            <React.Fragment key={`r${rowIdx}`}>
              <div className="text-[11px] text-warm-400 h-[14px] flex items-center justify-end leading-none">
                {rowIdx % 2 === 0 ? weekDayLabels[rowIdx] : ''}
              </div>
              {row.map((day, colIdx) =>
                day ? (
                  <div
                    key={`${colIdx}-${rowIdx}`}
                    title={`${day.label}: ${day.count} 个任务完成`}
                    className={`w-[14px] h-[14px] rounded-sm transition-colors duration-200 cursor-pointer hover:ring-2 hover:ring-accent-400 ${getColorClass(day.level, day.date === todayISO)}`}
                  />
                ) : (
                  <div key={`${colIdx}-${rowIdx}`} className="w-[14px] h-[14px]" />
                )
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* 图例 */}
      <div className="flex items-center gap-1.5 mt-3 text-[11px] text-warm-400">
        <span>少</span>
        <div className="w-3.5 h-3.5 rounded-sm bg-warm-100 dark:bg-warm-800" />
        <div className="w-3.5 h-3.5 rounded-sm bg-accent-200 dark:bg-accent-900" />
        <div className="w-3.5 h-3.5 rounded-sm bg-accent-300 dark:bg-accent-700" />
        <div className="w-3.5 h-3.5 rounded-sm bg-accent-400 dark:bg-accent-600" />
        <div className="w-3.5 h-3.5 rounded-sm bg-accent-500 dark:bg-accent-500" />
        <span>多</span>
      </div>
    </div>
  )
}
