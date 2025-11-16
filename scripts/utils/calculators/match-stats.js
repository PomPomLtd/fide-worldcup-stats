/**
 * Match Statistics Calculator (FIDE-Specific)
 *
 * Calculates match-level statistics unique to FIDE World Cup format:
 * - Tiebreak analysis (classical, rapid, blitz, armageddon)
 * - Match outcome distribution
 * - Average moves to decision by time control
 */

const { getMoveCount } = require('./helpers/game-helpers');

/**
 * Calculate match statistics
 * @param {Array<Object>} matches - Array of match objects with classification data
 * @returns {Object} Match-level statistics
 */
function calculateMatchStats(matches) {
  if (!matches || matches.length === 0) {
    return {
      totalMatches: 0,
      decidedInClassical: 0,
      decidedInRapidTier1: 0,
      decidedInRapidTier2: 0,
      decidedInBlitzTier1: 0,
      decidedInBlitzTier2: 0,
      decidedInArmageddon: 0,
      tiebreakAnalysis: {},
      averageMovesToDecision: {},
    };
  }

  let decidedInClassical = 0;
  let decidedInRapidTier1 = 0;
  let decidedInRapidTier2 = 0;
  let decidedInBlitzTier1 = 0;
  let decidedInBlitzTier2 = 0;
  let decidedInArmageddon = 0;

  const movesByTimeControl = {
    classical: [],
    rapidTier1: [],
    rapidTier2: [],
    blitzTier1: [],
    blitzTier2: [],
  };

  matches.forEach((match) => {
    const outcome = match.outcome || {};
    const tiebreakType = outcome.tiebreakType;

    // Count matches by decision type
    if (tiebreakType === 'CLASSICAL') decidedInClassical++;
    else if (tiebreakType === 'RAPID_TIER1') decidedInRapidTier1++;
    else if (tiebreakType === 'RAPID_TIER2') decidedInRapidTier2++;
    else if (tiebreakType === 'BLITZ_TIER1') decidedInBlitzTier1++;
    else if (tiebreakType === 'BLITZ_TIER2') decidedInBlitzTier2++;
    else if (tiebreakType === 'ARMAGEDDON') decidedInArmageddon++;

    // Collect move counts for decisive games in each time control
    const gameDetails = match.gameDetails || [];
    gameDetails.forEach((game) => {
      const classification = game.classification || {};
      const type = classification.type;
      const tier = classification.tier;
      const moveCount = getMoveCount(game);

      if (moveCount > 0 && game.result !== '1/2-1/2') {
        // Only count decisive games
        if (type === 'CLASSICAL') {
          movesByTimeControl.classical.push(moveCount);
        } else if (type === 'RAPID' && tier === 1) {
          movesByTimeControl.rapidTier1.push(moveCount);
        } else if (type === 'RAPID' && tier === 2) {
          movesByTimeControl.rapidTier2.push(moveCount);
        } else if (type === 'BLITZ' && tier === 1) {
          movesByTimeControl.blitzTier1.push(moveCount);
        } else if (type === 'BLITZ' && tier === 2) {
          movesByTimeControl.blitzTier2.push(moveCount);
        }
      }
    });
  });

  const totalMatches = matches.length;
  const wentToTiebreak = totalMatches - decidedInClassical;

  // Calculate average moves (in full moves, not plies)
  const averageMovesToDecision = {};
  Object.entries(movesByTimeControl).forEach(([tc, moves]) => {
    if (moves.length > 0) {
      const avg = moves.reduce((sum, m) => sum + m, 0) / moves.length / 2; // Divide by 2 for full moves
      averageMovesToDecision[tc] = parseFloat(avg.toFixed(1));
    }
  });

  return {
    totalMatches,
    decidedInClassical,
    decidedInRapidTier1,
    decidedInRapidTier2,
    decidedInBlitzTier1,
    decidedInBlitzTier2,
    decidedInArmageddon,
    tiebreakAnalysis: {
      classicalDecisiveRate: parseFloat(((decidedInClassical / totalMatches) * 100).toFixed(1)),
      wentToTiebreak,
      tiebreakRate: parseFloat(((wentToTiebreak / totalMatches) * 100).toFixed(1)),
      rapidTier1NeededRate:
        wentToTiebreak > 0 ? parseFloat((((decidedInRapidTier1 + decidedInRapidTier2 + decidedInBlitzTier1 + decidedInBlitzTier2 + decidedInArmageddon) / totalMatches) * 100).toFixed(1)) : 0,
      rapidTier2Needed: decidedInRapidTier2 + decidedInBlitzTier1 + decidedInBlitzTier2 + decidedInArmageddon,
      blitzNeeded: decidedInBlitzTier1 + decidedInBlitzTier2 + decidedInArmageddon,
    },
    averageMovesToDecision,
  };
}

module.exports = { calculateMatchStats };
