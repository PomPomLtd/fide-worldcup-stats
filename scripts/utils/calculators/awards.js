/**
 * Awards Calculator
 *
 * Calculates tournament awards: Bloodbath, Pacifist, Speed Demon,
 * Endgame Wizard, and Opening Sprinter.
 */

const { analyzeGamePhases } = require('../game-phases');
const { filterGamesWithMoves, getPlayerNames, getGameId, getPlayerRatings } = require('./helpers/game-helpers');
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

  // Filter out forfeits (games with <5 moves) for all awards
  const realGames = gamesWithMoves.filter((g) => {
    const moveCount = g.moveCount || (g.moveList || []).length;
    return moveCount >= 5;
  });

  if (realGames.length === 0) {
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

  // Only analyze phases for real games (no forfeits)
  const phases = realGames.map((g) => analyzeGamePhases(g.moveList, g.pgn));

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

  // Get games for awards (from realGames, not gamesWithMoves)
  const endgameGame = realGames[longestEndgame.gameIndex];
  const openingGame = shortestOpening.moves !== Infinity ? realGames[shortestOpening.gameIndex] : null;

  return {
    bloodbath: tactics.bloodiestGame,
    pacifist: tactics.quietestGame,
    speedDemon: checkmates.fastest,
    endgameWizard: {
      ...getPlayerNames(endgameGame),
      ...getPlayerRatings(endgameGame),
      endgameMoves: toFullMoves(longestEndgame.moves),
      gameId: getGameId(endgameGame),
    },
    openingSprinter: openingGame
      ? {
          ...getPlayerNames(openingGame),
          ...getPlayerRatings(openingGame),
          openingMoves: toFullMoves(shortestOpening.moves),
          gameId: getGameId(openingGame),
        }
      : null,
  };
}

module.exports = { calculateAwards };
