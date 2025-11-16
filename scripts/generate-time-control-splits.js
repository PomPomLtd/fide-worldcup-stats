#!/usr/bin/env node

/**
 * generate-time-control-splits.js
 *
 * FIDE World Cup 2025 - Stage 2 Extension: Time Control Splits
 *
 * This script reads classified match data and generates separate files for each
 * time control type (classical, rapid, blitz) within each round.
 *
 * This enables time-control-specific statistics and analysis.
 *
 * Input:  data/classified/round-N-classified.json
 * Output: data/classified/round-N-{classical|rapid|blitz}.json
 *
 * Usage:
 *   node scripts/generate-time-control-splits.js [--round=N]
 *   node scripts/generate-time-control-splits.js --round=1  # Split only Round 1
 *   node scripts/generate-time-control-splits.js            # Split all rounds
 */

const fs = require('fs');
const path = require('path');

// Configuration
const CLASSIFIED_DIR = path.join(__dirname, '../data/classified');

/**
 * Parse command line arguments
 */
function parseArgs() {
  const args = process.argv.slice(2);
  const options = { round: null };

  for (const arg of args) {
    if (arg.startsWith('--round=')) {
      options.round = parseInt(arg.split('=')[1], 10);
    }
  }

  return options;
}

/**
 * Filter games by time control type
 * @param {Array} games - Array of game objects with classification
 * @param {string} timeControlType - 'CLASSICAL', 'RAPID', or 'BLITZ'
 * @returns {Array} Filtered games
 */
function filterGamesByType(games, timeControlType) {
  return games.filter(game => game.classification?.type === timeControlType);
}

/**
 * Create a time-control-specific dataset from classified data
 * @param {Object} classifiedData - Full classified data for a round
 * @param {string} timeControlType - 'CLASSICAL', 'RAPID', or 'BLITZ'
 * @returns {Object} Time-control-specific dataset
 */
function createTimeControlDataset(classifiedData, timeControlType) {
  const typeLabel = timeControlType.toLowerCase();

  // Filter matches that have games of this type
  const relevantMatches = classifiedData.matches
    .map(match => {
      const gamesOfType = filterGamesByType(match.gameDetails, timeControlType);

      if (gamesOfType.length === 0) {
        return null; // No games of this type in this match
      }

      // Create filtered match with only games of this type
      return {
        matchId: match.matchId,
        matchNumber: match.matchNumber,
        pairingKey: match.pairingKey,
        players: match.players,
        totalGamesInTimeControl: gamesOfType.length,
        totalGamesOverall: match.totalGames,
        gameDetails: gamesOfType,
        outcome: match.outcome, // Include full match outcome for context
        dates: [...new Set(gamesOfType.map(g => g.date).filter(d => d))],
        site: match.site,
      };
    })
    .filter(match => match !== null);

  // Calculate statistics for this time control
  const totalGames = relevantMatches.reduce((sum, m) => sum + m.totalGamesInTimeControl, 0);

  // For rapid and blitz, separate by tier
  let tierStats = null;
  if (timeControlType === 'RAPID' || timeControlType === 'BLITZ') {
    const tier1Games = relevantMatches.flatMap(m =>
      m.gameDetails.filter(g => g.classification.tier === 1)
    );
    const tier2Games = relevantMatches.flatMap(m =>
      m.gameDetails.filter(g => g.classification.tier === 2)
    );

    tierStats = {
      tier1: {
        games: tier1Games.length,
        matches: new Set(tier1Games.map(g => {
          // Find match containing this game
          const match = relevantMatches.find(m =>
            m.gameDetails.some(gd => gd.round === g.round && gd.white === g.white)
          );
          return match?.matchId;
        })).size,
        timeControl: tier1Games[0]?.classification.timeControl || null,
      },
      tier2: {
        games: tier2Games.length,
        matches: new Set(tier2Games.map(g => {
          const match = relevantMatches.find(m =>
            m.gameDetails.some(gd => gd.round === g.round && gd.white === g.white)
          );
          return match?.matchId;
        })).size,
        timeControl: tier2Games[0]?.classification.timeControl || null,
      },
    };
  }

  return {
    roundNumber: classifiedData.roundNumber,
    roundName: classifiedData.roundName,
    timeControlType,
    timeControlLabel: typeLabel.charAt(0).toUpperCase() + typeLabel.slice(1),
    totalMatches: relevantMatches.length,
    totalGames,
    tierStats,
    matches: relevantMatches,
    generatedAt: new Date().toISOString(),
    sourceFile: `round-${classifiedData.roundNumber}-classified.json`,
  };
}

/**
 * Process a single round and generate time control splits
 * @param {number} roundNum - Round number
 * @returns {Object} Results with counts for each time control
 */
function processRound(roundNum) {
  console.log(`\n🔄 Generating time control splits for Round ${roundNum}...`);

  const inputPath = path.join(CLASSIFIED_DIR, `round-${roundNum}-classified.json`);

  if (!fs.existsSync(inputPath)) {
    console.error(`❌ Classified data not found: ${inputPath}`);
    console.error(`   Run: node scripts/classify-games.js --round=${roundNum}`);
    return null;
  }

  // Read classified data
  const classifiedData = JSON.parse(fs.readFileSync(inputPath, 'utf-8'));
  console.log(`   ✅ Loaded classified data: ${classifiedData.totalMatches} matches`);

  const results = {
    classical: null,
    rapid: null,
    blitz: null,
  };

  // Generate classical dataset
  const classicalData = createTimeControlDataset(classifiedData, 'CLASSICAL');
  if (classicalData.totalGames > 0) {
    const outputPath = path.join(CLASSIFIED_DIR, `round-${roundNum}-classical.json`);
    fs.writeFileSync(outputPath, JSON.stringify(classicalData, null, 2), 'utf-8');
    results.classical = classicalData;
    console.log(
      `   ✅ Classical: ${classicalData.totalMatches} matches, ${classicalData.totalGames} games`
    );
  }

  // Generate rapid dataset
  const rapidData = createTimeControlDataset(classifiedData, 'RAPID');
  if (rapidData.totalGames > 0) {
    const outputPath = path.join(CLASSIFIED_DIR, `round-${roundNum}-rapid.json`);
    fs.writeFileSync(outputPath, JSON.stringify(rapidData, null, 2), 'utf-8');
    results.rapid = rapidData;
    console.log(
      `   ✅ Rapid: ${rapidData.totalMatches} matches, ${rapidData.totalGames} games`
    );
    if (rapidData.tierStats) {
      console.log(
        `      - Tier 1 (${rapidData.tierStats.tier1.timeControl}): ${rapidData.tierStats.tier1.games} games`
      );
      console.log(
        `      - Tier 2 (${rapidData.tierStats.tier2.timeControl}): ${rapidData.tierStats.tier2.games} games`
      );
    }
  }

  // Generate blitz dataset
  const blitzData = createTimeControlDataset(classifiedData, 'BLITZ');
  if (blitzData.totalGames > 0) {
    const outputPath = path.join(CLASSIFIED_DIR, `round-${roundNum}-blitz.json`);
    fs.writeFileSync(outputPath, JSON.stringify(blitzData, null, 2), 'utf-8');
    results.blitz = blitzData;
    console.log(
      `   ✅ Blitz: ${blitzData.totalMatches} matches, ${blitzData.totalGames} games`
    );
    if (blitzData.tierStats) {
      console.log(
        `      - Tier 1 (${blitzData.tierStats.tier1.timeControl}): ${blitzData.tierStats.tier1.games} games`
      );
      console.log(
        `      - Tier 2 (${blitzData.tierStats.tier2.timeControl}): ${blitzData.tierStats.tier2.games} games`
      );
    }
  }

  return results;
}

/**
 * Main execution
 */
function main() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  FIDE World Cup 2025 - Time Control Splits');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  const options = parseArgs();

  // Process specific round or all rounds
  if (options.round !== null) {
    const results = processRound(options.round);

    if (results) {
      console.log(`\n✅ Round ${options.round} time control splits complete`);
    }
  } else {
    // Detect all available classified files
    if (!fs.existsSync(CLASSIFIED_DIR)) {
      console.error(`❌ Classified directory not found: ${CLASSIFIED_DIR}`);
      console.error(`   Run: node scripts/classify-games.js`);
      process.exit(1);
    }

    const files = fs.readdirSync(CLASSIFIED_DIR);
    const roundNumbers = new Set();

    for (const file of files) {
      const match = file.match(/^round-(\d+)-classified\.json$/);
      if (match) {
        roundNumbers.add(parseInt(match[1], 10));
      }
    }

    const rounds = Array.from(roundNumbers).sort((a, b) => a - b);

    console.log(`\n📂 Found ${rounds.length} classified rounds: ${rounds.join(', ')}`);

    for (const roundNum of rounds) {
      processRound(roundNum);
    }

    console.log(`\n✅ All time control splits complete`);
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  ✅ Processing complete!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { createTimeControlDataset };
