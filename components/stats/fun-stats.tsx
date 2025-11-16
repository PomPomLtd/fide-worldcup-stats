import { StatCard } from './stat-card'
import { PlayerVs, PlayerName } from './player-name'

interface FunStatsProps {
  funStats?: {
    fastestQueenTrade: {
      moves: number
      gameIndex: number
      gameId: string | null
      white: string
      black: string
    } | null
    slowestQueenTrade: {
      moves: number
      gameIndex: number
      gameId: string | null
      white: string
      black: string
    } | null
    longestCaptureSequence: {
      length: number
      gameIndex: number
      gameId: string | null
      startMove: number
      white: string
      black: string
    } | null
    longestCheckSequence: {
      length: number
      gameIndex: number
      gameId: string | null
      startMove: number
      white: string
      black: string
    } | null
    pawnStorm: {
      count: number
      gameIndex: number
      gameId: string | null
      white: string
      black: string
    } | null
    pieceLoyalty: {
      moves: number
      gameIndex: number
      gameId: string | null
      piece: string
      square: string
      white: string
      black: string
    } | null
    squareTourist: {
      squares: number
      gameIndex: number
      gameId: string | null
      piece: string
      color: string
      startSquare: string
      white: string
      black: string
    } | null
    castlingRace: {
      moves: number
      gameIndex: number
      gameId: string | null
      winner: string
      white: string
      black: string
    } | null
    openingHipster: {
      gameIndex: number
      gameId: string | null
      eco: string
      name: string
      moves: string
      white: string
      black: string
    } | null
    dadbodShuffler: {
      moves: number
      gameIndex: number
      gameId: string | null
      color: string
      white: string
      black: string
    } | null
    sportyQueen: {
      distance: number
      gameIndex: number
      gameId: string | null
      color: string
      white: string
      black: string
    } | null
    edgeLord: {
      moves: number
      gameIndex: number
      gameId: string | null
      color: string
      white: string
      black: string
    } | null
    rookLift: {
      moveNumber: number
      gameIndex: number
      gameId: string | null
      color: string
      rook: string
      square: string
      white: string
      black: string
    } | null
    centerStage: {
      moves: number
      gameIndex: number
      gameId: string | null
      piece: string
      startSquare: string
      color: string
      white: string
      black: string
    } | null
    darkLord: {
      captures: number
      gameIndex: number
      gameId: string | null
      color: string
      white: string
      black: string
    } | null
    chickenAward: {
      retreats: number
      gameIndex: number
      gameId: string | null
      color: string
      white: string
      black: string
    } | null
    slowestCastling: {
      moves: number
      gameIndex: number
      gameId: string | null
      color: string
      white: string
      black: string
    } | null
    pawnCaptures: {
      captures: number
      gameIndex: number
      gameId: string | null
      color: string
      white: string
      black: string
    } | null
    homebody?: {
      white: string
      black: string
      player: string
      playerName: string
      piecesInEnemy: number
      description: string
    }
    lateBloomer?: {
      white: string
      black: string
      player: string
      playerName: string
      moveNumber: number
      description: string
    }
    quickDraw?: {
      white: string
      black: string
      player: string
      playerName: string
      moveNumber: number
      description: string
    }
    crosshairs?: {
      white: string
      black: string
      square: string
      attackers: number
      whiteAttackers: number
      blackAttackers: number
      moveNumber: number
      move: string
      description: string
    }
    longestTension?: {
      white: string
      black: string
      moves: number
      squares: string
      startMove: number
      endMove: number
      description: string
    }
    // Time-based awards
    sniper?: {
      white: string
      black: string
      gameIndex: number
      gameId: string | null
      player: string
      color: string
      timeSpent: number
      moveNumber: number
      move: string
    }
    openingBlitzer?: {
      white: string
      black: string
      gameIndex: number
      gameId: string | null
      player: string
      color: string
      avgTime: number
      moveCount: number
    }
    sadTimes?: {
      white: string
      black: string
      gameIndex: number
      gameId: string | null
      player: string
      color: string
      timeSpent: number
      moveNumber: number
      move: string
      eval: number
    }
    mostPremoves?: {
      white: string
      black: string
      gameIndex: number
      gameId: string | null
      player: string
      color: string
      count: number
    }
    longestThink?: {
      white: string
      black: string
      gameIndex: number
      gameId: string | null
      player: string
      color: string
      timeSpent: number
      moveNumber: number
      move: string
    }
    zeitnotAddict?: {
      white: string
      black: string
      gameIndex: number
      gameId: string | null
      player: string
      color: string
      count: number
    }
    timeScrambleSurvivor?: {
      white: string
      black: string
      gameIndex: number
      gameId: string | null
      winner: string
      color: string
      minClock: number
      criticalMoves: number
      result: string
    }
    bulletSpeed?: {
      white: string
      black: string
      gameIndex: number
      gameId: string | null
      player: string
      color: string
      avgTime: number
      moveCount: number
    }
    antiOrthogonal: {
      moves: number
      gameIndex: number
      gameId: string | null
      color: string
      white: string
      black: string
    } | null
    comfortZone: {
      percentage: number
      pieceType: string
      moves: number
      totalNonPawnMoves: number
      gameIndex: number
      gameId: string | null
      color: string
      white: string
      black: string
    } | null
  }
}

// Helper function to format time in seconds to readable format
function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.round(seconds % 60)
  if (mins === 0) {
    return `${secs}s`
  }
  return `${mins}m ${secs}s`
}

// Helper function to create clickable award card
function AwardCard({ gameId, className, children }: { gameId?: string | null, className: string, children: React.ReactNode }) {
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

export function FunStats({ funStats }: FunStatsProps) {
  if (!funStats) return null

  return (
    <StatCard title="🎉 Fun Stats">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {funStats.fastestQueenTrade && (
          <AwardCard gameId={funStats.fastestQueenTrade.gameId} className="bg-slate-50 dark:bg-slate-900/20">
            <div className="font-semibold text-slate-900 dark:text-slate-300 mb-1">💼 Strategic Downsizing Award</div>
            <div className="text-sm text-gray-700 dark:text-gray-300">
              <PlayerVs white={funStats.fastestQueenTrade.white} black={funStats.fastestQueenTrade.black} />
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              Queens traded by move {funStats.fastestQueenTrade.moves}
            </div>
          </AwardCard>
        )}

        {funStats.slowestQueenTrade && (
          <AwardCard gameId={funStats.slowestQueenTrade.gameId} className="bg-amber-50 dark:bg-amber-900/20">
            <div className="font-semibold text-amber-900 dark:text-amber-300 mb-1">🕰️ Separation Anxiety Award</div>
            <div className="text-sm text-gray-700 dark:text-gray-300">
              <PlayerVs white={funStats.slowestQueenTrade.white} black={funStats.slowestQueenTrade.black} />
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              Queens kept until move {funStats.slowestQueenTrade.moves}
            </div>
          </AwardCard>
        )}

        {funStats.longestCaptureSequence && (
          <AwardCard gameId={funStats.longestCaptureSequence.gameId} className="bg-red-50 dark:bg-red-900/20">
            <div className="font-semibold text-red-900 dark:text-red-300 mb-1">🔪 Longest Capture Spree</div>
            <div className="text-sm text-gray-700 dark:text-gray-300">
              <PlayerVs white={funStats.longestCaptureSequence.white} black={funStats.longestCaptureSequence.black} />
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              {funStats.longestCaptureSequence.length} consecutive captures starting move {funStats.longestCaptureSequence.startMove}
            </div>
          </AwardCard>
        )}

        {funStats.longestCheckSequence && (
          <AwardCard gameId={funStats.longestCheckSequence.gameId} className="bg-orange-50 dark:bg-orange-900/20">
            <div className="font-semibold text-orange-900 dark:text-orange-300 mb-1">👑 Longest King Hunt</div>
            <div className="text-sm text-gray-700 dark:text-gray-300">
              <PlayerVs white={funStats.longestCheckSequence.white} black={funStats.longestCheckSequence.black} />
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              {funStats.longestCheckSequence.length} checks by one side starting move {funStats.longestCheckSequence.startMove}
            </div>
          </AwardCard>
        )}

        {funStats.pawnStorm && (
          <AwardCard gameId={funStats.pawnStorm.gameId} className="bg-cyan-50 dark:bg-cyan-900/20">
            <div className="font-semibold text-cyan-900 dark:text-cyan-300 mb-1">🌪️ Pawn Storm Award</div>
            <div className="text-sm text-gray-700 dark:text-gray-300">
              <PlayerVs white={funStats.pawnStorm.white} black={funStats.pawnStorm.black} />
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              {funStats.pawnStorm.count} pawn moves in the opening phase
            </div>
          </AwardCard>
        )}

        {funStats.pieceLoyalty && (
          <AwardCard gameId={funStats.pieceLoyalty.gameId} className="bg-indigo-50 dark:bg-indigo-900/20">
            <div className="font-semibold text-indigo-900 dark:text-indigo-300 mb-1">🏠 Piece Loyalty Award</div>
            <div className="text-sm text-gray-700 dark:text-gray-300">
              <PlayerVs white={funStats.pieceLoyalty.white} black={funStats.pieceLoyalty.black} />
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              {funStats.pieceLoyalty.piece} stayed on {funStats.pieceLoyalty.square} for {funStats.pieceLoyalty.moves} moves
            </div>
          </AwardCard>
        )}

        {funStats.squareTourist && (
          <AwardCard gameId={funStats.squareTourist.gameId} className="bg-teal-50 dark:bg-teal-900/20">
            <div className="font-semibold text-teal-900 dark:text-teal-300 mb-1">✈️ Square Tourist Award</div>
            <div className="text-sm text-gray-700 dark:text-gray-300">
              <PlayerVs white={funStats.squareTourist.white} black={funStats.squareTourist.black} />
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              {funStats.squareTourist.color}&apos;s {funStats.squareTourist.startSquare} {funStats.squareTourist.piece} visited {funStats.squareTourist.squares} different squares
            </div>
          </AwardCard>
        )}

        {funStats.castlingRace && (
          <AwardCard gameId={funStats.castlingRace.gameId} className="bg-purple-50 dark:bg-purple-900/20">
            <div className="font-semibold text-purple-900 dark:text-purple-300 mb-1">🏁 Castling Race Winner</div>
            <div className="text-sm text-gray-700 dark:text-gray-300">
              <PlayerVs white={funStats.castlingRace.white} black={funStats.castlingRace.black} />
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              {funStats.castlingRace.winner === 'white' ? funStats.castlingRace.white : funStats.castlingRace.black} castled first on move {funStats.castlingRace.moves}
            </div>
          </AwardCard>
        )}

        {funStats.openingHipster && (
          <AwardCard gameId={funStats.openingHipster.gameId} className="bg-blue-50 dark:bg-blue-900/20">
            <div className="font-semibold text-blue-900 dark:text-blue-300 mb-1">🎩 Opening Hipster</div>
            <div className="text-sm text-gray-700 dark:text-gray-300">
              <PlayerVs white={funStats.openingHipster.white} black={funStats.openingHipster.black} />
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              Most obscure opening: {funStats.openingHipster.eco} {funStats.openingHipster.name}
            </div>
          </AwardCard>
        )}

        {funStats.dadbodShuffler && (
          <AwardCard gameId={funStats.dadbodShuffler.gameId} className="bg-yellow-50 dark:bg-yellow-900/20">
            <div className="font-semibold text-yellow-900 dark:text-yellow-300 mb-1">👑 Dadbod Shuffler</div>
            <div className="text-sm text-gray-700 dark:text-gray-300">
              <PlayerVs white={funStats.dadbodShuffler.white} black={funStats.dadbodShuffler.black} />
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              {funStats.dadbodShuffler.color} king moved {funStats.dadbodShuffler.moves} times
            </div>
          </AwardCard>
        )}

        {funStats.sportyQueen && (
          <AwardCard gameId={funStats.sportyQueen.gameId} className="bg-pink-50 dark:bg-pink-900/20">
            <div className="font-semibold text-pink-900 dark:text-pink-300 mb-1">👸 Sporty Queen</div>
            <div className="text-sm text-gray-700 dark:text-gray-300">
              <PlayerVs white={funStats.sportyQueen.white} black={funStats.sportyQueen.black} />
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              {funStats.sportyQueen.color} queen traveled {Math.round(funStats.sportyQueen.distance)} squares (~{(funStats.sportyQueen.distance * 0.82 * 5.5).toFixed(0)} cm, or {(funStats.sportyQueen.distance * 0.82 * 5.5 * 18.54 / 100).toFixed(0)}m at human scale)
            </div>
          </AwardCard>
        )}

        {funStats.edgeLord && (
          <AwardCard gameId={funStats.edgeLord.gameId} className="bg-slate-50 dark:bg-slate-900/20">
            <div className="font-semibold text-slate-900 dark:text-slate-300 mb-1">📐 Professional Edger</div>
            <div className="text-sm text-gray-700 dark:text-gray-300">
              <PlayerVs white={funStats.edgeLord.white} black={funStats.edgeLord.black} />
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              {funStats.edgeLord.color} made {funStats.edgeLord.moves} moves on edge files (a/h)
            </div>
          </AwardCard>
        )}

        {funStats.rookLift && (
          <AwardCard gameId={funStats.rookLift.gameId} className="bg-emerald-50 dark:bg-emerald-900/20">
            <div className="font-semibold text-emerald-900 dark:text-emerald-300 mb-1">🚀 Do You Even Rook Lift Bro</div>
            <div className="text-sm text-gray-700 dark:text-gray-300">
              <PlayerVs white={funStats.rookLift.white} black={funStats.rookLift.black} />
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              {funStats.rookLift.rook} activated on move {funStats.rookLift.moveNumber}
            </div>
          </AwardCard>
        )}

        {funStats.centerStage && (
          <AwardCard gameId={funStats.centerStage.gameId} className="bg-violet-50 dark:bg-violet-900/20">
            <div className="font-semibold text-violet-900 dark:text-violet-300 mb-1">⭐ Center Stage</div>
            <div className="text-sm text-gray-700 dark:text-gray-300">
              <PlayerVs white={funStats.centerStage.white} black={funStats.centerStage.black} />
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              {funStats.centerStage.piece} dominated the center with {funStats.centerStage.moves} moves on d4/d5/e4/e5
            </div>
          </AwardCard>
        )}

        {funStats.darkLord && (
          <AwardCard gameId={funStats.darkLord.gameId} className="bg-gray-800 dark:bg-gray-950 border border-gray-700 dark:border-gray-800">
            <div className="font-semibold text-gray-100 dark:text-gray-200 mb-1">🌑 Dark Mode Enthusiast</div>
            <div className="text-sm text-gray-200 dark:text-gray-300">
              <PlayerVs white={funStats.darkLord.white} black={funStats.darkLord.black} />
            </div>
            <div className="text-xs text-gray-300 dark:text-gray-400 mt-1">
              {funStats.darkLord.color} captured {funStats.darkLord.captures} pieces on dark squares
            </div>
          </AwardCard>
        )}

        {funStats.chickenAward && (
          <AwardCard gameId={funStats.chickenAward.gameId} className="bg-lime-50 dark:bg-lime-900/20">
            <div className="font-semibold text-lime-900 dark:text-lime-300 mb-1">🐔 Chicken Award</div>
            <div className="text-sm text-gray-700 dark:text-gray-300">
              <PlayerVs white={funStats.chickenAward.white} black={funStats.chickenAward.black} />
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              {funStats.chickenAward.color} made {funStats.chickenAward.retreats} retreating moves
            </div>
          </AwardCard>
        )}

        {funStats.slowestCastling && (
          <AwardCard gameId={funStats.slowestCastling.gameId} className="bg-slate-50 dark:bg-slate-900/20">
            <div className="font-semibold text-slate-900 dark:text-slate-300 mb-1">🏰 Castle Commitment Issues</div>
            <div className="text-sm text-gray-700 dark:text-gray-300">
              <PlayerVs white={funStats.slowestCastling.white} black={funStats.slowestCastling.black} />
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              {funStats.slowestCastling.color} castled on move {funStats.slowestCastling.moves}
            </div>
          </AwardCard>
        )}

        {funStats.pawnCaptures && (
          <AwardCard gameId={funStats.pawnCaptures.gameId} className="bg-red-50 dark:bg-red-900/20">
            <div className="font-semibold text-red-900 dark:text-red-300 mb-1">🏴 Peasant Uprising Award</div>
            <div className="text-sm text-gray-700 dark:text-gray-300">
              <PlayerVs white={funStats.pawnCaptures.white} black={funStats.pawnCaptures.black} />
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              {funStats.pawnCaptures.color} pawns captured {funStats.pawnCaptures.captures} {funStats.pawnCaptures.captures === 1 ? 'piece' : 'pieces'}
            </div>
          </AwardCard>
        )}

        {funStats.homebody && (
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="font-semibold text-blue-900 dark:text-blue-300 mb-1">🏠 Homeboy</div>
            <div className="text-sm text-gray-700 dark:text-gray-300">
              <PlayerVs white={funStats.homebody.white} black={funStats.homebody.black} />
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              {funStats.homebody.playerName} only crossed {funStats.homebody.piecesInEnemy} piece(s) into opponent&apos;s half
            </div>
          </div>
        )}

        {funStats.lateBloomer && (
          <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <div className="font-semibold text-purple-900 dark:text-purple-300 mb-1">🐢 Late Bloomer</div>
            <div className="text-sm text-gray-700 dark:text-gray-300">
              <PlayerVs white={funStats.lateBloomer.white} black={funStats.lateBloomer.black} />
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              {funStats.lateBloomer.playerName} waited until move {Math.floor((funStats.lateBloomer.moveNumber + 1) / 2)} to cross into opponent&apos;s half
            </div>
          </div>
        )}

        {funStats.quickDraw && (
          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="font-semibold text-green-900 dark:text-green-300 mb-1">🔫 Fastest Gun</div>
            <div className="text-sm text-gray-700 dark:text-gray-300">
              <PlayerVs white={funStats.quickDraw.white} black={funStats.quickDraw.black} />
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              {funStats.quickDraw.playerName} crossed into opponent&apos;s half on move {Math.floor((funStats.quickDraw.moveNumber + 1) / 2)}
            </div>
          </div>
        )}

        {funStats.crosshairs && (
          <AwardCard gameId={undefined} className="bg-orange-50 dark:bg-orange-900/20">
            <div className="font-semibold text-orange-900 dark:text-orange-300 mb-1">🎯 Crosshairs</div>
            <div className="text-sm text-gray-700 dark:text-gray-300">
              <PlayerVs white={funStats.crosshairs.white} black={funStats.crosshairs.black} />
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              {funStats.crosshairs.square} attacked by {funStats.crosshairs.attackers} pieces
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
              {Math.floor((funStats.crosshairs.moveNumber + 1) / 2)}{funStats.crosshairs.moveNumber % 2 === 1 ? '.' : '...'} {funStats.crosshairs.move}
            </div>
          </AwardCard>
        )}

        {funStats.longestTension && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <div className="font-semibold text-red-900 dark:text-red-300 mb-1">💢 Hypertension Award</div>
            <div className="text-sm text-gray-700 dark:text-gray-300">
              <PlayerVs white={funStats.longestTension.white} black={funStats.longestTension.black} />
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              {funStats.longestTension.squares} faced off for {funStats.longestTension.moves} moves
            </div>
          </div>
        )}

        {funStats.antiOrthogonal && (
          <AwardCard gameId={funStats.antiOrthogonal.gameId} className="bg-purple-50 dark:bg-purple-900/20">
            <div className="font-semibold text-purple-900 dark:text-purple-300 mb-1">✖️ Anti-Orthogonal Activist</div>
            <div className="text-sm text-gray-700 dark:text-gray-300">
              <PlayerVs white={funStats.antiOrthogonal.white} black={funStats.antiOrthogonal.black} />
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              {funStats.antiOrthogonal.color} made {funStats.antiOrthogonal.moves} diagonal {funStats.antiOrthogonal.moves === 1 ? 'move' : 'moves'}
            </div>
          </AwardCard>
        )}

        {funStats.comfortZone && (
          <AwardCard gameId={funStats.comfortZone.gameId} className="bg-cyan-50 dark:bg-cyan-900/20">
            <div className="font-semibold text-cyan-900 dark:text-cyan-300 mb-1">✨ Comfort Zone Champion</div>
            <div className="text-sm text-gray-700 dark:text-gray-300">
              <PlayerVs white={funStats.comfortZone.white} black={funStats.comfortZone.black} />
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              {funStats.comfortZone.color} used {funStats.comfortZone.pieceType} for {funStats.comfortZone.percentage}% of non-pawn moves ({funStats.comfortZone.moves}/{funStats.comfortZone.totalNonPawnMoves})
            </div>
          </AwardCard>
        )}

        {/* Time-based awards */}
        {funStats.sniper && (
          <AwardCard gameId={funStats.sniper.gameId} className="bg-purple-50 dark:bg-purple-900/20">
            <div className="font-semibold text-purple-900 dark:text-purple-300 mb-1">🎯 Sniper</div>
            <div className="text-sm text-gray-700 dark:text-gray-300">
              {funStats.sniper.player}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              Delivered checkmate in {formatTime(funStats.sniper.timeSpent)}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
              {funStats.sniper.white} vs {funStats.sniper.black}
            </div>
          </AwardCard>
        )}

        {funStats.openingBlitzer && (
          <AwardCard gameId={funStats.openingBlitzer.gameId} className="bg-cyan-50 dark:bg-cyan-900/20">
            <div className="font-semibold text-cyan-900 dark:text-cyan-300 mb-1">📚 Opening Blitzer</div>
            <div className="text-sm text-gray-700 dark:text-gray-300">
              {funStats.openingBlitzer.player}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              Averaged {formatTime(funStats.openingBlitzer.avgTime)} per move in opening
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
              {funStats.openingBlitzer.white} vs {funStats.openingBlitzer.black}
            </div>
          </AwardCard>
        )}

        {funStats.sadTimes && (
          <AwardCard gameId={funStats.sadTimes.gameId} className="bg-gray-50 dark:bg-gray-800/50">
            <div className="font-semibold text-gray-900 dark:text-gray-300 mb-1">😢 Sad Times Award</div>
            <div className="text-sm text-gray-700 dark:text-gray-300">
              {funStats.sadTimes.player}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              Thought for {formatTime(funStats.sadTimes.timeSpent)} on {Math.floor((funStats.sadTimes.moveNumber + 1) / 2)}{funStats.sadTimes.moveNumber % 2 === 1 ? '.' : '...'} {funStats.sadTimes.move} at eval {funStats.sadTimes.eval.toFixed(2)}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
              {funStats.sadTimes.white} vs {funStats.sadTimes.black}
            </div>
          </AwardCard>
        )}

        {funStats.mostPremoves && (
          <AwardCard gameId={funStats.mostPremoves.gameId} className="bg-lime-50 dark:bg-lime-900/20">
            <div className="font-semibold text-lime-900 dark:text-lime-300 mb-1">🎮 Premove Master</div>
            <div className="text-sm text-gray-700 dark:text-gray-300">
              {funStats.mostPremoves.player}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              Made {funStats.mostPremoves.count} premoves (under 0.5s)
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
              {funStats.mostPremoves.white} vs {funStats.mostPremoves.black}
            </div>
          </AwardCard>
        )}

        {funStats.longestThink && (
          <AwardCard gameId={funStats.longestThink.gameId} className="bg-yellow-50 dark:bg-yellow-900/20">
            <div className="font-semibold text-yellow-900 dark:text-yellow-300 mb-1">🤔 Deep Thinker</div>
            <div className="text-sm text-gray-700 dark:text-gray-300">
              {funStats.longestThink.player}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              Spent {formatTime(funStats.longestThink.timeSpent)} on {Math.floor((funStats.longestThink.moveNumber + 1) / 2)}{funStats.longestThink.moveNumber % 2 === 1 ? '.' : '...'} {funStats.longestThink.move}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
              {funStats.longestThink.white} vs {funStats.longestThink.black}
            </div>
          </AwardCard>
        )}

        {funStats.zeitnotAddict && (
          <AwardCard gameId={funStats.zeitnotAddict.gameId} className="bg-rose-50 dark:bg-rose-900/20">
            <div className="font-semibold text-rose-900 dark:text-rose-300 mb-1">⏰ Zeitnot Addict</div>
            <div className="text-sm text-gray-700 dark:text-gray-300">
              {funStats.zeitnotAddict.player}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              Made {funStats.zeitnotAddict.count} moves with under 60 seconds
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
              {funStats.zeitnotAddict.white} vs {funStats.zeitnotAddict.black}
            </div>
          </AwardCard>
        )}

        {funStats.timeScrambleSurvivor && (
          <AwardCard gameId={funStats.timeScrambleSurvivor.gameId} className="bg-emerald-50 dark:bg-emerald-900/20">
            <div className="font-semibold text-emerald-900 dark:text-emerald-300 mb-1">🏆 Time Scramble Survivor</div>
            <div className="text-sm text-gray-700 dark:text-gray-300">
              {funStats.timeScrambleSurvivor.winner}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              Won with {formatTime(funStats.timeScrambleSurvivor.minClock)} remaining
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
              {funStats.timeScrambleSurvivor.white} vs {funStats.timeScrambleSurvivor.black}
            </div>
          </AwardCard>
        )}

        {funStats.bulletSpeed && (
          <AwardCard gameId={funStats.bulletSpeed.gameId} className="bg-sky-50 dark:bg-sky-900/20">
            <div className="font-semibold text-sky-900 dark:text-sky-300 mb-1">⚡ Bullet Speed</div>
            <div className="text-sm text-gray-700 dark:text-gray-300">
              {funStats.bulletSpeed.player}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              Averaged {formatTime(funStats.bulletSpeed.avgTime)} per move
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
              {funStats.bulletSpeed.white} vs {funStats.bulletSpeed.black}
            </div>
          </AwardCard>
        )}
      </div>
    </StatCard>
  )
}
