'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import type { RoundStats } from '@/app/stats/types'
import { formatPlayerName, formatPlayerVs } from '@/lib/utils'
import { TimeAwardsSection } from '@/components/stats/time-awards'
import { AnalysisSection } from '@/components/stats/analysis-section'
import { TacticalStatsSection } from '@/components/stats/tactical-stats-section'
import { PieceActivitySection } from '@/components/stats/piece-activity-section'
import { CheckmatesSection } from '@/components/stats/checkmates-section'
import { OpeningsSection } from '@/components/stats/openings-section'

// Helper to format player rating display
function formatRating(rating: number | null | undefined): string {
  if (!rating) return '';
  return ` (${rating})`;
}

export default function RoundPage() {
  const params = useParams()
  const roundNumber = parseInt(params.roundNumber as string)

  const [stats, setStats] = useState<RoundStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch(`/stats/round-${roundNumber}-stats.json`, {
          cache: 'no-store' // Always fetch fresh data
        })

        if (!response.ok) {
          throw new Error(`Round ${roundNumber} statistics not found`)
        }

        const data: RoundStats = await response.json()
        setStats(data)
      } catch (err) {
        console.error('Error loading round stats:', err)
        setError(err instanceof Error ? err.message : 'Failed to load statistics')
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [roundNumber])

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-700 dark:text-gray-300">Loading Round {roundNumber} statistics...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6">
          <div className="text-red-600 dark:text-red-400 text-xl font-bold mb-4">
            Error Loading Statistics
          </div>
          <p className="text-gray-700 dark:text-gray-300 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  // No data state
  if (!stats) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <p className="text-gray-700 dark:text-gray-300">No statistics available for Round {roundNumber}</p>
      </div>
    )
  }

  // Main content
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <nav className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            <Link href="/" className="hover:text-blue-600 dark:hover:text-blue-400">Home</Link>
            <span className="mx-2">/</span>
            <Link href="/stats/overview" className="hover:text-blue-600 dark:hover:text-blue-400">Overview</Link>
            <span className="mx-2">/</span>
            <span>Round {roundNumber}</span>
          </nav>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            {stats.roundName}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {stats.matchStats.totalMatches} matches • {stats.overview.totalGames} games
          </p>
        </div>

        {/* Quick Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg p-6 shadow-lg">
            <div className="text-sm opacity-90 mb-1">Total Games</div>
            <div className="text-3xl font-bold">{stats.overview.totalGames}</div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-lg p-6 shadow-lg">
            <div className="text-sm opacity-90 mb-1">Total Moves</div>
            <div className="text-3xl font-bold">{stats.overview.totalMoves.toLocaleString()}</div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg p-6 shadow-lg">
            <div className="text-sm opacity-90 mb-1">Avg Game Length</div>
            <div className="text-3xl font-bold">{stats.overview.averageGameLength} moves</div>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-lg p-6 shadow-lg">
            <div className="text-sm opacity-90 mb-1">Opening Coverage</div>
            <div className="text-3xl font-bold">{stats.openings.coverage}%</div>
          </div>
        </div>

        {/* Results Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Results Breakdown</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900 dark:text-white">{stats.results.whiteWins}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">White Wins ({stats.results.whiteWinPercentage}%)</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900 dark:text-white">{stats.results.blackWins}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Black Wins ({stats.results.blackWinPercentage}%)</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900 dark:text-white">{stats.results.draws}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Draws ({stats.results.drawPercentage}%)</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900 dark:text-white">{stats.results.decisivePercentage}%</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Decisive Games</div>
            </div>
          </div>
        </div>

        {/* Match Statistics (FIDE-Specific) - IMPROVED */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">⚔️ Match Statistics</h2>

          {/* Visual breakdown with progress bars */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              How Matches Were Decided
            </h3>

            {/* Classical */}
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  ♟️ Classical (90+30)
                </span>
                <span className="text-sm font-bold text-gray-900 dark:text-white">
                  {stats.matchStats.decidedInClassical} matches ({stats.matchStats.tiebreakAnalysis.classicalDecisiveRate}%)
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                <div
                  className="bg-green-500 h-3 rounded-full transition-all"
                  style={{ width: `${stats.matchStats.tiebreakAnalysis.classicalDecisiveRate}%` }}
                />
              </div>
            </div>

            {/* Rapid Tier 1 */}
            {stats.matchStats.decidedInRapidTier1 > 0 && (
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    ⚡ Rapid Tier 1 (15+10)
                  </span>
                  <span className="text-sm font-bold text-gray-900 dark:text-white">
                    {stats.matchStats.decidedInRapidTier1} matches ({((stats.matchStats.decidedInRapidTier1 / stats.matchStats.totalMatches) * 100).toFixed(1)}%)
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                  <div
                    className="bg-yellow-500 h-3 rounded-full transition-all"
                    style={{ width: `${(stats.matchStats.decidedInRapidTier1 / stats.matchStats.totalMatches * 100)}%` }}
                  />
                </div>
              </div>
            )}

            {/* Rapid Tier 2 */}
            {stats.matchStats.decidedInRapidTier2 > 0 && (
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    ⚡ Rapid Tier 2 (10+10)
                  </span>
                  <span className="text-sm font-bold text-gray-900 dark:text-white">
                    {stats.matchStats.decidedInRapidTier2} matches ({((stats.matchStats.decidedInRapidTier2 / stats.matchStats.totalMatches) * 100).toFixed(1)}%)
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                  <div
                    className="bg-orange-500 h-3 rounded-full transition-all"
                    style={{ width: `${(stats.matchStats.decidedInRapidTier2 / stats.matchStats.totalMatches * 100)}%` }}
                  />
                </div>
              </div>
            )}

            {/* Blitz Tier 1 */}
            {stats.matchStats.decidedInBlitzTier1 > 0 && (
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    💨 Blitz (5+3)
                  </span>
                  <span className="text-sm font-bold text-gray-900 dark:text-white">
                    {stats.matchStats.decidedInBlitzTier1} matches ({((stats.matchStats.decidedInBlitzTier1 / stats.matchStats.totalMatches) * 100).toFixed(1)}%)
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                  <div
                    className="bg-red-500 h-3 rounded-full transition-all"
                    style={{ width: `${(stats.matchStats.decidedInBlitzTier1 / stats.matchStats.totalMatches * 100)}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Key Stats in Boxes */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
              <div className="text-sm text-blue-900 dark:text-blue-300 mb-1">Went to Tiebreaks</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.matchStats.tiebreakAnalysis.wentToTiebreak}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {stats.matchStats.tiebreakAnalysis.tiebreakRate}% of matches
              </div>
            </div>

            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
              <div className="text-sm text-purple-900 dark:text-purple-300 mb-1">Avg Moves (Classical)</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.matchStats.averageMovesToDecision.classical || 'N/A'}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                moves to decision
              </div>
            </div>

            <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4 border border-orange-200 dark:border-orange-800">
              <div className="text-sm text-orange-900 dark:text-orange-300 mb-1">Deepest Tiebreak</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.matchStats.tiebreakAnalysis.blitzNeeded > 0 ? 'Blitz' :
                 stats.matchStats.tiebreakAnalysis.rapidTier2Needed > 0 ? 'Rapid 2' :
                 stats.matchStats.decidedInRapidTier1 > 0 ? 'Rapid 1' : 'Classical'}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {stats.matchStats.tiebreakAnalysis.blitzNeeded > 0
                  ? `${stats.matchStats.tiebreakAnalysis.blitzNeeded} went to blitz`
                  : stats.matchStats.tiebreakAnalysis.rapidTier2Needed > 0
                  ? `${stats.matchStats.tiebreakAnalysis.rapidTier2Needed} needed rapid 2`
                  : 'no blitz needed'}
              </div>
            </div>
          </div>
        </div>

        {/* Awards */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Tournament Awards</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {stats.awards.bloodbath && (
              <div className="border border-red-200 dark:border-red-800 rounded-lg p-4 bg-red-50 dark:bg-red-900/20">
                <div className="text-sm font-semibold text-red-900 dark:text-red-300 mb-2">🔪 Bloodbath</div>
                <div className="text-gray-900 dark:text-white font-medium text-sm">
                  {formatPlayerName(stats.awards.bloodbath.white)}{formatRating(stats.awards.bloodbath.whiteElo)}
                  {' vs '}
                  {formatPlayerName(stats.awards.bloodbath.black)}{formatRating(stats.awards.bloodbath.blackElo)}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">{stats.awards.bloodbath.captures} captures</div>
              </div>
            )}

            {stats.awards.pacifist && (
              <div className="border border-green-200 dark:border-green-800 rounded-lg p-4 bg-green-50 dark:bg-green-900/20">
                <div className="text-sm font-semibold text-green-900 dark:text-green-300 mb-2">☮️ Pacifist</div>
                <div className="text-gray-900 dark:text-white font-medium text-sm">
                  {formatPlayerName(stats.awards.pacifist.white)}{formatRating(stats.awards.pacifist.whiteElo)}
                  {' vs '}
                  {formatPlayerName(stats.awards.pacifist.black)}{formatRating(stats.awards.pacifist.blackElo)}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">{stats.awards.pacifist.captures} captures</div>
              </div>
            )}

            {stats.awards.speedDemon && (
              <div className="border border-blue-200 dark:border-blue-800 rounded-lg p-4 bg-blue-50 dark:bg-blue-900/20">
                <div className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-2">⚡ Speed Demon</div>
                <div className="text-gray-900 dark:text-white font-medium text-sm">
                  {formatPlayerName(stats.awards.speedDemon.white)}{formatRating(stats.awards.speedDemon.whiteElo)}
                  {' vs '}
                  {formatPlayerName(stats.awards.speedDemon.black)}{formatRating(stats.awards.speedDemon.blackElo)}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">{stats.awards.speedDemon.moves} moves ({stats.awards.speedDemon.winner} wins)</div>
              </div>
            )}

            {stats.awards.endgameWizard && (
              <div className="border border-purple-200 dark:border-purple-800 rounded-lg p-4 bg-purple-50 dark:bg-purple-900/20">
                <div className="text-sm font-semibold text-purple-900 dark:text-purple-300 mb-2">🧙 Endgame Wizard</div>
                <div className="text-gray-900 dark:text-white font-medium text-sm">
                  {formatPlayerName(stats.awards.endgameWizard.white)}{formatRating(stats.awards.endgameWizard.whiteElo)}
                  {' vs '}
                  {formatPlayerName(stats.awards.endgameWizard.black)}{formatRating(stats.awards.endgameWizard.blackElo)}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">{stats.awards.endgameWizard.endgameMoves} endgame moves</div>
              </div>
            )}
          </div>
        </div>

        {/* FIDE Fun Awards */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">🏆 FIDE World Cup Awards</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
            Special awards unique to the knockout format and FIDE World Cup competition
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {stats.fideFunAwards.tiebreakWarrior && (
              <div className="border border-amber-200 dark:border-amber-800 rounded-lg p-4 bg-amber-50 dark:bg-amber-900/20">
                <div className="text-sm font-semibold text-amber-900 dark:text-amber-300 mb-2">⚔️ Tiebreak Warrior</div>
                <div className="text-gray-900 dark:text-white font-medium">
                  {formatPlayerName(stats.fideFunAwards.tiebreakWarrior.player)}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {stats.fideFunAwards.tiebreakWarrior.tiebreakWins} tiebreak win{stats.fideFunAwards.tiebreakWarrior.tiebreakWins > 1 ? 's' : ''}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  Deepest: {stats.fideFunAwards.tiebreakWarrior.deepestTiebreak.replace('_', ' ')}
                </div>
              </div>
            )}

            {stats.fideFunAwards.giantSlayer && (
              <div className="border border-red-200 dark:border-red-800 rounded-lg p-4 bg-red-50 dark:bg-red-900/20">
                <div className="text-sm font-semibold text-red-900 dark:text-red-300 mb-2">🗡️ Giant Slayer</div>
                <div className="text-gray-900 dark:text-white font-medium">
                  {formatPlayerName(stats.fideFunAwards.giantSlayer.player)}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Beat {formatPlayerName(stats.fideFunAwards.giantSlayer.defeated)}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  +{stats.fideFunAwards.giantSlayer.ratingDifference} Elo upset
                </div>
              </div>
            )}

            {stats.fideFunAwards.rapidFire && (
              <div className="border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 bg-yellow-50 dark:bg-yellow-900/20">
                <div className="text-sm font-semibold text-yellow-900 dark:text-yellow-300 mb-2">⚡ Rapid Fire</div>
                <div className="text-gray-900 dark:text-white font-medium text-sm">
                  {formatPlayerName(stats.fideFunAwards.rapidFire.winner)} beat{' '}
                  {formatPlayerName(stats.fideFunAwards.rapidFire.white === stats.fideFunAwards.rapidFire.winner ? stats.fideFunAwards.rapidFire.black : stats.fideFunAwards.rapidFire.white)}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Fastest rapid win: {stats.fideFunAwards.rapidFire.moves} moves
                </div>
              </div>
            )}

            {stats.fideFunAwards.blitzWizard && (
              <div className="border border-orange-200 dark:border-orange-800 rounded-lg p-4 bg-orange-50 dark:bg-orange-900/20">
                <div className="text-sm font-semibold text-orange-900 dark:text-orange-300 mb-2">💨 Blitz Wizard</div>
                <div className="text-gray-900 dark:text-white font-medium">
                  {formatPlayerName(stats.fideFunAwards.blitzWizard.player)}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {stats.fideFunAwards.blitzWizard.blitzWins} blitz win{stats.fideFunAwards.blitzWizard.blitzWins > 1 ? 's' : ''}
                </div>
              </div>
            )}

            {stats.fideFunAwards.classicalPurist && (
              <div className="border border-emerald-200 dark:border-emerald-800 rounded-lg p-4 bg-emerald-50 dark:bg-emerald-900/20">
                <div className="text-sm font-semibold text-emerald-900 dark:text-emerald-300 mb-2">♟️ Classical Purist</div>
                <div className="text-gray-900 dark:text-white font-medium">
                  {formatPlayerName(stats.fideFunAwards.classicalPurist.player)}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Won without tiebreaks
                </div>
              </div>
            )}

            {stats.fideFunAwards.marathonMaster && (
              <div className="border border-indigo-200 dark:border-indigo-800 rounded-lg p-4 bg-indigo-50 dark:bg-indigo-900/20">
                <div className="text-sm font-semibold text-indigo-900 dark:text-indigo-300 mb-2">🏃‍♂️ Marathon Master</div>
                <div className="text-gray-900 dark:text-white font-medium text-sm">
                  {stats.fideFunAwards.marathonMaster.players.split(' vs ').map(p => formatPlayerName(p.trim())).join(' vs ')}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {stats.fideFunAwards.marathonMaster.totalGames} games, {stats.fideFunAwards.marathonMaster.totalMoves} moves
                </div>
              </div>
            )}

            {stats.fideFunAwards.fortressBuilder && (
              <div className="border border-slate-200 dark:border-slate-800 rounded-lg p-4 bg-slate-50 dark:bg-slate-900/20">
                <div className="text-sm font-semibold text-slate-900 dark:text-slate-300 mb-2">🏰 Fortress Builder</div>
                <div className="text-gray-900 dark:text-white font-medium text-sm">
                  {stats.fideFunAwards.fortressBuilder.players.split(' vs ').map(p => formatPlayerName(p.trim())).join(' vs ')}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {stats.fideFunAwards.fortressBuilder.draws} draws in {stats.fideFunAwards.fortressBuilder.totalGames} games
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Fun Stats */}
        {stats.funStats && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">🎉 Fun Stats</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              Entertaining patterns and achievements from this round
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Queen Trades */}
              {stats.funStats.fastestQueenTrade && (
                <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 bg-slate-50 dark:bg-slate-900/20">
                  <div className="text-sm font-semibold text-slate-900 dark:text-slate-300 mb-2">💼 Strategic Downsizing</div>
                  <div className="text-gray-900 dark:text-white text-sm mb-1">
                    {formatPlayerVs(stats.funStats.fastestQueenTrade.white, stats.funStats.fastestQueenTrade.black)}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Queens traded by move {stats.funStats.fastestQueenTrade.moves}
                  </div>
                </div>
              )}

              {stats.funStats.slowestQueenTrade && (
                <div className="border border-amber-200 dark:border-amber-700 rounded-lg p-4 bg-amber-50 dark:bg-amber-900/20">
                  <div className="text-sm font-semibold text-amber-900 dark:text-amber-300 mb-2">🕰️ Separation Anxiety</div>
                  <div className="text-gray-900 dark:text-white text-sm mb-1">
                    {formatPlayerVs(stats.funStats.slowestQueenTrade.white, stats.funStats.slowestQueenTrade.black)}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Queens kept until move {stats.funStats.slowestQueenTrade.moves}
                  </div>
                </div>
              )}

              {/* Sequences */}
              {stats.funStats.longestCaptureSequence && (
                <div className="border border-red-200 dark:border-red-700 rounded-lg p-4 bg-red-50 dark:bg-red-900/20">
                  <div className="text-sm font-semibold text-red-900 dark:text-red-300 mb-2">🔪 Longest Capture Spree</div>
                  <div className="text-gray-900 dark:text-white text-sm mb-1">
                    {formatPlayerVs(stats.funStats.longestCaptureSequence.white, stats.funStats.longestCaptureSequence.black)}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {stats.funStats.longestCaptureSequence.length} consecutive captures starting move {stats.funStats.longestCaptureSequence.startMove}
                  </div>
                </div>
              )}

              {stats.funStats.longestCheckSequence && (
                <div className="border border-orange-200 dark:border-orange-700 rounded-lg p-4 bg-orange-50 dark:bg-orange-900/20">
                  <div className="text-sm font-semibold text-orange-900 dark:text-orange-300 mb-2">👑 Longest King Hunt</div>
                  <div className="text-gray-900 dark:text-white text-sm mb-1">
                    {formatPlayerVs(stats.funStats.longestCheckSequence.white, stats.funStats.longestCheckSequence.black)}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {stats.funStats.longestCheckSequence.length} checks starting move {stats.funStats.longestCheckSequence.startMove}
                  </div>
                </div>
              )}

              {/* Opening Phase */}
              {stats.funStats.pawnStorm && (
                <div className="border border-cyan-200 dark:border-cyan-700 rounded-lg p-4 bg-cyan-50 dark:bg-cyan-900/20">
                  <div className="text-sm font-semibold text-cyan-900 dark:text-cyan-300 mb-2">🌪️ Pawn Storm</div>
                  <div className="text-gray-900 dark:text-white text-sm mb-1">
                    {formatPlayerVs(stats.funStats.pawnStorm.white, stats.funStats.pawnStorm.black)}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {stats.funStats.pawnStorm.count} pawn moves in the opening
                  </div>
                </div>
              )}

              {/* Piece Movement */}
              {stats.funStats.pieceLoyalty && (
                <div className="border border-indigo-200 dark:border-indigo-700 rounded-lg p-4 bg-indigo-50 dark:bg-indigo-900/20">
                  <div className="text-sm font-semibold text-indigo-900 dark:text-indigo-300 mb-2">🏠 Piece Loyalty</div>
                  <div className="text-gray-900 dark:text-white text-sm mb-1">
                    {formatPlayerVs(stats.funStats.pieceLoyalty.white, stats.funStats.pieceLoyalty.black)}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {stats.funStats.pieceLoyalty.piece} stayed on {stats.funStats.pieceLoyalty.square} for {stats.funStats.pieceLoyalty.moves} moves
                  </div>
                </div>
              )}

              {stats.funStats.squareTourist && (
                <div className="border border-teal-200 dark:border-teal-700 rounded-lg p-4 bg-teal-50 dark:bg-teal-900/20">
                  <div className="text-sm font-semibold text-teal-900 dark:text-teal-300 mb-2">✈️ Square Tourist</div>
                  <div className="text-gray-900 dark:text-white text-sm mb-1">
                    {formatPlayerVs(stats.funStats.squareTourist.white, stats.funStats.squareTourist.black)}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {stats.funStats.squareTourist.color} {stats.funStats.squareTourist.piece} visited {stats.funStats.squareTourist.squares} different squares
                  </div>
                </div>
              )}

              {stats.funStats.sportyQueen && (
                <div className="border border-pink-200 dark:border-pink-700 rounded-lg p-4 bg-pink-50 dark:bg-pink-900/20">
                  <div className="text-sm font-semibold text-pink-900 dark:text-pink-300 mb-2">👸 Sporty Queen</div>
                  <div className="text-gray-900 dark:text-white text-sm mb-1">
                    {formatPlayerVs(stats.funStats.sportyQueen.white, stats.funStats.sportyQueen.black)}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {stats.funStats.sportyQueen.color} queen traveled {Math.round(stats.funStats.sportyQueen.distance)} squares (~{(stats.funStats.sportyQueen.distance * 0.82 * 5.5).toFixed(0)} cm, or {(stats.funStats.sportyQueen.distance * 0.82 * 5.5 * 18.54 / 100).toFixed(0)}m at human scale)
                  </div>
                </div>
              )}

              {/* Castling */}
              {stats.funStats.castlingRace && (
                <div className="border border-purple-200 dark:border-purple-700 rounded-lg p-4 bg-purple-50 dark:bg-purple-900/20">
                  <div className="text-sm font-semibold text-purple-900 dark:text-purple-300 mb-2">🏁 Castling Race Winner</div>
                  <div className="text-gray-900 dark:text-white text-sm mb-1">
                    {formatPlayerVs(stats.funStats.castlingRace.white, stats.funStats.castlingRace.black)}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {stats.funStats.castlingRace.winner === 'white' ? formatPlayerName(stats.funStats.castlingRace.white) : formatPlayerName(stats.funStats.castlingRace.black)} castled first on move {stats.funStats.castlingRace.moves}
                  </div>
                </div>
              )}

              {stats.funStats.slowestCastling && (
                <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 bg-slate-50 dark:bg-slate-900/20">
                  <div className="text-sm font-semibold text-slate-900 dark:text-slate-300 mb-2">🏰 Castle Commitment Issues</div>
                  <div className="text-gray-900 dark:text-white text-sm mb-1">
                    {formatPlayerVs(stats.funStats.slowestCastling.white, stats.funStats.slowestCastling.black)}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {stats.funStats.slowestCastling.color} castled on move {stats.funStats.slowestCastling.moves}
                  </div>
                </div>
              )}

              {/* Special Patterns */}
              {stats.funStats.openingHipster && (
                <div className="border border-blue-200 dark:border-blue-700 rounded-lg p-4 bg-blue-50 dark:bg-blue-900/20">
                  <div className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-2">🎩 Opening Hipster</div>
                  <div className="text-gray-900 dark:text-white text-sm mb-1">
                    {formatPlayerVs(stats.funStats.openingHipster.white, stats.funStats.openingHipster.black)}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {stats.funStats.openingHipster.eco} {stats.funStats.openingHipster.name}
                  </div>
                </div>
              )}

              {stats.funStats.dadbodShuffler && (
                <div className="border border-yellow-200 dark:border-yellow-700 rounded-lg p-4 bg-yellow-50 dark:bg-yellow-900/20">
                  <div className="text-sm font-semibold text-yellow-900 dark:text-yellow-300 mb-2">👑 Dadbod Shuffler</div>
                  <div className="text-gray-900 dark:text-white text-sm mb-1">
                    {formatPlayerVs(stats.funStats.dadbodShuffler.white, stats.funStats.dadbodShuffler.black)}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {stats.funStats.dadbodShuffler.color} king moved {stats.funStats.dadbodShuffler.moves} times
                  </div>
                </div>
              )}

              {stats.funStats.edgeLord && (
                <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 bg-slate-50 dark:bg-slate-900/20">
                  <div className="text-sm font-semibold text-slate-900 dark:text-slate-300 mb-2">📐 Professional Edger</div>
                  <div className="text-gray-900 dark:text-white text-sm mb-1">
                    {formatPlayerVs(stats.funStats.edgeLord.white, stats.funStats.edgeLord.black)}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {stats.funStats.edgeLord.color} made {stats.funStats.edgeLord.moves} moves on edge files
                  </div>
                </div>
              )}

              {stats.funStats.rookLift && (
                <div className="border border-emerald-200 dark:border-emerald-700 rounded-lg p-4 bg-emerald-50 dark:bg-emerald-900/20">
                  <div className="text-sm font-semibold text-emerald-900 dark:text-emerald-300 mb-2">🚀 Rook Lift</div>
                  <div className="text-gray-900 dark:text-white text-sm mb-1">
                    {formatPlayerVs(stats.funStats.rookLift.white, stats.funStats.rookLift.black)}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {stats.funStats.rookLift.color} {stats.funStats.rookLift.rook} activated on move {stats.funStats.rookLift.moveNumber}
                  </div>
                </div>
              )}

              {stats.funStats.centerStage && (
                <div className="border border-violet-200 dark:border-violet-700 rounded-lg p-4 bg-violet-50 dark:bg-violet-900/20">
                  <div className="text-sm font-semibold text-violet-900 dark:text-violet-300 mb-2">⭐ Center Stage</div>
                  <div className="text-gray-900 dark:text-white text-sm mb-1">
                    {formatPlayerVs(stats.funStats.centerStage.white, stats.funStats.centerStage.black)}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {stats.funStats.centerStage.color} {stats.funStats.centerStage.piece} dominated the center with {stats.funStats.centerStage.moves} moves
                  </div>
                </div>
              )}

              {stats.funStats.darkLord && (
                <div className="border border-gray-700 dark:border-gray-600 rounded-lg p-4 bg-gray-800 dark:bg-gray-950">
                  <div className="text-sm font-semibold text-gray-100 dark:text-gray-200 mb-2">🌑 Dark Mode Enthusiast</div>
                  <div className="text-gray-200 dark:text-gray-300 text-sm mb-1">
                    {formatPlayerVs(stats.funStats.darkLord.white, stats.funStats.darkLord.black)}
                  </div>
                  <div className="text-sm text-gray-300 dark:text-gray-400">
                    {stats.funStats.darkLord.color} captured {stats.funStats.darkLord.captures} pieces on dark squares
                  </div>
                </div>
              )}

              {stats.funStats.lightLord && (
                <div className="border border-amber-300 dark:border-amber-600 rounded-lg p-4 bg-amber-50 dark:bg-amber-900/20">
                  <div className="text-sm font-semibold text-amber-900 dark:text-amber-300 mb-2">☀️ Day Mode Warrior</div>
                  <div className="text-gray-900 dark:text-white text-sm mb-1">
                    {formatPlayerVs(stats.funStats.lightLord.white, stats.funStats.lightLord.black)}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {stats.funStats.lightLord.color} captured {stats.funStats.lightLord.captures} pieces on light squares
                  </div>
                </div>
              )}

              {stats.funStats.chickenAward && (
                <div className="border border-lime-200 dark:border-lime-700 rounded-lg p-4 bg-lime-50 dark:bg-lime-900/20">
                  <div className="text-sm font-semibold text-lime-900 dark:text-lime-300 mb-2">🐔 Chicken Award</div>
                  <div className="text-gray-900 dark:text-white text-sm mb-1">
                    {formatPlayerVs(stats.funStats.chickenAward.white, stats.funStats.chickenAward.black)}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {stats.funStats.chickenAward.color} made {stats.funStats.chickenAward.retreats} retreating moves
                  </div>
                </div>
              )}

              {stats.funStats.pawnCaptures && (
                <div className="border border-red-200 dark:border-red-700 rounded-lg p-4 bg-red-50 dark:bg-red-900/20">
                  <div className="text-sm font-semibold text-red-900 dark:text-red-300 mb-2">🏴 Peasant Uprising</div>
                  <div className="text-gray-900 dark:text-white text-sm mb-1">
                    {formatPlayerVs(stats.funStats.pawnCaptures.white, stats.funStats.pawnCaptures.black)}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {stats.funStats.pawnCaptures.color} pawns captured {stats.funStats.pawnCaptures.captures} {stats.funStats.pawnCaptures.captures === 1 ? 'piece' : 'pieces'}
                  </div>
                </div>
              )}

              {stats.funStats.antiOrthogonal && (
                <div className="border border-purple-200 dark:border-purple-700 rounded-lg p-4 bg-purple-50 dark:bg-purple-900/20">
                  <div className="text-sm font-semibold text-purple-900 dark:text-purple-300 mb-2">✖️ Anti-Orthogonal Activist</div>
                  <div className="text-gray-900 dark:text-white text-sm mb-1">
                    {formatPlayerVs(stats.funStats.antiOrthogonal.white, stats.funStats.antiOrthogonal.black)}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {stats.funStats.antiOrthogonal.color} made {stats.funStats.antiOrthogonal.moves} diagonal {stats.funStats.antiOrthogonal.moves === 1 ? 'move' : 'moves'}
                  </div>
                </div>
              )}

              {stats.funStats.comfortZone && (
                <div className="border border-cyan-200 dark:border-cyan-700 rounded-lg p-4 bg-cyan-50 dark:bg-cyan-900/20">
                  <div className="text-sm font-semibold text-cyan-900 dark:text-cyan-300 mb-2">✨ Comfort Zone Champion</div>
                  <div className="text-gray-900 dark:text-white text-sm mb-1">
                    {formatPlayerVs(stats.funStats.comfortZone.white, stats.funStats.comfortZone.black)}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {stats.funStats.comfortZone.color} used {stats.funStats.comfortZone.pieceType} for {stats.funStats.comfortZone.percentage}% of non-pawn moves
                  </div>
                </div>
              )}

              {/* Territory Invasion Awards */}
              {stats.funStats.lateBloomer && (
                <div className="border border-orange-200 dark:border-orange-700 rounded-lg p-4 bg-orange-50 dark:bg-orange-900/20">
                  <div className="text-sm font-semibold text-orange-900 dark:text-orange-300 mb-2">🌱 Late Bloomer</div>
                  <div className="text-gray-900 dark:text-white text-sm mb-1">
                    {formatPlayerName(stats.funStats.lateBloomer.player)}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Waited until move {Math.floor(stats.funStats.lateBloomer.moveNumber / 2) + 1} to cross into enemy territory
                  </div>
                </div>
              )}

              {stats.funStats.quickDraw && (
                <div className="border border-red-200 dark:border-red-700 rounded-lg p-4 bg-red-50 dark:bg-red-900/20">
                  <div className="text-sm font-semibold text-red-900 dark:text-red-300 mb-2">🔫 Quick Draw</div>
                  <div className="text-gray-900 dark:text-white text-sm mb-1">
                    {formatPlayerName(stats.funStats.quickDraw.player)}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Invaded enemy territory on move {Math.floor(stats.funStats.quickDraw.moveNumber / 2) + 1}
                  </div>
                </div>
              )}

              {stats.funStats.homebody && (
                <div className="border border-blue-200 dark:border-blue-700 rounded-lg p-4 bg-blue-50 dark:bg-blue-900/20">
                  <div className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-2">🏠 Homebody</div>
                  <div className="text-gray-900 dark:text-white text-sm mb-1">
                    {formatPlayerName(stats.funStats.homebody.player)}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Only {stats.funStats.homebody.count} {stats.funStats.homebody.count === 1 ? 'piece' : 'pieces'} crossed into enemy territory
                  </div>
                </div>
              )}

              {stats.funStats.deepStrike && (
                <div className="border border-purple-200 dark:border-purple-700 rounded-lg p-4 bg-purple-50 dark:bg-purple-900/20">
                  <div className="text-sm font-semibold text-purple-900 dark:text-purple-300 mb-2">⚔️ Deep Strike</div>
                  <div className="text-gray-900 dark:text-white text-sm mb-1">
                    {formatPlayerName(stats.funStats.deepStrike.player)}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {stats.funStats.deepStrike.count} {stats.funStats.deepStrike.count === 1 ? 'piece' : 'pieces'} crossed into enemy territory
                  </div>
                </div>
              )}

              {stats.funStats.crosshairs && (
                <div className="border border-red-200 dark:border-red-700 rounded-lg p-4 bg-red-50 dark:bg-red-900/20">
                  <div className="text-sm font-semibold text-red-900 dark:text-red-300 mb-2">🎯 Crosshairs</div>
                  <div className="text-gray-900 dark:text-white text-sm mb-1">
                    {stats.funStats.crosshairs.white} vs {stats.funStats.crosshairs.black}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {stats.funStats.crosshairs.square.toUpperCase()} under attack by {stats.funStats.crosshairs.attackers} pieces
                  </div>
                  {stats.funStats.crosshairs.whiteRating && stats.funStats.crosshairs.blackRating && (
                    <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      ({stats.funStats.crosshairs.whiteRating} vs {stats.funStats.crosshairs.blackRating})
                    </div>
                  )}
                </div>
              )}

              {stats.funStats.longestTension && (
                <div className="border border-yellow-200 dark:border-yellow-700 rounded-lg p-4 bg-yellow-50 dark:bg-yellow-900/20">
                  <div className="text-sm font-semibold text-yellow-900 dark:text-yellow-300 mb-2">⚡ Longest Tension</div>
                  <div className="text-gray-900 dark:text-white text-sm mb-1">
                    {stats.funStats.longestTension.white} vs {stats.funStats.longestTension.black}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {stats.funStats.longestTension.moves} moves of tension between {stats.funStats.longestTension.squares}
                  </div>
                  {stats.funStats.longestTension.whiteRating && stats.funStats.longestTension.blackRating && (
                    <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      ({stats.funStats.longestTension.whiteRating} vs {stats.funStats.longestTension.blackRating})
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Time Awards */}
        <TimeAwardsSection timeAwards={stats.timeAwards} />

        {/* Stockfish Analysis */}
        <AnalysisSection analysis={stats.analysis} />

        {/* Tactical Stats */}
        <TacticalStatsSection tactics={stats.tactics} />

        {/* Piece Activity */}
        <PieceActivitySection pieces={stats.pieces as unknown as {
          activity: { pawns: number; knights: number; bishops: number; rooks: number; queens: number; kings: number }
          captured: { pawns: number; knights: number; bishops: number; rooks: number; queens: number }
        }} />

        {/* Checkmates */}
        <CheckmatesSection checkmates={stats.checkmates} />

        {/* Opening Moves */}
        <OpeningsSection openings={{
          firstMoves: (stats.openings as unknown as Record<string, unknown>).firstMoves as Record<string, { count: number; percentage: number; whiteWinRate: number }>,
          popularSequences: stats.openings.mostPopular?.slice(0, 10).map(opening => ({
            count: opening.count,
            eco: opening.eco,
            name: opening.name
          })) || []
        }} />

        {/* Game Phases */}
        {stats.gamePhases && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">🎯 Game Phases</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="text-sm text-blue-900 dark:text-blue-300 mb-1">Average Opening</div>
                <div className="text-3xl font-bold text-gray-900 dark:text-white">{stats.gamePhases.averageOpening}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">moves</div>
              </div>
              <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <div className="text-sm text-purple-900 dark:text-purple-300 mb-1">Average Middlegame</div>
                <div className="text-3xl font-bold text-gray-900 dark:text-white">{stats.gamePhases.averageMiddlegame}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">moves</div>
              </div>
              <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="text-sm text-green-900 dark:text-green-300 mb-1">Average Endgame</div>
                <div className="text-3xl font-bold text-gray-900 dark:text-white">{stats.gamePhases.averageEndgame}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">moves</div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">⏰ Longest Wait Till Capture</div>
                <div className="text-gray-900 dark:text-white font-medium text-sm">
                  {formatPlayerVs(stats.gamePhases.longestWaitTillCapture.white, stats.gamePhases.longestWaitTillCapture.black)}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">{stats.gamePhases.longestWaitTillCapture.moves} moves</div>
              </div>
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">♟️ Longest Middlegame</div>
                <div className="text-gray-900 dark:text-white font-medium text-sm">
                  {formatPlayerVs(stats.gamePhases.longestMiddlegame.white, stats.gamePhases.longestMiddlegame.black)}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">{stats.gamePhases.longestMiddlegame.moves} moves</div>
              </div>
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">👑 Longest Endgame</div>
                <div className="text-gray-900 dark:text-white font-medium text-sm">
                  {formatPlayerVs(stats.gamePhases.longestEndgame.white, stats.gamePhases.longestEndgame.black)}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">{stats.gamePhases.longestEndgame.moves} moves</div>
              </div>
            </div>
          </div>
        )}

        {/* Rating Analysis */}
        {stats.ratingAnalysis && stats.ratingAnalysis.hasRatingData && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">📊 Rating Analysis & Upsets</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                <div className="text-sm text-blue-900 dark:text-blue-300 mb-1">Avg Elo Difference</div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.ratingAnalysis.averageEloDifference}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">rating points</div>
              </div>
              <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 border border-red-200 dark:border-red-800">
                <div className="text-sm text-red-900 dark:text-red-300 mb-1">Total Upsets</div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.ratingAnalysis.upsets.length}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">underdog wins</div>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
                <div className="text-sm text-green-900 dark:text-green-300 mb-1">Favorite Win Rate</div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.ratingAnalysis.favoritePerformance.winRate.toFixed(1)}%</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {stats.ratingAnalysis.favoritePerformance.wins}W-{stats.ratingAnalysis.favoritePerformance.losses}L-{stats.ratingAnalysis.favoritePerformance.draws}D
                </div>
              </div>
            </div>

            {stats.ratingAnalysis.biggestUpset && (
              <div className="border border-red-200 dark:border-red-700 rounded-lg p-4 bg-red-50 dark:bg-red-900/20">
                <div className="text-sm font-semibold text-red-900 dark:text-red-300 mb-2">🏆 Biggest Upset</div>
                <div className="text-gray-900 dark:text-white text-sm mb-1">
                  {formatPlayerName(stats.ratingAnalysis.biggestUpset.underdog)} defeated {formatPlayerName(stats.ratingAnalysis.biggestUpset.favorite)}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  +{stats.ratingAnalysis.biggestUpset.eloDifference} rating point upset ({stats.ratingAnalysis.biggestUpset.underdogRating} vs {stats.ratingAnalysis.biggestUpset.favoriteRating})
                </div>
              </div>
            )}
          </div>
        )}

        {/* Top Openings */}
        {stats.openings && stats.openings.mostPopular && stats.openings.mostPopular.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">📖 Most Popular Openings</h2>
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              {stats.openings.totalUnique} unique openings • {stats.openings.coverage}% coverage
            </div>

            <div className="space-y-3">
              {stats.openings.mostPopular.slice(0, 10).map((opening, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="flex-shrink-0 w-8 text-center font-bold text-gray-500 dark:text-gray-400">
                    {index + 1}
                  </div>
                  <div className="flex-grow">
                    <div className="flex justify-between items-center mb-1">
                      <div className="font-semibold text-gray-900 dark:text-white">
                        {opening.name}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {opening.count} games ({opening.percentage}%)
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full transition-all"
                        style={{ width: `${opening.percentage}%` }}
                      />
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      ECO: {opening.eco}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="text-center text-gray-500 dark:text-gray-400 text-sm mt-12">
          Statistics generated: {new Date(stats.generatedAt).toLocaleString()}
        </div>
      </div>
    </div>
  )
}
