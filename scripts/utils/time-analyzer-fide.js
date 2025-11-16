/**
 * FIDE Time Analysis Utility
 *
 * Analyzes clock times from FIDE World Cup PGN data.
 * FIDE PGNs include:
 *   [%clk HH:MM:SS] - Time remaining on clock
 *   [%emt HH:MM:SS] - Elapsed move time (DIRECT - no calculation needed!)
 *
 * This is actually BETTER than Lichess data which requires calculation.
 */

/**
 * Parse clock time string to seconds
 * @param {string} clockStr - Clock time in format "H:MM:SS", "HH:MM:SS" or "M:SS"
 * @returns {number} Time in seconds
 */
function parseClockTime(clockStr) {
  if (!clockStr) return 0;

  const parts = clockStr.split(':').map(Number);
  if (parts.length === 3) {
    // HH:MM:SS format
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  } else if (parts.length === 2) {
    // MM:SS format
    return parts[0] * 60 + parts[1];
  }
  return 0;
}

/**
 * Extract clock times and elapsed move times from FIDE PGN
 * FIDE Format: 1. e4 {[%clk 01:30:54]} {[%emt 00:00:05]}
 *
 * @param {string} pgnString - PGN string with FIDE annotations
 * @returns {Array} Array of move time objects
 */
function extractFideClockTimes(pgnString) {
  const times = [];

  if (!pgnString) return times;

  // FIDE PGN has move number, move, then TWO annotation blocks:
  // {[%clk ...]} and {[%emt ...]}
  // We need to handle both white and black moves

  // Split by move numbers to process each full move (white + black)
  const movePattern = /(\d+)\.\s+([^\s{]+)\s*\{[^}]*\[%clk\s+([0-9:]+)\][^}]*\}\s*\{[^}]*\[%emt\s+([0-9:]+)\][^}]*\}(?:\s+([^\s{]+)\s*\{[^}]*\[%clk\s+([0-9:]+)\][^}]*\}\s*\{[^}]*\[%emt\s+([0-9:]+)\][^}]*\})?/g;

  let match;
  while ((match = movePattern.exec(pgnString)) !== null) {
    const moveNumber = parseInt(match[1]);
    const whiteMove = match[2];
    const whiteClk = match[3];
    const whiteEmt = match[4];
    const blackMove = match[5];
    const blackClk = match[6];
    const blackEmt = match[7];

    // White's move
    if (whiteMove && whiteClk && whiteEmt) {
      times.push({
        moveNumber,
        ply: moveNumber * 2 - 1, // White move N = ply 2N-1
        color: 'white',
        move: whiteMove,
        clockRemaining: parseClockTime(whiteClk),
        timeSpent: parseClockTime(whiteEmt) // Direct from PGN!
      });
    }

    // Black's move
    if (blackMove && blackClk && blackEmt) {
      times.push({
        moveNumber,
        ply: moveNumber * 2, // Black move N = ply 2N
        color: 'black',
        move: blackMove,
        clockRemaining: parseClockTime(blackClk),
        timeSpent: parseClockTime(blackEmt) // Direct from PGN!
      });
    }
  }

  return times;
}

/**
 * Get time control thresholds for zeitnot detection
 * @param {string} timeControl - Time control type
 * @returns {Object} Thresholds in seconds
 */
function getTimeControlThresholds(timeControl) {
  const thresholds = {
    'classical': {
      zeitnot: 300,    // 5:00
      extreme: 120,    // 2:00
      critical: 60,    // 1:00
      premove: 1.0,    // < 1 sec (30 sec increment makes this meaningful)
      basetime: 5400,  // 90:00
      increment: 30
    },
    'rapidTier1': {
      zeitnot: 120,    // 2:00
      extreme: 60,     // 1:00
      critical: 30,    // 0:30
      premove: 0.5,    // < 0.5 sec
      basetime: 900,   // 15:00
      increment: 10
    },
    'rapidTier2': {
      zeitnot: 90,     // 1:30
      extreme: 45,     // 0:45
      critical: 20,    // 0:20
      premove: 0.5,    // < 0.5 sec
      basetime: 600,   // 10:00
      increment: 10
    },
    'blitzTier1': {
      zeitnot: 60,     // 1:00
      extreme: 30,     // 0:30
      critical: 10,    // 0:10
      premove: 0.5,    // < 0.5 sec
      basetime: 300,   // 5:00
      increment: 3
    },
    'blitzTier2': {
      zeitnot: 45,     // 0:45
      extreme: 20,     // 0:20
      critical: 5,     // 0:05
      premove: 0.5,    // < 0.5 sec
      basetime: 180,   // 3:00
      increment: 2
    }
  };

  return thresholds[timeControl] || thresholds.classical;
}

/**
 * Analyze time usage for a single game
 * @param {Object} game - Parsed game object
 * @param {string} timeControl - Time control type
 * @returns {Object} Time analysis for the game
 */
function analyzeGameTime(game, timeControl = 'classical') {
  // Extract raw PGN (with annotations)
  const pgnString = game.rawPgn || game.pgn;
  const moveTimes = extractFideClockTimes(pgnString);

  if (moveTimes.length === 0) {
    return null; // No time data available
  }

  const thresholds = getTimeControlThresholds(timeControl);
  const headers = game.headers || {};

  // Support both formats: game.headers.White or game.white
  const white = headers.White || game.white || 'Unknown';
  const black = headers.Black || game.black || 'Unknown';
  const result = headers.Result || game.result || '*';

  // Find premoves (very fast moves)
  const premoves = moveTimes.filter(m => m.timeSpent < thresholds.premove);
  const whitePremoves = premoves.filter(m => m.color === 'white').length;
  const blackPremoves = premoves.filter(m => m.color === 'black').length;

  // Find longest think
  const longestThink = moveTimes.reduce((max, move) =>
    move.timeSpent > max.timeSpent ? move : max
  , moveTimes[0] || { timeSpent: 0 });

  // Find zeitnot moves (time pressure)
  const zeitnotMoves = moveTimes.filter(m => m.clockRemaining < thresholds.zeitnot);
  const whiteZeitnot = zeitnotMoves.filter(m => m.color === 'white').length;
  const blackZeitnot = zeitnotMoves.filter(m => m.color === 'black').length;

  // Find extreme time pressure
  const extremePressure = moveTimes.filter(m => m.clockRemaining < thresholds.extreme);
  const whiteExtreme = extremePressure.filter(m => m.color === 'white').length;
  const blackExtreme = extremePressure.filter(m => m.color === 'black').length;

  // Find critical time scramble
  const criticalScramble = moveTimes.filter(m => m.clockRemaining < thresholds.critical);
  const whiteCritical = criticalScramble.filter(m => m.color === 'white').length;
  const blackCritical = criticalScramble.filter(m => m.color === 'black').length;

  // Calculate average move times
  const whiteMoves = moveTimes.filter(m => m.color === 'white');
  const blackMoves = moveTimes.filter(m => m.color === 'black');
  const avgWhiteTime = whiteMoves.length > 0
    ? whiteMoves.reduce((sum, m) => sum + m.timeSpent, 0) / whiteMoves.length
    : 0;
  const avgBlackTime = blackMoves.length > 0
    ? blackMoves.reduce((sum, m) => sum + m.timeSpent, 0) / blackMoves.length
    : 0;

  // Find minimum clock time reached
  const whiteMinClock = whiteMoves.length > 0
    ? Math.min(...whiteMoves.map(m => m.clockRemaining))
    : thresholds.basetime;
  const blackMinClock = blackMoves.length > 0
    ? Math.min(...blackMoves.map(m => m.clockRemaining))
    : thresholds.basetime;

  // Calculate final clock times
  const whiteFinalClock = whiteMoves.length > 0
    ? whiteMoves[whiteMoves.length - 1].clockRemaining
    : thresholds.basetime;
  const blackFinalClock = blackMoves.length > 0
    ? blackMoves[blackMoves.length - 1].clockRemaining
    : thresholds.basetime;

  return {
    gameIndex: game.gameIndex,
    white,
    black,
    whiteElo: game.whiteElo || (game.headers?.WhiteElo ? parseInt(game.headers.WhiteElo) : null),
    blackElo: game.blackElo || (game.headers?.BlackElo ? parseInt(game.headers.BlackElo) : null),
    result,
    timeControl,
    premoves: {
      white: whitePremoves,
      black: blackPremoves,
      total: premoves.length
    },
    longestThink: {
      moveNumber: longestThink.ply,
      color: longestThink.color,
      player: longestThink.color === 'white' ? white : black,
      timeSpent: longestThink.timeSpent,
      move: longestThink.move
    },
    zeitnot: {
      white: whiteZeitnot,
      black: blackZeitnot,
      total: zeitnotMoves.length
    },
    extremePressure: {
      white: whiteExtreme,
      black: blackExtreme,
      total: extremePressure.length
    },
    criticalScramble: {
      white: whiteCritical,
      black: blackCritical,
      total: criticalScramble.length
    },
    avgMoveTime: {
      white: avgWhiteTime,
      black: avgBlackTime
    },
    minClockTime: {
      white: whiteMinClock,
      black: blackMinClock
    },
    finalClockTime: {
      white: whiteFinalClock,
      black: blackFinalClock
    },
    moveTimes,
    totalMoves: whiteMoves.length + blackMoves.length
  };
}

/**
 * Analyze time usage across all games
 * @param {Array} games - Array of parsed game objects
 * @returns {Array} Array of game time analyses
 */
function analyzeAllGames(games) {
  const analyses = [];

  for (const game of games) {
    // Determine time control for this game
    const timeControl = game.timeControl || 'classical';
    const analysis = analyzeGameTime(game, timeControl);

    if (analysis) {
      analyses.push(analysis);
    }
  }

  return analyses;
}

module.exports = {
  parseClockTime,
  extractFideClockTimes,
  getTimeControlThresholds,
  analyzeGameTime,
  analyzeAllGames
};
