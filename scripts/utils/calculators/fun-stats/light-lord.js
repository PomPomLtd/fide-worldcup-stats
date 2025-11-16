/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Light Lord (Day Mode Warrior) Fun Stat
 *
 * Tracks the player with the most captures on light squares.
 */

const { getPlayerNames, isLightSquare } = require('../helpers/game-helpers');

/**
 * Calculate light lord (most light square captures)
 * @param {Array} games - Array of parsed game objects
 * @returns {Object} Light lord stat
 */
function calculateLightLord(games) {
  let lightLord = { captures: 0, gameIndex: null, color: null };

  games.forEach((game, idx) => {
    let whiteLightCaptures = 0;
    let blackLightCaptures = 0;

    game.moveList.forEach((move) => {
      // Track light square captures
      if (move.captured && isLightSquare(move.to)) {
        if (move.color === 'w') {
          whiteLightCaptures++;
        } else {
          blackLightCaptures++;
        }
      }
    });

    // Check if this game has the most light square captures
    const players = getPlayerNames(game);
    const gameId = game.headers?.GameId || game.headers?.Site?.split('/').pop() || null;
    if (whiteLightCaptures > lightLord.captures) {
      lightLord = {
        captures: whiteLightCaptures,
        gameIndex: idx,
        gameId,
        color: 'White',
        white: players.white,
        black: players.black
      };
    }

    if (blackLightCaptures > lightLord.captures) {
      lightLord = {
        captures: blackLightCaptures,
        gameIndex: idx,
        gameId,
        color: 'Black',
        white: players.white,
        black: players.black
      };
    }
  });

  return lightLord.captures > 0 ? lightLord : null;
}

module.exports = { calculateLightLord };
