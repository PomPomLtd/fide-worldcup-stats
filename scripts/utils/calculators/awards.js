/**
 * Awards Calculator
 *
 * Calculates tournament awards: Bloodbath, Pacifist, Speed Demon,
 * Endgame Wizard, and Opening Sprinter.
 */

const { analyzeGamePhases } = require('../game-phases');
const { filterGamesWithMoves, getPlayerNames, getGameId } = require('./helpers/game-helpers');
const { toFullMoves } = require('./helpers/move-helpers');
const { calculateTactics } = require('./tactics');
const { calculateCheckmates } = require('./checkmates');

/**
 * Calculate tournament awards
 * @param {Array<Object>} games - Array of game objects
 * @param {Object} precomputedStats - Already computed stats to avoid recalculation
 * @returns {Object} Award statistics
 */
function calculateAwards(games, precomputedStats = null) {
  const gamesWithMoves = filterGamesWithMoves(games);

  if (gamesWithMoves.length === 0) {
    return {
      bloodbath: null,
      pacifist: null,
      speedDemon: null,
      endgameWizard: null,
      openingSprinter: null,
    };
  }

  // Use precomputed stats if available, otherwise calculate
  const tactics = precomputedStats?.tactics || calculateTactics(games);
  const checkmates = precomputedStats?.checkmates || calculateCheckmates(games);

  // Only analyze phases if not precomputed
  const phases = precomputedStats?.phases
    ? precomputedStats.phases
    : gamesWithMoves.map((g) => analyzeGamePhases(g.moveList, g.pgn));

  const longestEndgame = phases.reduce(
    (longest, phase, idx) => {
      return phase.endgame > longest.moves ? { moves: phase.endgame, gameIndex: idx } : longest;
    },
    { moves: 0, gameIndex: 0 }
  );

  const shortestOpening = phases.reduce(
    (shortest, phase, idx) => {
      if (phase.opening === 0) return shortest;
      return phase.opening < shortest.moves ? { moves: phase.opening, gameIndex: idx } : shortest;
    },
    { moves: Infinity, gameIndex: 0 }
  );

  // Get games for awards
  const endgameGame = gamesWithMoves[longestEndgame.gameIndex];
  const openingGame = shortestOpening.moves !== Infinity ? gamesWithMoves[shortestOpening.gameIndex] : null;

  return {
    bloodbath: tactics.bloodiestGame,
    pacifist: tactics.quietestGame,
    speedDemon: checkmates.fastest,
    endgameWizard: {
      ...getPlayerNames(endgameGame),
      endgameMoves: toFullMoves(longestEndgame.moves),
      gameId: getGameId(endgameGame),
    },
    openingSprinter: openingGame
      ? {
          ...getPlayerNames(openingGame),
          openingMoves: toFullMoves(shortestOpening.moves),
          gameId: getGameId(openingGame),
        }
      : null,
  };
}

module.exports = { calculateAwards };
