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
  player?: string
  players?: string
  captures?: number
  moves?: number
  endgameMoves?: number
  openingMoves?: number
  ratingDifference?: number
  totalMoves?: number
  tiebreakWins?: number
  blitzWins?: number
  squares?: number
  name?: string
  eco?: string
  length?: number
  count?: number
  distance?: number
  attackers?: number
  minClock?: number
  avgTime?: number
  timeSpent?: number
  // Analysis awards
  accuracy?: number
  acpl?: number
  cpLoss?: number
  percentage?: number
  rating?: number
  swing?: number
}

interface AwardConfig {
  key: string
  category: 'awards' | 'fideFunAwards' | 'funStats' | 'timeAwards' | 'analysis'
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
    getPlayers: (a) => ({ name: a.player }),
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
    getValue: (a) => `${a.squares || 0} unique squares visited`,
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
    getValue: (a) => `${a.name || 'Unknown'} (ECO ${a.eco || '?'})`,
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
    getValue: (a) => `${a.length || 0} consecutive checks`,
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
    getValue: (a) => `${a.attackers || 0} attackers on hottest square`,
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
    getValue: (a) => `${a.minClock || 0}s left`,
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
    getValue: (a) => `${(a.avgTime || 0).toFixed(1)}s per move`,
    getPlayers: (a) => ({ white: a.white, black: a.black }),
    borderColor: 'border-cyan-200 dark:border-cyan-800',
    bgColor: 'bg-cyan-50 dark:bg-cyan-900/20',
    textColor: 'text-cyan-900 dark:text-cyan-300'
  },
  {
    key: 'openingSprinter',
    category: 'awards',
    emoji: '🏃‍♂️',
    title: 'Opening Sprinter',
    getValue: (a) => `${a.openingMoves || 0} opening moves`,
    getPlayers: (a) => ({ white: a.white, black: a.black }),
    borderColor: 'border-lime-200 dark:border-lime-800',
    bgColor: 'bg-lime-50 dark:bg-lime-900/20',
    textColor: 'text-lime-900 dark:text-lime-300'
  },
  {
    key: 'tiebreakWarrior',
    category: 'fideFunAwards',
    emoji: '⚔️',
    title: 'Tiebreak Warrior',
    getValue: (a) => `${a.tiebreakWins || 0} tiebreak wins`,
    getPlayers: (a) => ({ name: a.player }),
    borderColor: 'border-red-200 dark:border-red-800',
    bgColor: 'bg-red-50 dark:bg-red-900/20',
    textColor: 'text-red-900 dark:text-red-300'
  },
  {
    key: 'rapidFire',
    category: 'fideFunAwards',
    emoji: '🔥',
    title: 'Rapid Fire Win',
    getValue: (a) => `Won in ${a.moves || 0} moves`,
    getPlayers: (a) => ({ name: a.winner }),
    borderColor: 'border-orange-200 dark:border-orange-800',
    bgColor: 'bg-orange-50 dark:bg-orange-900/20',
    textColor: 'text-orange-900 dark:text-orange-300'
  },
  {
    key: 'blitzWizard',
    category: 'fideFunAwards',
    emoji: '⚡',
    title: 'Blitz Wizard',
    getValue: (a) => `${a.blitzWins || 0} blitz wins`,
    getPlayers: (a) => ({ name: a.player }),
    borderColor: 'border-yellow-200 dark:border-yellow-800',
    bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
    textColor: 'text-yellow-900 dark:text-yellow-300'
  },
  {
    key: 'longestCaptureSequence',
    category: 'funStats',
    emoji: '🎣',
    title: 'Capture Streak',
    getValue: (a) => `${a.length || 0} consecutive captures`,
    getPlayers: (a) => ({ white: a.white, black: a.black }),
    borderColor: 'border-violet-200 dark:border-violet-800',
    bgColor: 'bg-violet-50 dark:bg-violet-900/20',
    textColor: 'text-violet-900 dark:text-violet-300'
  },
  {
    key: 'fastestQueenTrade',
    category: 'funStats',
    emoji: '👑',
    title: 'Early Queen Trade',
    getValue: (a) => `Move ${a.moves || 0}`,
    getPlayers: (a) => ({ white: a.white, black: a.black }),
    borderColor: 'border-fuchsia-200 dark:border-fuchsia-800',
    bgColor: 'bg-fuchsia-50 dark:bg-fuchsia-900/20',
    textColor: 'text-fuchsia-900 dark:text-fuchsia-300'
  },
  {
    key: 'pawnStorm',
    category: 'funStats',
    emoji: '🌪️',
    title: 'Pawn Storm',
    getValue: (a) => `${a.count || 0} advanced pawns`,
    getPlayers: (a) => ({ white: a.white, black: a.black }),
    borderColor: 'border-emerald-200 dark:border-emerald-800',
    bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
    textColor: 'text-emerald-900 dark:text-emerald-300'
  },
  {
    key: 'dadbodShuffler',
    category: 'funStats',
    emoji: '👴',
    title: 'King Wanderer',
    getValue: (a) => `${a.moves || 0} king moves`,
    getPlayers: (a) => ({ white: a.white, black: a.black }),
    borderColor: 'border-stone-200 dark:border-stone-800',
    bgColor: 'bg-stone-50 dark:bg-stone-900/20',
    textColor: 'text-stone-900 dark:text-stone-300'
  },
  {
    key: 'sportyQueen',
    category: 'funStats',
    emoji: '♕',
    title: 'Sporty Queen',
    getValue: (a) => `${a.distance || 0} squares traveled`,
    getPlayers: (a) => ({ white: a.white, black: a.black }),
    borderColor: 'border-purple-200 dark:border-purple-800',
    bgColor: 'bg-purple-50 dark:bg-purple-900/20',
    textColor: 'text-purple-900 dark:text-purple-300'
  },
  {
    key: 'castlingRace',
    category: 'funStats',
    emoji: '🏰',
    title: 'Castling Race',
    getValue: (a) => `Move ${a.moves || 0}`,
    getPlayers: (a) => ({ white: a.white, black: a.black }),
    borderColor: 'border-slate-200 dark:border-slate-800',
    bgColor: 'bg-slate-50 dark:bg-slate-900/20',
    textColor: 'text-slate-900 dark:text-slate-300'
  },
  {
    key: 'longestThink',
    category: 'timeAwards',
    emoji: '🤔',
    title: 'Longest Think',
    getValue: (a) => `${Math.floor((a.timeSpent || 0) / 60)}m ${Math.floor((a.timeSpent || 0) % 60)}s`,
    getPlayers: (a) => ({ name: a.player }),
    borderColor: 'border-gray-200 dark:border-gray-800',
    bgColor: 'bg-gray-50 dark:bg-gray-900/20',
    textColor: 'text-gray-900 dark:text-gray-300'
  },
  {
    key: 'accuracyKing',
    category: 'analysis',
    emoji: '🎯',
    title: 'Accuracy King',
    getValue: (a) => `${a.accuracy || 0}% accuracy`,
    getPlayers: (a) => ({ white: a.white, black: a.black }),
    borderColor: 'border-green-200 dark:border-green-800',
    bgColor: 'bg-green-50 dark:bg-green-900/20',
    textColor: 'text-green-900 dark:text-green-300'
  },
  {
    key: 'biggestBlunder',
    category: 'analysis',
    emoji: '🤦',
    title: 'Biggest Blunder',
    getValue: (a) => `${a.cpLoss || 0} centipawn loss`,
    getPlayers: (a) => ({ white: a.white, black: a.black }),
    borderColor: 'border-red-200 dark:border-red-800',
    bgColor: 'bg-red-50 dark:bg-red-900/20',
    textColor: 'text-red-900 dark:text-red-300'
  },
  {
    key: 'stockfishBuddy',
    category: 'analysis',
    emoji: '🤖',
    title: 'Stockfish Buddy',
    getValue: (a) => `${a.percentage || 0}% engine moves`,
    getPlayers: (a) => ({ white: a.white, black: a.black }),
    borderColor: 'border-blue-200 dark:border-blue-800',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    textColor: 'text-blue-900 dark:text-blue-300'
  },
  {
    key: 'notSoSuperGM',
    category: 'analysis',
    emoji: '😬',
    title: 'Not-So-Super GM',
    getValue: (a) => `${a.rating || 0} rated, ${a.cpLoss || 0}cp blunder`,
    getPlayers: (a) => ({ white: a.white, black: a.black }),
    borderColor: 'border-amber-200 dark:border-amber-800',
    bgColor: 'bg-amber-50 dark:bg-amber-900/20',
    textColor: 'text-amber-900 dark:text-amber-300'
  },
  {
    key: 'comebackKing',
    category: 'analysis',
    emoji: '👑',
    title: 'Comeback King',
    getValue: (a) => `${a.swing || 0}cp swing`,
    getPlayers: (a) => ({ white: a.white, black: a.black }),
    borderColor: 'border-purple-200 dark:border-purple-800',
    bgColor: 'bg-purple-50 dark:bg-purple-900/20',
    textColor: 'text-purple-900 dark:text-purple-300'
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
