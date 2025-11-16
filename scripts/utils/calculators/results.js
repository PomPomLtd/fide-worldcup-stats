/**
 * Results Calculator
 *
 * Calculates win/loss/draw statistics and percentages.
 * Handles both lichess4545-style and FIDE-style game data.
 */

const { isWhiteWin, isBlackWin, isDraw } = require('./helpers/game-helpers');

/**
 * Calculate win/loss/draw statistics
 * @param {Array<Object>} games - Array of game objects
 * @returns {Object} Results statistics with counts and percentages
 */
function calculateResults(games) {
  if (!games || games.length === 0) {
    return {
      totalGames: 0,
      whiteWins: 0,
      blackWins: 0,
      draws: 0,
      whiteWinPercentage: 0,
      blackWinPercentage: 0,
      drawPercentage: 0,
      decisivePercentage: 0,
    };
  }

  let whiteWins = 0;
  let blackWins = 0;
  let draws = 0;

  games.forEach((game) => {
    if (isWhiteWin(game)) {
      whiteWins++;
    } else if (isBlackWin(game)) {
      blackWins++;
    } else if (isDraw(game)) {
      draws++;
    }
  });

  const total = games.length;
  const decisive = whiteWins + blackWins;

  return {
    totalGames: total,
    whiteWins,
    blackWins,
    draws,
    whiteWinPercentage: parseFloat(((whiteWins / total) * 100).toFixed(1)),
    blackWinPercentage: parseFloat(((blackWins / total) * 100).toFixed(1)),
    drawPercentage: parseFloat(((draws / total) * 100).toFixed(1)),
    decisivePercentage: parseFloat(((decisive / total) * 100).toFixed(1)),
  };
}

module.exports = { calculateResults };
