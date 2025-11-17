import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
            FIDE World Cup 2025
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 mb-2">
            Goa, India
          </p>
          <p className="text-lg text-gray-500 dark:text-gray-500">
            Comprehensive statistics and analysis for all 128 players
          </p>
        </div>

        {/* Quick Access */}
        <div className="mb-12">
          <Link
            href="/stats/overview"
            className="block max-w-3xl mx-auto p-8 bg-gradient-to-br from-blue-600 to-indigo-700 dark:from-blue-900 dark:to-indigo-950 text-white rounded-xl shadow-2xl hover:shadow-3xl transform hover:scale-[1.02] transition-all duration-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold mb-2">Tournament Overview</h2>
                <p className="text-blue-100 mb-2">5 of 7 rounds complete</p>
                <p className="text-sm text-blue-200">635 games • 198 matches • 59,680 moves analyzed</p>
              </div>
              <div className="text-white">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </Link>
        </div>

        {/* Round Cards */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Round Statistics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Round 1 */}
            <Link
              href="/stats/round/1"
              className="block p-6 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:border-blue-500 dark:hover:border-blue-400 hover:shadow-lg transition-all duration-200 bg-white dark:bg-gray-800"
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Round 1</h3>
                <span className="px-3 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-xs font-semibold rounded-full">
                  Complete
                </span>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-2">128 → 64 players</p>
              <p className="text-sm text-gray-500 dark:text-gray-500">78 matches • 218 games</p>
              <div className="mt-4 text-blue-600 dark:text-blue-400 flex items-center gap-2 font-medium">
                View Stats →
              </div>
            </Link>

            {/* Round 2 */}
            <Link
              href="/stats/round/2"
              className="block p-6 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:border-blue-500 dark:hover:border-blue-400 hover:shadow-lg transition-all duration-200 bg-white dark:bg-gray-800"
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Round 2</h3>
                <span className="px-3 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-xs font-semibold rounded-full">
                  Complete
                </span>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-2">64 → 32 players</p>
              <p className="text-sm text-gray-500 dark:text-gray-500">39 matches • 221 games</p>
              <div className="mt-4 text-blue-600 dark:text-blue-400 flex items-center gap-2 font-medium">
                View Stats →
              </div>
            </Link>

            {/* Round 3 */}
            <Link
              href="/stats/round/3"
              className="block p-6 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:border-blue-500 dark:hover:border-blue-400 hover:shadow-lg transition-all duration-200 bg-white dark:bg-gray-800"
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Round 3</h3>
                <span className="px-3 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-xs font-semibold rounded-full">
                  Complete
                </span>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-2">32 → 16 players (Round of 16)</p>
              <p className="text-sm text-gray-500 dark:text-gray-500">19 matches • 99 games</p>
              <div className="mt-4 text-blue-600 dark:text-blue-400 flex items-center gap-2 font-medium">
                View Stats →
              </div>
            </Link>

            {/* Round 4 */}
            <Link
              href="/stats/round/4"
              className="block p-6 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:border-blue-500 dark:hover:border-blue-400 hover:shadow-lg transition-all duration-200 bg-white dark:bg-gray-800"
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Round 4</h3>
                <span className="px-3 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-xs font-semibold rounded-full">
                  Complete
                </span>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-2">16 → 8 players (Quarter-finals)</p>
              <p className="text-sm text-gray-500 dark:text-gray-500">9 matches • 67 games</p>
              <div className="mt-4 text-blue-600 dark:text-blue-400 flex items-center gap-2 font-medium">
                View Stats →
              </div>
            </Link>

            {/* Round 5 */}
            <Link
              href="/stats/round/5"
              className="block p-6 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:border-blue-500 dark:hover:border-blue-400 hover:shadow-lg transition-all duration-200 bg-white dark:bg-gray-800"
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Round 5</h3>
                <span className="px-3 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-xs font-semibold rounded-full">
                  Complete
                </span>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-2">8 → 4 players (Semi-finals)</p>
              <p className="text-sm text-gray-500 dark:text-gray-500">5 matches • 30 games</p>
              <div className="mt-4 text-blue-600 dark:text-blue-400 flex items-center gap-2 font-medium">
                View Stats →
              </div>
            </Link>

            {/* Round 6 - Coming Soon */}
            <div className="p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-900 opacity-60">
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Round 6</h3>
                <span className="px-3 py-1 bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400 text-xs font-semibold rounded-full">
                  Upcoming
                </span>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-2">4 → 2 players (Finals)</p>
              <p className="text-sm text-gray-500 dark:text-gray-500">Coming soon...</p>
            </div>
          </div>
        </div>

        {/* About Section */}
        <div className="max-w-4xl mx-auto mt-16 p-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">About the Tournament</h3>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            The FIDE World Cup is a single-elimination knockout tournament featuring 128 of the world&apos;s top chess players.
            Each match consists of classical games (90+30 time control), with rapid and blitz tiebreaks if needed.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mt-6">
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">128</div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Players</div>
            </div>
            <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">7</div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Rounds</div>
            </div>
            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="text-3xl font-bold text-green-600 dark:text-green-400">635</div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Games Played</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
