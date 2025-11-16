/**
 * Game Phases Calculator
 *
 * Calculates statistics about opening, middlegame, and endgame phases
 * using Lichess approach for phase detection.
 */

const { analyzeGamePhases, getPhaseStatistics } = require('../game-phases');
const { filterGamesWithMoves, getPlayerNames, getGameId } = require('./helpers/game-helpers');
const { toFullMoves } = require('./helpers/move-helpers');

/**
 * Calculate game phase statistics
 * Note: Phase lengths are in half-moves, so we divide by 2 for full moves
 * @param {Array<Object>} games - Array of game objects
 * @returns {Object} Phase statistics including averages and longest phases
 */
function calculateGamePhases(games) {
  const gamesWithMoves = filterGamesWithMoves(games);

  if (gamesWithMoves.length === 0) {
    return {
      averageOpening: 0,
      averageMiddlegame: 0,
      averageEndgame: 0,
      longestWaitTillCapture: null,
      longestMiddlegame: null,
      longestEndgame: null,
    };
  }

  // Analyze phases with progress indicator
  const allPhases = gamesWithMoves.map((g, idx) => {
    if ((idx + 1) % 50 === 0 || idx === 0 || idx === gamesWithMoves.length - 1) {
      process.stdout.write(`\r      Analyzing game phases: ${idx + 1}/${gamesWithMoves.length} games...`);
    }
    return analyzeGamePhases(g.moveList, g.pgn);
  });
  if (gamesWithMoves.length > 0) {
    process.stdout.write('\n');
  }

  const phaseStats = getPhaseStatistics(allPhases);

  // Find longest wait until first capture
  let longestWaitTillCapture = { moves: 0, gameIndex: 0 };
  gamesWithMoves.forEach((game, idx) => {
    const moveList = game.moveList || [];
    const firstCaptureIndex = moveList.findIndex((move) => move.captured);
    const movesBeforeCapture = firstCaptureIndex === -1 ? moveList.length : firstCaptureIndex;
    if (movesBeforeCapture > longestWaitTillCapture.moves) {
      longestWaitTillCapture = { moves: movesBeforeCapture, gameIndex: idx };
    }
  });

  // Get games for longest stats
  const waitGame = gamesWithMoves[longestWaitTillCapture.gameIndex];
  const middleGame = gamesWithMoves[phaseStats.longestMiddlegame.gameIndex];
  const endGame = gamesWithMoves[phaseStats.longestEndgame.gameIndex];

  return {
    averageOpening: parseFloat((phaseStats.averageOpening / 2).toFixed(1)),
    averageMiddlegame: parseFloat((phaseStats.averageMiddlegame / 2).toFixed(1)),
    averageEndgame: parseFloat((phaseStats.averageEndgame / 2).toFixed(1)),
    longestWaitTillCapture: {
      moves: toFullMoves(longestWaitTillCapture.moves),
      ...getPlayerNames(waitGame),
      gameId: getGameId(waitGame),
    },
    longestMiddlegame: {
      moves: toFullMoves(phaseStats.longestMiddlegame.moves),
      ...getPlayerNames(middleGame),
      gameId: getGameId(middleGame),
    },
    longestEndgame: {
      moves: toFullMoves(phaseStats.longestEndgame.moves),
      ...getPlayerNames(endGame),
      gameId: getGameId(endGame),
    },
  };
}

module.exports = { calculateGamePhases };
