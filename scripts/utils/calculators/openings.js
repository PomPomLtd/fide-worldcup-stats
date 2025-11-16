/**
 * Openings Calculator
 *
 * Analyzes opening moves and sequences, identifying ECO codes
 * and tracking first move popularity and win rates.
 * Enhanced to use enriched opening data from Stage 3.
 */

const { filterGamesWithMoves, isWhiteWin, isBlackWin, isDraw } = require('./helpers/game-helpers');

/**
 * Calculate opening statistics
 * @param {Array<Object>} games - Array of game objects
 * @returns {Object} Opening statistics with first moves, popular openings, and win rates
 */
function calculateOpenings(games) {
  const gamesWithMoves = filterGamesWithMoves(games);

  if (gamesWithMoves.length === 0) {
    return {
      totalGames: 0,
      totalUnique: 0,
      coverage: 0,
      firstMoves: {},
      byEco: {},
      mostPopular: [],
      bestForWhite: null,
      bestForBlack: null,
      mostDecisive: null,
    };
  }

  const firstMoves = {};
  const byEco = {};
  let gamesWithOpenings = 0;

  gamesWithMoves.forEach((game) => {
    const moveList = game.moveList || [];

    // First move tracking
    if (moveList.length > 0) {
      const firstMove = moveList[0].san;
      if (!firstMoves[firstMove]) {
        firstMoves[firstMove] = { count: 0, whiteWins: 0, draws: 0, blackWins: 0 };
      }
      firstMoves[firstMove].count++;
      if (isWhiteWin(game)) firstMoves[firstMove].whiteWins++;
      else if (isDraw(game)) firstMoves[firstMove].draws++;
      else if (isBlackWin(game)) firstMoves[firstMove].blackWins++;
    }

    // Opening tracking (from enriched data or fallback)
    const opening = game.opening;
    if (opening && opening.eco) {
      gamesWithOpenings++;

      const key = `${opening.eco}:${opening.name}`;
      if (!byEco[key]) {
        byEco[key] = {
          eco: opening.eco,
          name: opening.name,
          count: 0,
          whiteWins: 0,
          draws: 0,
          blackWins: 0,
          confidence: opening.confidence || 'unknown',
        };
      }

      byEco[key].count++;
      if (isWhiteWin(game)) byEco[key].whiteWins++;
      else if (isDraw(game)) byEco[key].draws++;
      else if (isBlackWin(game)) byEco[key].blackWins++;
    }
  });

  // Format first moves with statistics
  const formattedFirstMoves = {};
  const total = gamesWithMoves.length;
  Object.entries(firstMoves).forEach(([move, data]) => {
    formattedFirstMoves[move] = {
      count: data.count,
      percentage: parseFloat(((data.count / total) * 100).toFixed(1)),
      whiteWinRate: data.count > 0 ? parseFloat(((data.whiteWins / data.count) * 100).toFixed(1)) : 0,
    };
  });

  // Calculate stats for each opening
  const openingsWithStats = Object.values(byEco).map((opening) => {
    const total = opening.count;
    return {
      ...opening,
      whiteWinRate: total > 0 ? parseFloat(((opening.whiteWins / total) * 100).toFixed(1)) : 0,
      blackWinRate: total > 0 ? parseFloat(((opening.blackWins / total) * 100).toFixed(1)) : 0,
      drawRate: total > 0 ? parseFloat(((opening.draws / total) * 100).toFixed(1)) : 0,
      decisiveRate: total > 0 ? parseFloat((((opening.whiteWins + opening.blackWins) / total) * 100).toFixed(1)) : 0,
    };
  });

  // Most popular openings
  const mostPopular = [...openingsWithStats].sort((a, b) => b.count - a.count).slice(0, 10);

  // Best opening for white (minimum 3 games)
  const bestForWhite = openingsWithStats
    .filter((o) => o.count >= 3)
    .sort((a, b) => b.whiteWinRate - a.whiteWinRate)[0] || null;

  // Best opening for black (minimum 3 games)
  const bestForBlack = openingsWithStats
    .filter((o) => o.count >= 3)
    .sort((a, b) => b.blackWinRate - a.blackWinRate)[0] || null;

  // Most decisive opening (minimum 3 games)
  const mostDecisive = openingsWithStats
    .filter((o) => o.count >= 3)
    .sort((a, b) => b.decisiveRate - a.decisiveRate)[0] || null;

  return {
    totalGames: total,
    totalUnique: Object.keys(byEco).length,
    coverage: parseFloat(((gamesWithOpenings / total) * 100).toFixed(1)),
    firstMoves: formattedFirstMoves,
    byEco: openingsWithStats,
    mostPopular,
    bestForWhite,
    bestForBlack,
    mostDecisive,
  };
}

module.exports = { calculateOpenings };
