import type { TournamentOverview } from '@/app/stats/types'
import { StatCard } from '@/components/stats/stat-card'
import { PlayerName } from '@/components/stats/player-name'

interface PlayerLeaderboardProps {
  players: TournamentOverview['playerLeaderboard']
}

const categoryEmojis: Record<string, string> = {
  awards: '🏆',
  fideFunAwards: '🎖️',
  funStats: '🎯',
  analysis: '🔬',
  timeAwards: '⏱️'
}

const categoryLabels: Record<string, string> = {
  awards: 'Tournament',
  fideFunAwards: 'FIDE',
  funStats: 'Fun Stats',
  analysis: 'Stockfish',
  timeAwards: 'Time'
}

export function PlayerLeaderboard({ players }: PlayerLeaderboardProps) {
  const top10 = players.slice(0, 10)

  return (
    <StatCard title="🌟 Player Award Leaderboard">
      <div className="space-y-3">
        {top10.map((player, index) => {
          const sortedCategories = Object.entries(player.byCategory)
            .sort(([, a], [, b]) => b - a)

          return (
            <div
              key={player.name}
              className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  {/* Rank */}
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 dark:from-blue-500 dark:to-indigo-500 flex items-center justify-center">
                    <span className="text-white font-bold text-lg">
                      {index === 0 && '🥇'}
                      {index === 1 && '🥈'}
                      {index === 2 && '🥉'}
                      {index > 2 && (index + 1)}
                    </span>
                  </div>

                  {/* Player Info */}
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                      <PlayerName name={player.name} />
                    </div>

                    {/* Category Breakdown */}
                    <div className="flex flex-wrap gap-2 mt-1">
                      {sortedCategories.map(([category, count]) => (
                        <span
                          key={category}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/50 dark:bg-gray-900/50 text-xs text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700"
                          title={categoryLabels[category] || category}
                        >
                          <span>{categoryEmojis[category] || '🏅'}</span>
                          <span>{count}</span>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Total Awards */}
                  <div className="flex-shrink-0 text-right">
                    <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                      {player.totalAwards}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      {player.totalAwards === 1 ? 'award' : 'awards'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        })}

        {players.length === 0 && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            No player awards data available yet
          </div>
        )}
      </div>

      {players.length > 10 && (
        <div className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
          Showing top 10 of {players.length} players
        </div>
      )}
    </StatCard>
  )
}
