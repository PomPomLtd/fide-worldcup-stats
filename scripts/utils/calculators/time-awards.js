/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Time-Based Awards Calculator
 *
 * Calculates awards based on time management and pressure performance.
 * Uses data from time-analyzer-fide.js
 */

const { analyzeAllGames } = require('../time-analyzer-fide');

/**
 * Normalize time control classification to analyzer format
 * @param {Object} classification - Classification object from enriched data
 * @returns {string} Normalized time control ('classical', 'rapidTier1', etc.)
 */
function normalizeTimeControl(classification) {
  if (!classification) return 'classical';

  const type = classification.type?.toLowerCase();

  if (type === 'classical') return 'classical';

  if (type === 'rapid') {
    return classification.tier === 2 ? 'rapidTier2' : 'rapidTier1';
  }

  if (type === 'blitz') {
    return classification.tier === 2 ? 'blitzTier2' : 'blitzTier1';
  }

  return 'classical';
}

/**
 * Calculate time-based awards from game analyses
 * @param {Array} games - Array of parsed game objects with time control
 * @param {Object|null} analysis - Optional Stockfish analysis results
 * @returns {Object} Time awards
 */
function calculateTimeAwards(games, analysis = null) {
  // Normalize time controls in games
  const normalizedGames = games.map(game => ({
    ...game,
    timeControl: normalizeTimeControl(game.classification)
  }));

  // Analyze all games
  const analyses = analyzeAllGames(normalizedGames);

  if (analyses.length === 0) {
    return null; // No time data available
  }

  const awards = {};

  // 1. 🤔 Longest Think
  awards.longestThink = calculateLongestThink(analyses);

  // 2. ⏰ Zeitnot Addict
  awards.zeitnotAddict = calculateZeitnotAddict(analyses);

  // 3. 🏆 Time Scramble Survivor
  awards.timeScrambleSurvivor = calculateTimeScrambleSurvivor(analyses, games);

  // 4. ⚡ Bullet Speed
  awards.bulletSpeed = calculateBulletSpeed(analyses);

  // 5. 📚 Opening Blitzer
  awards.openingBlitzer = calculateOpeningBlitzer(analyses);

  // 6. 🏃 Premove Master
  awards.premoveMaster = calculatePremoveMaster(analyses);

  // FIDE-Specific Awards

  // 7. 🔥 Tiebreak Pressure King
  awards.tiebreakPressureKing = calculateTiebreakPressureKing(analyses, games);

  // 8. 📉 Classical Time Burner
  awards.classicalTimeBurner = calculateClassicalTimeBurner(analyses);

  // 9. 🎭 Time Control Specialist
  awards.timeControlSpecialist = calculateTimeControlSpecialist(analyses);

  return awards;
}

/**
 * 1. Longest Think - Most time spent on a single move
 */
function calculateLongestThink(analyses) {
  let max = null;

  for (const game of analyses) {
    if (!max || game.longestThink.timeSpent > max.timeSpent) {
      max = {
        white: game.white,
        black: game.black,
        whiteRating: game.whiteRating,
        blackRating: game.blackRating,
        player: game.longestThink.player,
        color: game.longestThink.color,
        timeSpent: game.longestThink.timeSpent,
        moveNumber: game.longestThink.moveNumber,
        move: game.longestThink.move,
        timeControl: game.timeControl,
        gameIndex: game.gameIndex
      };
    }
  }

  return max;
}

/**
 * 2. Zeitnot Addict - Most moves made in time pressure
 */
function calculateZeitnotAddict(analyses) {
  let max = null;

  for (const game of analyses) {
    const whiteCount = game.zeitnot.white;
    const blackCount = game.zeitnot.black;

    if (whiteCount > (max?.count || 0)) {
      max = {
        white: game.white,
        black: game.black,
        whiteRating: game.whiteRating,
        blackRating: game.blackRating,
        player: game.white,
        color: 'white',
        count: whiteCount,
        minClock: game.minClockTime.white,
        timeControl: game.timeControl,
        gameIndex: game.gameIndex
      };
    }

    if (blackCount > (max?.count || 0)) {
      max = {
        white: game.white,
        black: game.black,
        whiteRating: game.whiteRating,
        blackRating: game.blackRating,
        player: game.black,
        color: 'black',
        count: blackCount,
        minClock: game.minClockTime.black,
        timeControl: game.timeControl,
        gameIndex: game.gameIndex
      };
    }
  }

  return max;
}

/**
 * 3. Time Scramble Survivor - Won with critical time pressure
 */
function calculateTimeScrambleSurvivor(analyses, games) {
  const survivors = [];

  for (const game of analyses) {
    const result = game.result;

    // Check if winner was in critical time pressure
    const whiteWon = result === '1-0';
    const blackWon = result === '0-1';

    if (whiteWon && game.criticalScramble.white > 0) {
      survivors.push({
        white: game.white,
        black: game.black,
        whiteRating: game.whiteRating,
        blackRating: game.blackRating,
        winner: game.white,
        color: 'white',
        minClock: game.minClockTime.white,
        criticalMoves: game.criticalScramble.white,
        timeControl: game.timeControl,
        gameIndex: game.gameIndex,
        result
      });
    }

    if (blackWon && game.criticalScramble.black > 0) {
      survivors.push({
        white: game.white,
        black: game.black,
        whiteRating: game.whiteRating,
        blackRating: game.blackRating,
        winner: game.black,
        color: 'black',
        minClock: game.minClockTime.black,
        criticalMoves: game.criticalScramble.black,
        timeControl: game.timeControl,
        gameIndex: game.gameIndex,
        result
      });
    }
  }

  // Return survivor with lowest clock time
  return survivors.length > 0
    ? survivors.reduce((min, s) => s.minClock < min.minClock ? s : min)
    : null;
}

/**
 * 4. Bullet Speed - Fastest average move time
 */
function calculateBulletSpeed(analyses) {
  let fastest = null;

  for (const game of analyses) {
    // Require minimum moves (15 for rapid/blitz, 20 for classical)
    const minMoves = game.timeControl === 'classical' ? 20 : 15;

    const whiteMoves = game.moveTimes.filter(m => m.color === 'white').length;
    const blackMoves = game.moveTimes.filter(m => m.color === 'black').length;

    if (whiteMoves >= minMoves) {
      const avg = game.avgMoveTime.white;
      if (!fastest || avg < fastest.avgTime) {
        fastest = {
          white: game.white,
          black: game.black,
          whiteElo: game.whiteElo,
          blackElo: game.blackElo,
          player: game.white,
          color: 'white',
          avgTime: avg,
          moveCount: whiteMoves,
          timeControl: game.timeControl,
          gameIndex: game.gameIndex
        };
      }
    }

    if (blackMoves >= minMoves) {
      const avg = game.avgMoveTime.black;
      if (!fastest || avg < fastest.avgTime) {
        fastest = {
          white: game.white,
          black: game.black,
          whiteElo: game.whiteElo,
          blackElo: game.blackElo,
          player: game.black,
          color: 'black',
          avgTime: avg,
          moveCount: blackMoves,
          timeControl: game.timeControl,
          gameIndex: game.gameIndex
        };
      }
    }
  }

  return fastest;
}

/**
 * 5. Opening Blitzer - Fastest average in first moves
 */
function calculateOpeningBlitzer(analyses) {
  let fastest = null;

  for (const game of analyses) {
    // First 10 moves for classical, 8 for rapid/blitz
    const maxPly = game.timeControl === 'classical' ? 20 : 16;
    const minPly = game.timeControl === 'classical' ? 14 : 12; // Require at least 7-8 moves

    const whiteOpening = game.moveTimes.filter(m => m.color === 'white' && m.ply <= maxPly);
    const blackOpening = game.moveTimes.filter(m => m.color === 'black' && m.ply <= maxPly);

    if (whiteOpening.length >= minPly / 2) {
      const avg = whiteOpening.reduce((sum, m) => sum + m.timeSpent, 0) / whiteOpening.length;
      if (!fastest || avg < fastest.avgTime) {
        fastest = {
          white: game.white,
          black: game.black,
          whiteElo: game.whiteElo,
          blackElo: game.blackElo,
          player: game.white,
          color: 'white',
          avgTime: avg,
          moveCount: whiteOpening.length,
          timeControl: game.timeControl,
          gameIndex: game.gameIndex
        };
      }
    }

    if (blackOpening.length >= minPly / 2) {
      const avg = blackOpening.reduce((sum, m) => sum + m.timeSpent, 0) / blackOpening.length;
      if (!fastest || avg < fastest.avgTime) {
        fastest = {
          white: game.white,
          black: game.black,
          whiteElo: game.whiteElo,
          blackElo: game.blackElo,
          player: game.black,
          color: 'black',
          avgTime: avg,
          moveCount: blackOpening.length,
          timeControl: game.timeControl,
          gameIndex: game.gameIndex
        };
      }
    }
  }

  return fastest;
}

/**
 * 6. Premove Master - Most very fast moves
 */
function calculatePremoveMaster(analyses) {
  let max = null;

  for (const game of analyses) {
    const whiteCount = game.premoves.white;
    const blackCount = game.premoves.black;

    if (whiteCount > (max?.count || 0)) {
      max = {
        white: game.white,
        black: game.black,
        whiteRating: game.whiteRating,
        blackRating: game.blackRating,
        player: game.white,
        color: 'white',
        count: whiteCount,
        timeControl: game.timeControl,
        gameIndex: game.gameIndex
      };
    }

    if (blackCount > (max?.count || 0)) {
      max = {
        white: game.white,
        black: game.black,
        whiteRating: game.whiteRating,
        blackRating: game.blackRating,
        player: game.black,
        color: 'black',
        count: blackCount,
        timeControl: game.timeControl,
        gameIndex: game.gameIndex
      };
    }
  }

  return max;
}

/**
 * 7. FIDE: Tiebreak Pressure King - Most clutch tiebreak wins under pressure
 */
function calculateTiebreakPressureKing(analyses, games) {
  // Group analyses by player
  const playerStats = {};

  for (const game of analyses) {
    // Only count tiebreak games (not classical)
    if (game.timeControl === 'classical') continue;

    const result = game.result;
    if (result !== '1-0' && result !== '0-1') continue; // Only wins

    const winner = result === '1-0' ? 'white' : 'black';
    const winnerName = result === '1-0' ? game.white : game.black;
    const inCritical = game.criticalScramble[winner] > 0;

    if (!playerStats[winnerName]) {
      playerStats[winnerName] = {
        player: winnerName,
        tiebreakWins: 0,
        criticalWins: 0,
        minClock: Infinity,
        games: []
      };
    }

    playerStats[winnerName].tiebreakWins++;

    if (inCritical) {
      playerStats[winnerName].criticalWins++;
      playerStats[winnerName].minClock = Math.min(
        playerStats[winnerName].minClock,
        game.minClockTime[winner]
      );
      playerStats[winnerName].games.push({
        white: game.white,
        black: game.black,
        timeControl: game.timeControl,
        minClock: game.minClockTime[winner]
      });
    }
  }

  // Find player with most critical tiebreak wins
  const players = Object.values(playerStats);
  if (players.length === 0) return null;

  const king = players.reduce((max, p) =>
    p.criticalWins > (max.criticalWins || 0) ? p : max
  );

  return king.criticalWins > 0 ? king : null;
}

/**
 * 8. FIDE: Classical Time Burner - Least time remaining in classical
 */
function calculateClassicalTimeBurner(analyses) {
  let burner = null;

  for (const game of analyses) {
    // Only classical games with decisive result
    if (game.timeControl !== 'classical') continue;
    if (game.result !== '1-0' && game.result !== '0-1') continue;

    const whiteFinal = game.finalClockTime.white;
    const blackFinal = game.finalClockTime.black;

    if (whiteFinal < (burner?.finalClock || Infinity)) {
      burner = {
        white: game.white,
        black: game.black,
        whiteRating: game.whiteRating,
        blackRating: game.blackRating,
        player: game.white,
        color: 'white',
        finalClock: whiteFinal,
        totalMoves: game.moveTimes.filter(m => m.color === 'white').length,
        result: game.result,
        gameIndex: game.gameIndex
      };
    }

    if (blackFinal < (burner?.finalClock || Infinity)) {
      burner = {
        white: game.white,
        black: game.black,
        whiteRating: game.whiteRating,
        blackRating: game.blackRating,
        player: game.black,
        color: 'black',
        finalClock: blackFinal,
        totalMoves: game.moveTimes.filter(m => m.color === 'black').length,
        result: game.result,
        gameIndex: game.gameIndex
      };
    }
  }

  return burner;
}

/**
 * 9. FIDE: Time Control Specialist - Best at specific time control
 */
function calculateTimeControlSpecialist(analyses) {
  // Group by player and time control
  const playerStats = {};

  for (const game of analyses) {
    const addPlayerStats = (playerName, color) => {
      if (!playerStats[playerName]) {
        playerStats[playerName] = {
          player: playerName,
          classical: { games: 0, totalFinal: 0, totalMoves: 0 },
          rapid: { games: 0, totalFinal: 0, totalMoves: 0 },
          blitz: { games: 0, totalFinal: 0, totalMoves: 0 }
        };
      }

      const tc = game.timeControl === 'classical' ? 'classical' :
                 game.timeControl.startsWith('rapid') ? 'rapid' : 'blitz';

      const finalClock = game.finalClockTime[color];
      const moves = game.moveTimes.filter(m => m.color === color).length;

      playerStats[playerName][tc].games++;
      playerStats[playerName][tc].totalFinal += finalClock;
      playerStats[playerName][tc].totalMoves += moves;
    };

    addPlayerStats(game.white, 'white');
    addPlayerStats(game.black, 'black');
  }

  // Find player with biggest variance (specialist)
  let specialist = null;
  let maxVariance = 0;

  for (const [playerName, stats] of Object.entries(playerStats)) {
    // Calculate average final clock / moves ratio for each TC
    const ratios = {};

    for (const tc of ['classical', 'rapid', 'blitz']) {
      if (stats[tc].games > 0) {
        const avgFinal = stats[tc].totalFinal / stats[tc].games;
        const avgMoves = stats[tc].totalMoves / stats[tc].games;
        ratios[tc] = avgMoves > 0 ? avgFinal / avgMoves : 0;
      }
    }

    // Calculate variance
    const ratioValues = Object.values(ratios);
    if (ratioValues.length >= 2) {
      const max = Math.max(...ratioValues);
      const min = Math.min(...ratioValues);
      const variance = max - min;

      if (variance > maxVariance) {
        maxVariance = variance;
        const bestTC = Object.entries(ratios).reduce((a, b) => a[1] > b[1] ? a : b)[0];

        specialist = {
          player: playerName,
          specialist: bestTC,
          stats: {
            classical: {
              games: stats.classical.games,
              avgFinalClock: stats.classical.games > 0 ? Math.round(stats.classical.totalFinal / stats.classical.games) : 0,
              avgMoves: stats.classical.games > 0 ? Math.round(stats.classical.totalMoves / stats.classical.games) : 0,
              ratio: ratios.classical || 0
            },
            rapid: {
              games: stats.rapid.games,
              avgFinalClock: stats.rapid.games > 0 ? Math.round(stats.rapid.totalFinal / stats.rapid.games) : 0,
              avgMoves: stats.rapid.games > 0 ? Math.round(stats.rapid.totalMoves / stats.rapid.games) : 0,
              ratio: ratios.rapid || 0
            },
            blitz: {
              games: stats.blitz.games,
              avgFinalClock: stats.blitz.games > 0 ? Math.round(stats.blitz.totalFinal / stats.blitz.games) : 0,
              avgMoves: stats.blitz.games > 0 ? Math.round(stats.blitz.totalMoves / stats.blitz.games) : 0,
              ratio: ratios.blitz || 0
            }
          },
          variance: maxVariance
        };
      }
    }
  }

  return specialist;
}

module.exports = {
  calculateTimeAwards,
  normalizeTimeControl
};
