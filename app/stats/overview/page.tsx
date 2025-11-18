'use client'

import { useEffect, useState } from 'react'
import type { TournamentOverview } from '@/app/stats/types'
import { TournamentHero } from '@/components/stats/overview/tournament-hero'
import { RoundSummaryTable } from '@/components/stats/overview/round-summary-table'
import { HallOfFame } from '@/components/stats/overview/hall-of-fame'
import { PlayerLeaderboard } from '@/components/stats/overview/player-leaderboard'
import { TopAwards } from '@/components/stats/overview/top-awards'
import { TimeControlComparison } from '@/components/stats/overview/time-control-comparison'
import { TacticalStatsSection } from '@/components/stats/tactical-stats-section'
import { PieceActivitySection } from '@/components/stats/piece-activity-section'
import { CheckmatesSection } from '@/components/stats/checkmates-section'
import { OpeningsSection } from '@/components/stats/openings-section'

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
        <TopAwards topAwards={overview.topAwards} />
        <PlayerLeaderboard players={overview.playerLeaderboard} />
        <RoundSummaryTable rounds={overview.byRound} />

        {/* Time Control Comparison */}
        {overview.timeControlComparison && (
          <TimeControlComparison timeControlComparison={overview.timeControlComparison} />
        )}

        {/* Tactical Stats */}
        {overview.tactics && (
          <TacticalStatsSection
            tactics={overview.tactics as unknown as {
              totalCaptures: number
              totalPromotions: number | null
              castling: { kingside: number; queenside: number }
              enPassantGames: Array<{ white: string; black: string; count: number }>
            }}
          />
        )}

        {/* Piece Activity */}
        {overview.pieces && (
          <PieceActivitySection
            pieces={overview.pieces as unknown as {
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
            }}
          />
        )}

        {/* Checkmates */}
        {overview.checkmates && (
          <CheckmatesSection checkmates={overview.checkmates as unknown as {
            byPiece: {
              queen: number
              rook: number
              bishop: number
              knight: number
              pawn: number
            }
            fastest: {
              moves: number
              white: string
              black: string
              winner: string
              gameId: string | null
            } | null
          }} />
        )}

        {/* Opening Moves */}
        {overview.openings?.firstMoveStats && (
          <OpeningsSection openings={{
            firstMoves: overview.openings.firstMoveStats.reduce((acc, stat) => {
              acc[stat.move] = {
                count: stat.count,
                percentage: Math.round((stat.count / overview.overall.totalGames) * 100),
                whiteWinRate: stat.whiteWinRate
              };
              return acc;
            }, {} as Record<string, { count: number; percentage: number; whiteWinRate: number }>),
            generalOpenings: overview.openings.generalOpenings,
            popularSequences: overview.openings.mostPopular.slice(0, 10).map(opening => ({
              moves: opening.name,
              count: opening.count,
              eco: null,
              name: opening.name
            }))
          }} />
        )}
      </div>
    </div>
  )
}
