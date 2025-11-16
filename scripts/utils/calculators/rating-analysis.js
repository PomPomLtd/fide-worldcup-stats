/**
 * Rating Analysis Calculator (FIDE-Specific)
 *
 * Analyzes performance based on player ratings:
 * - Average rating difference
 * - Upsets (lower-rated player wins)
 * - Favorite performance statistics
 *
 * Note: Requires rating data in player info. Gracefully handles missing data.
 */

const { getWinner, getPlayerNames } = require('./helpers/game-helpers');

/**
 * Extract rating from player info
 * @param {Object} playerInfo - Player information object
 * @returns {number|null} Rating or null if not available
 */
function getPlayerRating(playerInfo) {
  if (!playerInfo) return null;
  // Check various possible fields
  return playerInfo.rating || playerInfo.elo || playerInfo.fideRating || null;
}

/**
 * Calculate rating-based statistics
 * @param {Array<Object>} matches - Array of match objects with player info
 * @returns {Object} Rating analysis statistics
 */
function calculateRatingAnalysis(matches) {
  if (!matches || matches.length === 0) {
    return {
      hasRatingData: false,
      totalGames: 0,
      gamesWithRatings: 0,
      averageEloDifference: 0,
      upsets: [],
      biggestUpset: null,
      favoritePerformance: {
        wins: 0,
        draws: 0,
        losses: 0,
      },
    };
  }

  let gamesWithRatings = 0;
  let totalEloDifference = 0;
  const upsets = [];
  let biggestUpset = null;
  let favoriteWins = 0;
  let favoriteLosses = 0;
  let draws = 0;

  matches.forEach((match) => {
    const players = match.players || [];
    const gameDetails = match.gameDetails || [];

    gameDetails.forEach((game) => {
      // Try to get ratings from player info
      const whitePlayer = players.find((p) => p.name === game.white);
      const blackPlayer = players.find((p) => p.name === game.black);

      const whiteRating = getPlayerRating(whitePlayer);
      const blackRating = getPlayerRating(blackPlayer);

      if (whiteRating && blackRating) {
        gamesWithRatings++;

        const eloDiff = Math.abs(whiteRating - blackRating);
        totalEloDifference += eloDiff;

        const favorite = whiteRating > blackRating ? 'white' : 'black';
        const underdog = favorite === 'white' ? 'black' : 'white';
        const favoriteName = favorite === 'white' ? game.white : game.black;
        const underdogName = underdog === 'white' ? game.white : game.black;
        const favoriteRating = favorite === 'white' ? whiteRating : blackRating;
        const underdogRating = underdog === 'white' ? whiteRating : blackRating;

        const winner = getWinner(game);

        if (winner === underdog) {
          // Upset!
          const upset = {
            underdog: underdogName,
            underdogRating,
            favorite: favoriteName,
            favoriteRating,
            eloDifference: eloDiff,
            result: game.result,
            white: game.white,
            black: game.black,
          };

          upsets.push(upset);

          if (!biggestUpset || eloDiff > biggestUpset.eloDifference) {
            biggestUpset = upset;
          }

          favoriteLosses++;
        } else if (winner === favorite) {
          favoriteWins++;
        } else {
          draws++;
        }
      }
    });
  });

  const hasRatingData = gamesWithRatings > 0;
  const totalGames = matches.reduce((sum, m) => sum + (m.gameDetails?.length || 0), 0);

  return {
    hasRatingData,
    totalGames,
    gamesWithRatings,
    coverage: gamesWithRatings > 0 ? parseFloat(((gamesWithRatings / totalGames) * 100).toFixed(1)) : 0,
    averageEloDifference: gamesWithRatings > 0 ? parseFloat((totalEloDifference / gamesWithRatings).toFixed(1)) : 0,
    upsets: upsets.sort((a, b) => b.eloDifference - a.eloDifference),
    upsetCount: upsets.length,
    upsetRate: gamesWithRatings > 0 ? parseFloat(((upsets.length / gamesWithRatings) * 100).toFixed(1)) : 0,
    biggestUpset,
    favoritePerformance: {
      wins: favoriteWins,
      draws,
      losses: favoriteLosses,
      winRate: gamesWithRatings > 0 ? parseFloat(((favoriteWins / gamesWithRatings) * 100).toFixed(1)) : 0,
    },
  };
}

module.exports = { calculateRatingAnalysis, getPlayerRating };
