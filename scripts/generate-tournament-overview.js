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
    averageGameLength: totalGames > 0 ? Math.round((totalMoves / totalGames / 2) * 10) / 10 : 0,
    longestGame,
    shortestGame,
    piecesCaptured
  };
}

/**
 * Aggregate tactical statistics across all rounds
 */
function aggregateTactics(rounds) {
  let totalCaptures = 0;
  let totalPromotions = 0;
  let kingsideCastles = 0;
  let queensideCastles = 0;
  const enPassantGames = [];

  rounds.forEach(round => {
    if (round.tactics) {
      totalCaptures += round.tactics.totalCaptures || 0;
      totalPromotions += round.tactics.totalPromotions || 0;
      kingsideCastles += round.tactics.castling?.kingside || 0;
      queensideCastles += round.tactics.castling?.queenside || 0;

      if (round.tactics.enPassantGames) {
        enPassantGames.push(...round.tactics.enPassantGames);
      }
    }
  });

  return {
    totalCaptures,
    totalPromotions,
    castling: {
      kingside: kingsideCastles,
      queenside: queensideCastles
    },
    enPassantGames
  };
}

/**
 * Aggregate piece activity statistics across all rounds
 */
function aggregatePieceActivity(rounds) {
  const activity = {
    pawns: 0,
    knights: 0,
    bishops: 0,
    rooks: 0,
    queens: 0,
    kings: 0
  };

  const captured = {
    pawns: 0,
    knights: 0,
    bishops: 0,
    rooks: 0,
    queens: 0
  };

  rounds.forEach(round => {
    if (round.pieces?.activity) {
      activity.pawns += round.pieces.activity.pawns || 0;
      activity.knights += round.pieces.activity.knights || 0;
      activity.bishops += round.pieces.activity.bishops || 0;
      activity.rooks += round.pieces.activity.rooks || 0;
      activity.queens += round.pieces.activity.queens || 0;
      activity.kings += round.pieces.activity.kings || 0;
    }

    if (round.pieces?.captured) {
      captured.pawns += round.pieces.captured.pawns || 0;
      captured.knights += round.pieces.captured.knights || 0;
      captured.bishops += round.pieces.captured.bishops || 0;
      captured.rooks += round.pieces.captured.rooks || 0;
      captured.queens += round.pieces.captured.queens || 0;
    }
  });

  return { activity, captured };
}

/**
 * Aggregate checkmate statistics across all rounds
 */
function aggregateCheckmates(rounds) {
  const byPiece = {
    queen: 0,
    rook: 0,
    bishop: 0,
    knight: 0,
    pawn: 0
  };

  let fastestCheckmate = null;

  rounds.forEach(round => {
    if (round.checkmates?.byPiece) {
      byPiece.queen += round.checkmates.byPiece.queen || 0;
      byPiece.rook += round.checkmates.byPiece.rook || 0;
      byPiece.bishop += round.checkmates.byPiece.bishop || 0;
      byPiece.knight += round.checkmates.byPiece.knight || 0;
      byPiece.pawn += round.checkmates.byPiece.pawn || 0;
    }

    if (round.checkmates?.fastest) {
      if (!fastestCheckmate || round.checkmates.fastest.moves < fastestCheckmate.moves) {
        fastestCheckmate = {
          ...round.checkmates.fastest,
          roundNumber: round.roundNumber
        };
      }
    }
  });

  return { byPiece, fastest: fastestCheckmate };
}

/**
 * Aggregate first move statistics across all rounds
 */
function aggregateFirstMoves(rounds) {
  const moveCounts = {};
  let totalGames = 0;

  rounds.forEach(round => {
    if (round.openings?.firstMoves) {
      // firstMoves is a Record object, not an array
      Object.entries(round.openings.firstMoves).forEach(([move, stats]) => {
        if (!moveCounts[move]) {
          moveCounts[move] = {
            move,
            count: 0,
            whiteWinRate: 0,
            totalWinRate: 0
          };
        }
        moveCounts[move].count += stats.count;
        // Weight the win rate by number of games
        moveCounts[move].totalWinRate += stats.whiteWinRate * stats.count;
      });
      totalGames += round.overview?.totalGames || 0;
    }
  });

  // Calculate weighted average win rates and sort by popularity
  const firstMoveStats = Object.entries(moveCounts).map(([move, data]) => ({
    move,
    count: data.count,
    whiteWinRate: data.count > 0
      ? Math.round(data.totalWinRate / data.count)
      : 0,
    popularity: data.count,
    percentage: totalGames > 0
      ? Math.round((data.count / totalGames) * 100 * 10) / 10
      : 0
  })).sort((a, b) => b.count - a.count);

  return firstMoveStats.slice(0, 10);
}

/**
 * Compare statistics across time controls
 */
function compareTimeControls(rounds) {
  const comparison = {
    classical: { games: 0, avgLength: 0, whiteWins: 0, draws: 0, blackWins: 0 },
    rapid: { games: 0, avgLength: 0, whiteWins: 0, draws: 0, blackWins: 0 },
    blitz: { games: 0, avgLength: 0, whiteWins: 0, draws: 0, blackWins: 0 }
  };

  rounds.forEach(round => {
    // Classical
    if (round.byTimeControl?.classical) {
      const classical = round.byTimeControl.classical;
      comparison.classical.games += classical.overview?.totalGames || 0;
      comparison.classical.avgLength += (classical.overview?.totalMoves || 0);
      comparison.classical.whiteWins += classical.results?.whiteWins || 0;
      comparison.classical.draws += classical.results?.draws || 0;
      comparison.classical.blackWins += classical.results?.blackWins || 0;
    }

    // Rapid (aggregate both tiers)
    ['rapidTier1', 'rapidTier2'].forEach(tier => {
      if (round.byTimeControl?.[tier]) {
        const rapid = round.byTimeControl[tier];
        comparison.rapid.games += rapid.overview?.totalGames || 0;
        comparison.rapid.avgLength += (rapid.overview?.totalMoves || 0);
        comparison.rapid.whiteWins += rapid.results?.whiteWins || 0;
        comparison.rapid.draws += rapid.results?.draws || 0;
        comparison.rapid.blackWins += rapid.results?.blackWins || 0;
      }
    });

    // Blitz (aggregate both tiers)
    ['blitzTier1', 'blitzTier2'].forEach(tier => {
      if (round.byTimeControl?.[tier]) {
        const blitz = round.byTimeControl[tier];
        comparison.blitz.games += blitz.overview?.totalGames || 0;
        comparison.blitz.avgLength += (blitz.overview?.totalMoves || 0);
        comparison.blitz.whiteWins += blitz.results?.whiteWins || 0;
        comparison.blitz.draws += blitz.results?.draws || 0;
        comparison.blitz.blackWins += blitz.results?.blackWins || 0;
      }
    });
  });

  // Calculate percentages and averages
  ['classical', 'rapid', 'blitz'].forEach(tc => {
    const data = comparison[tc];
    const totalGames = data.games;
    if (totalGames > 0) {
      // Convert plies to full moves by dividing by 2
      data.avgLength = Math.round((data.avgLength / totalGames / 2) * 10) / 10;
      data.whiteWinRate = Math.round((data.whiteWins / totalGames) * 100);
      data.drawRate = Math.round((data.draws / totalGames) * 100);
      data.blackWinRate = Math.round((data.blackWins / totalGames) * 100);
    }
  });

  return comparison;
}

/**
 * Create round-by-round summary
 */
function createRoundSummary(rounds) {
  return rounds.map(round => {
    // Aggregate rapid games from all tiers
    const rapidGames =
      (round.byTimeControl?.rapid?.overview?.totalGames || 0) +
      (round.byTimeControl?.rapidTier1?.overview?.totalGames || 0) +
      (round.byTimeControl?.rapidTier2?.overview?.totalGames || 0);

    // Aggregate blitz games from all tiers
    const blitzGames =
      (round.byTimeControl?.blitz?.overview?.totalGames || 0) +
      (round.byTimeControl?.blitzTier1?.overview?.totalGames || 0) +
      (round.byTimeControl?.blitzTier2?.overview?.totalGames || 0);

    return {
      roundNumber: round.roundNumber,
      roundName: round.roundName,
      matches: round.matchStats?.totalMatches || 0,
      games: round.overview?.totalGames || 0,
      avgGameLength: round.overview?.averageGameLength || 0,
      tiebreakRate: round.matchStats?.tiebreakPercentage || 0,
      upsetRate: calculateUpsetRate(round),
      classicalGames: round.byTimeControl?.classical?.overview?.totalGames || 0,
      rapidGames,
      blitzGames
    };
  });
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
    zeitnotAddict: (a, b) => (a?.minClock || Infinity) < (b?.minClock || Infinity) && (a?.minClock || 0) >= 0,
    timeScrambleSurvivor: (a, b) => (a?.count || 0) > (b?.count || 0),
    bulletSpeed: (a, b) => (a?.avgTime || Infinity) < (b?.avgTime || Infinity),
    openingBlitzer: (a, b) => (a?.avgTime || Infinity) < (b?.avgTime || Infinity),
    classicalTimeBurner: (a, b) => (a?.totalTime || 0) > (b?.totalTime || 0),

    // Fun Stats - numeric comparisons
    longestCheckSequence: (a, b) => (a?.length || 0) > (b?.length || 0),
    longestCaptureSequence: (a, b) => (a?.length || 0) > (b?.length || 0),
    fastestQueenTrade: (a, b) => {
      const aMoves = a?.moveNumber || Infinity;
      const bMoves = b?.moveNumber || Infinity;
      return aMoves < bMoves;
    },
    slowestQueenTrade: (a, b) => (a?.moveNumber || 0) > (b?.moveNumber || 0),
    pawnStorm: (a, b) => (a?.advancedPawns || 0) > (b?.advancedPawns || 0),
    castlingRace: (a, b) => {
      const aMoves = a?.moveNumber || Infinity;
      const bMoves = b?.moveNumber || Infinity;
      return aMoves < bMoves;
    },
    squareTourist: (a, b) => (a?.squares || 0) > (b?.squares || 0),
    openingHipster: (a, b) => (a?.obscurityScore || 0) > (b?.obscurityScore || 0),
    dadbodShuffler: (a, b) => (a?.moves || 0) > (b?.moves || 0),
    sportyQueen: (a, b) => (a?.moves || 0) > (b?.moves || 0),
    edgeLord: (a, b) => (a?.moves || 0) > (b?.moves || 0),
    centerStage: (a, b) => (a?.moves || 0) > (b?.moves || 0),
    darkLord: (a, b) => (a?.captures || 0) > (b?.captures || 0),
    lightLord: (a, b) => (a?.captures || 0) > (b?.captures || 0),
    rookLift: (a, b) => {
      const aMoves = a?.moveNumber || Infinity;
      const bMoves = b?.moveNumber || Infinity;
      return aMoves < bMoves;
    },
    chickenAward: (a, b) => (a?.retreats || 0) > (b?.retreats || 0),
    homebody: (a, b) => (a?.piecesStayedHome || 0) > (b?.piecesStayedHome || 0),
    crosshairs: (a, b) => (a?.attackers || 0) > (b?.attackers || 0),
    lateBloomer: (a, b) => {
      const aMoves = a?.moveNumber || Infinity;
      const bMoves = b?.moveNumber || Infinity;
      return aMoves > bMoves;
    },
    quickDraw: (a, b) => {
      const aMoves = a?.moveNumber || Infinity;
      const bMoves = b?.moveNumber || Infinity;
      return aMoves < bMoves;
    },

    // Analysis Awards
    accuracyKing: (a, b) => (a?.accuracy || 0) > (b?.accuracy || 0),
    biggestBlunder: (a, b) => (a?.cpLoss || 0) > (b?.cpLoss || 0),
    lowestACPL: (a, b) => {
      const aACPL = a?.acpl ?? Infinity;
      const bACPL = b?.acpl ?? Infinity;
      return aACPL < bACPL;
    },
    highestACPL: (a, b) => (a?.acpl || 0) > (b?.acpl || 0),
    lowestCombinedACPL: (a, b) => {
      const aACPL = a?.combinedACPL ?? Infinity;
      const bACPL = b?.combinedACPL ?? Infinity;
      return aACPL < bACPL;
    },
    highestCombinedACPL: (a, b) => (a?.combinedACPL || 0) > (b?.combinedACPL || 0),
    comebackKing: (a, b) => (a?.swing || 0) > (b?.swing || 0),
    luckyEscape: (a, b) => (a?.escapeAmount || 0) > (b?.escapeAmount || 0),
    stockfishBuddy: (a, b) => (a?.percentage || 0) > (b?.percentage || 0),
    inaccuracyKing: (a, b) => (a?.inaccuracies || 0) > (b?.inaccuracies || 0),
    notSoSuperGM: (a, b) => (a?.severity || 0) > (b?.severity || 0),

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

      // Special handling for analysis category - extract from summary
      if (category === 'analysis') {
        if (!round.analysis || !round.analysis.summary) return;

        Object.entries(round.analysis.summary).forEach(([awardKey, awardData]) => {
          if (!awardData || awardData === null) return;
          if (awardKey === 'roundNumber' || awardKey === 'roundName') return;

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
      } else {
        // Regular category processing
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
      }
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
  const generalOpeningCounts = {};

  rounds.forEach(round => {
    if (round.openings?.mostPopular) {
      round.openings.mostPopular.forEach(opening => {
        const name = opening.name || opening.opening;
        if (name) {
          // Track specific variations
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

          // Track general opening families (text before colon)
          const generalName = name.includes(':')
            ? name.split(':')[0].trim()
            : name;

          if (!generalOpeningCounts[generalName]) {
            generalOpeningCounts[generalName] = {
              name: generalName,
              count: 0
            };
          }
          generalOpeningCounts[generalName].count += opening.count || 0;
        }
      });
    }
  });

  // Sort by count
  const sortedOpenings = Object.values(openingCounts)
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  const sortedGeneralOpenings = Object.values(generalOpeningCounts)
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  return {
    mostPopular: sortedOpenings,
    generalOpenings: sortedGeneralOpenings
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

    console.log('  - Aggregating tactical stats...');
    const tactics = aggregateTactics(rounds);

    console.log('  - Aggregating piece activity...');
    const pieces = aggregatePieceActivity(rounds);

    console.log('  - Aggregating checkmates...');
    const checkmates = aggregateCheckmates(rounds);

    console.log('  - Aggregating first moves...');
    const firstMoveStats = aggregateFirstMoves(rounds);

    console.log('  - Comparing time controls...');
    const timeControlComparison = compareTimeControls(rounds);

    // 3. Combine into overview object
    const overview = {
      tournamentName: 'FIDE World Cup 2025',
      location: 'Goa, India',
      totalRounds: 8,
      roundsCompleted: 5, // Round 6 is in progress
      generatedAt: new Date().toISOString(),

      overall: aggregates,
      byRound,
      hallOfFame,
      awardFrequency,
      playerLeaderboard,
      topAwards,
      trends,
      openings: {
        ...openings,
        firstMoveStats
      },
      tactics,
      pieces,
      checkmates,
      timeControlComparison,

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
