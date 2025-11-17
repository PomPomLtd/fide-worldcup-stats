import { StatCard } from './stat-card'

interface TacticalStatsSectionProps {
  tactics: {
    totalCaptures: number
    totalPromotions: number
    castling: {
      kingsideCastles: number
      queensideCastles: number
    }
    enPassantGames: Array<{
      white: string
      black: string
      count: number
    }>
  }
}

export function TacticalStatsSection({ tactics }: TacticalStatsSectionProps) {
  // Count total en passant moves
  const totalEnPassant = tactics.enPassantGames.reduce((sum, game) => sum + game.count, 0)

  return (
    <StatCard title="⚔️ Tactical Stats">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center p-4 bg-gray-50 dark:bg-gray-900/20 rounded-lg">
          <div className="text-3xl font-bold text-gray-900 dark:text-white">
            {tactics.totalCaptures}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Total Captures
          </div>
        </div>

        <div className="text-center p-4 bg-gray-50 dark:bg-gray-900/20 rounded-lg">
          <div className="text-3xl font-bold text-gray-900 dark:text-white">
            {tactics.totalPromotions}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Promotions
          </div>
        </div>

        <div className="text-center p-4 bg-gray-50 dark:bg-gray-900/20 rounded-lg">
          <div className="text-3xl font-bold text-gray-900 dark:text-white">
            {tactics.castling.kingsideCastles}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Kingside Castling
          </div>
        </div>

        <div className="text-center p-4 bg-gray-50 dark:bg-gray-900/20 rounded-lg">
          <div className="text-3xl font-bold text-gray-900 dark:text-white">
            {tactics.castling.queensideCastles}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Queenside Castling
          </div>
        </div>
      </div>

      {totalEnPassant > 0 && (
        <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">🎯</span>
            <h4 className="font-semibold text-blue-900 dark:text-blue-300">
              En Passant
            </h4>
          </div>
          <div className="text-sm text-blue-800 dark:text-blue-200">
            {totalEnPassant} en passant capture{totalEnPassant !== 1 ? 's' : ''} in {tactics.enPassantGames.length} game{tactics.enPassantGames.length !== 1 ? 's' : ''}
          </div>
        </div>
      )}
    </StatCard>
  )
}
