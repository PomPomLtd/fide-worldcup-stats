/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Opening Hipster Fun Stat
 *
 * Tracks the most obscure/specific opening name used.
 * Obscurity = name length + bonus for specificity (contains colon).
 */

const { getOpeningName } = require('../../chess-openings');
const { getPlayerNames } = require('../helpers/game-helpers');

/**
 * Calculate how exotic an ECO code is
 * @param {string} eco - ECO code (e.g., 'A00', 'B20')
 * @returns {number} Exoticism bonus score
 */
function getEcoExoticismBonus(eco) {
  if (!eco || eco.length < 3) return 0;

  const letter = eco[0];
  const number = parseInt(eco.substring(1, 3));

  // A00-A03: Very exotic unusual first moves (Grob, Polish, Anderssen, etc.)
  if (letter === 'A' && number <= 3) return 40;

  // A04-A09: Exotic (Reti, King's Indian Attack variations)
  if (letter === 'A' && number <= 9) return 30;

  // A10-A39: Uncommon (English, unusual lines)
  if (letter === 'A' && number <= 39) return 20;

  // A40-A99: Less common responses
  if (letter === 'A' && number <= 79) return 15;
  if (letter === 'A') return 10;

  // B00-B09: Rare defenses (Owen, St. George, etc.)
  if (letter === 'B' && number <= 9) return 25;

  // C00-C19: French and Caro-Kann exotic lines
  if (letter === 'C' && number <= 19) return 10;

  // C20-C29: Rare open games
  if (letter === 'C' && number <= 29) return 15;

  // D00-D05: Uncommon Queen's Pawn lines
  if (letter === 'D' && number <= 5) return 15;

  // E00-E09: Catalan and rare Indian lines
  if (letter === 'E' && number <= 9) return 10;

  // Everything else is relatively common
  return 0;
}

/**
 * Calculate opening hipster (most obscure opening)
 * @param {Array} games - Array of parsed game objects
 * @returns {Object} Opening hipster stat
 */
function calculateOpeningHipster(games) {
  let openingHipster = { gameIndex: null, eco: null, name: null, moves: null, obscurityScore: 0 };

  games.forEach((game, idx) => {
    // Check for opening hipster award (most obscure opening)
    // Get opening for this game (first 6 moves)
    if (game.moveList.length >= 6) {
      const sequence = game.moveList.slice(0, 6).map(m => m.san).join(' ');
      const opening = getOpeningName(sequence);

      if (opening && opening.name) {
        // Calculate obscurity score: length of name + specificity (has colon) + ECO exoticism
        const hasColon = opening.name.includes(':');
        const nameLength = opening.name.length;
        const ecoBonus = getEcoExoticismBonus(opening.eco);
        const obscurityScore = nameLength + (hasColon ? 20 : 0) + ecoBonus;

        if (obscurityScore > openingHipster.obscurityScore) {
          const players = getPlayerNames(game);
          const gameId = game.headers?.GameId || game.headers?.Site?.split('/').pop() || null;
          openingHipster = {
            gameIndex: idx,
            gameId,
            eco: opening.eco,
            name: opening.name,
            moves: sequence,
            obscurityScore,
            white: players.white,
            black: players.black
          };
        }
      }
    }
  });

  return openingHipster.gameIndex !== null ? openingHipster : null;
}

module.exports = { calculateOpeningHipster };
