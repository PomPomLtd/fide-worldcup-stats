/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Crosshairs Award
 *
 * Finds the square that was under the most simultaneous attacks in a single position.
 */

const { Chess } = require('chess.js');

/**
 * Count attackers on each square for a given position
 * @param {Chess} chess - Chess.js instance
 * @returns {Object} Map of square -> {attackers, whiteAttackers, blackAttackers}
 */
function countAttackersPerSquare(chess) {
  const squares = {};
  const allSquares = [
    'a1', 'a2', 'a3', 'a4', 'a5', 'a6', 'a7', 'a8',
    'b1', 'b2', 'b3', 'b4', 'b5', 'b6', 'b7', 'b8',
    'c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'c7', 'c8',
    'd1', 'd2', 'd3', 'd4', 'd5', 'd6', 'd7', 'd8',
    'e1', 'e2', 'e3', 'e4', 'e5', 'e6', 'e7', 'e8',
    'f1', 'f2', 'f3', 'f4', 'f5', 'f6', 'f7', 'f8',
    'g1', 'g2', 'g3', 'g4', 'g5', 'g6', 'g7', 'g8',
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'h7', 'h8'
  ];

  for (const square of allSquares) {
    const piece = chess.get(square);

    // Count white attackers
    const whiteAttackers = chess.attackers(square, 'w').length;

    // Count black attackers
    const blackAttackers = chess.attackers(square, 'b').length;

    const totalAttackers = whiteAttackers + blackAttackers;

    if (totalAttackers > 0) {
      squares[square] = {
        attackers: totalAttackers,
        whiteAttackers,
        blackAttackers,
        piece: piece ? `${piece.color}${piece.type}` : null
      };
    }
  }

  return squares;
}

/**
 * Find the square under most simultaneous attack across all games
 * @param {Array} games - Array of game objects with moveList
 * @returns {Object|null} Crosshairs award data
 */
function calculateCrosshairs(games) {
  let maxAttacked = null;

  for (const game of games) {
    if (!game.moveList || game.moveList.length === 0) continue;

    const chess = new Chess();

    for (let i = 0; i < game.moveList.length; i++) {
      const move = game.moveList[i];

      try {
        // Make the move
        chess.move(move.san);

        // Count attackers on each square
        const attackedSquares = countAttackersPerSquare(chess);

        // Find the most attacked square in this position
        for (const [square, data] of Object.entries(attackedSquares)) {
          if (!maxAttacked || data.attackers > maxAttacked.attackers) {
            maxAttacked = {
              white: game.white,
              black: game.black,
              whiteRating: game.whiteRating,
              blackRating: game.blackRating,
              square,
              attackers: data.attackers,
              whiteAttackers: data.whiteAttackers,
              blackAttackers: data.blackAttackers,
              moveNumber: i + 1,
              move: move.san,
              gameIndex: game.gameIndex,
              gameId: game.gameId
            };
          }
        }
      } catch (error) {
        // Skip invalid moves
        continue;
      }
    }
  }

  return maxAttacked;
}

module.exports = { calculateCrosshairs };
