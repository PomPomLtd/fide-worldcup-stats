/**
 * Stockfish Analysis Reader
 * ===========================
 *
 * Reads Stockfish analysis files (data/analysis/round-N-analysis.json)
 * and provides the data for integration into tournament statistics.
 *
 * This enables decoupled architecture where:
 * 1. Stockfish analysis can be run independently (slow, 60 min parallel)
 * 2. Stats generation is fast (30 min) and reads existing analysis files
 * 3. Analysis data persists across stats regenerations
 */

const fs = require('fs');
const path = require('path');

/**
 * Read Stockfish analysis for a specific round
 * @param {number} round - Round number (1-6)
 * @returns {Object|null} Analysis data or null if file doesn't exist
 */
function readRoundAnalysis(round) {
  const analysisPath = path.join(__dirname, '../../data/analysis', `round-${round}-analysis.json`);

  try {
    if (!fs.existsSync(analysisPath)) {
      return null; // File doesn't exist - analysis hasn't been run yet
    }

    const rawData = fs.readFileSync(analysisPath, 'utf8');
    const analysis = JSON.parse(rawData);

    // Validate structure
    if (!analysis.games || !Array.isArray(analysis.games)) {
      console.warn(`⚠️  Invalid analysis file format for Round ${round}`);
      return null;
    }

    return analysis;
  } catch (error) {
    console.warn(`⚠️  Error reading analysis for Round ${round}:`, error.message);
    return null;
  }
}

/**
 * Check if analysis exists for a round
 * @param {number} round - Round number
 * @returns {boolean}
 */
function hasAnalysis(round) {
  const analysisPath = path.join(__dirname, '../../data/analysis', `round-${round}-analysis.json`);
  return fs.existsSync(analysisPath);
}

/**
 * Get analysis status for all rounds
 * @returns {Object} Map of round number to boolean (has analysis)
 */
function getAnalysisStatus() {
  const status = {};
  for (let round = 1; round <= 6; round++) {
    status[round] = hasAnalysis(round);
  }
  return status;
}

/**
 * Format analysis data for inclusion in round stats
 *
 * Takes raw Stockfish analysis and extracts key information:
 * - Game-level analysis (accuracy, ACPL, move quality per game)
 * - Summary statistics (accuracy king, biggest blunder, etc.)
 *
 * @param {Object} analysis - Raw analysis from readRoundAnalysis()
 * @returns {Object|null} Formatted analysis data
 */
function formatAnalysisForStats(analysis) {
  if (!analysis || !analysis.games) {
    return null;
  }

  return {
    // Game-level data (keep as array for frontend compatibility)
    games: analysis.games.map(game => ({
      gameIndex: game.gameIndex,
      white: game.white,
      black: game.black,
      whiteAccuracy: game.whiteAccuracy,
      blackAccuracy: game.blackAccuracy,
      whiteACPL: game.whiteACPL,
      blackACPL: game.blackACPL,
      whiteMoveQuality: game.whiteMoveQuality,
      blackMoveQuality: game.blackMoveQuality,
      biggestBlunder: game.biggestBlunder
    })),

    // Summary statistics
    summary: analysis.summary || null,

    // Metadata
    metadata: {
      gamesAnalyzed: analysis.games.length,
      depth: analysis.depth || 15,
      analyzedAt: analysis.analyzedAt || null
    }
  };
}

module.exports = {
  readRoundAnalysis,
  hasAnalysis,
  getAnalysisStatus,
  formatAnalysisForStats
};
