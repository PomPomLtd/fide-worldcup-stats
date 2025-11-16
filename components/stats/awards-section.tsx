import { PlayerVs } from './player-name'
import { StatCard } from './stat-card'
import { AwardCard } from './award-card'

interface AwardsSectionProps {
  awards: {
    bloodbath: {
      white: string
      black: string
      captures: number
      gameId: string | null
    }
    pacifist: {
      white: string
      black: string
      captures: number
      gameId: string | null
    }
    speedDemon: {
      white: string
      black: string
      moves: number
      winner: string
      gameId: string | null
    } | null
    endgameWizard: {
      white: string
      black: string
      endgameMoves: number
      gameId: string | null
    }
    openingSprinter: {
      white: string
      black: string
      openingMoves: number
      gameId: string | null
    } | null
  }
}

export function AwardsSection({ awards }: AwardsSectionProps) {
  return (
    <StatCard title="🏆 Round Awards">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <AwardCard gameId={awards.bloodbath.gameId} className="bg-red-50 dark:bg-red-900/20">
          <div className="font-semibold text-red-900 dark:text-red-300 mb-1">🩸 Bloodbath Award</div>
          <div className="text-sm text-gray-700 dark:text-gray-300">
            <PlayerVs white={awards.bloodbath.white} black={awards.bloodbath.black} />
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">{awards.bloodbath.captures} captures!</div>
        </AwardCard>

        <AwardCard gameId={awards.pacifist.gameId} className="bg-green-50 dark:bg-green-900/20">
          <div className="font-semibold text-green-900 dark:text-green-300 mb-1">🕊️ Pacifist Award</div>
          <div className="text-sm text-gray-700 dark:text-gray-300">
            <PlayerVs white={awards.pacifist.white} black={awards.pacifist.black} />
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">{awards.pacifist.captures} captures</div>
        </AwardCard>

        {awards.speedDemon && (
          <AwardCard gameId={awards.speedDemon.gameId} className="bg-yellow-50 dark:bg-yellow-900/20">
            <div className="font-semibold text-yellow-900 dark:text-yellow-300 mb-1">⚡ Speed Demon</div>
            <div className="text-sm text-gray-700 dark:text-gray-300">
              <PlayerVs white={awards.speedDemon.white} black={awards.speedDemon.black} />
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">Mate in {awards.speedDemon.moves} moves</div>
          </AwardCard>
        )}

        <AwardCard gameId={awards.endgameWizard.gameId} className="bg-purple-50 dark:bg-purple-900/20">
          <div className="font-semibold text-purple-900 dark:text-purple-300 mb-1">🧙 Endgame Wizard</div>
          <div className="text-sm text-gray-700 dark:text-gray-300">
            <PlayerVs white={awards.endgameWizard.white} black={awards.endgameWizard.black} />
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">{awards.endgameWizard.endgameMoves} endgame moves!</div>
        </AwardCard>
      </div>
    </StatCard>
  )
}
