#!/usr/bin/env node

/**
 * Generate Tournament Overview Statistics
 *
 * Aggregates all round stats into a comprehensive tournament overview.
 *
 * Usage:
 *   node scripts/generate-tournament-overview.js
 *
 * Output:
 *   public/stats/tournament-overview.json
 */

const fs = require('fs');
const path = require('path');

/**
 * Load all available round data files
 */
function loadRoundData() {
  const statsDir = path.join(process.cwd(), 'public', 'stats');
  const rounds = [];

  // Try to load rounds 1-7 (World Cup has up to 7 rounds)
  for (let roundNum = 1; roundNum <= 7; roundNum++) {
    const filePath = path.join(statsDir, `round-${roundNum}-stats.json`);

    if (fs.existsSync(filePath)) {
      try {
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        rounds.push(data);
        console.log(`✓ Loaded Round ${roundNum} (${data.overview.totalGames} games)`);
      } catch (error) {
        console.warn(`⚠ Failed to parse Round ${roundNum}:`, error.message);
      }
    }
  }

  if (rounds.length === 0) {
    throw new Error('No round data found');
  }

  console.log(`\n📊 Loaded ${rounds.length} rounds`);
  return rounds.sort((a, b) => a.roundNumber - b.roundNumber);
}

/**
 * Aggregate overall statistics across all rounds
 */
function aggregateTotals(rounds) {
  let totalGames = 0;
  let totalMatches = 0;
  let totalMoves = 0;
  let longestGame = null;
  let shortestGame = null;

  const piecesCaptured = {
    pawns: 0,
    knights: 0,
    bishops: 0,
    rooks: 0,
    queens: 0,
    total: 0
  };

  rounds.forEach(round => {
    totalGames += round.overview?.totalGames || 0;
    totalMoves += round.overview?.totalMoves || 0;
    totalMatches += round.matchStats?.totalMatches || 0;

    // Find longest game
    if (round.overview?.longestGame) {
      if (!longestGame || round.overview.longestGame.moves > longestGame.moves) {
        longestGame = {
          ...round.overview.longestGame,
          roundNumber: round.roundNumber
        };
      }
    }

    // Find shortest game (exclude forfeits - games with less than 10 moves)
    if (round.overview?.shortestGame && round.overview.shortestGame.moves >= 10) {
      if (!shortestGame || round.overview.shortestGame.moves < shortestGame.moves) {
        shortestGame = {
          ...round.overview.shortestGame,
          roundNumber: round.roundNumber
        };
      }
    }

    // Aggregate piece captures
    if (round.pieces?.captured) {
      const pawns = round.pieces.captured.pawns || 0;
      const knights = round.pieces.captured.knights || 0;
      const bishops = round.pieces.captured.bishops || 0;
      const rooks = round.pieces.captured.rooks || 0;
      const queens = round.pieces.captured.queens || 0;

      piecesCaptured.pawns += pawns;
      piecesCaptured.knights += knights;
      piecesCaptured.bishops += bishops;
      piecesCaptured.rooks += rooks;
      piecesCaptured.queens += queens;
      piecesCaptured.total += pawns + knights + bishops + rooks + queens;
    }
  });

  return {
    totalGames,
    totalMatches,
    totalMoves,
    averageGameLength: totalGames > 0 ? Math.round((totalMoves / totalGames) * 10) / 10 : 0,
    longestGame,
    shortestGame,
    piecesCaptured
  };
}

/**
 * Create round-by-round summary
 */
function createRoundSummary(rounds) {
  return rounds.map(round => ({
    roundNumber: round.roundNumber,
    roundName: round.roundName,
    matches: round.matchStats?.totalMatches || 0,
    games: round.overview?.totalGames || 0,
    avgGameLength: round.overview?.averageGameLength || 0,
    tiebreakRate: round.matchStats?.tiebreakPercentage || 0,
    upsetRate: calculateUpsetRate(round),
    classicalGames: round.byTimeControl?.classical?.overview?.totalGames || 0,
    rapidGames: round.byTimeControl?.rapid?.overview?.totalGames || 0,
    blitzGames: round.byTimeControl?.blitz?.overview?.totalGames || 0
  }));
}

/**
 * Calculate upset rate for a round
 */
function calculateUpsetRate(round) {
  if (!round.ratingAnalysis?.upsets) return 0;

  const totalGames = round.overview?.totalGames || 0;
  const upsetCount = round.ratingAnalysis.upsets.length || 0;

  return totalGames > 0 ? Math.round((upsetCount / totalGames) * 1000) / 10 : 0;
}

/**
 * Extract player name from award data
 */
function extractPlayerNames(awardData) {
  const players = [];

  // Check various fields where player names might be
  if (awardData.player) players.push(awardData.player);
  if (awardData.playerName) players.push(awardData.playerName);
  if (awardData.winner) players.push(awardData.winner);

  // For game awards (white vs black)
  if (awardData.white) players.push(awardData.white);
  if (awardData.black) players.push(awardData.black);

  // For match awards (split "Player1 vs Player2")
  if (awardData.players && typeof awardData.players === 'string') {
    const split = awardData.players.split(' vs ');
    players.push(...split.map(p => p.trim()));
  }

  return players;
}

/**
 * Calculate player award leaderboard
 */
function calculatePlayerAwards(rounds) {
  const playerAwards = {};

  rounds.forEach(round => {
    // Collect all awards from different categories
    ['awards', 'fideFunAwards', 'funStats', 'analysis', 'timeAwards'].forEach(category => {
      if (round[category]) {
        Object.entries(round[category]).forEach(([awardKey, awardData]) => {
          if (awardData && typeof awardData === 'object') {
            const players = extractPlayerNames(awardData);

            players.forEach(player => {
              if (player && player !== 'Unknown') {
                if (!playerAwards[player]) {
                  playerAwards[player] = {
                    name: player,
                    totalAwards: 0,
                    byCategory: {},
                    awards: []
                  };
                }

                playerAwards[player].totalAwards++;

                if (!playerAwards[player].byCategory[category]) {
                  playerAwards[player].byCategory[category] = 0;
                }
                playerAwards[player].byCategory[category]++;

                playerAwards[player].awards.push({
                  category,
                  awardKey,
                  roundNumber: round.roundNumber,
                  roundName: round.roundName
                });
              }
            });
          }
        });
      }
    });
  });

  // Convert to array and sort by total awards
  const leaderboard = Object.values(playerAwards)
    .sort((a, b) => b.totalAwards - a.totalAwards)
    .slice(0, 20); // Top 20 players

  return leaderboard;
}

/**
 * Find Hall of Fame entries across all rounds
 */
function findHallOfFame(rounds) {
  // Find biggest upset
  let biggestUpset = null;
  rounds.forEach(round => {
    if (round.ratingAnalysis?.biggestUpset) {
      const upset = round.ratingAnalysis.biggestUpset;
      const ratingDiff = upset.eloDifference || upset.ratingDiff || 0;

      if (!biggestUpset || ratingDiff > biggestUpset.ratingDiff) {
        biggestUpset = {
          winner: upset.underdog,
          loser: upset.favorite,
          winnerRating: upset.underdogRating,
          loserRating: upset.favoriteRating,
          ratingDiff: ratingDiff,
          roundNumber: round.roundNumber
        };
      }
    }
  });

  return {
    biggestUpset,
    // Can add more hall of fame categories here
  };
}

/**
 * Count award frequency across all rounds
 */
function analyzeAwardFrequency(rounds) {
  const frequency = {};

  rounds.forEach(round => {
    ['awards', 'fideFunAwards', 'funStats', 'analysis', 'timeAwards'].forEach(category => {
      if (round[category]) {
        Object.keys(round[category]).forEach(awardKey => {
          const fullKey = `${category}.${awardKey}`;
          frequency[fullKey] = (frequency[fullKey] || 0) + 1;
        });
      }
    });
  });

  return frequency;
}

/**
 * Find the top awards across all rounds
 */
function findTopAwards(rounds) {
  const topAwards = {
    awards: {},
    fideFunAwards: {},
    funStats: {},
    timeAwards: {},
    analysis: {}
  };

  // Define comparison functions for each award type
  const comparators = {
    // Tournament Awards
    bloodbath: (a, b) => (a?.captures || 0) > (b?.captures || 0),
    pacifist: (a, b) => {
      const aCaptures = a?.captures ?? Infinity;
      const bCaptures = b?.captures ?? Infinity;
      return aCaptures < bCaptures && aCaptures > 0;
    },
    speedDemon: (a, b) => {
      const aMoves = a?.moves || Infinity;
      const bMoves = b?.moves || Infinity;
      return aMoves < bMoves && aMoves >= 10; // Exclude forfeits
    },
    endgameWizard: (a, b) => (a?.endgameMoves || 0) > (b?.endgameMoves || 0),
    openingSprinter: (a, b) => {
      const aMoves = a?.openingMoves || Infinity;
      const bMoves = b?.openingMoves || Infinity;
      return aMoves < bMoves;
    },

    // FIDE Fun Awards
    tiebreakWarrior: (a, b) => (a?.tiebreakGames || 0) > (b?.tiebreakGames || 0),
    giantSlayer: (a, b) => (a?.ratingDifference || 0) > (b?.ratingDifference || 0),
    rapidFire: (a, b) => (a?.rapidWins || 0) > (b?.rapidWins || 0),
    blitzWizard: (a, b) => (a?.blitzWins || 0) > (b?.blitzWins || 0),
    classicalPurist: (a, b) => (a?.classicalWins || 0) > (b?.classicalWins || 0),
    marathonMaster: (a, b) => (a?.totalMoves || 0) > (b?.totalMoves || 0),
    fortressBuilder: (a, b) => (a?.defensiveHolds || 0) > (b?.defensiveHolds || 0),
    upsetArtist: (a, b) => (a?.upsets || 0) > (b?.upsets || 0),

    // Time Awards
    longestThink: (a, b) => (a?.thinkTime || 0) > (b?.thinkTime || 0),
    zeitnotAddict: (a, b) => (a?.timeLeft || 0) < (b?.timeLeft || 0) && (a?.timeLeft || 0) >= 0,
    timeScrambleSurvivor: (a, b) => (a?.movesInZeitnot || 0) > (b?.movesInZeitnot || 0),
    bulletSpeed: (a, b) => (a?.averageMoveTime || Infinity) < (b?.averageMoveTime || Infinity),
    openingBlitzer: (a, b) => (a?.openingSpeed || Infinity) < (b?.openingSpeed || Infinity),
    classicalTimeBurner: (a, b) => (a?.timeUsed || 0) > (b?.timeUsed || 0),

    // Fun Stats - numeric comparisons
    longestCheckSequence: (a, b) => (a?.consecutiveChecks || 0) > (b?.consecutiveChecks || 0),
    longestCaptureSequence: (a, b) => (a?.consecutiveCaptures || 0) > (b?.consecutiveCaptures || 0),
    fastestQueenTrade: (a, b) => {
      const aMoves = a?.moveNumber || Infinity;
      const bMoves = b?.moveNumber || Infinity;
      return aMoves < bMoves;
    },
    slowestQueenTrade: (a, b) => (a?.moveNumber || 0) > (b?.moveNumber || 0),
    pawnStorm: (a, b) => (a?.pawnAdvances || 0) > (b?.pawnAdvances || 0),
    castlingRace: (a, b) => {
      const aMoves = a?.bothCastled || Infinity;
      const bMoves = b?.bothCastled || Infinity;
      return aMoves < bMoves;
    },
    squareTourist: (a, b) => (a?.uniqueSquares || 0) > (b?.uniqueSquares || 0),
    openingHipster: (a, b) => (a?.obscurityScore || 0) > (b?.obscurityScore || 0),
    dadbodShuffler: (a, b) => (a?.kingMoves || 0) > (b?.kingMoves || 0),
    sportyQueen: (a, b) => (a?.queenMoves || 0) > (b?.queenMoves || 0),
    edgeLord: (a, b) => (a?.edgeMoves || 0) > (b?.edgeMoves || 0),
    centerStage: (a, b) => (a?.centerMoves || 0) > (b?.centerMoves || 0),
    darkLord: (a, b) => (a?.darkSquareMoves || 0) > (b?.darkSquareMoves || 0),
    lightLord: (a, b) => (a?.lightSquareMoves || 0) > (b?.lightSquareMoves || 0),
    rookLift: (a, b) => (a?.earlyRookLifts || 0) > (b?.earlyRookLifts || 0),
    chickenAward: (a, b) => (a?.retreats || 0) > (b?.retreats || 0),
    homebody: (a, b) => (a?.stayedHome || 0) > (b?.stayedHome || 0),
    crosshairs: (a, b) => (a?.capturedPieces || 0) > (b?.capturedPieces || 0),
    lateBloomer: (a, b) => {
      const aMoves = a?.firstCapture || Infinity;
      const bMoves = b?.firstCapture || Infinity;
      return aMoves > bMoves;
    },
    quickDraw: (a, b) => {
      const aMoves = a?.firstCapture || Infinity;
      const bMoves = b?.firstCapture || Infinity;
      return aMoves < bMoves;
    },

    // Default: use value if exists
    default: (a, b) => {
      const aVal = a?.value || a?.score || 0;
      const bVal = b?.value || b?.score || 0;
      return aVal > bVal;
    }
  };

  // Process each category
  const categories = ['awards', 'fideFunAwards', 'funStats', 'timeAwards', 'analysis'];

  categories.forEach(category => {
    rounds.forEach(round => {
      if (!round[category]) return;

      Object.entries(round[category]).forEach(([awardKey, awardData]) => {
        if (!awardData || awardData === null) return;

        const comparator = comparators[awardKey] || comparators.default;
        const current = topAwards[category][awardKey];

        if (!current || comparator(awardData, current)) {
          topAwards[category][awardKey] = {
            ...awardData,
            roundNumber: round.roundNumber,
            roundName: round.roundName
          };
        }
      });
    });
  });

  return topAwards;
}

/**
 * Calculate trends across rounds
 */
function calculateTrends(rounds) {
  return {
    avgGameLengthByRound: rounds.map(r => r.overview?.averageGameLength || 0),
    whiteWinRateByRound: rounds.map(r => r.results?.whiteWinPercentage || 0),
    drawRateByRound: rounds.map(r => r.results?.drawPercentage || 0),
    tiebreakRateByRound: rounds.map(r => r.matchStats?.tiebreakPercentage || 0),
    upsetRateByRound: rounds.map(r => calculateUpsetRate(r)),
    totalGamesByRound: rounds.map(r => r.overview?.totalGames || 0)
  };
}

/**
 * Analyze openings across tournament
 */
function analyzeOpenings(rounds) {
  const openingCounts = {};

  rounds.forEach(round => {
    if (round.openings?.mostPopular) {
      round.openings.mostPopular.forEach(opening => {
        const name = opening.name || opening.opening;
        if (name) {
          if (!openingCounts[name]) {
            openingCounts[name] = {
              name,
              count: 0,
              wins: 0,
              draws: 0,
              losses: 0
            };
          }
          openingCounts[name].count += opening.count || 0;
        }
      });
    }
  });

  // Sort by count
  const sortedOpenings = Object.values(openingCounts)
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  return {
    mostPopular: sortedOpenings
  };
}

/**
 * Main function
 */
async function main() {
  console.log('🏆 Generating Tournament Overview Statistics\n');

  try {
    // 1. Load all round data
    console.log('📥 Loading round data...');
    const rounds = loadRoundData();

    // 2. Calculate various stats
    console.log('\n📊 Calculating statistics...');

    console.log('  - Aggregating totals...');
    const aggregates = aggregateTotals(rounds);

    console.log('  - Creating round summaries...');
    const byRound = createRoundSummary(rounds);

    console.log('  - Finding Hall of Fame...');
    const hallOfFame = findHallOfFame(rounds);

    console.log('  - Calculating trends...');
    const trends = calculateTrends(rounds);

    console.log('  - Analyzing award frequency...');
    const awardFrequency = analyzeAwardFrequency(rounds);

    console.log('  - Calculating player leaderboard...');
    const playerLeaderboard = calculatePlayerAwards(rounds);

    console.log('  - Finding top awards...');
    const topAwards = findTopAwards(rounds);

    console.log('  - Analyzing openings...');
    const openings = analyzeOpenings(rounds);

    // 3. Combine into overview object
    const overview = {
      tournamentName: 'FIDE World Cup 2025',
      location: 'Goa, India',
      totalRounds: 7,
      roundsCompleted: rounds.length,
      generatedAt: new Date().toISOString(),

      overall: aggregates,
      byRound,
      hallOfFame,
      awardFrequency,
      playerLeaderboard,
      topAwards,
      trends,
      openings,

      players: {
        startingPlayers: 128,
        remainingPlayers: Math.pow(2, 7 - rounds.length),
        eliminatedPlayers: 128 - Math.pow(2, 7 - rounds.length)
      }
    };

    // 4. Write to file
    const outputPath = path.join(
      process.cwd(),
      'public',
      'stats',
      'tournament-overview.json'
    );

    fs.writeFileSync(outputPath, JSON.stringify(overview, null, 2));

    console.log('\n✅ Tournament overview generated successfully!');
    console.log(`📁 Output: ${outputPath}`);
    console.log(`\n📈 Summary:`);
    console.log(`  - Rounds: ${overview.roundsCompleted}/${overview.totalRounds}`);
    console.log(`  - Total Games: ${aggregates.totalGames}`);
    console.log(`  - Total Matches: ${aggregates.totalMatches}`);
    console.log(`  - Total Moves: ${aggregates.totalMoves.toLocaleString()}`);
    console.log(`  - Avg Game Length: ${aggregates.averageGameLength} moves`);
    console.log(`  - Longest Game: ${aggregates.longestGame?.moves || 0} moves (Round ${aggregates.longestGame?.roundNumber || '?'})`);
    console.log(`  - Shortest Game: ${aggregates.shortestGame?.moves || 0} moves (Round ${aggregates.shortestGame?.roundNumber || '?'})`);
    console.log(`\n⚰️ Piece Cemetery: ${aggregates.piecesCaptured.total} total casualties`);
    console.log(`   ♟️ ${aggregates.piecesCaptured.pawns} Pawns • ♞ ${aggregates.piecesCaptured.knights} Knights • ♝ ${aggregates.piecesCaptured.bishops} Bishops • ♜ ${aggregates.piecesCaptured.rooks} Rooks • ♛ ${aggregates.piecesCaptured.queens} Queens\n`);

  } catch (error) {
    console.error('\n❌ Error generating overview:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { main };
