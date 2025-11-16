import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-6">FIDE World Cup 2025 Statistics</h1>

      <p className="text-lg mb-8 text-gray-600 dark:text-gray-400">
        Comprehensive statistics and analysis for the FIDE World Cup 2025 in Goa, India.
        Explore knockout rounds, opening trends, tactical patterns, player awards, and much more.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        <Link
          href="/stats"
          className="block p-8 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 transition-colors"
        >
          <h2 className="text-3xl font-bold mb-2">Tournament Overview</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-2">All Rounds Aggregated</p>
          <p className="text-sm text-gray-500 dark:text-gray-500">5 rounds • 640+ games analyzed</p>
          <div className="mt-4 text-blue-600 dark:text-blue-400 flex items-center gap-2">
            View Overview
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </Link>

        <Link
          href="/stats/round/1"
          className="block p-8 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 transition-colors"
        >
          <h2 className="text-2xl font-bold mb-2">Round 1</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-2">64 Players → 32 Advance</p>
          <p className="text-sm text-gray-500 dark:text-gray-500">8 matches • Nov 1-3, 2025</p>
          <div className="mt-4 text-blue-600 dark:text-blue-400 flex items-center gap-2">
            View Round Stats
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </Link>

        <Link
          href="/stats/round/3"
          className="block p-8 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 transition-colors"
        >
          <h2 className="text-2xl font-bold mb-2">Round 3 (Round of 16)</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-2">16 Players → 8 Advance</p>
          <p className="text-sm text-gray-500 dark:text-gray-500">11 matches • Nov 7-9, 2025</p>
          <div className="mt-4 text-blue-600 dark:text-blue-400 flex items-center gap-2">
            View Round Stats
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </Link>
      </div>

      <div className="mt-12 p-6 bg-gray-50 dark:bg-gray-900 rounded-lg">
        <h3 className="text-xl font-bold mb-4">About FIDE World Cup 2025</h3>
        <p className="text-gray-700 dark:text-gray-300 mb-4">
          The FIDE World Cup is a single-elimination knockout tournament featuring 128 of the world&apos;s top chess players.
          Each match consists of classical games (90+30 time control), with rapid and blitz tiebreaks if needed.
          The tournament is held in Goa, India from November 1-15, 2025.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6 text-sm">
          <div>
            <div className="font-bold text-gray-900 dark:text-gray-100">Round 1-2</div>
            <div className="text-gray-600 dark:text-gray-400">Nov 1-6</div>
          </div>
          <div>
            <div className="font-bold text-gray-900 dark:text-gray-100">Round 3-4</div>
            <div className="text-gray-600 dark:text-gray-400">Nov 7-12</div>
          </div>
          <div>
            <div className="font-bold text-gray-900 dark:text-gray-100">Semi-Finals & Final</div>
            <div className="text-gray-600 dark:text-gray-400">Nov 13-15</div>
          </div>
        </div>
      </div>
    </div>
  );
}
