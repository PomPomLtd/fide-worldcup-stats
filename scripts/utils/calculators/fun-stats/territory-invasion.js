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

    // Track first invasion and max simultaneous invaders
    const invasionTracking = {
      white: {
        firstInvasion: null,
        maxSimultaneousInvaders: 0
      },
      black: {
        firstInvasion: null,
        maxSimultaneousInvaders: 0
      }
    };

    // Track current piece positions (to know what's in enemy territory)
    const piecePositions = {
      white: new Map(), // square -> piece type
      black: new Map()
    };

    // Initialize starting positions (pawns and pieces)
    const initRanks = { white: ['1', '2'], black: ['7', '8'] };
    for (const color of ['white', 'black']) {
      const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
      const ranks = initRanks[color];
      for (const file of files) {
        for (const rank of ranks) {
          piecePositions[color].set(`${file}${rank}`, 'p'); // Simplified initialization
        }
      }
    }

    // Iterate through moves and track invasions
    for (let i = 0; i < game.moveList.length; i++) {
      const move = game.moveList[i];
      if (!move || !move.to || !move.color || !move.from) continue;

      const movingColor = move.color === 'w' ? 'white' : 'black';
      const opponentColor = movingColor === 'white' ? 'black' : 'white';
      const tracking = invasionTracking[movingColor];

      // Update piece positions
      piecePositions[movingColor].delete(move.from);
      piecePositions[movingColor].set(move.to, move.piece);

      // Handle captures
      if (move.captured) {
        piecePositions[opponentColor].delete(move.to);
      }

      // Count pieces in enemy territory for this color
      let invasionCount = 0;
      for (const square of piecePositions[movingColor].keys()) {
        if (isInEnemyTerritory(square, movingColor)) {
          invasionCount++;
        }
      }

      // Record first invasion
      if (invasionCount > 0 && tracking.firstInvasion === null) {
        tracking.firstInvasion = i;
      }

      // Update max simultaneous invaders
      if (invasionCount > tracking.maxSimultaneousInvaders) {
        tracking.maxSimultaneousInvaders = invasionCount;
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

      // Homebody: Least simultaneous pieces in enemy territory
      const invaderCount = tracking.maxSimultaneousInvaders;
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

      // Deep Strike: Most simultaneous pieces in enemy territory
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
