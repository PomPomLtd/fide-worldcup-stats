/**
 * Game Helper Functions
 *
 * Utilities for filtering and extracting data from game objects.
 * Works with both lichess4545-style parsed games and our enriched FIDE data.
 */

/**
 * Filter games that have moves (exclude forfeits/no-play games)
 * @param {Array<Object>} games - Array of game objects
 * @returns {Array<Object>} Games with at least one move
 */
function filterGamesWithMoves(games) {
  return games.filter(g => {
    // Handle both formats: moveCount (our data) and moves (4545 data)
    const moveCount = g.moveCount || g.moves || 0;
    return moveCount > 0;
  });
}

/**
 * Get player name from game object
 * @param {Object} game - Game object
 * @param {string} color - 'white' or 'black'
 * @returns {string} Player name
 */
function getPlayerName(game, color) {
  // Handle both headers format (4545) and direct fields (our data)
  if (game.headers) {
    return color === 'white'
      ? (game.headers.White || 'Unknown')
      : (game.headers.Black || 'Unknown');
  }
  return color === 'white' ? (game.white || 'Unknown') : (game.black || 'Unknown');
}

/**
 * Get both player names from game object
 * @param {Object} game - Game object
 * @returns {Object} Object with white and black player names
 */
function getPlayerNames(game) {
  return {
    white: getPlayerName(game, 'white'),
    black: getPlayerName(game, 'black'),
  };
}

/**
 * Get game result
 * @param {Object} game - Game object
 * @returns {string} Result ('1-0', '0-1', '1/2-1/2', '*')
 */
function getResult(game) {
  return game.result || (game.headers?.Result) || '*';
}

/**
 * Get move count (handles both ply and full move formats)
 * @param {Object} game - Game object
 * @returns {number} Number of moves (in plies/half-moves)
 */
function getMoveCount(game) {
  // Our data uses moveCount, 4545 uses moves
  // Both should be in plies (half-moves)
  return game.moveCount || game.moves || 0;
}

/**
 * Get game ID for linking/reference
 * @param {Object} game - Game object
 * @returns {string|null} Game ID
 */
function getGameId(game) {
  // Try various sources
  if (game.headers?.GameId) return game.headers.GameId;
  if (game.headers?.Site) {
    const parts = game.headers.Site.split('/');
    return parts[parts.length - 1];
  }
  // For FIDE games, use round field as identifier
  if (game.round) return game.round;
  return null;
}

/**
 * Check if game is a draw
 * @param {Object} game - Game object
 * @returns {boolean} True if game is a draw
 */
function isDraw(game) {
  const result = getResult(game);
  return result === '1/2-1/2';
}

/**
 * Check if white won
 * @param {Object} game - Game object
 * @returns {boolean} True if white won
 */
function isWhiteWin(game) {
  const result = getResult(game);
  return result === '1-0';
}

/**
 * Check if black won
 * @param {Object} game - Game object
 * @returns {boolean} True if black won
 */
function isBlackWin(game) {
  const result = getResult(game);
  return result === '0-1';
}

/**
 * Get winner color (if any)
 * @param {Object} game - Game object
 * @returns {string|null} 'white', 'black', or null if draw/ongoing
 */
function getWinner(game) {
  const result = getResult(game);
  if (result === '1-0') return 'white';
  if (result === '0-1') return 'black';
  return null;
}

/**
 * Get player rating from game object
 * @param {Object} game - Game object
 * @param {string} color - 'white' or 'black'
 * @returns {number|null} Player rating or null if not available
 */
function getPlayerRating(game, color) {
  // Try PGN headers first (lichess4545 format)
  if (game.headers) {
    const elo = color === 'white' ? game.headers.WhiteElo : game.headers.BlackElo;
    if (elo) return parseInt(elo, 10);
  }

  // Try direct fields (enriched data)
  if (game.whiteElo && color === 'white') return game.whiteElo;
  if (game.blackElo && color === 'black') return game.blackElo;

  // Parse from PGN string (FIDE data format)
  if (game.pgn) {
    const headerName = color === 'white' ? 'WhiteElo' : 'BlackElo';
    const regex = new RegExp(`\\[${headerName} "([0-9]+)"\\]`);
    const match = game.pgn.match(regex);
    if (match) return parseInt(match[1], 10);
  }

  return null;
}

/**
 * Get both player ratings from game object
 * @param {Object} game - Game object
 * @returns {Object} Object with whiteElo and blackElo (may be null)
 */
function getPlayerRatings(game) {
  return {
    whiteElo: getPlayerRating(game, 'white'),
    blackElo: getPlayerRating(game, 'black'),
  };
}

/**
 * Calculate Manhattan distance between two squares
 * @param {string} from - Starting square (e.g., 'e4')
 * @param {string} to - Ending square (e.g., 'e5')
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
 * @returns {boolean} True if square is dark
 */
function isDarkSquare(square) {
  const file = square.charCodeAt(0) - 'a'.charCodeAt(0);
  const rank = parseInt(square[1]) - 1;
  return (file + rank) % 2 === 0;
}

/**
 * Check if a square is a light square
 * @param {string} square - Square notation (e.g., 'e4')
 * @returns {boolean} True if square is light
 */
function isLightSquare(square) {
  const file = square.charCodeAt(0) - 'a'.charCodeAt(0);
  const rank = parseInt(square[1]) - 1;
  return (file + rank) % 2 === 1;
}

/**
 * Convert plies to full moves
 * @param {number} plies - Number of half-moves
 * @returns {number} Number of full moves
 */
function toFullMoves(plies) {
  return Math.ceil(plies / 2);
}

/**
 * Constants for piece names
 */
const PIECE_NAMES = {
  p: 'Pawn',
  n: 'Knight',
  b: 'Bishop',
  r: 'Rook',
  q: 'Queen',
  k: 'King',
};

const PIECE_NAMES_LOWERCASE = {
  p: 'pawn',
  n: 'knight',
  b: 'bishop',
  r: 'rook',
  q: 'queen',
  k: 'king',
};

const CENTER_SQUARES = new Set(['d4', 'd5', 'e4', 'e5']);

module.exports = {
  filterGamesWithMoves,
  getPlayerName,
  getPlayerNames,
  getResult,
  getMoveCount,
  getGameId,
  isDraw,
  isWhiteWin,
  isBlackWin,
  getWinner,
  getPlayerRating,
  getPlayerRatings,
  calculateDistance,
  isDarkSquare,
  isLightSquare,
  toFullMoves,
  PIECE_NAMES,
  PIECE_NAMES_LOWERCASE,
  CENTER_SQUARES,
};
