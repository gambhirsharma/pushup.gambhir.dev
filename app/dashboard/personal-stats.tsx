'use client'

import { useEffect, useState } from 'react'

type WeekData = {
  day: string
  date: string
  count: number
}

type Stats = {
  today: number
  week: WeekData[]
  total: number
}

export default function PersonalStats() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/pushups/stats')
      const data = await response.json()
      setStats(data)
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-white dark:bg-zinc-900 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-black dark:text-white mb-4">
          📊 Your Stats
        </h3>
        <div className="text-center py-8 text-zinc-500 dark:text-zinc-500">Loading...</div>
      </div>
    )
  }

  if (!stats) {
    return null
  }

  const maxCount = Math.max(...stats.week.map(d => d.count), 1)

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-black dark:text-white mb-4">
        📊 Your Stats
      </h3>
      
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">Today</p>
          <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{stats.today}</p>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">Total</p>
          <p className="text-3xl font-bold text-green-600 dark:text-green-400">{stats.total}</p>
        </div>
      </div>

      <div>
        <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3">This Week</p>
        <div className="flex items-end justify-between gap-2 h-32">
          {stats.week.map((day) => (
            <div key={day.date} className="flex-1 flex flex-col items-center gap-2">
              <div className="w-full flex items-end justify-center h-24">
                <div
                  className="w-full bg-blue-500 dark:bg-blue-600 rounded-t transition-all hover:bg-blue-600 dark:hover:bg-blue-500"
                  style={{
                    height: `${(day.count / maxCount) * 100}%`,
                    minHeight: day.count > 0 ? '4px' : '0px'
                  }}
                  title={`${day.count} push-ups`}
                />
              </div>
              <div className="text-center">
                <p className="text-xs font-medium text-zinc-700 dark:text-zinc-300">{day.day}</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-500">{day.count}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {stats.today === 0 && (
        <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <p className="text-sm text-yellow-800 dark:text-yellow-300">
            💪 You haven't logged any push-ups today. Start your workout!
          </p>
        </div>
      )}
    </div>
  )
}
