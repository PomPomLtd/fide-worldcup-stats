import { StatCard } from './stat-card'
import { PlayerVs } from './player-name'
import { AwardCard } from './award-card'

interface CheckmatesSectionProps {
  checkmates: {
    byPiece: Record<string, number>
    fastest: {
      moves: number
      gameIndex: number
      gameId: string | null
      white: string
      black: string
      winner: string
    } | null
  }
}

export function CheckmatesSection({ checkmates }: CheckmatesSectionProps) {
  return (
    <StatCard title="☠️ Checkmates">
      <div>
        <h4 className="font-semibold text-gray-900 dark:text-white mb-3">By Piece</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
          {Object.entries(checkmates.byPiece)
            .filter(([piece]) => piece !== 'king')
            .map(([piece, count]) => (
            <div key={piece} className="text-center p-2 bg-gray-50 dark:bg-gray-900/20 rounded">
              <div className="font-bold text-gray-900 dark:text-white">{count}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400 capitalize">{piece}</div>
            </div>
          ))}
        </div>
      </div>

      {checkmates.fastest && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AwardCard gameId={checkmates.fastest.gameId} className="bg-red-50 dark:bg-red-900/20">
            <div className="font-semibold text-red-900 dark:text-red-300 mb-1">⚡ Fastest Checkmate</div>
            <div className="text-sm text-gray-700 dark:text-gray-300">
              <PlayerVs white={checkmates.fastest.white} black={checkmates.fastest.black} />
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              {checkmates.fastest.moves} moves • Winner: {checkmates.fastest.winner}
            </div>
          </AwardCard>
        </div>
      )}
    </StatCard>
  )
}
