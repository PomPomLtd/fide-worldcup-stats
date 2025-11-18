'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { StatCard } from '@/components/stats/stat-card'

interface TimeControlData {
  games: number
  avgLength: number
  whiteWins: number
  draws: number
  blackWins: number
  whiteWinRate: number
  drawRate: number
  blackWinRate: number
}

interface TimeControlComparisonProps {
  timeControlComparison: {
    classical: TimeControlData
    rapid: TimeControlData
    blitz: TimeControlData
  }
}

export function TimeControlComparison({ timeControlComparison }: TimeControlComparisonProps) {
  const { classical, rapid, blitz } = timeControlComparison

  // Prepare data for game length chart
  const gameLengthData = [
    { timeControl: 'Classical', avgLength: classical.avgLength, games: classical.games },
    { timeControl: 'Rapid', avgLength: rapid.avgLength, games: rapid.games },
    { timeControl: 'Blitz', avgLength: blitz.avgLength, games: blitz.games }
  ]

  // Prepare data for result distribution chart
  const resultDistributionData = [
    {
      timeControl: 'Classical',
      'White Wins': classical.whiteWinRate,
      'Draws': classical.drawRate,
      'Black Wins': classical.blackWinRate
    },
    {
      timeControl: 'Rapid',
      'White Wins': rapid.whiteWinRate,
      'Draws': rapid.drawRate,
      'Black Wins': rapid.blackWinRate
    },
    {
      timeControl: 'Blitz',
      'White Wins': blitz.whiteWinRate,
      'Draws': blitz.drawRate,
      'Black Wins': blitz.blackWinRate
    }
  ]

  return (
    <StatCard title="⏱️ Time Control Comparison" className="mb-8">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
          <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">♟️ Classical</h4>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Games:</span>
              <span className="font-medium">{classical.games}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Avg Length:</span>
              <span className="font-medium">{classical.avgLength} moves</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Draw Rate:</span>
              <span className="font-medium">{classical.drawRate}%</span>
            </div>
          </div>
        </div>

        <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
          <h4 className="font-semibold text-orange-900 dark:text-orange-100 mb-2">⚡ Rapid</h4>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Games:</span>
              <span className="font-medium">{rapid.games}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Avg Length:</span>
              <span className="font-medium">{rapid.avgLength} moves</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Draw Rate:</span>
              <span className="font-medium">{rapid.drawRate}%</span>
            </div>
          </div>
        </div>

        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
          <h4 className="font-semibold text-red-900 dark:text-red-100 mb-2">💨 Blitz</h4>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Games:</span>
              <span className="font-medium">{blitz.games}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Avg Length:</span>
              <span className="font-medium">{blitz.avgLength} moves</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Draw Rate:</span>
              <span className="font-medium">{blitz.drawRate}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Average Game Length Chart */}
        <div>
          <h4 className="text-sm font-semibold mb-3 text-gray-700 dark:text-gray-300">
            Average Game Length
          </h4>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={gameLengthData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
              <XAxis
                dataKey="timeControl"
                className="text-xs"
                tick={{ fill: 'currentColor' }}
              />
              <YAxis
                className="text-xs"
                tick={{ fill: 'currentColor' }}
                label={{ value: 'Moves', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: '1px solid #ccc',
                  borderRadius: '4px'
                }}
              />
              <Bar dataKey="avgLength" fill="#3b82f6" name="Avg Moves" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Result Distribution Chart */}
        <div>
          <h4 className="text-sm font-semibold mb-3 text-gray-700 dark:text-gray-300">
            Result Distribution
          </h4>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={resultDistributionData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
              <XAxis
                dataKey="timeControl"
                className="text-xs"
                tick={{ fill: 'currentColor' }}
              />
              <YAxis
                className="text-xs"
                tick={{ fill: 'currentColor' }}
                label={{ value: 'Percentage', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: '1px solid #ccc',
                  borderRadius: '4px'
                }}
              />
              <Legend />
              <Bar dataKey="White Wins" stackId="a" fill="#22c55e" />
              <Bar dataKey="Draws" stackId="a" fill="#64748b" />
              <Bar dataKey="Black Wins" stackId="a" fill="#ef4444" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Key Insights */}
      <div className="mt-6 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
        <h4 className="font-semibold mb-2 text-gray-900 dark:text-gray-100">🔍 Key Insights</h4>
        <ul className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
          <li>
            • <strong>Most Decisive:</strong> {
              blitz.drawRate < rapid.drawRate && blitz.drawRate < classical.drawRate
                ? 'Blitz'
                : rapid.drawRate < classical.drawRate
                ? 'Rapid'
                : 'Classical'
            } ({Math.min(classical.drawRate, rapid.drawRate, blitz.drawRate)}% draws)
          </li>
          <li>
            • <strong>Longest Games:</strong> {
              blitz.avgLength > rapid.avgLength && blitz.avgLength > classical.avgLength
                ? 'Blitz'
                : rapid.avgLength > classical.avgLength
                ? 'Rapid'
                : 'Classical'
            } ({Math.max(classical.avgLength, rapid.avgLength, blitz.avgLength).toFixed(1)} avg moves)
          </li>
          <li>
            • <strong>White Advantage:</strong> Strongest in {
              blitz.whiteWinRate > rapid.whiteWinRate && blitz.whiteWinRate > classical.whiteWinRate
                ? `Blitz (${blitz.whiteWinRate}%)`
                : rapid.whiteWinRate > classical.whiteWinRate
                ? `Rapid (${rapid.whiteWinRate}%)`
                : `Classical (${classical.whiteWinRate}%)`
            }
          </li>
        </ul>
      </div>
    </StatCard>
  )
}
