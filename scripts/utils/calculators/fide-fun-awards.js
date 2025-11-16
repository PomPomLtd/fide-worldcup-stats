/**
 * FIDE World Cup Fun Awards
 *
 * Fun, creative awards specific to FIDE World Cup format:
 * - Tiebreak-related awards
 * - Rating upset awards
 * - Time control performance awards
 * - Match pattern awards
 */

const { getMoveCount, getWinner, isDraw } = require('./helpers/game-helpers');
const { getPlayerRating } = require('./rating-analysis');

/**
 * Tiebreak Warrior - Player who needed the most tiebreak games
 * @param {Array<Object>} matches - Match objects
 * @returns {Object|null} Award winner
 */
function calculateTiebreakWarrior(matches) {
  const playerTiebreaks = {};

  matches.forEach((match) => {
    const outcome = match.outcome || {};
    const tiebreakType = outcome.tiebreakType;

    if (tiebreakType && tiebreakType !== 'CLASSICAL') {
      const winner = outcome.winner;
      if (winner) {
        if (!playerTiebreaks[winner]) {
          playerTiebreaks[winner] = { player: winner, count: 0, deepestTiebreak: tiebreakType };
        }
        playerTiebreaks[winner].count++;

        // Track deepest tiebreak (ARMAGEDDON > BLITZ_TIER2 > BLITZ_TIER1 > RAPID_TIER2 > RAPID_TIER1)
        const tiebreakDepth = {
          RAPID_TIER1: 1,
          RAPID_TIER2: 2,
          BLITZ_TIER1: 3,
          BLITZ_TIER2: 4,
          ARMAGEDDON: 5,
        };

        if (tiebreakDepth[tiebreakType] > tiebreakDepth[playerTiebreaks[winner].deepestTiebreak]) {
          playerTiebreaks[winner].deepestTiebreak = tiebreakType;
        }
      }
    }
  });

  const sorted = Object.values(playerTiebreaks).sort((a, b) => b.count - a.count);
  if (sorted.length === 0) return null;

  return {
    player: sorted[0].player,
    tiebreakWins: sorted[0].count,
    deepestTiebreak: sorted[0].deepestTiebreak,
  };
}

/**
 * Giant Slayer - Biggest rating upset
 * (Calculated by rating-analysis, but formatted here for fun)
 * @param {Object} ratingAnalysis - Rating analysis data
 * @returns {Object|null} Award winner
 */
function calculateGiantSlayer(ratingAnalysis) {
  if (!ratingAnalysis.hasRatingData || !ratingAnalysis.biggestUpset) {
    return null;
  }

  const upset = ratingAnalysis.biggestUpset;
  return {
    player: upset.underdog,
    defeated: upset.favorite,
    ratingDifference: upset.eloDifference,
    result: upset.result,
  };
}

/**
 * Rapid Fire - Fastest rapid game
 * @param {Array<Object>} matches - Match objects
 * @returns {Object|null} Award winner
 */
function calculateRapidFire(matches) {
  let fastest = { moves: Infinity, game: null, players: null };

  matches.forEach((match) => {
    const gameDetails = match.gameDetails || [];
    gameDetails.forEach((game) => {
      const classification = game.classification || {};
      if (classification.type === 'RAPID') {
        const moves = getMoveCount(game);
        if (moves > 0 && moves < fastest.moves && game.result !== '1/2-1/2') {
          fastest = {
            moves,
            game,
            players: { white: game.white, black: game.black },
            winner: getWinner(game),
          };
        }
      }
    });
  });

  if (fastest.moves === Infinity) return null;

  return {
    ...fastest.players,
    moves: Math.ceil(fastest.moves / 2), // Convert to full moves
    winner: fastest.winner === 'white' ? fastest.players.white : fastest.players.black,
  };
}

/**
 * Blitz Wizard - Best blitz performance (won multiple blitz games)
 * @param {Array<Object>} matches - Match objects
 * @returns {Object|null} Award winner
 */
function calculateBlitzWizard(matches) {
  const blitzWins = {};

  matches.forEach((match) => {
    const gameDetails = match.gameDetails || [];
    gameDetails.forEach((game) => {
      const classification = game.classification || {};
      if (classification.type === 'BLITZ' && game.result !== '1/2-1/2') {
        const winner = getWinner(game);
        const winnerName = winner === 'white' ? game.white : game.black;
        blitzWins[winnerName] = (blitzWins[winnerName] || 0) + 1;
      }
    });
  });

  const sorted = Object.entries(blitzWins).sort((a, b) => b[1] - a[1]);
  if (sorted.length === 0) return null;

  return {
    player: sorted[0][0],
    blitzWins: sorted[0][1],
  };
}

/**
 * Classical Purist - REMOVED
 * This award was not meaningful as most matches (74%+) are decided in classical.
 * Winning in classical is the norm, not an achievement.
 */

/**
 * Marathon Master - Longest total match (most plies across all games)
 * @param {Array<Object>} matches - Match objects
 * @returns {Object|null} Award winner
 */
function calculateMarathonMaster(matches) {
  let longest = { totalMoves: 0, match: null };

  matches.forEach((match) => {
    const gameDetails = match.gameDetails || [];
    const totalMoves = gameDetails.reduce((sum, game) => sum + getMoveCount(game), 0);

    if (totalMoves > longest.totalMoves) {
      longest = { totalMoves, match };
    }
  });

  if (longest.totalMoves === 0) return null;

  const players = longest.match.players || [];
  return {
    players: players.map((p) => p.name).join(' vs '),
    totalGames: longest.match.gameDetails.length,
    totalMoves: Math.ceil(longest.totalMoves / 2), // Full moves
    winner: longest.match.outcome?.winner || 'Unknown',
  };
}

/**
 * Fortress Builder - Most draws in a single match
 * @param {Array<Object>} matches - Match objects
 * @returns {Object|null} Award winner
 */
function calculateFortressBuilder(matches) {
  let mostDraws = { draws: 0, match: null };

  matches.forEach((match) => {
    const gameDetails = match.gameDetails || [];
    const draws = gameDetails.filter((g) => isDraw(g)).length;

    if (draws > mostDraws.draws) {
      mostDraws = { draws, match };
    }
  });

  if (mostDraws.draws === 0) return null;

  const players = mostDraws.match.players || [];
  return {
    players: players.map((p) => p.name).join(' vs '),
    draws: mostDraws.draws,
    totalGames: mostDraws.match.gameDetails.length,
  };
}

/**
 * Upset Artist - Player with most upset wins (requires rating data)
 * @param {Object} ratingAnalysis - Rating analysis data
 * @returns {Object|null} Award winner
 */
function calculateUpsetArtist(ratingAnalysis) {
  if (!ratingAnalysis.hasRatingData || ratingAnalysis.upsets.length === 0) {
    return null;
  }

  const upsetWins = {};
  ratingAnalysis.upsets.forEach((upset) => {
    const player = upset.underdog;
    upsetWins[player] = (upsetWins[player] || 0) + 1;
  });

  const sorted = Object.entries(upsetWins).sort((a, b) => b[1] - a[1]);
  return {
    player: sorted[0][0],
    upsets: sorted[0][1],
  };
}

/**
 * Calculate all FIDE fun awards
 * @param {Array<Object>} matches - Match objects
 * @param {Object} ratingAnalysis - Rating analysis data
 * @returns {Object} All fun awards
 */
function calculateFideFunAwards(matches, ratingAnalysis) {
  return {
    tiebreakWarrior: calculateTiebreakWarrior(matches),
    giantSlayer: calculateGiantSlayer(ratingAnalysis),
    rapidFire: calculateRapidFire(matches),
    blitzWizard: calculateBlitzWizard(matches),
    classicalPurist: null, // Removed - not meaningful (most matches decided in classical)
    marathonMaster: calculateMarathonMaster(matches),
    fortressBuilder: calculateFortressBuilder(matches),
    upsetArtist: calculateUpsetArtist(ratingAnalysis),
  };
}

module.exports = { calculateFideFunAwards };
