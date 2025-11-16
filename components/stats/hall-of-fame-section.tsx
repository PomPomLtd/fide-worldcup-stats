import { HallOfFame } from '@/app/stats/overview-types'
import { StatCard } from '../stat-card'
import { PlayerVs, PlayerName } from '../player-name'

interface HallOfFameSectionProps {
  hallOfFame: HallOfFame
}

// Helper function to create clickable award card
function AwardCard({ gameId, className, children }: { gameId?: string | null, className: string, children: React.ReactNode }) {
  const cardClasses = `p-4 ${className} rounded-lg relative group transition-all ${gameId ? 'cursor-pointer hover:ring-2 hover:ring-blue-500 dark:hover:ring-blue-400' : ''}`

  if (!gameId) {
    return <div className={cardClasses}>{children}</div>
  }

  return (
    <a
      href={`https://lichess.org/${gameId}`}
      target="_blank"
      rel="noopener noreferrer"
      className={cardClasses}
    >
      {children}
      <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <svg className="w-4 h-4 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
      </div>
    </a>
  )
}

export function HallOfFameSection({ hallOfFame }: HallOfFameSectionProps) {
  return (
    <StatCard title="🏆 Hall of Fame">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Cleanest Game */}
        {hallOfFame.cleanestGame && (
          <AwardCard gameId={hallOfFame.cleanestGame.gameId} className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700">
            <div className="font-semibold text-green-900 dark:text-green-300 mb-1">💎 Cleanest Game Ever</div>
            <div className="text-sm text-gray-700 dark:text-gray-300">
              <PlayerVs white={hallOfFame.cleanestGame.white} black={hallOfFame.cleanestGame.black} />
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              Round {hallOfFame.cleanestGame.round} • Combined ACPL: <strong>{hallOfFame.cleanestGame.combinedACPL.toFixed(1)}</strong>
            </div>
          </AwardCard>
        )}

        {/* Wildest Game */}
        {hallOfFame.wildestGame && (
          <AwardCard gameId={hallOfFame.wildestGame.gameId} className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700">
            <div className="font-semibold text-purple-900 dark:text-purple-300 mb-1">🎢 Wildest Game Ever</div>
            <div className="text-sm text-gray-700 dark:text-gray-300">
              <PlayerVs white={hallOfFame.wildestGame.white} black={hallOfFame.wildestGame.black} />
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              Round {hallOfFame.wildestGame.round} • Combined ACPL: <strong>{hallOfFame.wildestGame.combinedACPL.toFixed(1)}</strong>
            </div>
          </AwardCard>
        )}

        {/* Biggest Blunder */}
        {hallOfFame.biggestBlunder && (
          <AwardCard gameId={hallOfFame.biggestBlunder.gameId} className="bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 border-2 border-red-400 dark:border-red-600">
            <div className="font-semibold text-red-900 dark:text-red-200 mb-1">💥 Blunder of the Tournament</div>
            <div className="text-sm text-gray-700 dark:text-gray-300">
              <PlayerName name={hallOfFame.biggestBlunder.player === 'white' ? hallOfFame.biggestBlunder.white : hallOfFame.biggestBlunder.black} />
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              Round {hallOfFame.biggestBlunder.round} • Move {hallOfFame.biggestBlunder.moveNumber}. <strong className="font-mono">{hallOfFame.biggestBlunder.move}</strong> • <strong className="text-red-900 dark:text-red-200">{hallOfFame.biggestBlunder.cpLoss} cp</strong>
            </div>
          </AwardCard>
        )}

        {/* Most Accurate */}
        {hallOfFame.mostAccurate && (
          <AwardCard gameId={hallOfFame.mostAccurate.gameId} className="bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 border-2 border-yellow-400 dark:border-yellow-600">
            <div className="font-semibold text-yellow-900 dark:text-yellow-200 mb-1">🎖️ Best Performance Ever</div>
            <div className="text-sm text-gray-700 dark:text-gray-300">
              <PlayerName name={hallOfFame.mostAccurate.player === 'white' ? hallOfFame.mostAccurate.white : hallOfFame.mostAccurate.black} />
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              Round {hallOfFame.mostAccurate.round} • Accuracy: <strong className="text-yellow-900 dark:text-yellow-200">{hallOfFame.mostAccurate.accuracy}%</strong> • ACPL: <strong>{hallOfFame.mostAccurate.acpl}</strong>
            </div>
          </AwardCard>
        )}

        {/* Sportiest Queen */}
        {hallOfFame.sportiestQueen && (
          <AwardCard gameId={hallOfFame.sportiestQueen.gameId} className="bg-pink-50 dark:bg-pink-900/20 border border-pink-200 dark:border-pink-700">
            <div className="font-semibold text-pink-900 dark:text-pink-300 mb-1">👸 Ultra Marathon Queen</div>
            <div className="text-sm text-gray-700 dark:text-gray-300">
              <PlayerName name={hallOfFame.sportiestQueen.color === 'White' ? hallOfFame.sportiestQueen.white : hallOfFame.sportiestQueen.black} />
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              Round {hallOfFame.sportiestQueen.round} • {hallOfFame.sportiestQueen.distance} squares ({hallOfFame.sportiestQueen.distanceCm} cm, {hallOfFame.sportiestQueen.distanceHumanScaleM}m human scale)
            </div>
          </AwardCard>
        )}

        {/* Most Retreats */}
        {hallOfFame.mostRetreats && (
          <AwardCard gameId={hallOfFame.mostRetreats.gameId} className="bg-lime-50 dark:bg-lime-900/20 border border-lime-200 dark:border-lime-700">
            <div className="font-semibold text-lime-900 dark:text-lime-300 mb-1">🐔 Chicken Champion</div>
            <div className="text-sm text-gray-700 dark:text-gray-300">
              <PlayerName name={hallOfFame.mostRetreats.color === 'White' ? hallOfFame.mostRetreats.white : hallOfFame.mostRetreats.black} />
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              Round {hallOfFame.mostRetreats.round} • {hallOfFame.mostRetreats.retreats} retreating moves
            </div>
          </AwardCard>
        )}

        {/* Longest Game */}
        {hallOfFame.longestGame && (
          <AwardCard gameId={hallOfFame.longestGame.gameId} className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-700">
            <div className="font-semibold text-indigo-900 dark:text-indigo-300 mb-1">⏱️ Marathon Match</div>
            <div className="text-sm text-gray-700 dark:text-gray-300">
              <PlayerVs white={hallOfFame.longestGame.white} black={hallOfFame.longestGame.black} />
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              Round {hallOfFame.longestGame.round} • {hallOfFame.longestGame.moves} moves
            </div>
          </AwardCard>
        )}

        {/* Shortest Game */}
        {hallOfFame.shortestGame && (
          <AwardCard gameId={hallOfFame.shortestGame.gameId} className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-700">
            <div className="font-semibold text-orange-900 dark:text-orange-300 mb-1">⚡ Speed Run</div>
            <div className="text-sm text-gray-700 dark:text-gray-300">
              <PlayerVs white={hallOfFame.shortestGame.white} black={hallOfFame.shortestGame.black} />
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              Round {hallOfFame.shortestGame.round} • Only {hallOfFame.shortestGame.moves} moves!
            </div>
          </AwardCard>
        )}

        {/* Longest Check Sequence */}
        {hallOfFame.longestCheckSequence && (
          <AwardCard gameId={hallOfFame.longestCheckSequence.gameId} className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-700">
            <div className="font-semibold text-orange-900 dark:text-orange-300 mb-1">👑 Ultimate King Hunt</div>
            <div className="text-sm text-gray-700 dark:text-gray-300">
              <PlayerVs white={hallOfFame.longestCheckSequence.white} black={hallOfFame.longestCheckSequence.black} />
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              Round {hallOfFame.longestCheckSequence.round} • {hallOfFame.longestCheckSequence.length} checks in a row
            </div>
          </AwardCard>
        )}

        {/* Longest Capture Spree */}
        {hallOfFame.longestCaptureSpree && (
          <AwardCard gameId={hallOfFame.longestCaptureSpree.gameId} className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700">
            <div className="font-semibold text-red-900 dark:text-red-300 mb-1">🔪 Ultimate Capture Spree</div>
            <div className="text-sm text-gray-700 dark:text-gray-300">
              <PlayerVs white={hallOfFame.longestCaptureSpree.white} black={hallOfFame.longestCaptureSpree.black} />
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              Round {hallOfFame.longestCaptureSpree.round} • {hallOfFame.longestCaptureSpree.length} consecutive captures
            </div>
          </AwardCard>
        )}

        {/* Earliest Castling */}
        {hallOfFame.earliestCastling && (
          <AwardCard gameId={hallOfFame.earliestCastling.gameId} className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700">
            <div className="font-semibold text-purple-900 dark:text-purple-300 mb-1">🏁 Speed Castling Record</div>
            <div className="text-sm text-gray-700 dark:text-gray-300">
              <PlayerName name={hallOfFame.earliestCastling.winner === 'white' ? hallOfFame.earliestCastling.white : hallOfFame.earliestCastling.black} />
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              Round {hallOfFame.earliestCastling.round} • Castled on move {hallOfFame.earliestCastling.moves}!
            </div>
          </AwardCard>
        )}

        {/* Biggest Comeback */}
        {hallOfFame.biggestComeback && (
          <AwardCard gameId={hallOfFame.biggestComeback.gameId} className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700">
            <div className="font-semibold text-green-900 dark:text-green-300 mb-1">🎯 Epic Comeback</div>
            <div className="text-sm text-gray-700 dark:text-gray-300">
              <PlayerName name={hallOfFame.biggestComeback.player === 'white' ? hallOfFame.biggestComeback.white : hallOfFame.biggestComeback.black} />
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              Round {hallOfFame.biggestComeback.round} • Swing: <strong className="text-green-900 dark:text-green-200">{hallOfFame.biggestComeback.swing} cp</strong>
            </div>
          </AwardCard>
        )}

        {/* Most Obscure Opening */}
        {hallOfFame.mostObscureOpening && (
          <AwardCard gameId={hallOfFame.mostObscureOpening.gameId} className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700">
            <div className="font-semibold text-blue-900 dark:text-blue-300 mb-1">🎩 Ultimate Opening Hipster</div>
            <div className="text-sm text-gray-700 dark:text-gray-300">
              <PlayerVs white={hallOfFame.mostObscureOpening.white} black={hallOfFame.mostObscureOpening.black} />
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              Round {hallOfFame.mostObscureOpening.round} • {hallOfFame.mostObscureOpening.eco} {hallOfFame.mostObscureOpening.name}
            </div>
          </AwardCard>
        )}

      </div>
    </StatCard>
  )
}
