import Link from 'next/link'

interface RoundHeaderProps {
  roundNumber: number
  seasonNumber: number
  generatedAt: string
  nextRoundExists: boolean
}

export function RoundHeader({ roundNumber, seasonNumber, generatedAt, nextRoundExists }: RoundHeaderProps) {
  return (
    <>
      <div>
        <Link href={`/stats/${seasonNumber}`} className="text-indigo-600 dark:text-indigo-400 hover:underline text-sm mb-2 inline-block">
          ← Back to Season {seasonNumber}
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
              Season {seasonNumber} - Round {roundNumber} Statistics
            </h1>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Generated on {new Date(generatedAt).toLocaleDateString('en-US')}
            </p>
          </div>

          {/* Round Navigation */}
          <div className="flex items-center space-x-2">
            {roundNumber > 1 && (
              <Link
                href={`/stats/${seasonNumber}/round/${roundNumber - 1}`}
                className="inline-flex items-center px-3 sm:px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <svg className="w-4 h-4 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span className="hidden sm:inline">Round {roundNumber - 1}</span>
                <span className="sm:hidden">Rd {roundNumber - 1}</span>
              </Link>
            )}
            {nextRoundExists && (
              <Link
                href={`/stats/${seasonNumber}/round/${roundNumber + 1}`}
                className="inline-flex items-center px-3 sm:px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <span className="hidden sm:inline">Round {roundNumber + 1}</span>
                <span className="sm:hidden">Rd {roundNumber + 1}</span>
                <svg className="w-4 h-4 sm:ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
