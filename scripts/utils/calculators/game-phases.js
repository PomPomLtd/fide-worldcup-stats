/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Game Phases Calculator
 *
 * Calculates statistics about opening, middlegame, and endgame phases
 * using Lichess approach for phase detection.
 */

const { analyzeGamePhases, getPhaseStatistics } = require('../game-phases');
const { getPlayerNames, toFullMoves, filterGamesWithMoves } = require('./helpers');

/**
 * Calculate game phase statistics
 * Note: Phase lengths are in half-moves, so we divide by 2 for full moves
 * @param {Array} games - Array of parsed game objects
 * @returns {Object} Phase statistics including averages and longest phases
 */
function calculateGamePhases(games) {
  const gamesWithMoves = filterGamesWithMoves(games);

  const allPhases = gamesWithMoves.map(g => analyzeGamePhases(g.moveList, g.pgn));
  const phaseStats = getPhaseStatistics(allPhases);

  // Find longest wait until first capture
  let longestWaitTillCapture = { moves: 0, gameIndex: 0 };
  gamesWithMoves.forEach((game, idx) => {
    const firstCaptureIndex = game.moveList.findIndex(move => move.captured);
    const movesBeforeCapture = firstCaptureIndex === -1 ? game.moveList.length : firstCaptureIndex;
    if (movesBeforeCapture > longestWaitTillCapture.moves) {
      longestWaitTillCapture = { moves: movesBeforeCapture, gameIndex: idx };
    }
  });

  // Extract gameIds
  const waitGame = gamesWithMoves[longestWaitTillCapture.gameIndex];
  const waitGameId = waitGame.headers?.GameId || waitGame.headers?.Site?.split('/').pop() || null;

  const middleGame = gamesWithMoves[phaseStats.longestMiddlegame.gameIndex];
  const middleGameId = middleGame.headers?.GameId || middleGame.headers?.Site?.split('/').pop() || null;

  const endGame = gamesWithMoves[phaseStats.longestEndgame.gameIndex];
  const endGameId = endGame.headers?.GameId || endGame.headers?.Site?.split('/').pop() || null;

  return {
    averageOpening: phaseStats.averageOpening / 2,
    averageMiddlegame: phaseStats.averageMiddlegame / 2,
    averageEndgame: phaseStats.averageEndgame / 2,
    longestWaitTillCapture: {
      moves: toFullMoves(longestWaitTillCapture.moves),
      ...getPlayerNames(waitGame),
      game: `${waitGame.headers.White} vs ${waitGame.headers.Black}`,
      gameId: waitGameId
    },
    longestMiddlegame: {
      moves: toFullMoves(phaseStats.longestMiddlegame.moves),
      ...getPlayerNames(middleGame),
      game: `${middleGame.headers.White} vs ${middleGame.headers.Black}`,
      gameId: middleGameId
    },
    longestEndgame: {
      moves: toFullMoves(phaseStats.longestEndgame.moves),
      ...getPlayerNames(endGame),
      game: `${endGame.headers.White} vs ${endGame.headers.Black}`,
      gameId: endGameId
    }
  };
}

module.exports = { calculateGamePhases };
