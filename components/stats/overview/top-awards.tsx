import type { TournamentOverview } from '@/app/stats/types'
import { StatCard } from '@/components/stats/stat-card'
import { PlayerName } from '@/components/stats/player-name'

interface TopAwardsProps {
  topAwards: TournamentOverview['topAwards']
}

interface AwardData extends Record<string, unknown> {
  roundNumber: number
  roundName: string
  white?: string
  black?: string
  winner?: string
  players?: string
  captures?: number
  moves?: number
  endgameMoves?: number
  ratingDifference?: number
  totalMoves?: number
  uniqueSquares?: number
  opening?: string
  eco?: string
  consecutiveChecks?: number
  capturedPieces?: number
  timeLeft?: number
  averageMoveTime?: number
}

interface AwardConfig {
  key: string
  category: 'awards' | 'fideFunAwards' | 'funStats' | 'timeAwards'
  emoji: string
  title: string
  getValue: (award: AwardData) => string
  getPlayers: (award: AwardData) => { white?: string; black?: string; name?: string }
  borderColor: string
  bgColor: string
  textColor: string
}

const awardConfigs: AwardConfig[] = [
  {
    key: 'bloodbath',
    category: 'awards',
    emoji: '🩸',
    title: 'Bloodbath',
    getValue: (a) => `${a.captures} captures`,
    getPlayers: (a) => ({ white: a.white, black: a.black }),
    borderColor: 'border-red-200 dark:border-red-800',
    bgColor: 'bg-red-50 dark:bg-red-900/20',
    textColor: 'text-red-900 dark:text-red-300'
  },
  {
    key: 'pacifist',
    category: 'awards',
    emoji: '☮️',
    title: 'Pacifist',
    getValue: (a) => `${a.captures} captures`,
    getPlayers: (a) => ({ white: a.white, black: a.black }),
    borderColor: 'border-green-200 dark:border-green-800',
    bgColor: 'bg-green-50 dark:bg-green-900/20',
    textColor: 'text-green-900 dark:text-green-300'
  },
  {
    key: 'speedDemon',
    category: 'awards',
    emoji: '⚡',
    title: 'Speed Demon',
    getValue: (a) => `${a.moves} moves`,
    getPlayers: (a) => ({ white: a.white, black: a.black }),
    borderColor: 'border-yellow-200 dark:border-yellow-800',
    bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
    textColor: 'text-yellow-900 dark:text-yellow-300'
  },
  {
    key: 'endgameWizard',
    category: 'awards',
    emoji: '🧙',
    title: 'Endgame Wizard',
    getValue: (a) => `${a.endgameMoves} endgame moves`,
    getPlayers: (a) => ({ white: a.white, black: a.black }),
    borderColor: 'border-purple-200 dark:border-purple-800',
    bgColor: 'bg-purple-50 dark:bg-purple-900/20',
    textColor: 'text-purple-900 dark:text-purple-300'
  },
  {
    key: 'giantSlayer',
    category: 'fideFunAwards',
    emoji: '🎯',
    title: 'Giant Slayer',
    getValue: (a) => `+${a.ratingDifference} rating upset`,
    getPlayers: (a) => ({ name: a.winner }),
    borderColor: 'border-orange-200 dark:border-orange-800',
    bgColor: 'bg-orange-50 dark:bg-orange-900/20',
    textColor: 'text-orange-900 dark:text-orange-300'
  },
  {
    key: 'marathonMaster',
    category: 'fideFunAwards',
    emoji: '🏃',
    title: 'Marathon Master',
    getValue: (a) => `${a.totalMoves} total moves`,
    getPlayers: (a) => ({ name: a.players }),
    borderColor: 'border-indigo-200 dark:border-indigo-800',
    bgColor: 'bg-indigo-50 dark:bg-indigo-900/20',
    textColor: 'text-indigo-900 dark:text-indigo-300'
  },
  {
    key: 'squareTourist',
    category: 'funStats',
    emoji: '🗺️',
    title: 'Square Tourist',
    getValue: (a) => `${a.uniqueSquares} unique squares visited`,
    getPlayers: (a) => ({ white: a.white, black: a.black }),
    borderColor: 'border-teal-200 dark:border-teal-800',
    bgColor: 'bg-teal-50 dark:bg-teal-900/20',
    textColor: 'text-teal-900 dark:text-teal-300'
  },
  {
    key: 'openingHipster',
    category: 'funStats',
    emoji: '🎩',
    title: 'Opening Hipster',
    getValue: (a) => `${a.opening} (ECO ${a.eco})`,
    getPlayers: (a) => ({ white: a.white, black: a.black }),
    borderColor: 'border-pink-200 dark:border-pink-800',
    bgColor: 'bg-pink-50 dark:bg-pink-900/20',
    textColor: 'text-pink-900 dark:text-pink-300'
  },
  {
    key: 'longestCheckSequence',
    category: 'funStats',
    emoji: '♔',
    title: 'Check Sequence',
    getValue: (a) => `${a.consecutiveChecks} consecutive checks`,
    getPlayers: (a) => ({ white: a.white, black: a.black }),
    borderColor: 'border-blue-200 dark:border-blue-800',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    textColor: 'text-blue-900 dark:text-blue-300'
  },
  {
    key: 'crosshairs',
    category: 'funStats',
    emoji: '🎯',
    title: 'Crosshairs',
    getValue: (a) => `${a.capturedPieces} pieces captured`,
    getPlayers: (a) => ({ white: a.white, black: a.black }),
    borderColor: 'border-rose-200 dark:border-rose-800',
    bgColor: 'bg-rose-50 dark:bg-rose-900/20',
    textColor: 'text-rose-900 dark:text-rose-300'
  },
  {
    key: 'zeitnotAddict',
    category: 'timeAwards',
    emoji: '⏰',
    title: 'Zeitnot Addict',
    getValue: (a) => `${a.timeLeft}s left`,
    getPlayers: (a) => ({ white: a.white, black: a.black }),
    borderColor: 'border-amber-200 dark:border-amber-800',
    bgColor: 'bg-amber-50 dark:bg-amber-900/20',
    textColor: 'text-amber-900 dark:text-amber-300'
  },
  {
    key: 'bulletSpeed',
    category: 'timeAwards',
    emoji: '💨',
    title: 'Bullet Speed',
    getValue: (a) => `${(a.averageMoveTime || 0).toFixed(1)}s per move`,
    getPlayers: (a) => ({ white: a.white, black: a.black }),
    borderColor: 'border-cyan-200 dark:border-cyan-800',
    bgColor: 'bg-cyan-50 dark:bg-cyan-900/20',
    textColor: 'text-cyan-900 dark:text-cyan-300'
  }
]

export function TopAwards({ topAwards }: TopAwardsProps) {
  return (
    <StatCard title="🏆 Best of the Best - Top Awards Across All Rounds">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {awardConfigs.map((config) => {
          const award = topAwards[config.category]?.[config.key] as AwardData | undefined
          if (!award) return null

          const players = config.getPlayers(award)

          return (
            <div
              key={`${config.category}-${config.key}`}
              className={`border ${config.borderColor} rounded-lg p-4 ${config.bgColor} hover:shadow-md transition-shadow`}
            >
              <div className={`text-sm font-semibold ${config.textColor} mb-2`}>
                {config.emoji} {config.title}
              </div>

              <div className="text-gray-900 dark:text-white text-sm mb-1">
                {players.white && players.black ? (
                  <>
                    <PlayerName name={players.white} /> vs{' '}
                    <PlayerName name={players.black} />
                  </>
                ) : players.name ? (
                  <PlayerName name={players.name} />
                ) : (
                  'Unknown'
                )}
              </div>

              <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                {config.getValue(award)}
              </div>

              {award.roundName && (
                <div className="text-xs text-gray-500 dark:text-gray-500 mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                  {award.roundName}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </StatCard>
  )
}
