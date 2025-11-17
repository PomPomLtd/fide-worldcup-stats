'use client'

import { useEffect, useState } from 'react'
import type { TournamentOverview } from '@/app/stats/types'
import { TournamentHero } from '@/components/stats/overview/tournament-hero'
import { RoundSummaryTable } from '@/components/stats/overview/round-summary-table'
import { HallOfFame } from '@/components/stats/overview/hall-of-fame'

export default function TournamentOverviewPage() {
  const [overview, setOverview] = useState<TournamentOverview | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        const response = await fetch('/stats/tournament-overview.json', {
          cache: 'no-store'
        })
        if (!response.ok) {
          throw new Error(`Failed to fetch overview: ${response.statusText}`)
        }
        const data = await response.json()
        setOverview(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load overview')
      } finally {
        setLoading(false)
      }
    }
    fetchOverview()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading tournament overview...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      </div>
    )
  }

  if (!overview) return null

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        <TournamentHero overview={overview} />
        <HallOfFame hallOfFame={overview.hallOfFame} overall={overview.overall} />
        <RoundSummaryTable rounds={overview.byRound} />
      </div>
    </div>
  )
}
