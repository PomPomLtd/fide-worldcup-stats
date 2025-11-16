import { StatCard } from './stat-card'
import { PlayerName } from './player-name'
import { AwardCard } from './award-card'

interface GamePhasesProps {
  gamePhases: {
    averageOpening: number
    averageMiddlegame: number
    averageEndgame: number
    longestWaitTillCapture: {
      moves: number
      white: string
      black: string
      game: string
      gameId: string | null
    }
    longestMiddlegame: {
      moves: number
      white: string
      black: string
      game: string
      gameId: string | null
    }
    longestEndgame: {
      moves: number
      white: string
      black: string
      game: string
      gameId: string | null
    }
  }
}

export function GamePhases({ gamePhases }: GamePhasesProps) {
  return (
    <StatCard title="⏱️ Game Phases">
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{Math.round(gamePhases.averageOpening)}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Avg Opening</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{Math.round(gamePhases.averageMiddlegame)}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Avg Middlegame</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{Math.round(gamePhases.averageEndgame)}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Avg Endgame</div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <AwardCard gameId={gamePhases.longestWaitTillCapture.gameId} className="bg-blue-50 dark:bg-blue-900/20">
          <div className="font-semibold text-blue-900 dark:text-blue-300 mb-1">Longest Wait Till First Capture</div>
          <div className="text-sm text-gray-700 dark:text-gray-300"><PlayerName name={gamePhases.longestWaitTillCapture.game} /></div>
          <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">{gamePhases.longestWaitTillCapture.moves} moves</div>
        </AwardCard>
        <AwardCard gameId={gamePhases.longestMiddlegame.gameId} className="bg-purple-50 dark:bg-purple-900/20">
          <div className="font-semibold text-purple-900 dark:text-purple-300 mb-1">Longest Middlegame</div>
          <div className="text-sm text-gray-700 dark:text-gray-300"><PlayerName name={gamePhases.longestMiddlegame.game} /></div>
          <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">{gamePhases.longestMiddlegame.moves} moves</div>
        </AwardCard>
        <AwardCard gameId={gamePhases.longestEndgame.gameId} className="bg-green-50 dark:bg-green-900/20">
          <div className="font-semibold text-green-900 dark:text-green-300 mb-1">Longest Endgame</div>
          <div className="text-sm text-gray-700 dark:text-gray-300"><PlayerName name={gamePhases.longestEndgame.game} /></div>
          <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">{gamePhases.longestEndgame.moves} moves</div>
        </AwardCard>
      </div>
    </StatCard>
  )
}
