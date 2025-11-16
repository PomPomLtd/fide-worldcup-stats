'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import type { RoundStats } from '@/app/stats/types'

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
            <a href="/" className="hover:text-blue-600 dark:hover:text-blue-400">Home</a>
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

        {/* Match Statistics (FIDE-Specific) */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Match Statistics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Decision Points</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-700 dark:text-gray-300">Decided in Classical</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {stats.matchStats.decidedInClassical} ({stats.matchStats.tiebreakAnalysis.classicalDecisiveRate}%)
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700 dark:text-gray-300">Decided in Rapid Tier 1</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{stats.matchStats.decidedInRapidTier1}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700 dark:text-gray-300">Decided in Rapid Tier 2</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{stats.matchStats.decidedInRapidTier2}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700 dark:text-gray-300">Decided in Blitz Tier 1</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{stats.matchStats.decidedInBlitzTier1}</span>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Tiebreak Summary</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-700 dark:text-gray-300">Went to Tiebreak</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {stats.matchStats.tiebreakAnalysis.wentToTiebreak} ({stats.matchStats.tiebreakAnalysis.tiebreakRate}%)
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700 dark:text-gray-300">Needed Rapid Tier 2</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{stats.matchStats.tiebreakAnalysis.rapidTier2Needed}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700 dark:text-gray-300">Needed Blitz</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{stats.matchStats.tiebreakAnalysis.blitzNeeded}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Awards */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Tournament Awards</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stats.awards.bloodbath && (
              <div className="border border-red-200 dark:border-red-800 rounded-lg p-4 bg-red-50 dark:bg-red-900/20">
                <div className="text-sm font-semibold text-red-900 dark:text-red-300 mb-2">🔪 Bloodbath</div>
                <div className="text-gray-900 dark:text-white font-medium">{stats.awards.bloodbath.white} vs {stats.awards.bloodbath.black}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">{stats.awards.bloodbath.captures} captures</div>
              </div>
            )}

            {stats.awards.pacifist && (
              <div className="border border-green-200 dark:border-green-800 rounded-lg p-4 bg-green-50 dark:bg-green-900/20">
                <div className="text-sm font-semibold text-green-900 dark:text-green-300 mb-2">☮️ Pacifist</div>
                <div className="text-gray-900 dark:text-white font-medium">{stats.awards.pacifist.white} vs {stats.awards.pacifist.black}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">{stats.awards.pacifist.captures} captures</div>
              </div>
            )}

            {stats.awards.speedDemon && (
              <div className="border border-blue-200 dark:border-blue-800 rounded-lg p-4 bg-blue-50 dark:bg-blue-900/20">
                <div className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-2">⚡ Speed Demon</div>
                <div className="text-gray-900 dark:text-white font-medium">{stats.awards.speedDemon.white} vs {stats.awards.speedDemon.black}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">{stats.awards.speedDemon.moves} moves ({stats.awards.speedDemon.winner} wins)</div>
              </div>
            )}
          </div>
        </div>

        {/* More sections will be added incrementally... */}

        <div className="text-center text-gray-500 dark:text-gray-400 text-sm mt-12">
          Statistics generated: {new Date(stats.generatedAt).toLocaleString()}
        </div>
      </div>
    </div>
  )
}
