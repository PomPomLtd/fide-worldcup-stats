/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Game Phase Detection Utility
 *
 * Detects opening, middlegame, and endgame phases in chess games.
 * Based on Lichess's Divider.scala implementation.
 *
 * Phase definitions (from Lichess's Divider.scala):
 * - Opening: Game start until middlegame conditions are met
 * - Middlegame: Starts when ANY of:
 *   1. Majors+Minors (Q+R+B+N) ≤ 10 pieces
 *   2. Back rank sparse (< 4 pieces on rank 1 or rank 8)
 *   3. Mixedness score > 150 (not implemented - requires complex position analysis)
 * - Endgame: When 6 or fewer minor/major pieces remain (queens, rooks, bishops, knights)
 *
 * @module game-phases
 */

const { Chess } = require('chess.js');

/**
 * Analyze game phases for a parsed game
 *
 * @param {Array} history - Move history from chess.js (verbose format)
 * @param {string} pgn - Original PGN string for replay
 * @returns {Object} Phase analysis with move numbers and lengths
 */
function analyzeGamePhases(history, pgn) {
  if (history.length === 0) {
    return {
      opening: 0,
      middlegame: 0,
      endgame: 0,
      openingEnd: 0,
      middlegameEnd: 0
    };
  }

  const chess = new Chess();
  chess.loadPgn(pgn);

  // Detect opening end (middlegame start)
  const openingEnd = detectOpeningEnd(history, pgn);

  // Detect endgame start
  const endgameStart = detectEndgameStart(history, pgn);

  // Calculate phase lengths
  const openingLength = openingEnd;
  const middlegameLength = endgameStart - openingEnd;
  const endgameLength = history.length - endgameStart;

  return {
    opening: openingLength,
    middlegame: middlegameLength,
    endgame: endgameLength,
    openingEnd,
    middlegameEnd: endgameStart
  };
}

/**
 * Check if back rank is sparse (< 4 pieces on rank 1 or rank 8)
 * Matches Lichess's backrankSparse() function
 *
 * @param {Array} board - Chess.js board array
 * @returns {boolean} True if either back rank has fewer than 4 pieces
 */
function isBackrankSparse(board) {
  // Count pieces on White's back rank (rank 1 = index 7 in chess.js board)
  const whiteBackrank = board[7].filter(square => square !== null).length;

  // Count pieces on Black's back rank (rank 8 = index 0 in chess.js board)
  const blackBackrank = board[0].filter(square => square !== null).length;

  return whiteBackrank < 4 || blackBackrank < 4;
}

/**
 * Detect when the opening phase ends (middlegame starts)
 *
 * Based on Lichess's Divider.scala implementation:
 * Middlegame starts when ANY of these conditions is met:
 * 1. Majors+Minors (Q+R+B+N) ≤ 10
 * 2. Back rank sparse (< 4 pieces on either player's back rank)
 * 3. Mixedness score > 150 (not implemented - computationally expensive)
 *
 * Fallback: If none trigger, opening ends at move 20 or 15 (whichever is shorter)
 *
 * @param {Array} history - Move history
 * @param {string} pgn - Original PGN for position replay
 * @returns {number} Move number when opening ends
 */
function detectOpeningEnd(history, pgn) {
  // Create chess instance ONCE and replay incrementally
  const chess = new Chess();

  for (let i = 0; i < history.length; i++) {
    const move = history[i];

    // Play this move
    chess.move(move.san);

    const board = chess.board();

    // Check Lichess conditions
    const pieceCount = countMinorMajorPieces(board);
    const backrankSparse = isBackrankSparse(board);

    // Middlegame starts when: piece count ≤ 10 OR back rank sparse
    // Note: Mixedness > 150 not implemented (requires complex position analysis)
    if (pieceCount <= 10 || backrankSparse) {
      return i;
    }
  }

  // Fallback: opening ends around move 15-20
  return Math.min(20, history.length);
}

/**
 * Detect when the endgame phase starts
 *
 * Based on Lichess's threshold:
 * - 6 or fewer minor/major pieces remain (queens, rooks, bishops, knights)
 * - Pawns and kings are excluded from count
 *
 * @param {Array} history - Move history
 * @param {string} pgn - Original PGN for position replay
 * @returns {number} Move number when endgame starts
 */
function detectEndgameStart(history, pgn) {
  // Replay game ONCE and store piece counts for each position
  const chess = new Chess();
  const pieceCounts = [];

  for (let i = 0; i < history.length; i++) {
    chess.move(history[i].san);
    pieceCounts[i] = countMinorMajorPieces(chess.board());
  }

  // Work backwards from end to find when endgame started
  for (let i = history.length - 1; i >= 0; i--) {
    const pieceCount = pieceCounts[i];

    // Endgame threshold: 6 or fewer minor/major pieces (Lichess standard)
    if (pieceCount <= 6) {
      // Continue searching backwards
      continue;
    } else {
      // Found where endgame started (next move after this)
      return i + 1;
    }
  }

  // If we never found endgame, it starts at the end
  return history.length;
}

/**
 * Count minor and major pieces (Q+R+B+N, excluding pawns and kings)
 * Matches Lichess's majorsAndMinors() function
 *
 * @param {Array} board - Chess.js board array
 * @returns {number} Count of Q+R+B+N pieces
 */
function countMinorMajorPieces(board) {
  let count = 0;

  board.forEach(row => {
    row.forEach(square => {
      if (square && square.type !== 'k' && square.type !== 'p') {
        count++;
      }
    });
  });

  return count;
}

/**
 * Determine which phase a specific move number is in
 *
 * @param {number} moveNumber - The move number to check
 * @param {Object} phases - Phase analysis object
 * @returns {string} Phase name: 'opening', 'middlegame', or 'endgame'
 */
function getMovePhase(moveNumber, phases) {
  if (moveNumber < phases.openingEnd) {
    return 'opening';
  } else if (moveNumber < phases.middlegameEnd) {
    return 'middlegame';
  } else {
    return 'endgame';
  }
}

/**
 * Get statistics about phase distribution across multiple games
 *
 * @param {Array} gamesPhases - Array of phase analysis objects
 * @returns {Object} Aggregate phase statistics
 */
function getPhaseStatistics(gamesPhases) {
  if (gamesPhases.length === 0) {
    return {
      averageOpening: 0,
      averageMiddlegame: 0,
      averageEndgame: 0,
      longestOpening: null,
      longestMiddlegame: null,
      longestEndgame: null
    };
  }

  let totalOpening = 0;
  let totalMiddlegame = 0;
  let totalEndgame = 0;

  let longestOpening = { moves: 0, gameIndex: null };
  let longestMiddlegame = { moves: 0, gameIndex: null };
  let longestEndgame = { moves: 0, gameIndex: null };

  gamesPhases.forEach((phases, index) => {
    totalOpening += phases.opening;
    totalMiddlegame += phases.middlegame;
    totalEndgame += phases.endgame;

    if (phases.opening > longestOpening.moves) {
      longestOpening = { moves: phases.opening, gameIndex: index };
    }
    if (phases.middlegame > longestMiddlegame.moves) {
      longestMiddlegame = { moves: phases.middlegame, gameIndex: index };
    }
    if (phases.endgame > longestEndgame.moves) {
      longestEndgame = { moves: phases.endgame, gameIndex: index };
    }
  });

  const count = gamesPhases.length;

  return {
    averageOpening: totalOpening / count,
    averageMiddlegame: totalMiddlegame / count,
    averageEndgame: totalEndgame / count,
    longestOpening,
    longestMiddlegame,
    longestEndgame
  };
}

module.exports = {
  analyzeGamePhases,
  detectOpeningEnd,
  detectEndgameStart,
  getMovePhase,
  getPhaseStatistics,
  countMinorMajorPieces,
  isBackrankSparse
};
