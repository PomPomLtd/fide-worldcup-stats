import type { TournamentOverview } from '@/app/stats/types'

interface TournamentHeroProps {
  overview: TournamentOverview
}

export function TournamentHero({ overview }: TournamentHeroProps) {
  const progressPercentage = (overview.roundsCompleted / overview.totalRounds) * 100

  return (
    <div className="bg-gradient-to-br from-blue-600 to-indigo-700 dark:from-blue-900 dark:to-indigo-950 rounded-xl shadow-2xl p-8 text-white">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Title */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            {overview.tournamentName}
          </h1>
          <p className="text-xl text-blue-100">
            {overview.location}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm font-medium">
            <span>Tournament Progress</span>
            <span>{overview.roundsCompleted} of {overview.totalRounds} Rounds Complete</span>
          </div>
          <div className="w-full h-4 bg-blue-800/30 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Key Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
          <div className="bg-white/10 backdrop-blur rounded-lg p-4 text-center">
            <p className="text-3xl font-bold">{overview.overall.totalGames}</p>
            <p className="text-sm text-blue-100 mt-1">Total Games</p>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-lg p-4 text-center">
            <p className="text-3xl font-bold">{overview.overall.totalMatches}</p>
            <p className="text-sm text-blue-100 mt-1">Total Matches</p>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-lg p-4 text-center">
            <p className="text-3xl font-bold">{overview.overall.totalMoves.toLocaleString()}</p>
            <p className="text-sm text-blue-100 mt-1">Total Moves</p>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-lg p-4 text-center">
            <p className="text-3xl font-bold">{overview.overall.averageGameLength}</p>
            <p className="text-sm text-blue-100 mt-1">Avg Game Length</p>
          </div>
        </div>

        {/* Tournament Bracket Progress */}
        <div className="bg-white/10 backdrop-blur rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-3">Knockout Bracket Progress</h3>
          <div className="flex items-center justify-center gap-2 text-sm flex-wrap">
            <span className={`px-3 py-1 rounded ${overview.roundsCompleted >= 2 ? 'bg-green-500' : 'bg-gray-600'}`}>128</span>
            <span>→</span>
            <span className={`px-3 py-1 rounded ${overview.roundsCompleted >= 3 ? 'bg-green-500' : 'bg-gray-600'}`}>64</span>
            <span>→</span>
            <span className={`px-3 py-1 rounded ${overview.roundsCompleted >= 4 ? 'bg-green-500' : 'bg-gray-600'}`}>32</span>
            <span>→</span>
            <span className={`px-3 py-1 rounded ${overview.roundsCompleted >= 5 ? 'bg-green-500' : 'bg-gray-600'}`}>16</span>
            <span>→</span>
            <span className={`px-3 py-1 rounded ${overview.roundsCompleted >= 5 ? 'bg-yellow-500' : 'bg-gray-600'}`}>8</span>
            <span>→</span>
            <span className={`px-3 py-1 rounded ${overview.roundsCompleted >= 6 ? 'bg-green-500' : 'bg-gray-600'}`}>4</span>
            <span>→</span>
            <span className={`px-3 py-1 rounded ${overview.roundsCompleted >= 7 ? 'bg-green-500' : 'bg-gray-600'}`}>2</span>
            <span>→</span>
            <span className={`px-3 py-1 rounded ${overview.roundsCompleted >= 8 ? 'bg-green-500' : 'bg-yellow-500'}`}>🏆</span>
          </div>
          <p className="text-center text-sm text-blue-100 mt-2">
            Round {overview.roundsCompleted + 1} in progress • 8 players remaining in quarterfinals
          </p>
        </div>
      </div>
    </div>
  )
}
