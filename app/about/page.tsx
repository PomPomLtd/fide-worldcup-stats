export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
            About FIDE World Cup 2025 Stats
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Comprehensive statistical analysis of the FIDE World Cup 2025
          </p>
        </div>

        {/* Main Content */}
        <div className="space-y-8">
          {/* Disclaimer */}
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-6">
            <h2 className="text-xl font-bold text-yellow-900 dark:text-yellow-200 mb-3 flex items-center gap-2">
              <span>⚠️</span>
              <span>Important Notice</span>
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-2">
              This website is <strong>not officially associated with FIDE</strong> or the FIDE World Cup 2025 tournament.
            </p>
            <p className="text-gray-700 dark:text-gray-300">
              This is an <strong>experimental platform</strong> created by chess enthusiasts to provide detailed statistical analysis.
              While we strive for accuracy, this site <strong>may contain errors or inaccuracies</strong>.
              All official tournament information should be verified through{' '}
              <a
                href="https://worldcup2025.fide.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-yellow-700 dark:text-yellow-300 hover:underline font-medium"
              >
                the official FIDE World Cup website
              </a>.
            </p>
          </div>

          {/* About the Project */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">About This Project</h2>
            <div className="space-y-4 text-gray-700 dark:text-gray-300">
              <p>
                FIDE World Cup 2025 Stats is a comprehensive statistical analysis platform for the 2025 FIDE World Cup
                held in Goa, India. We process PGN game files from the tournament to generate detailed statistics,
                insights, and visualizations across multiple categories.
              </p>
              <p>
                Our analysis includes over 15 statistical categories covering everything from opening moves and tactical
                patterns to player performance awards and time management. We track data across all time controls
                (classical, rapid, and blitz) throughout the tournament&apos;s 8-round knockout structure.
              </p>
              <p className="font-medium">
                The platform features:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Round-by-round statistical breakdowns</li>
                <li>Tournament-wide aggregated statistics</li>
                <li>Player performance tracking and awards</li>
                <li>Opening analysis with ECO code enrichment</li>
                <li>Tactical pattern recognition</li>
                <li>Time control comparison charts</li>
                <li>Interactive visualizations and heatmaps</li>
                <li>Fun and creative statistical awards</li>
              </ul>
            </div>
          </div>

          {/* Technology */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Technology</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Built with modern web technologies for fast, responsive performance:
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="font-semibold text-gray-900 dark:text-white">Next.js 15</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Framework</div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="font-semibold text-gray-900 dark:text-white">React 19</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">UI Library</div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="font-semibold text-gray-900 dark:text-white">TailwindCSS 4</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Styling</div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="font-semibold text-gray-900 dark:text-white">TypeScript 5</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Language</div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="font-semibold text-gray-900 dark:text-white">Recharts</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Visualizations</div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="font-semibold text-gray-900 dark:text-white">chess.js</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Engine</div>
              </div>
            </div>
          </div>

          {/* Created By */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Created By</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="flex-1">
                  <p className="text-gray-700 dark:text-gray-300 mb-3">
                    This project is developed and maintained by{' '}
                    <a
                      href="https://www.pom-pom.ch"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 dark:text-indigo-400 hover:underline font-semibold"
                    >
                      Pom Pom Ltd
                    </a>, a software development company based in Switzerland.
                  </p>
                  <p className="text-gray-700 dark:text-gray-300 mb-4">
                    We are passionate about chess and data visualization, combining both to create
                    engaging tools for the chess community.
                  </p>
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Contact Us</h3>
                    <p className="text-gray-700 dark:text-gray-300">
                      For questions, feedback, or reporting issues, please contact us at:
                    </p>
                    <a
                      href="mailto:hello@pom-pom.ch"
                      className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
                    >
                      hello@pom-pom.ch
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Copyright */}
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 p-6 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              © 2025 Pom Pom Ltd. Licensed under the{' '}
              <a
                href="https://opensource.org/licenses/MIT"
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                MIT License
              </a>.
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
              Tournament data sourced from public PGN files. Chess game analysis powered by chess.js and Stockfish.
            </p>
          </div>

          {/* Acknowledgments */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Acknowledgments</h2>
            <div className="space-y-3 text-gray-700 dark:text-gray-300">
              <p>
                <strong>Opening Database:</strong>{' '}
                <a
                  href="https://github.com/lichess-org/chess-openings"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  Lichess opening database
                </a>{' '}
                (3,546+ openings)
              </p>
              <p>
                <strong>Chess Engine:</strong>{' '}
                <a
                  href="https://github.com/jhlywa/chess.js"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  chess.js
                </a>{' '}
                and{' '}
                <a
                  href="https://stockfishchess.org/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  Stockfish
                </a>
              </p>
              <p>
                <strong>Framework:</strong>{' '}
                <a
                  href="https://nextjs.org/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  Next.js
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
