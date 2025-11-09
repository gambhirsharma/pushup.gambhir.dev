'use client'

import { useEffect, useState } from 'react'

type LeaderboardEntry = {
  user_id: string
  email: string
  display_name: string | null
  avatar_url: string | null
  count?: number
  total_count?: number
  rank: number
}

export default function DailyLeaderboard() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLeaderboard()
  }, [])

  const fetchLeaderboard = async () => {
    try {
      const response = await fetch('/api/leaderboard?type=daily')
      const data = await response.json()
      setLeaderboard(data.leaderboard || [])
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-white dark:bg-zinc-900 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-black dark:text-white mb-4">
          🏆 Daily Leaderboard
        </h3>
        <div className="text-center py-8 text-zinc-500 dark:text-zinc-500">Loading...</div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-black dark:text-white mb-4">
        🏆 Daily Leaderboard
      </h3>
      <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
        Top performers today
      </p>
      {leaderboard.length === 0 ? (
        <div className="text-center py-8 text-zinc-500 dark:text-zinc-500">
          No entries yet today. Be the first!
        </div>
      ) : (
        <div className="space-y-3">
          {leaderboard.map((entry, index) => (
            <div
              key={entry.user_id}
              className="flex items-center gap-3 p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
            >
              <div className="flex-shrink-0 w-8 text-center">
                {index === 0 && <span className="text-2xl">🥇</span>}
                {index === 1 && <span className="text-2xl">🥈</span>}
                {index === 2 && <span className="text-2xl">🥉</span>}
                {index > 2 && (
                  <span className="text-sm font-semibold text-zinc-600 dark:text-zinc-400">
                    #{entry.rank}
                  </span>
                )}
              </div>
              {entry.avatar_url ? (
                <img
                  src={entry.avatar_url}
                  alt={entry.display_name || entry.email}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
                  {(entry.display_name || entry.email).charAt(0).toUpperCase()}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-black dark:text-white truncate">
                  {entry.display_name || entry.email.split('@')[0]}
                </p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                  {entry.count}
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-500">push-ups</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
