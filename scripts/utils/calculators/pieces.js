/**
 * Pieces Calculator
 *
 * Analyzes piece statistics: activity (moves made by each piece type),
 * captures (pieces taken), and survival rates.
 */

const { filterGamesWithMoves } = require('./helpers/game-helpers');
const { PIECE_NAMES_LOWERCASE } = require('./helpers/piece-helpers');

/**
 * Calculate pieces remaining from final board position
 * @param {Object} game - Game object
 * @returns {Object|null} Pieces remaining counts
 */
function calculatePiecesRemaining(game) {
  // If pre-computed, use it
  if (game.piecesRemaining) {
    return game.piecesRemaining;
  }

  // Try to get from final board position if available
  if (game.boardAtEnd) {
    const board = game.boardAtEnd;
    const counts = { w_p: 0, w_n: 0, w_b: 0, w_r: 0, w_q: 0, w_k: 0, b_p: 0, b_n: 0, b_b: 0, b_r: 0, b_q: 0, b_k: 0 };

    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        const square = board[i][j];
        if (square) {
          const color = square.color === 'w' ? 'w' : 'b';
          const piece = square.type.toLowerCase();
          const key = `${color}_${piece}`;
          if (counts[key] !== undefined) {
            counts[key]++;
          }
        }
      }
    }

    return counts;
  }

  return null;
}

/**
 * Calculate piece statistics
 * @param {Array<Object>} games - Array of game objects
 * @returns {Object} Piece statistics including activity, captures, and survival rates
 */
function calculatePieceStats(games) {
  const gamesWithMoves = filterGamesWithMoves(games);

  if (gamesWithMoves.length === 0) {
    return {
      activity: {},
      captured: {},
      survivalRate: {},
    };
  }

  const activity = { p: 0, n: 0, b: 0, r: 0, q: 0, k: 0 };
  const captured = { p: 0, n: 0, b: 0, r: 0, q: 0 };
  const survival = { rooks: [], queens: [], bishops: [], knights: [] };

  gamesWithMoves.forEach((game) => {
    const moveList = game.moveList || [];

    // Activity
    moveList.forEach((move) => {
      if (move.piece) {
        activity[move.piece]++;
      }
      if (move.captured) {
        captured[move.captured]++;
      }
    });

    // Survival (if data available)
    const pc = calculatePiecesRemaining(game);
    if (pc) {
      survival.rooks.push(pc.w_r + pc.b_r);
      survival.queens.push(pc.w_q + pc.b_q);
      survival.bishops.push(pc.w_b + pc.b_b);
      survival.knights.push(pc.w_n + pc.b_n);
    }
  });

  const formattedActivity = {};
  Object.entries(activity).forEach(([piece, count]) => {
    formattedActivity[PIECE_NAMES_LOWERCASE[piece]] = count;
  });

  const formattedCaptured = {};
  Object.entries(captured).forEach(([piece, count]) => {
    formattedCaptured[PIECE_NAMES_LOWERCASE[piece]] = count;
  });

  // Calculate survival rates if we have data
  const survivalRate = {};
  if (survival.rooks.length > 0) {
    survivalRate.rooks = parseFloat(((survival.rooks.reduce((a, b) => a + b, 0) / survival.rooks.length / 4) * 100).toFixed(1));
    survivalRate.queens = parseFloat(((survival.queens.reduce((a, b) => a + b, 0) / survival.queens.length / 2) * 100).toFixed(1));
    survivalRate.bishops = parseFloat(((survival.bishops.reduce((a, b) => a + b, 0) / survival.bishops.length / 4) * 100).toFixed(1));
    survivalRate.knights = parseFloat(((survival.knights.reduce((a, b) => a + b, 0) / survival.knights.length / 4) * 100).toFixed(1));
  }

  return {
    activity: formattedActivity,
    captured: formattedCaptured,
    survivalRate,
  };
}

module.exports = { calculatePieceStats, calculatePiecesRemaining };
