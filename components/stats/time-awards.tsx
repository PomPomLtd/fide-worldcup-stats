import { StatCard } from './stat-card'
import { PlayerVs } from './player-name'
import { formatPlayerName } from '@/lib/utils'
import type { TimeAwards as TimeAwardsType } from '@/app/stats/types'

interface TimeAwardsProps {
  timeAwards?: TimeAwardsType | null
}

/**
 * Format time in seconds to MM:SS or HH:MM:SS
 */
function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)

  if (h > 0) {
    return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }
  return `${m}:${s.toString().padStart(2, '0')}`
}

/**
 * Format time control label
 */
function formatTimeControl(tc: string): string {
  const labels: Record<string, string> = {
    'classical': 'Classical',
    'rapidTier1': 'Rapid',
    'rapidTier2': 'Rapid',
    'blitzTier1': 'Blitz',
    'blitzTier2': 'Blitz'
  }
  return labels[tc] || tc
}

/**
 * Award card wrapper component
 */
function AwardCard({
  emoji,
  title,
  player,
  description,
  game,
  color = 'slate'
}: {
  emoji: string
  title: string
  player: string
  description: string
  game?: string
  color?: 'slate' | 'blue' | 'green' | 'amber' | 'red' | 'purple' | 'indigo'
}) {
  const colorClasses = {
    slate: 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/20',
    blue: 'border-blue-200 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/20',
    green: 'border-green-200 dark:border-green-700 bg-green-50 dark:bg-green-900/20',
    amber: 'border-amber-200 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/20',
    red: 'border-red-200 dark:border-red-700 bg-red-50 dark:bg-red-900/20',
    purple: 'border-purple-200 dark:border-purple-700 bg-purple-50 dark:bg-purple-900/20',
    indigo: 'border-indigo-200 dark:border-indigo-700 bg-indigo-50 dark:bg-indigo-900/20'
  }

  return (
    <div className={`border rounded-lg p-4 ${colorClasses[color]}`}>
      <div className="text-sm font-semibold text-gray-900 dark:text-gray-300 mb-2">
        {emoji} {title}
      </div>
      <div className="text-gray-900 dark:text-white font-medium text-sm mb-1">
        {player}
      </div>
      <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
        {description}
      </div>
      {game && (
        <div className="text-xs text-gray-500 dark:text-gray-500 mt-2">
          {game}
        </div>
      )}
    </div>
  )
}

export function TimeAwardsSection({ timeAwards }: TimeAwardsProps) {
  if (!timeAwards) return null

  return (
    <StatCard title="⏱️ Time Awards">
      <div className="text-sm text-gray-600 dark:text-gray-400 mb-6">
        Awards based on time management, pressure performance, and clock mastery
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Longest Think */}
        {timeAwards.longestThink && (
          <AwardCard
            emoji="🤔"
            title="Longest Think"
            player={formatPlayerName(timeAwards.longestThink.player)}
            description={`${formatTime(timeAwards.longestThink.timeSpent)} on move ${Math.floor(timeAwards.longestThink.moveNumber / 2) + 1}. ${timeAwards.longestThink.move}`}
            game={`${formatPlayerName(timeAwards.longestThink.white)} vs ${formatPlayerName(timeAwards.longestThink.black)} (${formatTimeControl(timeAwards.longestThink.timeControl)})`}
            color="indigo"
          />
        )}

        {/* Zeitnot Addict */}
        {timeAwards.zeitnotAddict && (
          <AwardCard
            emoji="⏰"
            title="Zeitnot Addict"
            player={formatPlayerName(timeAwards.zeitnotAddict.player)}
            description={`${timeAwards.zeitnotAddict.count} moves in time pressure, down to ${formatTime(timeAwards.zeitnotAddict.minClock)}`}
            game={`${formatPlayerName(timeAwards.zeitnotAddict.white)} vs ${formatPlayerName(timeAwards.zeitnotAddict.black)} (${formatTimeControl(timeAwards.zeitnotAddict.timeControl)})`}
            color="red"
          />
        )}

        {/* Time Scramble Survivor */}
        {timeAwards.timeScrambleSurvivor && (
          <AwardCard
            emoji="🏆"
            title="Time Scramble Survivor"
            player={formatPlayerName(timeAwards.timeScrambleSurvivor.winner)}
            description={`Won with ${timeAwards.timeScrambleSurvivor.criticalMoves} critical moves, clock at ${formatTime(timeAwards.timeScrambleSurvivor.minClock)}`}
            game={`${formatPlayerName(timeAwards.timeScrambleSurvivor.white)} vs ${formatPlayerName(timeAwards.timeScrambleSurvivor.black)} (${formatTimeControl(timeAwards.timeScrambleSurvivor.timeControl)})`}
            color="green"
          />
        )}

        {/* Bullet Speed */}
        {timeAwards.bulletSpeed && (
          <AwardCard
            emoji="⚡"
            title="Bullet Speed"
            player={formatPlayerName(timeAwards.bulletSpeed.player)}
            description={`Average ${timeAwards.bulletSpeed.avgTime.toFixed(1)}s per move (${timeAwards.bulletSpeed.moveCount} moves)`}
            game={`${formatPlayerName(timeAwards.bulletSpeed.white)} vs ${formatPlayerName(timeAwards.bulletSpeed.black)} (${formatTimeControl(timeAwards.bulletSpeed.timeControl)})`}
            color="blue"
          />
        )}

        {/* Opening Blitzer */}
        {timeAwards.openingBlitzer && (
          <AwardCard
            emoji="📚"
            title="Opening Blitzer"
            player={formatPlayerName(timeAwards.openingBlitzer.player)}
            description={`${timeAwards.openingBlitzer.avgTime.toFixed(1)}s average in opening (${timeAwards.openingBlitzer.moveCount} moves)`}
            game={`${formatPlayerName(timeAwards.openingBlitzer.white)} vs ${formatPlayerName(timeAwards.openingBlitzer.black)} (${formatTimeControl(timeAwards.openingBlitzer.timeControl)})`}
            color="purple"
          />
        )}

        {/* Premove Master */}
        {timeAwards.premoveMaster && (
          <AwardCard
            emoji="🏃"
            title="Premove Master"
            player={formatPlayerName(timeAwards.premoveMaster.player)}
            description={`${timeAwards.premoveMaster.count} instant moves`}
            game={`${formatPlayerName(timeAwards.premoveMaster.white)} vs ${formatPlayerName(timeAwards.premoveMaster.black)} (${formatTimeControl(timeAwards.premoveMaster.timeControl)})`}
            color="amber"
          />
        )}

        {/* Tiebreak Pressure King */}
        {timeAwards.tiebreakPressureKing && (
          <AwardCard
            emoji="🔥"
            title="Tiebreak Pressure King"
            player={formatPlayerName(timeAwards.tiebreakPressureKing.player)}
            description={`${timeAwards.tiebreakPressureKing.criticalWins} critical tiebreak wins, lowest ${formatTime(timeAwards.tiebreakPressureKing.minClock)}`}
            game={`${timeAwards.tiebreakPressureKing.tiebreakWins} total tiebreak wins`}
            color="red"
          />
        )}

        {/* Classical Time Burner */}
        {timeAwards.classicalTimeBurner && (
          <AwardCard
            emoji="📉"
            title="Classical Time Burner"
            player={formatPlayerName(timeAwards.classicalTimeBurner.player)}
            description={`Finished with ${formatTime(timeAwards.classicalTimeBurner.finalClock)} after ${timeAwards.classicalTimeBurner.totalMoves} moves`}
            game={`${formatPlayerName(timeAwards.classicalTimeBurner.white)} vs ${formatPlayerName(timeAwards.classicalTimeBurner.black)} (Classical)`}
            color="slate"
          />
        )}

        {/* Increment Farmer */}
        {timeAwards.incrementFarmer && (
          <AwardCard
            emoji="🌾"
            title="Increment Farmer"
            player={formatPlayerName(timeAwards.incrementFarmer.player)}
            description={`Net ${timeAwards.incrementFarmer.netTime >= 0 ? '+' : ''}${formatTime(Math.abs(timeAwards.incrementFarmer.netTime))} (${formatTime(timeAwards.incrementFarmer.incrementGained)} gained)`}
            game={`${formatPlayerName(timeAwards.incrementFarmer.white)} vs ${formatPlayerName(timeAwards.incrementFarmer.black)} (Classical)`}
            color="green"
          />
        )}

        {/* Time Control Specialist */}
        {timeAwards.timeControlSpecialist && (
          <AwardCard
            emoji="🎯"
            title="Time Control Specialist"
            player={formatPlayerName(timeAwards.timeControlSpecialist.player)}
            description={`Best time management in ${timeAwards.timeControlSpecialist.specialist} (${timeAwards.timeControlSpecialist.stats[timeAwards.timeControlSpecialist.specialist].games} games, avg ${formatTime(timeAwards.timeControlSpecialist.stats[timeAwards.timeControlSpecialist.specialist].avgFinalClock)} remaining)`}
            game={(() => {
              const stats = timeAwards.timeControlSpecialist.stats;
              const parts = [];
              if (stats.classical.games > 0) parts.push(`Classical: ${stats.classical.games}`);
              if (stats.rapid.games > 0) parts.push(`Rapid: ${stats.rapid.games}`);
              if (stats.blitz.games > 0) parts.push(`Blitz: ${stats.blitz.games}`);
              return parts.join(', ') || 'Multiple time controls';
            })()}
            color="indigo"
          />
        )}
      </div>
    </StatCard>
  )
}
