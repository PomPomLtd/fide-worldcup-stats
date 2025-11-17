import { StatCard } from './stat-card'

interface PieceActivitySectionProps {
  pieces: {
    activity: {
      pawns: number
      knights: number
      bishops: number
      rooks: number
      queens: number
      kings: number
    }
    captured: {
      pawns: number
      knights: number
      bishops: number
      rooks: number
      queens: number
    }
  }
}

const PIECE_LABELS: Record<string, string> = {
  pawns: 'Pawn moves',
  knights: 'Knight moves',
  bishops: 'Bishop moves',
  rooks: 'Rook moves',
  queens: 'Queen moves',
  kings: 'King moves'
}

export function PieceActivitySection({ pieces }: PieceActivitySectionProps) {
  // Calculate total moves
  const totalMoves = Object.values(pieces.activity).reduce((sum, moves) => sum + moves, 0)

  return (
    <StatCard title="👑 Piece Activity">
      <div className="mb-6">
        <div className="text-sm text-gray-600 dark:text-gray-400 mb-3">
          Total: {totalMoves.toLocaleString()} moves across all games
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {Object.entries(pieces.activity).map(([piece, moves]) => (
            <div key={piece} className="text-center p-3 bg-gray-50 dark:bg-gray-900/20 rounded-lg">
              <div className="text-xl font-bold text-gray-900 dark:text-white">
                {moves.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {PIECE_LABELS[piece]}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
        <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
          Pieces Captured
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {Object.entries(pieces.captured).map(([piece, count]) => (
            <div key={piece} className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <div className="text-xl font-bold text-red-900 dark:text-red-300">
                {count}
              </div>
              <div className="text-sm text-red-700 dark:text-red-400 capitalize">
                {piece}
              </div>
            </div>
          ))}
        </div>
      </div>
    </StatCard>
  )
}
