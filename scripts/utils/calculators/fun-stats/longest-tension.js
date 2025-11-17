/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Longest Tension Award
 *
 * Finds pieces that could capture each other but don't for the longest sequence.
 * Tension = mutual attack where both sides can capture the other's piece.
 */

const { Chess } = require('chess.js');

/**
 * Find all tension pairs in current position
 * @param {Chess} chess - Chess.js instance
 * @returns {Array} Array of tension pairs {square1, square2, piece1, piece2}
 */
function findTensionPairs(chess) {
  const tensions = [];
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

  const processedPairs = new Set();

  for (const square1 of allSquares) {
    const piece1 = chess.get(square1);
    if (!piece1) continue;

    for (const square2 of allSquares) {
      if (square1 === square2) continue;

      const piece2 = chess.get(square2);
      if (!piece2) continue;

      // Skip if same color
      if (piece1.color === piece2.color) continue;

      // Create a unique key for this pair (sorted to avoid duplicates)
      const pairKey = [square1, square2].sort().join('-');
      if (processedPairs.has(pairKey)) continue;

      // Check if piece1 attacks square2
      const piece1AttacksSquare2 = chess.attackers(square2, piece1.color).some(
        (sq) => sq === square1
      );

      // Check if piece2 attacks square1
      const piece2AttacksSquare1 = chess.attackers(square1, piece2.color).some(
        (sq) => sq === square2
      );

      // If mutual attack, it's tension
      if (piece1AttacksSquare2 && piece2AttacksSquare1) {
        tensions.push({
          square1,
          square2,
          piece1: `${piece1.color}${piece1.type}`,
          piece2: `${piece2.color}${piece2.type}`,
          key: pairKey
        });
        processedPairs.add(pairKey);
      }
    }
  }

  return tensions;
}

/**
 * Find the longest tension sequence across all games
 * @param {Array} games - Array of game objects with moveList
 * @returns {Object|null} Longest tension award data
 */
function calculateLongestTension(games) {
  let longestTension = null;

  for (const game of games) {
    if (!game.moveList || game.moveList.length === 0) continue;

    const chess = new Chess();
    const activeTensions = new Map(); // key -> {tension, startMove, moves}

    for (let i = 0; i < game.moveList.length; i++) {
      const move = game.moveList[i];

      try {
        // Make the move
        chess.move(move.san);

        // Find current tensions
        const currentTensions = findTensionPairs(chess);
        const currentKeys = new Set(currentTensions.map((t) => t.key));

        // Update active tensions
        const tensionsToRemove = [];
        for (const [key, tensionData] of activeTensions.entries()) {
          if (currentKeys.has(key)) {
            // Tension continues
            tensionData.moves++;
          } else {
            // Tension resolved
            if (
              !longestTension ||
              tensionData.moves > longestTension.moves
            ) {
              longestTension = {
                white: game.white,
                black: game.black,
                whiteRating: game.whiteRating,
                blackRating: game.blackRating,
                moves: tensionData.moves,
                squares: tensionData.tension.square1 + '-' + tensionData.tension.square2,
                piece1: tensionData.tension.piece1,
                piece2: tensionData.tension.piece2,
                startMove: tensionData.startMove,
                endMove: i,
                gameIndex: game.gameIndex,
                gameId: game.gameId
              };
            }
            tensionsToRemove.push(key);
          }
        }

        // Remove resolved tensions
        for (const key of tensionsToRemove) {
          activeTensions.delete(key);
        }

        // Add new tensions
        for (const tension of currentTensions) {
          if (!activeTensions.has(tension.key)) {
            activeTensions.set(tension.key, {
              tension,
              startMove: i + 1,
              moves: 1
            });
          }
        }
      } catch (error) {
        // Skip invalid moves
        continue;
      }
    }

    // Check any remaining tensions at end of game
    for (const [key, tensionData] of activeTensions.entries()) {
      if (!longestTension || tensionData.moves > longestTension.moves) {
        longestTension = {
          white: game.white,
          black: game.black,
          whiteElo: game.whiteElo,
          blackElo: game.blackElo,
          moves: tensionData.moves,
          squares: tensionData.tension.square1 + '-' + tensionData.tension.square2,
          piece1: tensionData.tension.piece1,
          piece2: tensionData.tension.piece2,
          startMove: tensionData.startMove,
          endMove: game.moveList.length,
          gameIndex: game.gameIndex,
          gameId: game.gameId
        };
      }
    }
  }

  return longestTension;
}

module.exports = { calculateLongestTension };
