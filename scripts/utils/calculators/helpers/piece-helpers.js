/**
 * Piece Helper Functions
 *
 * Utilities for working with chess pieces - type identification,
 * naming, and piece-related constants.
 */

/**
 * Piece type names mapping (capitalized)
 */
const PIECE_NAMES = {
  p: 'Pawn',
  n: 'Knight',
  b: 'Bishop',
  r: 'Rook',
  q: 'Queen',
  k: 'King',
};

/**
 * Piece type names mapping (lowercase for tactical stats)
 */
const PIECE_NAMES_LOWERCASE = {
  p: 'pawns',
  n: 'knights',
  b: 'bishops',
  r: 'rooks',
  q: 'queens',
  k: 'kings',
};

/**
 * Piece symbols (Unicode)
 */
const PIECE_SYMBOLS = {
  white: {
    p: '♙',
    n: '♘',
    b: '♗',
    r: '♖',
    q: '♕',
    k: '♔',
  },
  black: {
    p: '♟',
    n: '♞',
    b: '♝',
    r: '♜',
    q: '♛',
    k: '♚',
  },
};

/**
 * Get piece name from piece type
 * @param {string} pieceType - Piece type ('p', 'n', 'b', 'r', 'q', 'k')
 * @param {boolean} lowercase - Return lowercase name
 * @returns {string} Piece name
 */
function getPieceName(pieceType, lowercase = false) {
  const type = pieceType.toLowerCase();
  if (lowercase) {
    return PIECE_NAMES_LOWERCASE[type] || 'unknown';
  }
  return PIECE_NAMES[type] || 'Unknown';
}

/**
 * Get piece symbol (Unicode)
 * @param {string} piece - Piece code from chess.js (e.g., 'wP', 'bN')
 * @returns {string} Unicode piece symbol
 */
function getPieceSymbol(piece) {
  if (!piece || piece.length !== 2) return '';
  const color = piece[0] === 'w' ? 'white' : 'black';
  const type = piece[1].toLowerCase();
  return PIECE_SYMBOLS[color][type] || '';
}

/**
 * Check if a piece is a major piece (Queen or Rook)
 * @param {string} pieceType - Piece type
 * @returns {boolean} True if major piece
 */
function isMajorPiece(pieceType) {
  const type = pieceType.toLowerCase();
  return type === 'q' || type === 'r';
}

/**
 * Check if a piece is a minor piece (Bishop or Knight)
 * @param {string} pieceType - Piece type
 * @returns {boolean} True if minor piece
 */
function isMinorPiece(pieceType) {
  const type = pieceType.toLowerCase();
  return type === 'b' || type === 'n';
}

/**
 * Get piece value (standard chess values)
 * @param {string} pieceType - Piece type
 * @returns {number} Piece value (pawn=1, knight=3, bishop=3, rook=5, queen=9, king=0)
 */
function getPieceValue(pieceType) {
  const values = {
    p: 1,
    n: 3,
    b: 3,
    r: 5,
    q: 9,
    k: 0, // King has no material value
  };
  return values[pieceType.toLowerCase()] || 0;
}

module.exports = {
  PIECE_NAMES,
  PIECE_NAMES_LOWERCASE,
  PIECE_SYMBOLS,
  getPieceName,
  getPieceSymbol,
  isMajorPiece,
  isMinorPiece,
  getPieceValue,
};
