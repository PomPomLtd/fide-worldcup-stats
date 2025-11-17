import type { TournamentOverview } from '@/app/stats/types'
import { StatCard } from '@/components/stats/stat-card'
import { PlayerName } from '@/components/stats/player-name'

interface HallOfFameProps {
  hallOfFame: TournamentOverview['hallOfFame']
  overall: TournamentOverview['overall']
}

export function HallOfFame({ hallOfFame, overall }: HallOfFameProps) {
  return (
    <StatCard title="🏆 Tournament Hall of Fame">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Longest Game */}
        {overall.longestGame && (
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 rounded-lg p-6 border border-purple-200 dark:border-purple-800">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-100">
                  Longest Game
                </h3>
                <p className="text-3xl font-bold text-purple-600 dark:text-purple-400 mt-2">
                  {overall.longestGame.moves} moves
                </p>
                <div className="mt-3 space-y-1 text-sm">
                  <p className="text-gray-700 dark:text-gray-300">
                    <PlayerName name={overall.longestGame.white} /> vs{' '}
                    <PlayerName name={overall.longestGame.black} />
                  </p>
                  <p className="text-gray-600 dark:text-gray-400">
                    Round {overall.longestGame.roundNumber} • {overall.longestGame.result}
                  </p>
                </div>
              </div>
              <span className="text-4xl">♟️</span>
            </div>
          </div>
        )}

        {/* Shortest Game */}
        {overall.shortestGame && (
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 rounded-lg p-6 border border-amber-200 dark:border-amber-800">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-amber-900 dark:text-amber-100">
                  Shortest Game
                </h3>
                <p className="text-3xl font-bold text-amber-600 dark:text-amber-400 mt-2">
                  {overall.shortestGame.moves} moves
                </p>
                <div className="mt-3 space-y-1 text-sm">
                  <p className="text-gray-700 dark:text-gray-300">
                    <PlayerName name={overall.shortestGame.white} /> vs{' '}
                    <PlayerName name={overall.shortestGame.black} />
                  </p>
                  <p className="text-gray-600 dark:text-gray-400">
                    Round {overall.shortestGame.roundNumber} • {overall.shortestGame.result}
                  </p>
                </div>
              </div>
              <span className="text-4xl">⚡</span>
            </div>
          </div>
        )}

        {/* Biggest Upset */}
        {hallOfFame.biggestUpset && (
          <div className="bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-950/30 dark:to-rose-950/30 rounded-lg p-6 border border-red-200 dark:border-red-800">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-red-900 dark:text-red-100">
                  Biggest Upset
                </h3>
                <p className="text-3xl font-bold text-red-600 dark:text-red-400 mt-2">
                  +{hallOfFame.biggestUpset.ratingDiff} Elo
                </p>
                <div className="mt-3 space-y-1 text-sm">
                  <p className="text-gray-700 dark:text-gray-300">
                    <PlayerName name={hallOfFame.biggestUpset.winner} /> ({hallOfFame.biggestUpset.winnerRating}) defeated{' '}
                    <PlayerName name={hallOfFame.biggestUpset.loser} /> ({hallOfFame.biggestUpset.loserRating})
                  </p>
                  <p className="text-gray-600 dark:text-gray-400">
                    Round {hallOfFame.biggestUpset.roundNumber}
                  </p>
                </div>
              </div>
              <span className="text-4xl">🎯</span>
            </div>
          </div>
        )}

        {/* Piece Cemetery */}
        <div className="bg-gradient-to-br from-gray-50 to-slate-50 dark:from-gray-950/30 dark:to-slate-950/30 rounded-lg p-6 border border-gray-200 dark:border-gray-800">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Piece Cemetery
              </h3>
              <p className="text-3xl font-bold text-gray-600 dark:text-gray-400 mt-2">
                {overall.piecesCaptured.total.toLocaleString()}
              </p>
              <div className="mt-3 grid grid-cols-5 gap-2 text-center text-xs">
                <div>
                  <div className="text-lg">♟️</div>
                  <div className="text-gray-600 dark:text-gray-400">{overall.piecesCaptured.pawns}</div>
                </div>
                <div>
                  <div className="text-lg">♞</div>
                  <div className="text-gray-600 dark:text-gray-400">{overall.piecesCaptured.knights}</div>
                </div>
                <div>
                  <div className="text-lg">♝</div>
                  <div className="text-gray-600 dark:text-gray-400">{overall.piecesCaptured.bishops}</div>
                </div>
                <div>
                  <div className="text-lg">♜</div>
                  <div className="text-gray-600 dark:text-gray-400">{overall.piecesCaptured.rooks}</div>
                </div>
                <div>
                  <div className="text-lg">♛</div>
                  <div className="text-gray-600 dark:text-gray-400">{overall.piecesCaptured.queens}</div>
                </div>
              </div>
            </div>
            <span className="text-4xl">⚰️</span>
          </div>
        </div>
      </div>
    </StatCard>
  )
}
