/**
 * time-control-classifier.js
 *
 * FIDE World Cup 2025 - Time Control Classification Utility
 *
 * Classifies games based on their Round field according to official FIDE World Cup
 * tiebreak structure:
 *
 * Official Tiebreak Sequence:
 * 1. Classical: Games 1-2 (90 min + 30 sec increment)
 * 2. Rapid Tier 1: Games 3-4 (15 min + 10 sec increment)
 * 3. Rapid Tier 2: Games 5-6 (10 min + 10 sec increment)
 * 4. Blitz Tier 1: Games 7-8 (5 min + 3 sec increment)
 * 5. Blitz Tier 2: Games 9-10 (3 min + 2 sec increment)
 * 6. Armageddon: Game 11 (sudden death)
 *
 * Note: The TimeControl field in PGN headers is NOT reliable for classification
 * as it remains static (classical format) even for tiebreak games. The Round field
 * (e.g., "1.1", "3.2", "5.1") provides accurate game type information.
 */

/**
 * Classify a game's time control based on its Round field
 *
 * @param {string} roundField - The Round field from PGN (e.g., "1.1", "3.2", "5.1")
 * @returns {Object} Classification object with type, tier, and timeControl
 * @returns {string} return.type - Game type: 'CLASSICAL', 'RAPID', 'BLITZ', or 'ARMAGEDDON'
 * @returns {number|null} return.tier - Tier number for RAPID/BLITZ (1 or 2), null for others
 * @returns {string} return.timeControl - Human-readable time control (e.g., '15+10', '5+3')
 * @returns {number} return.gameNumber - The extracted game number
 *
 * @example
 * classifyByRoundField('1.1')
 * // Returns: { type: 'CLASSICAL', tier: null, timeControl: '90+30', gameNumber: 1 }
 *
 * classifyByRoundField('3.2')
 * // Returns: { type: 'RAPID', tier: 1, timeControl: '15+10', gameNumber: 3 }
 *
 * classifyByRoundField('7.1')
 * // Returns: { type: 'BLITZ', tier: 1, timeControl: '5+3', gameNumber: 7 }
 */
function classifyByRoundField(roundField) {
  if (!roundField) {
    return {
      type: 'UNKNOWN',
      tier: null,
      timeControl: 'unknown',
      gameNumber: null,
      error: 'Round field is missing or empty',
    };
  }

  // Extract game number from Round field (first part before the dot)
  const parts = roundField.split('.');
  const gameNum = parseInt(parts[0], 10);

  if (isNaN(gameNum)) {
    return {
      type: 'UNKNOWN',
      tier: null,
      timeControl: 'unknown',
      gameNumber: null,
      error: `Invalid Round field format: ${roundField}`,
    };
  }

  // Classical: Games 1-2
  if (gameNum >= 1 && gameNum <= 2) {
    return {
      type: 'CLASSICAL',
      tier: null,
      timeControl: '90+30',
      gameNumber: gameNum,
    };
  }

  // Rapid Tier 1: Games 3-4
  if (gameNum >= 3 && gameNum <= 4) {
    return {
      type: 'RAPID',
      tier: 1,
      timeControl: '15+10',
      gameNumber: gameNum,
    };
  }

  // Rapid Tier 2: Games 5-6
  if (gameNum >= 5 && gameNum <= 6) {
    return {
      type: 'RAPID',
      tier: 2,
      timeControl: '10+10',
      gameNumber: gameNum,
    };
  }

  // Blitz Tier 1: Games 7-8
  if (gameNum >= 7 && gameNum <= 8) {
    return {
      type: 'BLITZ',
      tier: 1,
      timeControl: '5+3',
      gameNumber: gameNum,
    };
  }

  // Blitz Tier 2: Games 9-10
  if (gameNum >= 9 && gameNum <= 10) {
    return {
      type: 'BLITZ',
      tier: 2,
      timeControl: '3+2',
      gameNumber: gameNum,
    };
  }

  // Armageddon: Game 11
  if (gameNum === 11) {
    return {
      type: 'ARMAGEDDON',
      tier: null,
      timeControl: 'armageddon',
      gameNumber: gameNum,
    };
  }

  // Unknown game number (beyond expected range)
  return {
    type: 'UNKNOWN',
    tier: null,
    timeControl: 'unknown',
    gameNumber: gameNum,
    error: `Game number ${gameNum} is outside expected range (1-11)`,
  };
}

/**
 * Get a human-readable label for a time control classification
 *
 * @param {Object} classification - Classification object from classifyByRoundField
 * @returns {string} Human-readable label
 *
 * @example
 * getTimeControlLabel({ type: 'RAPID', tier: 1, timeControl: '15+10' })
 * // Returns: "Rapid Tier 1 (15+10)"
 */
function getTimeControlLabel(classification) {
  if (!classification || classification.type === 'UNKNOWN') {
    return 'Unknown';
  }

  const { type, tier, timeControl } = classification;

  if (type === 'CLASSICAL') {
    return `Classical (${timeControl})`;
  }

  if (type === 'ARMAGEDDON') {
    return 'Armageddon';
  }

  if (type === 'RAPID' || type === 'BLITZ') {
    const typeLabel = type.charAt(0) + type.slice(1).toLowerCase();
    return `${typeLabel} Tier ${tier} (${timeControl})`;
  }

  return 'Unknown';
}

/**
 * Batch classify multiple games by their Round fields
 *
 * @param {Array<Object>} games - Array of game objects with 'round' field
 * @returns {Array<Object>} Games with added 'classification' field
 *
 * @example
 * const games = [
 *   { round: '1.1', white: 'Player A', black: 'Player B' },
 *   { round: '3.2', white: 'Player C', black: 'Player D' }
 * ];
 * const classified = classifyGames(games);
 * // Each game now has a 'classification' field
 */
function classifyGames(games) {
  return games.map(game => ({
    ...game,
    classification: classifyByRoundField(game.round),
  }));
}

module.exports = {
  classifyByRoundField,
  getTimeControlLabel,
  classifyGames,
};
