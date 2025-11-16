export function AwardCard({ gameId, className, children }: { gameId?: string | null, className: string, children: React.ReactNode }) {
  const cardClasses = `p-4 ${className} rounded-lg relative group transition-all ${gameId ? 'cursor-pointer hover:ring-2 hover:ring-blue-500 dark:hover:ring-blue-400' : ''}`

  if (!gameId) {
    return <div className={cardClasses}>{children}</div>
  }

  return (
    <a
      href={`https://lichess.org/${gameId}`}
      target="_blank"
      rel="noopener noreferrer"
      className={cardClasses}
    >
      {children}
      <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <svg className="w-4 h-4 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
      </div>
    </a>
  )
}
