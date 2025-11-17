/**
 * Overview Statistics Calculator
 *
 * Calculates basic game overview stats: total games, total moves,
 * average game length, longest/shortest games.
 * Handles different game data formats for backward compatibility.
 */

const { filterGamesWithMoves, getPlayerNames, getMoveCount, getGameId, getResult } = require('./helpers/game-helpers');
const { toFullMoves } = require('./helpers/move-helpers');

/**
 * Calculate overview statistics
 * Note: chess.js history.length gives us half-moves (plies)
 * Note: Games with 0 moves (forfeits with no play) are excluded from move statistics
 *
 * @param {Array<Object>} games - Array of game objects
 * @returns {Object} Overview statistics
 */
function calculateOverview(games) {
  if (!games || games.length === 0) {
    return {
      totalGames: 0,
      totalMoves: 0,
      averageGameLength: 0,
      longestGame: null,
      shortestGame: null,
    };
  }

  // Filter out games with no moves for statistics that require moves
  const gamesWithMoves = filterGamesWithMoves(games);

  if (gamesWithMoves.length === 0) {
    return {
      totalGames: games.length,
      totalMoves: 0,
      averageGameLength: 0,
      longestGame: null,
      shortestGame: null,
    };
  }

  const totalMoves = gamesWithMoves.reduce((sum, g) => sum + getMoveCount(g), 0);

  const longestGame = gamesWithMoves.reduce((longest, game) => {
    const moves = getMoveCount(game);
    return moves > longest.moves ? { moves, game } : longest;
  }, { moves: 0, game: null });

  const shortestGame = gamesWithMoves.reduce((shortest, game) => {
    const moves = getMoveCount(game);
    return moves < shortest.moves ? { moves, game } : shortest;
  }, { moves: Infinity, game: null });

  const longestPlayers = getPlayerNames(longestGame.game);
  const shortestPlayers = getPlayerNames(shortestGame.game);

  return {
    totalGames: games.length, // Count all games including forfeits
    totalMoves,
    averageGameLength: parseFloat((totalMoves / gamesWithMoves.length / 2).toFixed(1)), // Divide by 2 for full moves
    longestGame: {
      moves: toFullMoves(longestGame.moves),
      white: longestPlayers.white,
      black: longestPlayers.black,
      result: getResult(longestGame.game),
      gameId: getGameId(longestGame.game),
    },
    shortestGame: {
      moves: toFullMoves(shortestGame.moves),
      white: shortestPlayers.white,
      black: shortestPlayers.black,
      result: getResult(shortestGame.game),
      gameId: getGameId(shortestGame.game),
    },
  };
}

module.exports = { calculateOverview };
