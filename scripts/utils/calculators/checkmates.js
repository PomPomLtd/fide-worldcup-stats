/**
 * Checkmates Calculator
 *
 * Analyzes checkmate patterns: which pieces delivered mate,
 * and tracks the fastest checkmate in the round.
 */

const { filterGamesWithMoves, getPlayerNames, getGameId, getResult } = require('./helpers/game-helpers');
const { isCheckmate, getMoveNumber } = require('./helpers/move-helpers');
const { getPieceName } = require('./helpers/piece-helpers');

/**
 * Find checkmates in a game
 * @param {Object} game - Game object with moveList
 * @returns {Array} Array of checkmate objects
 */
function findCheckmates(game) {
  // If pre-computed, use it
  if (game.specialMoves?.checkmates) {
    return game.specialMoves.checkmates;
  }

  const moveList = game.moveList || [];
  const checkmates = [];

  moveList.forEach((move, idx) => {
    if (isCheckmate(move.san)) {
      checkmates.push({
        piece: move.piece,
        moveNumber: getMoveNumber(idx, true),
        color: move.color,
        san: move.san,
      });
    }
  });

  return checkmates;
}

/**
 * Calculate checkmate statistics
 * @param {Array<Object>} games - Array of game objects
 * @returns {Object} Checkmate statistics including by piece and fastest mate
 */
function calculateCheckmates(games) {
  const gamesWithMoves = filterGamesWithMoves(games);

  if (gamesWithMoves.length === 0) {
    return {
      total: 0,
      byPiece: {},
      fastest: null,
    };
  }

  const byPiece = { queen: 0, rook: 0, bishop: 0, knight: 0, pawn: 0 };
  let fastestMate = { moves: Infinity, game: null };
  let totalCheckmates = 0;

  gamesWithMoves.forEach((game) => {
    const checkmates = findCheckmates(game);
    const moveList = game.moveList || [];
    const moveCount = game.moveCount || moveList.length;

    checkmates.forEach((mate) => {
      totalCheckmates++;
      const pieceName = getPieceName(mate.piece, true); // lowercase

      if (byPiece[pieceName] !== undefined) {
        byPiece[pieceName]++;
      }

      // Only consider games with 5+ moves for fastest mate (exclude forfeits)
      if (moveCount >= 5 && mate.moveNumber < fastestMate.moves) {
        fastestMate = {
          moves: mate.moveNumber,
          game,
          mateMove: mate,
        };
      }
    });
  });

  // Format fastest mate output
  let fastestMateOutput = null;
  if (fastestMate.moves !== Infinity) {
    const players = getPlayerNames(fastestMate.game);
    fastestMateOutput = {
      moves: fastestMate.moves,
      white: players.white,
      black: players.black,
      winner: fastestMate.mateMove.color === 'w' ? 'White' : 'Black',
      gameId: getGameId(fastestMate.game),
    };
  }

  return {
    total: totalCheckmates,
    byPiece,
    fastest: fastestMateOutput,
  };
}

module.exports = { calculateCheckmates, findCheckmates };
