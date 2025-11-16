/**
 * Board Heatmap Calculator
 *
 * Tracks square activity (moves to/from) and captures on each square
 * to identify hotspots and quiet zones on the board.
 */

const { filterGamesWithMoves } = require('./helpers/game-helpers');
const { ALL_SQUARES } = require('./helpers/board-helpers');

/**
 * Calculate board heatmap statistics
 * @param {Array<Object>} games - Array of game objects
 * @returns {Object} Heatmap statistics with most/least active squares
 */
function calculateBoardHeatmap(games) {
  const gamesWithMoves = filterGamesWithMoves(games);

  if (gamesWithMoves.length === 0) {
    return {
      bloodiestSquare: null,
      mostPopularSquare: null,
      leastPopularSquare: null,
      quietestSquares: [],
      top5Bloodiest: [],
      top5Popular: [],
      data: {},
    };
  }

  const squareActivity = {}; // Total moves to/from each square
  const captureSquares = {}; // Captures on each square

  // Initialize all squares
  ALL_SQUARES.forEach((square) => {
    squareActivity[square] = 0;
    captureSquares[square] = 0;
  });

  // Track activity and captures
  gamesWithMoves.forEach((game) => {
    const moveList = game.moveList || [];
    moveList.forEach((move) => {
      // Track destination square activity
      if (move.to) {
        squareActivity[move.to] = (squareActivity[move.to] || 0) + 1;
      }

      // Track captures on squares
      if (move.captured && move.to) {
        captureSquares[move.to] = (captureSquares[move.to] || 0) + 1;
      }
    });
  });

  // Find most/least active squares
  const sortedActivity = Object.entries(squareActivity).sort((a, b) => b[1] - a[1]);
  const sortedCaptures = Object.entries(captureSquares).sort((a, b) => b[1] - a[1]);

  // Get non-zero squares for least popular
  const activeSquares = sortedActivity.filter(([, count]) => count > 0);
  const quietestSquares = sortedActivity.filter(([, count]) => count === 0).map(([sq]) => sq);

  return {
    bloodiestSquare: sortedCaptures[0]
      ? {
          square: sortedCaptures[0][0],
          captures: sortedCaptures[0][1],
          description: `${sortedCaptures[0][0]} saw ${sortedCaptures[0][1]} captures`,
        }
      : null,
    mostPopularSquare: sortedActivity[0]
      ? {
          square: sortedActivity[0][0],
          visits: sortedActivity[0][1],
          description: `${sortedActivity[0][0]} was visited ${sortedActivity[0][1]} times`,
        }
      : null,
    leastPopularSquare:
      activeSquares.length > 0
        ? {
            square: activeSquares[activeSquares.length - 1][0],
            visits: activeSquares[activeSquares.length - 1][1],
            description: `${activeSquares[activeSquares.length - 1][0]} was only visited ${activeSquares[activeSquares.length - 1][1]} times`,
          }
        : null,
    quietestSquares,
    top5Bloodiest: sortedCaptures.slice(0, 5).map(([sq, count]) => ({ square: sq, captures: count })),
    top5Popular: sortedActivity.slice(0, 5).map(([sq, count]) => ({ square: sq, visits: count })),
    data: squareActivity, // Full heatmap data for visualization
  };
}

module.exports = { calculateBoardHeatmap };
