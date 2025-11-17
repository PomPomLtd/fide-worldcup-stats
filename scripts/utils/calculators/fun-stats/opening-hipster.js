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

  // A00-A03: EXTREMELY exotic unusual first moves (Grob, Polish, Anderssen, Sodium Attack)
  if (letter === 'A' && number <= 3) return 200;

  // A04-A09: Very exotic (Reti, King's Indian Attack variations)
  if (letter === 'A' && number <= 9) return 100;

  // A10-A39: English Opening - common at high level, so LOW score
  if (letter === 'A' && number <= 39) return 5;

  // A40-A99: Queen's Pawn unusual responses
  if (letter === 'A' && number <= 49) return 80;
  if (letter === 'A' && number <= 79) return 60;
  if (letter === 'A') return 40;

  // B00-B09: RARE defenses (Owen, St. George, Nimzowitsch, Borg)
  if (letter === 'B' && number <= 9) return 150;

  // B10-B19: Caro-Kann rare lines
  if (letter === 'B' && number <= 19) return 30;

  // B20-B99: Sicilian (COMMON - low score)
  if (letter === 'B') return 3;

  // C00-C19: French and Caro-Kann exotic lines
  if (letter === 'C' && number <= 19) return 50;

  // C20-C99: Open games (1.e4 e5) - VERY common
  if (letter === 'C') return 2;

  // D00-D05: Uncommon Queen's Pawn lines
  if (letter === 'D' && number <= 5) return 70;

  // D06-D99: Queen's Gambit family - common
  if (letter === 'D') return 4;

  // E00-E09: Catalan and rare Indian lines
  if (letter === 'E' && number <= 9) return 50;

  // E10-E99: Indian defenses - moderately common
  if (letter === 'E') return 8;

  // Everything else
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
        // Calculate obscurity score: ECO exoticism (heavily weighted) + specificity + name length (minimal)
        const hasColon = opening.name.includes(':');
        const nameLength = opening.name.length;
        const ecoBonus = getEcoExoticismBonus(opening.eco);

        // Weight ECO exoticism heavily, name length minimally (so weird ECOs dominate)
        const obscurityScore = (ecoBonus * 3) + (hasColon ? 30 : 0) + (nameLength * 0.3);

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
