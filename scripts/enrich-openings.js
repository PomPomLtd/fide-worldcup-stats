#!/usr/bin/env node

/**
 * enrich-openings.js
 *
 * FIDE World Cup 2025 - Stage 3: Opening Enrichment
 *
 * This script reads classified match data and enriches it with:
 * 1. Opening names and ECO codes from move sequences
 * 2. Opening statistics (most popular, by time control, etc.)
 * 3. Confidence metrics for opening matches
 *
 * Input:  data/classified/round-N-classified.json
 * Output: data/enriched/round-N-enriched.json
 *
 * Usage:
 *   node scripts/enrich-openings.js [--round=N]
 *   node scripts/enrich-openings.js --round=1  # Enrich only Round 1
 *   node scripts/enrich-openings.js            # Enrich all rounds
 */

const fs = require('fs');
const path = require('path');
const { matchOpening } = require('./utils/opening-matcher');

// Configuration
const CLASSIFIED_DIR = path.join(__dirname, '../data/classified');
const OUTPUT_DIR = path.join(__dirname, '../data/enriched');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

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
 * Enrich a single game with opening information
 * @param {Object} game - Game object with moves field
 * @returns {Object} Game with opening field added
 */
function enrichGame(game) {
  const opening = matchOpening(game.moves || '');

  return {
    ...game,
    opening,
  };
}

/**
 * Generate opening statistics from enriched matches
 * @param {Array} matches - Array of match objects with enriched games
 * @param {Object} classifiedData - Original classified data for context
 * @returns {Object} Opening statistics
 */
function generateOpeningStats(matches, classifiedData) {
  const stats = {
    totalGames: 0,
    gamesWithOpenings: 0,
    gamesUnknown: 0,
    coverageRate: 0,

    byEco: {},
    byName: {},
    byConfidence: {
      high: 0,
      medium: 0,
      low: 0,
      none: 0,
    },

    mostPopular: [],
    byTimeControl: {},
  };

  // Collect all games
  const allGames = [];
  matches.forEach(match => {
    match.gameDetails.forEach(game => {
      allGames.push(game);
    });
  });

  stats.totalGames = allGames.length;

  // Analyze each game
  allGames.forEach(game => {
    if (!game.opening) return;

    const { eco, name, confidence } = game.opening;

    // Count by confidence
    if (confidence) {
      stats.byConfidence[confidence] = (stats.byConfidence[confidence] || 0) + 1;
    }

    // Count matched vs unknown
    if (eco && name !== 'Unknown Opening') {
      stats.gamesWithOpenings++;

      // Count by ECO code
      if (!stats.byEco[eco]) {
        stats.byEco[eco] = {
          eco,
          name,
          count: 0,
          games: [],
        };
      }
      stats.byEco[eco].count++;
      stats.byEco[eco].games.push({
        white: game.white,
        black: game.black,
        result: game.result,
      });

      // Count by opening name
      if (!stats.byName[name]) {
        stats.byName[name] = {
          name,
          eco,
          count: 0,
        };
      }
      stats.byName[name].count++;
    } else {
      stats.gamesUnknown++;
    }

    // Count by time control
    const timeControl = game.classification?.type || 'UNKNOWN';
    if (!stats.byTimeControl[timeControl]) {
      stats.byTimeControl[timeControl] = {
        totalGames: 0,
        gamesWithOpenings: 0,
        gamesUnknown: 0,
        openings: {},
      };
    }

    stats.byTimeControl[timeControl].totalGames++;

    if (eco && name !== 'Unknown Opening') {
      stats.byTimeControl[timeControl].gamesWithOpenings++;

      if (!stats.byTimeControl[timeControl].openings[eco]) {
        stats.byTimeControl[timeControl].openings[eco] = {
          eco,
          name,
          count: 0,
        };
      }
      stats.byTimeControl[timeControl].openings[eco].count++;
    } else {
      stats.byTimeControl[timeControl].gamesUnknown++;
    }
  });

  // Calculate coverage rate
  stats.coverageRate = stats.totalGames > 0
    ? ((stats.gamesWithOpenings / stats.totalGames) * 100).toFixed(1)
    : 0;

  // Generate most popular list (sorted by count)
  stats.mostPopular = Object.values(stats.byEco)
    .sort((a, b) => b.count - a.count)
    .slice(0, 20) // Top 20
    .map(({ eco, name, count }) => ({ eco, name, count }));

  // Sort openings within each time control
  Object.keys(stats.byTimeControl).forEach(tc => {
    const tcStats = stats.byTimeControl[tc];
    tcStats.mostPopular = Object.values(tcStats.openings)
      .sort((a, b) => b.count - a.count)
      .slice(0, 10) // Top 10 per time control
      .map(({ eco, name, count }) => ({ eco, name, count }));
  });

  return stats;
}

/**
 * Process a single round's classified data and enrich with openings
 * @param {number} roundNum - Round number
 * @returns {Object} Enriched round data
 */
function processRound(roundNum) {
  console.log(`\n🔄 Enriching Round ${roundNum} with opening data...`);

  const inputPath = path.join(CLASSIFIED_DIR, `round-${roundNum}-classified.json`);

  if (!fs.existsSync(inputPath)) {
    console.error(`❌ Classified data not found: ${inputPath}`);
    console.error(`   Run: node scripts/classify-games.js --round=${roundNum}`);
    return null;
  }

  // Read classified data
  const classifiedData = JSON.parse(fs.readFileSync(inputPath, 'utf-8'));
  console.log(`   ✅ Loaded ${classifiedData.totalMatches} matches`);

  // Enrich each match's games with opening info
  console.log(`   🔍 Matching openings...`);
  let totalEnriched = 0;
  let highConfidence = 0;

  const enrichedMatches = classifiedData.matches.map(match => {
    const enrichedGames = match.gameDetails.map(game => {
      const enriched = enrichGame(game);
      totalEnriched++;

      if (enriched.opening.confidence === 'high') {
        highConfidence++;
      }

      return enriched;
    });

    return {
      ...match,
      gameDetails: enrichedGames,
    };
  });

  console.log(`   ✅ Enriched ${totalEnriched} games (${highConfidence} high confidence)`);

  // Generate opening statistics
  console.log(`   📊 Generating opening statistics...`);
  const openingStats = generateOpeningStats(enrichedMatches, classifiedData);

  console.log(`\n   📈 Opening Coverage:`);
  console.log(`      Total games:        ${openingStats.totalGames}`);
  console.log(`      With openings:      ${openingStats.gamesWithOpenings} (${openingStats.coverageRate}%)`);
  console.log(`      Unknown:            ${openingStats.gamesUnknown}`);
  console.log(`      Unique openings:    ${Object.keys(openingStats.byEco).length}`);

  console.log(`\n   🎯 Confidence Distribution:`);
  console.log(`      High:   ${openingStats.byConfidence.high}`);
  console.log(`      Medium: ${openingStats.byConfidence.medium}`);
  console.log(`      Low:    ${openingStats.byConfidence.low}`);
  console.log(`      None:   ${openingStats.byConfidence.none}`);

  if (openingStats.mostPopular.length > 0) {
    console.log(`\n   🏆 Top 5 Most Popular Openings:`);
    openingStats.mostPopular.slice(0, 5).forEach((op, i) => {
      console.log(`      ${i + 1}. ${op.name} (${op.eco}) - ${op.count} games`);
    });
  }

  // Create enriched data structure
  const enrichedData = {
    ...classifiedData,
    matches: enrichedMatches,
    openingStats,
    enrichedAt: new Date().toISOString(),
    stage: 'enriched',
  };

  return enrichedData;
}

/**
 * Main execution
 */
function main() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  FIDE World Cup 2025 - Opening Enrichment (Stage 3)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  const options = parseArgs();

  // Process specific round or all rounds
  if (options.round !== null) {
    const enrichedData = processRound(options.round);

    if (enrichedData) {
      const outputPath = path.join(OUTPUT_DIR, `round-${options.round}-enriched.json`);
      fs.writeFileSync(outputPath, JSON.stringify(enrichedData, null, 2), 'utf-8');

      console.log(`\n✅ Round ${options.round} enrichment complete:`);
      console.log(`   Output: ${outputPath}`);
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
      const enrichedData = processRound(roundNum);

      if (enrichedData) {
        const outputPath = path.join(OUTPUT_DIR, `round-${roundNum}-enriched.json`);
        fs.writeFileSync(outputPath, JSON.stringify(enrichedData, null, 2), 'utf-8');

        console.log(`\n✅ Round ${roundNum} enrichment complete:`);
        console.log(`   Output: ${outputPath}`);
      }
    }
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  ✅ Enrichment complete!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { enrichGame, generateOpeningStats };
