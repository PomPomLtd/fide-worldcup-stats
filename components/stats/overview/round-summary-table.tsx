import Link from 'next/link'
import type { TournamentOverview } from '@/app/stats/types'
import { StatCard } from '@/components/stats/stat-card'

interface RoundSummaryTableProps {
  rounds: TournamentOverview['byRound']
}

export function RoundSummaryTable({ rounds }: RoundSummaryTableProps) {
  return (
    <StatCard title="📊 Round-by-Round Summary">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                Round
              </th>
              <th className="text-right py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                Matches
              </th>
              <th className="text-right py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                Games
              </th>
              <th className="text-right py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                Avg Length
              </th>
              <th className="text-right py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                Tiebreaks
              </th>
              <th className="text-right py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                Upsets
              </th>
              <th className="text-center py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                Time Controls
              </th>
              <th className="text-center py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                Details
              </th>
            </tr>
          </thead>
          <tbody>
            {rounds.map((round) => (
              <tr
                key={round.roundNumber}
                className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors"
              >
                <td className="py-3 px-4">
                  <div>
                    <div className="font-medium text-gray-900 dark:text-gray-100">
                      Round {round.roundNumber}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {round.roundName}
                    </div>
                  </div>
                </td>
                <td className="text-right py-3 px-4 text-gray-700 dark:text-gray-300">
                  {round.matches}
                </td>
                <td className="text-right py-3 px-4 text-gray-700 dark:text-gray-300">
                  {round.games}
                </td>
                <td className="text-right py-3 px-4 text-gray-700 dark:text-gray-300">
                  {round.avgGameLength} moves
                </td>
                <td className="text-right py-3 px-4">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    round.tiebreakRate > 40
                      ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                      : round.tiebreakRate > 25
                      ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                      : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                  }`}>
                    {round.tiebreakRate.toFixed(1)}%
                  </span>
                </td>
                <td className="text-right py-3 px-4">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    round.upsetRate > 20
                      ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                      : round.upsetRate > 10
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                      : 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'
                  }`}>
                    {round.upsetRate.toFixed(1)}%
                  </span>
                </td>
                <td className="text-center py-3 px-4">
                  {(() => {
                    const totalClassified = round.classicalGames + round.rapidGames + round.blitzGames
                    const hasCompleteData = totalClassified === round.games && totalClassified > 0

                    if (!hasCompleteData) {
                      return (
                        <span className="text-xs text-gray-400 dark:text-gray-500 italic">
                          N/A
                        </span>
                      )
                    }

                    return (
                      <div className="flex justify-center gap-2 text-xs">
                        {round.classicalGames > 0 && (
                          <span className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 px-2 py-1 rounded">
                            C: {round.classicalGames}
                          </span>
                        )}
                        {round.rapidGames > 0 && (
                          <span className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 px-2 py-1 rounded">
                            R: {round.rapidGames}
                          </span>
                        )}
                        {round.blitzGames > 0 && (
                          <span className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 px-2 py-1 rounded">
                            B: {round.blitzGames}
                          </span>
                        )}
                      </div>
                    )
                  })()}
                </td>
                <td className="text-center py-3 px-4">
                  <Link
                    href={`/stats/round/${round.roundNumber}`}
                    className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                  >
                    View Stats →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-gray-300 dark:border-gray-600 font-semibold">
              <td className="py-3 px-4 text-gray-900 dark:text-gray-100">
                Total
              </td>
              <td className="text-right py-3 px-4 text-gray-900 dark:text-gray-100">
                {rounds.reduce((sum, r) => sum + r.matches, 0)}
              </td>
              <td className="text-right py-3 px-4 text-gray-900 dark:text-gray-100">
                {rounds.reduce((sum, r) => sum + r.games, 0)}
              </td>
              <td className="text-right py-3 px-4 text-gray-700 dark:text-gray-300">
                {(rounds.reduce((sum, r) => sum + r.avgGameLength, 0) / rounds.length).toFixed(1)} avg
              </td>
              <td colSpan={4}></td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Legend */}
      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Time Control Legend:</h4>
        <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-center gap-2">
            <span className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 px-2 py-1 rounded text-xs font-medium">
              C
            </span>
            <span>Classical (90+30)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 px-2 py-1 rounded text-xs font-medium">
              R
            </span>
            <span>Rapid (25+10 or 10+10)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 px-2 py-1 rounded text-xs font-medium">
              B
            </span>
            <span>Blitz (5+3 or 3+2)</span>
          </div>
        </div>
      </div>
    </StatCard>
  )
}
