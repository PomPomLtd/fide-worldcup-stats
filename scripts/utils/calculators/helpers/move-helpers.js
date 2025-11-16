/**
 * Move Helper Functions
 *
 * Utilities for working with chess moves - conversion, classification,
 * and move pattern analysis.
 */

/**
 * Convert half-moves (plies) to full moves
 * @param {number} halfMoves - Number of half-moves (plies)
 * @returns {number} Number of full moves (rounded up)
 */
function toFullMoves(halfMoves) {
  return Math.ceil(halfMoves / 2);
}

/**
 * Convert full moves to half-moves (plies)
 * @param {number} fullMoves - Number of full moves
 * @returns {number} Number of half-moves
 */
function toHalfMoves(fullMoves) {
  return fullMoves * 2;
}

/**
 * Check if a move is a capture
 * @param {Object} move - Move object from chess.js (verbose format)
 * @returns {boolean} True if capture
 */
function isCapture(move) {
  return move.captured !== undefined;
}

/**
 * Check if a move is a promotion
 * @param {Object} move - Move object from chess.js
 * @returns {boolean} True if promotion
 */
function isPromotion(move) {
  return move.promotion !== undefined;
}

/**
 * Check if a move is castling
 * @param {Object} move - Move object from chess.js
 * @returns {boolean} True if castling
 */
function isCastling(move) {
  return move.flags && move.flags.includes('k') || move.flags.includes('q');
}

/**
 * Check if a move is en passant
 * @param {Object} move - Move object from chess.js
 * @returns {boolean} True if en passant
 */
function isEnPassant(move) {
  return move.flags && move.flags.includes('e');
}

/**
 * Check if a move is a check
 * @param {string} san - Standard Algebraic Notation
 * @returns {boolean} True if check
 */
function isCheck(san) {
  return san.endsWith('+');
}

/**
 * Check if a move is checkmate
 * @param {string} san - Standard Algebraic Notation
 * @returns {boolean} True if checkmate
 */
function isCheckmate(san) {
  return san.endsWith('#');
}

/**
 * Get castling side from move
 * @param {Object} move - Move object from chess.js
 * @returns {string|null} 'kingside', 'queenside', or null
 */
function getCastlingSide(move) {
  if (!move.flags) return null;
  if (move.flags.includes('k')) return 'kingside';
  if (move.flags.includes('q')) return 'queenside';
  return null;
}

/**
 * Classify move type for statistics
 * @param {Object} move - Move object from chess.js
 * @returns {Object} Classification with flags
 */
function classifyMove(move) {
  return {
    isCapture: isCapture(move),
    isPromotion: isPromotion(move),
    isCastling: isCastling(move),
    isEnPassant: isEnPassant(move),
    isCheck: isCheck(move.san),
    isCheckmate: isCheckmate(move.san),
    castlingSide: getCastlingSide(move),
  };
}

/**
 * Game phase definitions based on move number
 */
const GAME_PHASES = {
  opening: { start: 1, end: 15 },
  middlegame: { start: 16, end: 40 },
  endgame: { start: 41, end: Infinity },
};

/**
 * Determine game phase from move number
 * @param {number} moveNumber - Full move number (not ply)
 * @returns {string} 'opening', 'middlegame', or 'endgame'
 */
function getGamePhase(moveNumber) {
  if (moveNumber <= GAME_PHASES.opening.end) return 'opening';
  if (moveNumber <= GAME_PHASES.middlegame.end) return 'middlegame';
  return 'endgame';
}

/**
 * Get move number from ply
 * @param {number} ply - Ply/half-move number (0-indexed or 1-indexed)
 * @param {boolean} zeroIndexed - Whether ply is 0-indexed
 * @returns {number} Full move number
 */
function getMoveNumber(ply, zeroIndexed = false) {
  const adjustedPly = zeroIndexed ? ply + 1 : ply;
  return Math.ceil(adjustedPly / 2);
}

module.exports = {
  toFullMoves,
  toHalfMoves,
  isCapture,
  isPromotion,
  isCastling,
  isEnPassant,
  isCheck,
  isCheckmate,
  getCastlingSide,
  classifyMove,
  getGamePhase,
  getMoveNumber,
  GAME_PHASES,
};
