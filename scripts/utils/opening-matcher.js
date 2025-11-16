/**
 * opening-matcher.js
 *
 * FIDE World Cup 2025 - Opening Matching Utility
 *
 * Thin wrapper around chess-openings database to match opening names
 * from move sequences with confidence scoring.
 */

const { getOpeningName } = require('./chess-openings');

/**
 * Match opening from move sequence with confidence scoring
 *
 * @param {string} moveSequence - Space-separated moves in SAN (e.g., "e4 e5 Nf3 Nc6")
 * @returns {Object} Opening match with confidence
 */
function matchOpening(moveSequence) {
  if (!moveSequence || moveSequence.trim() === '') {
    return {
      eco: null,
      name: 'Unknown Opening',
      matchedMoves: null,
      confidence: 'none',
      matchDepth: 0,
    };
  }

  // Get opening from database (tries exact match, then progressive shortening)
  const opening = getOpeningName(moveSequence);

  if (!opening) {
    // No match found
    return {
      eco: null,
      name: 'Unknown Opening',
      matchedMoves: null,
      confidence: 'none',
      matchDepth: 0,
    };
  }

  // Calculate confidence based on how many moves matched
  const movesMatched = opening.moveSequence.split(' ').length;
  let confidence = 'low';

  if (movesMatched >= 10) {
    confidence = 'high';
  } else if (movesMatched >= 6) {
    confidence = 'medium';
  }

  return {
    eco: opening.eco,
    name: opening.name,
    matchedMoves: opening.moveSequence,
    confidence,
    matchDepth: movesMatched,
  };
}

/**
 * Batch match openings for multiple games
 *
 * @param {Array<Object>} games - Array of game objects with 'moves' field
 * @returns {Array<Object>} Games with added 'opening' field
 */
function matchOpenings(games) {
  return games.map(game => ({
    ...game,
    opening: matchOpening(game.moves || ''),
  }));
}

module.exports = {
  matchOpening,
  matchOpenings,
};
