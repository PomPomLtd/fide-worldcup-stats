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
 * Find Hall of Fame entries across all rounds
 */
function findHallOfFame(rounds) {
  const allAwards = [];

  rounds.forEach(round => {
    // Collect all awards from different categories
    ['awards', 'fideFunAwards', 'funStats', 'analysis', 'timeAwards'].forEach(category => {
      if (round[category]) {
        Object.entries(round[category]).forEach(([awardKey, awardData]) => {
          if (awardData && typeof awardData === 'object') {
            allAwards.push({
              category,
              awardKey,
              roundNumber: round.roundNumber,
              ...awardData
            });
          }
        });
      }
    });
  });

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
