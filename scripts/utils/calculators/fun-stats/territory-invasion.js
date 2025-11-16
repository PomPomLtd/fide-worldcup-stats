/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Territory Invasion Awards
 *
 * Awards based on piece movement across the board midpoint.
 * Tracks when and how many pieces cross into enemy territory.
 */

/**
 * Check if a square is in enemy territory for a given color
 * @param {string} square - Square in algebraic notation (e.g., 'e4')
 * @param {string} color - 'white' or 'black'
 * @returns {boolean}
 */
function isInEnemyTerritory(square, color) {
  const rank = parseInt(square[1]);
  if (color === 'white') {
    return rank >= 5; // White's enemy territory is ranks 5-8
  } else {
    return rank <= 4; // Black's enemy territory is ranks 1-4
  }
}

/**
 * Analyze territory invasion for all games
 * @param {Array} games - Array of game objects
 * @returns {Object} Territory invasion statistics
 */
function calculateTerritoryInvasion(games) {
  let latestFirstInvasion = null; // Late Bloomer
  let earliestFirstInvasion = null; // Quick Draw
  let leastInvaders = null; // Homebody
  let mostInvaders = null; // Deep Strike

  for (const game of games) {
    if (!game.moveList || game.moveList.length === 0) continue;

    // Track first invasion and total unique invaders
    const invasionTracking = {
      white: {
        firstInvasion: null,
        invadedSquares: new Set(),
        uniquePiecesInvaded: new Set()
      },
      black: {
        firstInvasion: null,
        invadedSquares: new Set(),
        uniquePiecesInvaded: new Set()
      }
    };

    // Iterate through moves and track invasions
    for (let i = 0; i < game.moveList.length; i++) {
      const move = game.moveList[i];
      if (!move || !move.to || !move.color) continue;

      const movingColor = move.color === 'w' ? 'white' : 'black';
      const tracking = invasionTracking[movingColor];

      // Check if piece is now in enemy territory
      if (isInEnemyTerritory(move.to, movingColor)) {
        // Record first invasion
        if (tracking.firstInvasion === null) {
          tracking.firstInvasion = i;
        }

        // Track unique pieces that invaded (piece type + starting square)
        const pieceKey = `${move.piece}${move.from}`;
        tracking.uniquePiecesInvaded.add(pieceKey);
      }
    }

    // Update awards
    for (const color of ['white', 'black']) {
      const tracking = invasionTracking[color];
      const playerName = color === 'white' ? game.white : game.black;
      const opponent = color === 'white' ? game.black : game.white;

      // Late Bloomer: Latest first invasion
      if (tracking.firstInvasion !== null) {
        const moveNumber = tracking.firstInvasion;
        if (!latestFirstInvasion || moveNumber > latestFirstInvasion.moveNumber) {
          latestFirstInvasion = {
            white: game.white,
            black: game.black,
            whiteElo: game.whiteElo,
            blackElo: game.blackElo,
            player: playerName,
            color,
            moveNumber,
            gameIndex: game.gameIndex,
            gameId: game.gameId
          };
        }

        // Quick Draw: Earliest first invasion
        if (!earliestFirstInvasion || moveNumber < earliestFirstInvasion.moveNumber) {
          earliestFirstInvasion = {
            white: game.white,
            black: game.black,
            whiteElo: game.whiteElo,
            blackElo: game.blackElo,
            player: playerName,
            color,
            moveNumber,
            gameIndex: game.gameIndex,
            gameId: game.gameId
          };
        }
      }

      // Homebody: Least unique pieces invaded
      const invaderCount = tracking.uniquePiecesInvaded.size;
      if (tracking.firstInvasion !== null) { // Only count if they invaded at all
        if (!leastInvaders || invaderCount < leastInvaders.count) {
          leastInvaders = {
            white: game.white,
            black: game.black,
            whiteElo: game.whiteElo,
            blackElo: game.blackElo,
            player: playerName,
            color,
            count: invaderCount,
            gameIndex: game.gameIndex,
            gameId: game.gameId
          };
        }
      }

      // Deep Strike: Most unique pieces invaded
      if (invaderCount > 0) {
        if (!mostInvaders || invaderCount > mostInvaders.count) {
          mostInvaders = {
            white: game.white,
            black: game.black,
            whiteElo: game.whiteElo,
            blackElo: game.blackElo,
            player: playerName,
            color,
            count: invaderCount,
            gameIndex: game.gameIndex,
            gameId: game.gameId
          };
        }
      }
    }
  }

  return {
    lateBloomer: latestFirstInvasion,
    quickDraw: earliestFirstInvasion,
    homebody: leastInvaders,
    deepStrike: mostInvaders
  };
}

module.exports = { calculateTerritoryInvasion };
