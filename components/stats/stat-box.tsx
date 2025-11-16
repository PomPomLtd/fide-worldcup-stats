import { ReactNode } from 'react'

interface StatBoxProps {
  title: string
  emoji?: string
  player: ReactNode
  details: ReactNode
  colorScheme: 'yellow' | 'red' | 'green' | 'orange' | 'blue' | 'purple' | 'indigo'
  featured?: boolean
  gameId?: string | null
}

const colorClasses = {
  yellow: {
    bg: 'bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20',
    border: 'border-yellow-400 dark:border-yellow-600',
    title: 'text-yellow-900 dark:text-yellow-200',
    text: 'text-gray-700 dark:text-gray-300',
  },
  red: {
    bg: 'bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20',
    border: 'border-red-400 dark:border-red-600',
    title: 'text-red-900 dark:text-red-200',
    text: 'text-gray-700 dark:text-gray-300',
  },
  green: {
    bg: 'bg-green-50 dark:bg-green-900/20',
    border: '',
    title: 'text-green-900 dark:text-green-300',
    text: 'text-gray-700 dark:text-gray-300',
  },
  orange: {
    bg: 'bg-orange-50 dark:bg-orange-900/20',
    border: '',
    title: 'text-orange-900 dark:text-orange-300',
    text: 'text-gray-700 dark:text-gray-300',
  },
  blue: {
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    border: '',
    title: 'text-blue-900 dark:text-blue-300',
    text: 'text-gray-700 dark:text-gray-300',
  },
  purple: {
    bg: 'bg-purple-50 dark:bg-purple-900/20',
    border: '',
    title: 'text-purple-900 dark:text-purple-300',
    text: 'text-gray-700 dark:text-gray-300',
  },
  indigo: {
    bg: 'bg-indigo-50 dark:bg-indigo-900/20',
    border: 'border-indigo-400 dark:border-indigo-600',
    title: 'text-indigo-900 dark:text-indigo-300',
    text: 'text-gray-700 dark:text-gray-300',
  },
}

export function StatBox({ title, emoji, player, details, colorScheme, featured = false, gameId }: StatBoxProps) {
  const colors = colorClasses[colorScheme]
  const borderClass = featured ? `border-2 ${colors.border}` : ''
  const hoverClass = gameId ? 'cursor-pointer hover:ring-2 hover:ring-gray-400 dark:hover:ring-gray-500 transition-all relative group' : ''

  const content = (
    <>
      <div className={`font-semibold ${colors.title} mb-1`}>
        {emoji && <span className="mr-1">{emoji}</span>}
        {title}
      </div>
      <div className={`text-sm ${colors.text} font-medium`}>
        {player}
      </div>
      <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
        {details}
      </div>
      {gameId && (
        <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <svg className="w-4 h-4 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </div>
      )}
    </>
  )

  if (!gameId) {
    return (
      <div className={`p-4 ${colors.bg} rounded-lg ${borderClass}`}>
        {content}
      </div>
    )
  }

  return (
    <a
      href={`https://lichess.org/${gameId}`}
      target="_blank"
      rel="noopener noreferrer"
      className={`p-4 ${colors.bg} rounded-lg ${borderClass} ${hoverClass} block`}
    >
      {content}
    </a>
  )
}
