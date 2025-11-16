/**
 * Time Analysis Utility
 *
 * Analyzes clock times from Lichess PGN data to calculate time-based statistics
 * and awards such as premoves, longest thinks, zeitnot situations, etc.
 */

/**
 * Parse clock time string to seconds
 * @param {string} clockStr - Clock time in format "H:MM:SS" or "M:SS"
 * @returns {number} Time in seconds
 */
function parseClockTime(clockStr) {
  const parts = clockStr.split(':').map(Number);
  if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  } else if (parts.length === 2) {
    return parts[0] * 60 + parts[1];
  }
  return 0;
}

/**
 * Extract clock times and evaluations from PGN move notation
 * @param {string} pgnString - PGN string with clock and eval annotations
 * @returns {Array} Array of {moveNumber, color, clockTime, eval} objects
 */
function extractClockTimes(pgnString) {
  const times = [];

  // Extract moves with clock and eval annotations
  // Format: 1. e4 { [%eval 0.18] [%clk 0:45:00] } 1... e5 { [%clk 0:45:00] }
  // Note: Black moves have "N..." prefix (e.g., "1...")
  const moveRegex = /(\d+)\.\s+(\S+)\s*\{([^}]*)\}(?:\s+\d+\.\.\.\s+(\S+)\s*\{([^}]*)\})?/g;

  let match;
  while ((match = moveRegex.exec(pgnString)) !== null) {
    const moveNumber = parseInt(match[1]);

    // Parse white's move
    if (match[3]) {
      const clkMatch = match[3].match(/\[%clk\s+([0-9:]+)\]/);
      const evalMatch = match[3].match(/\[%eval\s+([-+]?[0-9.#]+)\]/);

      if (clkMatch) {
        times.push({
          moveNumber,
          color: 'white',
          move: match[2],
          clockTime: parseClockTime(clkMatch[1]),
          eval: evalMatch ? parseEval(evalMatch[1]) : null
        });
      }
    }

    // Parse black's move (if present)
    if (match[4] && match[5]) {
      const clkMatch = match[5].match(/\[%clk\s+([0-9:]+)\]/);
      const evalMatch = match[5].match(/\[%eval\s+([-+]?[0-9.#]+)\]/);

      if (clkMatch) {
        times.push({
          moveNumber,
          color: 'black',
          move: match[4],
          clockTime: parseClockTime(clkMatch[1]),
          eval: evalMatch ? parseEval(evalMatch[1]) : null
        });
      }
    }
  }

  return times;
}

/**
 * Parse evaluation string to numeric value
 * @param {string} evalStr - Evaluation string (e.g., "0.18", "#3", "-2.5")
 * @returns {number} Numeric evaluation (mate = 100 or -100)
 */
function parseEval(evalStr) {
  if (evalStr.includes('#')) {
    // Mate in N moves - use large value with sign
    const mateIn = parseInt(evalStr.replace('#', ''));
    return mateIn > 0 ? 100 : -100;
  }
  return parseFloat(evalStr);
}

/**
 * Calculate time spent on each move
 * @param {Array} clockTimes - Array of clock times with evals
 * @param {number} increment - Time increment in seconds (e.g., 45 for 45+45)
 * @returns {Array} Array of {moveNumber, color, timeSpent, eval} objects
 */
function calculateMoveTimes(clockTimes, increment = 45) {
  const moveTimes = [];

  // We need to compare each player's consecutive moves with themselves
  // to calculate how much time THEY spent thinking
  for (let i = 0; i < clockTimes.length; i++) {
    const curr = clockTimes[i];

    // Find this player's previous move
    let prevSamePlayer = null;
    for (let j = i - 1; j >= 0; j--) {
      if (clockTimes[j].color === curr.color) {
        prevSamePlayer = clockTimes[j];
        break;
      }
    }

    // Skip first move for each player (no previous move to compare)
    if (!prevSamePlayer) {
      continue;
    }

    // Time spent = (previous clock + increment) - current clock
    const timeSpent = (prevSamePlayer.clockTime + increment) - curr.clockTime;

    // Convert full move number to ply (half-move number)
    // White move N = ply (N * 2 - 1)
    // Black move N = ply (N * 2)
    const ply = curr.color === 'white'
      ? curr.moveNumber * 2 - 1
      : curr.moveNumber * 2;

    moveTimes.push({
      moveNumber: ply, // Store ply number for consistency
      color: curr.color,
      move: curr.move,
      timeSpent: Math.max(0, timeSpent), // Ensure non-negative
      clockRemaining: curr.clockTime,
      evalBefore: prevSamePlayer.eval, // Eval before this player's move
      evalAfter: curr.eval   // Eval after this player's move
    });
  }

  return moveTimes;
}

/**
 * Analyze time usage for a single game
 * @param {Object} game - Parsed game object with rawPgn field
 * @param {number} increment - Time increment in seconds
 * @returns {Object} Time analysis for the game
 */
function analyzeGameTime(game, increment = 45) {
  // Use rawPgn which has clock annotations, not the normalized pgn
  const pgnString = game.rawPgn || game.pgn;
  const clockTimes = extractClockTimes(pgnString);
  const moveTimes = calculateMoveTimes(clockTimes, increment);

  if (moveTimes.length === 0) {
    return null; // No clock data available
  }

  const headers = game.headers;
  const gameIndex = game.gameIndex;
  const white = headers.White || 'Unknown';
  const black = headers.Black || 'Unknown';
  const gameId = headers.GameId || headers.Site?.split('/').pop() || null;
  const result = headers.Result || '*';

  // Check if game ended in checkmate
  const isCheckmate = game.moveList && game.moveList.length > 0 &&
    game.moveList[game.moveList.length - 1].san.includes('#');

  // Find premoves (moves made in < 0.5 seconds)
  const premoves = moveTimes.filter(m => m.timeSpent < 0.5);
  const whitePremoves = premoves.filter(m => m.color === 'white').length;
  const blackPremoves = premoves.filter(m => m.color === 'black').length;

  // Find longest think
  const longestThink = moveTimes.reduce((max, move) =>
    move.timeSpent > max.timeSpent ? move : max
  , moveTimes[0]);

  // Find zeitnot moves (made with < 60 seconds remaining)
  const zeitnotMoves = moveTimes.filter(m => m.clockRemaining < 60);
  const whiteZeitnot = zeitnotMoves.filter(m => m.color === 'white').length;
  const blackZeitnot = zeitnotMoves.filter(m => m.color === 'black').length;

  // Find extreme time pressure (< 30 seconds)
  const extremePressure = moveTimes.filter(m => m.clockRemaining < 30);
  const whiteExtreme = extremePressure.filter(m => m.color === 'white').length;
  const blackExtreme = extremePressure.filter(m => m.color === 'black').length;

  // Find critical time scramble (< 10 seconds)
  const criticalScramble = moveTimes.filter(m => m.clockRemaining < 10);
  const whiteCritical = criticalScramble.filter(m => m.color === 'white').length;
  const blackCritical = criticalScramble.filter(m => m.color === 'black').length;

  // Calculate average move times
  const whiteMoves = moveTimes.filter(m => m.color === 'white');
  const blackMoves = moveTimes.filter(m => m.color === 'black');
  const avgWhiteTime = whiteMoves.reduce((sum, m) => sum + m.timeSpent, 0) / whiteMoves.length;
  const avgBlackTime = blackMoves.reduce((sum, m) => sum + m.timeSpent, 0) / blackMoves.length;

  // Find minimum clock time reached
  const whiteMinClock = Math.min(...whiteMoves.map(m => m.clockRemaining));
  const blackMinClock = Math.min(...blackMoves.map(m => m.clockRemaining));

  return {
    gameIndex,
    white,
    black,
    gameId,
    result,
    isCheckmate,
    premoves: {
      white: whitePremoves,
      black: blackPremoves,
      total: premoves.length
    },
    longestThink: {
      moveNumber: longestThink.moveNumber,
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
    moveTimes
  };
}

/**
 * Analyze time usage across all games
 * @param {Array} games - Array of parsed game objects with rawPgn field
 * @param {number} increment - Time increment in seconds
 * @returns {Object} Aggregate time analysis and awards
 */
function analyzeAllGames(games, increment = 45) {
  const gameAnalyses = [];

  for (const game of games) {
    const analysis = analyzeGameTime(game, increment);
    if (analysis) {
      gameAnalyses.push(analysis);
    }
  }

  if (gameAnalyses.length === 0) {
    return null; // No clock data in any games
  }

  // Find awards

  // 1. Most Premoves
  const mostPremoves = gameAnalyses.reduce((max, game) => {
    const whiteTotal = game.premoves.white;
    const blackTotal = game.premoves.black;
    const maxInGame = Math.max(whiteTotal, blackTotal);
    const player = whiteTotal > blackTotal ? 'white' : 'black';
    const currentMax = max.count || 0;

    if (maxInGame > currentMax) {
      return {
        white: game.white,
        black: game.black,
        gameIndex: game.gameIndex,
        gameId: game.gameId,
        player: player === 'white' ? game.white : game.black,
        color: player,
        count: maxInGame
      };
    }
    return max;
  }, {});

  // 2. Longest Think
  const longestThink = gameAnalyses.reduce((max, game) => {
    if (game.longestThink.timeSpent > (max.timeSpent || 0)) {
      return {
        white: game.white,
        black: game.black,
        gameIndex: game.gameIndex,
        gameId: game.gameId,
        player: game.longestThink.player,
        color: game.longestThink.color,
        timeSpent: game.longestThink.timeSpent,
        moveNumber: game.longestThink.moveNumber,
        move: game.longestThink.move
      };
    }
    return max;
  }, {});

  // 3. Zeitnot Addict (most moves with < 60 seconds)
  const zeitnotAddict = gameAnalyses.reduce((max, game) => {
    const whiteTotal = game.zeitnot.white;
    const blackTotal = game.zeitnot.black;
    const maxInGame = Math.max(whiteTotal, blackTotal);
    const player = whiteTotal > blackTotal ? 'white' : 'black';
    const currentMax = max.count || 0;

    if (maxInGame > currentMax) {
      return {
        white: game.white,
        black: game.black,
        gameIndex: game.gameIndex,
        gameId: game.gameId,
        player: player === 'white' ? game.white : game.black,
        color: player,
        count: maxInGame
      };
    }
    return max;
  }, {});

  // 4. Time Scramble Survivor (won with < 10 seconds at some point)
  const timeScrambleSurvivors = [];
  for (const game of gameAnalyses) {
    // Need to pass Result through from original game data
    const whiteCritical = game.criticalScramble.white > 0;
    const blackCritical = game.criticalScramble.black > 0;

    // We'll need to get result from the games array
    const originalGame = games[game.gameIndex];
    const result = originalGame?.headers?.Result;

    if ((result === '1-0' && whiteCritical) || (result === '0-1' && blackCritical)) {
      const winner = result === '1-0' ? 'white' : 'black';
      timeScrambleSurvivors.push({
        white: game.white,
        black: game.black,
        gameIndex: game.gameIndex,
        gameId: game.gameId,
        winner: winner === 'white' ? game.white : game.black,
        color: winner,
        minClock: game.minClockTime[winner],
        criticalMoves: game.criticalScramble[winner],
        result
      });
    }
  }

  const timeScrambleSurvivor = timeScrambleSurvivors.length > 0
    ? timeScrambleSurvivors.reduce((min, game) =>
        game.minClock < (min.minClock || Infinity) ? game : min
      , timeScrambleSurvivors[0])
    : null;

  // 5. Bullet Speed (fastest average move time with at least 20 moves)
  const bulletSpeed = gameAnalyses
    .map(game => {
      const whiteAvg = game.avgMoveTime.white;
      const blackAvg = game.avgMoveTime.black;
      const whiteMoves = game.moveTimes.filter(m => m.color === 'white').length;
      const blackMoves = game.moveTimes.filter(m => m.color === 'black').length;

      const candidates = [];
      if (whiteMoves >= 20) {
        candidates.push({
          white: game.white,
          black: game.black,
          gameIndex: game.gameIndex,
          gameId: game.gameId,
          player: game.white,
          color: 'white',
          avgTime: whiteAvg,
          moveCount: whiteMoves
        });
      }
      if (blackMoves >= 20) {
        candidates.push({
          white: game.white,
          black: game.black,
          gameIndex: game.gameIndex,
          gameId: game.gameId,
          player: game.black,
          color: 'black',
          avgTime: blackAvg,
          moveCount: blackMoves
        });
      }
      return candidates;
    })
    .flat()
    .reduce((min, candidate) =>
      candidate.avgTime < (min.avgTime || Infinity) ? candidate : min
    , {});

  // 6. 🎯 Sniper - Fastest time to spot and execute checkmate
  const sniperCandidates = [];
  for (const game of gameAnalyses) {
    // Only consider games that actually ended in checkmate
    if (!game.isCheckmate) {
      continue;
    }

    // Find checkmate moves (move that results in mate eval)
    // Must match the game result: positive eval for 1-0, negative for 0-1
    const checkmateMoves = game.moveTimes.filter(m => {
      if (!m.evalAfter || !m.evalBefore) return false;

      // Check that eval changed to mate
      if (Math.abs(m.evalAfter) < 100 || Math.abs(m.evalBefore) >= 100) return false;

      // Verify eval direction matches game result
      if (game.result === '1-0' && m.evalAfter < 0) return false; // White won, so eval should be positive
      if (game.result === '0-1' && m.evalAfter > 0) return false; // Black won, so eval should be negative

      return true;
    });

    for (const cm of checkmateMoves) {
      sniperCandidates.push({
        white: game.white,
        black: game.black,
        gameIndex: game.gameIndex,
        gameId: game.gameId,
        player: cm.color === 'white' ? game.white : game.black,
        color: cm.color,
        timeSpent: cm.timeSpent,
        moveNumber: cm.moveNumber,
        move: cm.move
      });
    }
  }
  const sniper = sniperCandidates.length > 0
    ? sniperCandidates.reduce((min, candidate) =>
        candidate.timeSpent < (min.timeSpent || Infinity) ? candidate : min
      , sniperCandidates[0])
    : null;

  // 7. 📚 Opening Blitzer - Fastest average move time in first 10 moves
  const openingBlitzer = gameAnalyses
    .map(game => {
      const whiteOpeningMoves = game.moveTimes.filter(m => m.color === 'white' && m.moveNumber <= 10);
      const blackOpeningMoves = game.moveTimes.filter(m => m.color === 'black' && m.moveNumber <= 10);

      const candidates = [];
      if (whiteOpeningMoves.length >= 8) { // At least 8 opening moves
        const avgTime = whiteOpeningMoves.reduce((sum, m) => sum + m.timeSpent, 0) / whiteOpeningMoves.length;
        candidates.push({
          white: game.white,
          black: game.black,
          gameIndex: game.gameIndex,
          gameId: game.gameId,
          player: game.white,
          color: 'white',
          avgTime,
          moveCount: whiteOpeningMoves.length
        });
      }
      if (blackOpeningMoves.length >= 8) {
        const avgTime = blackOpeningMoves.reduce((sum, m) => sum + m.timeSpent, 0) / blackOpeningMoves.length;
        candidates.push({
          white: game.white,
          black: game.black,
          gameIndex: game.gameIndex,
          gameId: game.gameId,
          player: game.black,
          color: 'black',
          avgTime,
          moveCount: blackOpeningMoves.length
        });
      }
      return candidates;
    })
    .flat()
    .reduce((min, candidate) =>
      candidate.avgTime < (min.avgTime || Infinity) ? candidate : min
    , {});

  // 8. 😢 Sad Times Award - Longest think in a totally lost position (eval < -5 from player's perspective)
  const sadTimesCandidates = [];
  for (const game of gameAnalyses) {
    for (const move of game.moveTimes) {
      // Check if player is losing badly from their perspective
      const evalFromPlayerPerspective = move.color === 'white' ? move.evalBefore : -move.evalBefore;

      if (evalFromPlayerPerspective !== null && evalFromPlayerPerspective < -5) {
        sadTimesCandidates.push({
          white: game.white,
          black: game.black,
          gameIndex: game.gameIndex,
          gameId: game.gameId,
          player: move.color === 'white' ? game.white : game.black,
          color: move.color,
          timeSpent: move.timeSpent,
          moveNumber: move.moveNumber,
          move: move.move,
          eval: evalFromPlayerPerspective
        });
      }
    }
  }
  const sadTimes = sadTimesCandidates.length > 0
    ? sadTimesCandidates.reduce((max, candidate) =>
        candidate.timeSpent > (max.timeSpent || 0) ? candidate : max
      , sadTimesCandidates[0])
    : null;

  return {
    mostPremoves: mostPremoves.count ? mostPremoves : null,
    longestThink: longestThink.timeSpent ? longestThink : null,
    zeitnotAddict: zeitnotAddict.count ? zeitnotAddict : null,
    timeScrambleSurvivor,
    bulletSpeed: bulletSpeed.avgTime ? bulletSpeed : null,
    sniper,
    openingBlitzer: openingBlitzer.avgTime ? openingBlitzer : null,
    sadTimes,
    summary: {
      totalGamesWithClockData: gameAnalyses.length,
      avgPremovesPerGame: gameAnalyses.reduce((sum, g) => sum + g.premoves.total, 0) / gameAnalyses.length,
      avgZeitnotMovesPerGame: gameAnalyses.reduce((sum, g) => sum + g.zeitnot.total, 0) / gameAnalyses.length,
      gamesWithTimescramble: timeScrambleSurvivors.length
    }
  };
}

module.exports = {
  parseClockTime,
  parseEval,
  extractClockTimes,
  calculateMoveTimes,
  analyzeGameTime,
  analyzeAllGames
};
