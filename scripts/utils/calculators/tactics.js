/**
 * Tactics Calculator
 *
 * Analyzes tactical elements: captures, castling, promotions,
 * en passant, underpromotions, and capture streaks.
 * Calculates all statistics from moveList for maximum flexibility.
 */

const { filterGamesWithMoves, getPlayerNames, getGameId } = require('./helpers/game-helpers');
const { isCapture, isPromotion, isCastling, isEnPassant, getCastlingSide, getMoveNumber } = require('./helpers/move-helpers');
const { getPieceName } = require('./helpers/piece-helpers');

/**
 * Calculate special moves for a single game
 * @param {Object} game - Game object with moveList
 * @returns {Object} Special moves counts
 */
function calculateSpecialMoves(game) {
  const moveList = game.moveList || [];

  const stats = {
    totalCaptures: 0,
    totalPromotions: 0,
    totalCastlingKingside: 0,
    totalCastlingQueenside: 0,
    totalEnPassant: 0,
  };

  moveList.forEach((move) => {
    if (isCapture(move)) stats.totalCaptures++;
    if (isPromotion(move)) stats.totalPromotions++;
    if (isEnPassant(move)) stats.totalEnPassant++;

    const castlingSide = getCastlingSide(move);
    if (castlingSide === 'kingside') stats.totalCastlingKingside++;
    if (castlingSide === 'queenside') stats.totalCastlingQueenside++;
  });

  return stats;
}

/**
 * Calculate tactical statistics
 * @param {Array<Object>} games - Array of game objects
 * @returns {Object} Tactical statistics including captures, castling, promotions
 */
function calculateTactics(games) {
  const gamesWithMoves = filterGamesWithMoves(games);

  if (gamesWithMoves.length === 0) {
    return {
      totalCaptures: 0,
      enPassantGames: [],
      promotions: 0,
      castling: { kingside: 0, queenside: 0 },
      bloodiestGame: null,
      quietestGame: null,
      longestNonCaptureStreak: null,
      totalUnderpromotions: 0,
      underpromotions: [],
    };
  }

  let totalCaptures = 0;
  let totalPromotions = 0;
  let totalCastlingKingside = 0;
  let totalCastlingQueenside = 0;
  let totalUnderpromotions = 0;

  const enPassantGames = [];
  const underpromotions = [];

  let bloodiestGame = { captures: 0, game: null };
  let quietestGame = { captures: Infinity, game: null };
  let longestNonCaptureStreak = { moves: 0, game: null };

  gamesWithMoves.forEach((game) => {
    // Calculate or use pre-computed special moves
    const sm = game.specialMoves || calculateSpecialMoves(game);
    const players = getPlayerNames(game);
    const moveList = game.moveList || [];

    totalCaptures += sm.totalCaptures;
    totalPromotions += sm.totalPromotions;
    totalCastlingKingside += sm.totalCastlingKingside;
    totalCastlingQueenside += sm.totalCastlingQueenside;

    if (sm.totalEnPassant > 0) {
      enPassantGames.push({ ...players, count: sm.totalEnPassant });
    }

    // Track underpromotions
    moveList.forEach((move, moveIdx) => {
      if (move.promotion && move.promotion !== 'q') {
        totalUnderpromotions++;
        underpromotions.push({
          moveNumber: getMoveNumber(moveIdx, true),
          promotedTo: getPieceName(move.promotion),
          color: move.color === 'w' ? 'White' : 'Black',
          san: move.san,
          ...players,
        });
      }
    });

    // Track bloodiest and quietest games (only for games with 5+ moves to exclude forfeits)
    const moveCount = game.moveCount || moveList.length;
    if (moveCount >= 5) {
      if (sm.totalCaptures > bloodiestGame.captures) {
        bloodiestGame = { captures: sm.totalCaptures, game };
      }

      if (sm.totalCaptures < quietestGame.captures) {
        quietestGame = { captures: sm.totalCaptures, game };
      }
    }

    // Find longest non-capture streak
    let currentStreak = 0;
    let maxStreak = 0;
    moveList.forEach((move) => {
      if (move.captured) {
        currentStreak = 0;
      } else {
        currentStreak++;
        if (currentStreak > maxStreak) maxStreak = currentStreak;
      }
    });

    if (maxStreak > longestNonCaptureStreak.moves) {
      longestNonCaptureStreak = { moves: maxStreak, game };
    }
  });

  // Format bloodiest game output
  const bloodiestPlayers = getPlayerNames(bloodiestGame.game);
  const quietestPlayers = getPlayerNames(quietestGame.game);
  const streakPlayers = getPlayerNames(longestNonCaptureStreak.game);

  return {
    totalCaptures,
    averageCapturesPerGame: parseFloat((totalCaptures / gamesWithMoves.length).toFixed(1)),
    enPassantGames,
    promotions: totalPromotions,
    castling: {
      kingside: totalCastlingKingside,
      queenside: totalCastlingQueenside,
      total: totalCastlingKingside + totalCastlingQueenside,
    },
    bloodiestGame: {
      captures: bloodiestGame.captures,
      white: bloodiestPlayers.white,
      black: bloodiestPlayers.black,
      gameId: getGameId(bloodiestGame.game),
    },
    quietestGame: {
      captures: quietestGame.captures,
      white: quietestPlayers.white,
      black: quietestPlayers.black,
      gameId: getGameId(quietestGame.game),
    },
    longestNonCaptureStreak: {
      moves: longestNonCaptureStreak.moves,
      white: streakPlayers.white,
      black: streakPlayers.black,
      gameId: getGameId(longestNonCaptureStreak.game),
    },
    totalUnderpromotions,
    underpromotions,
  };
}

module.exports = { calculateTactics, calculateSpecialMoves };
