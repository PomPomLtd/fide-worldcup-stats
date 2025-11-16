/**
 * Board Helper Functions
 *
 * Utilities for working with chess board squares, coordinates, and geometry.
 */

/**
 * Calculate Manhattan distance between two squares on a chess board
 * @param {string} from - Starting square (e.g., 'e2')
 * @param {string} to - Ending square (e.g., 'e4')
 * @returns {number} Manhattan distance
 */
function calculateDistance(from, to) {
  const fromFile = from.charCodeAt(0) - 'a'.charCodeAt(0);
  const fromRank = parseInt(from[1]) - 1;
  const toFile = to.charCodeAt(0) - 'a'.charCodeAt(0);
  const toRank = parseInt(to[1]) - 1;
  return Math.abs(toFile - fromFile) + Math.abs(toRank - fromRank);
}

/**
 * Check if a square is a dark square
 * @param {string} square - Square notation (e.g., 'd4')
 * @returns {boolean} True if dark square
 */
function isDarkSquare(square) {
  const file = square.charCodeAt(0) - 'a'.charCodeAt(0); // 0-7
  const rank = parseInt(square[1]) - 1; // 0-7
  return (file + rank) % 2 === 1; // Dark squares have odd sum
}

/**
 * Check if a square is in the center (d4, d5, e4, e5)
 * @param {string} square - Square notation (e.g., 'e4')
 * @returns {boolean} True if center square
 */
function isCenterSquare(square) {
  return CENTER_SQUARES.has(square);
}

/**
 * Check if a square is in the extended center (c3-f6)
 * @param {string} square - Square notation
 * @returns {boolean} True if extended center
 */
function isExtendedCenter(square) {
  const file = square.charCodeAt(0) - 'a'.charCodeAt(0); // 0-7
  const rank = parseInt(square[1]) - 1; // 0-7
  return file >= 2 && file <= 5 && rank >= 2 && rank <= 5;
}

/**
 * Check if a square is a corner square
 * @param {string} square - Square notation
 * @returns {boolean} True if corner
 */
function isCornerSquare(square) {
  return CORNER_SQUARES.has(square);
}

/**
 * Check if a square is on the edge of the board
 * @param {string} square - Square notation
 * @returns {boolean} True if on edge
 */
function isEdgeSquare(square) {
  const file = square.charCodeAt(0) - 'a'.charCodeAt(0); // 0-7
  const rank = parseInt(square[1]) - 1; // 0-7
  return file === 0 || file === 7 || rank === 0 || rank === 7;
}

/**
 * Get rank number (1-8)
 * @param {string} square - Square notation
 * @returns {number} Rank number (1-8)
 */
function getRank(square) {
  return parseInt(square[1]);
}

/**
 * Get file letter (a-h)
 * @param {string} square - Square notation
 * @returns {string} File letter
 */
function getFile(square) {
  return square[0];
}

/**
 * Check if square is in white's half of the board (ranks 1-4)
 * @param {string} square - Square notation
 * @returns {boolean} True if in white's territory
 */
function isWhiteTerritory(square) {
  return getRank(square) <= 4;
}

/**
 * Check if square is in black's half of the board (ranks 5-8)
 * @param {string} square - Square notation
 * @returns {boolean} True if in black's territory
 */
function isBlackTerritory(square) {
  return getRank(square) >= 5;
}

/**
 * Generate all 64 squares
 * @returns {Array<string>} Array of all square names
 */
function getAllSquares() {
  const squares = [];
  for (let rank = 1; rank <= 8; rank++) {
    for (let file = 0; file < 8; file++) {
      squares.push(String.fromCharCode('a'.charCodeAt(0) + file) + rank);
    }
  }
  return squares;
}

// Constants
const CENTER_SQUARES = new Set(['d4', 'd5', 'e4', 'e5']);
const CORNER_SQUARES = new Set(['a1', 'a8', 'h1', 'h8']);
const ALL_SQUARES = getAllSquares();

module.exports = {
  calculateDistance,
  isDarkSquare,
  isCenterSquare,
  isExtendedCenter,
  isCornerSquare,
  isEdgeSquare,
  getRank,
  getFile,
  isWhiteTerritory,
  isBlackTerritory,
  getAllSquares,
  CENTER_SQUARES,
  CORNER_SQUARES,
  ALL_SQUARES,
};
