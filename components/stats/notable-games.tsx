import { StatCard } from './stat-card'
import { PlayerVs } from './player-name'
import { AwardCard } from './award-card'

interface NotableGamesProps {
  overview: {
    longestGame: {
      moves: number
      white: string
      black: string
      result: string
      gameId: string | null
    }
    shortestGame: {
      moves: number
      white: string
      black: string
      result: string
      gameId: string | null
    }
  }
  longestNonCaptureStreak: {
    moves: number
    white: string
    black: string
    gameId: string | null
  }
}

export function NotableGames({ overview, longestNonCaptureStreak }: NotableGamesProps) {
  return (
    <StatCard title="🎯 Notable Games">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <AwardCard gameId={overview.longestGame.gameId} className="bg-purple-50 dark:bg-purple-900/20">
          <div className="font-semibold text-purple-900 dark:text-purple-300 mb-1">Longest Game</div>
          <div className="text-sm text-gray-700 dark:text-gray-300">
            <PlayerVs white={overview.longestGame.white} black={overview.longestGame.black} />
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            {overview.longestGame.moves} moves • Result: {overview.longestGame.result}
          </div>
        </AwardCard>

        <AwardCard gameId={overview.shortestGame.gameId} className="bg-blue-50 dark:bg-blue-900/20">
          <div className="font-semibold text-blue-900 dark:text-blue-300 mb-1">Shortest Game</div>
          <div className="text-sm text-gray-700 dark:text-gray-300">
            <PlayerVs white={overview.shortestGame.white} black={overview.shortestGame.black} />
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            {overview.shortestGame.moves} moves • Result: {overview.shortestGame.result}
          </div>
        </AwardCard>

        <AwardCard gameId={longestNonCaptureStreak.gameId} className="bg-green-50 dark:bg-green-900/20">
          <div className="font-semibold text-green-900 dark:text-green-300 mb-1">Longest Non-Capture Streak</div>
          <div className="text-sm text-gray-700 dark:text-gray-300">
            <PlayerVs white={longestNonCaptureStreak.white} black={longestNonCaptureStreak.black} />
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            {longestNonCaptureStreak.moves} consecutive moves without captures
          </div>
        </AwardCard>
      </div>
    </StatCard>
  )
}
