#!/usr/bin/env node

/**
 * Generate Statistics
 *
 * Main statistics generation script for FIDE World Cup.
 * Reads enriched data and generates comprehensive statistics for each round.
 *
 * Usage:
 *   node scripts/generate-stats.js [--round=N]
 *   npm run stats:round1
 *   npm run stats:all
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Calculators
const { calculateResults } = require('./utils/calculators/results');
const { calculateOverview } = require('./utils/calculators/overview');
const { calculateTactics } = require('./utils/calculators/tactics');
const { calculatePieceStats } = require('./utils/calculators/pieces');
const { calculateCheckmates } = require('./utils/calculators/checkmates');
const { calculateBoardHeatmap } = require('./utils/calculators/heatmap');
const { calculateGamePhases } = require('./utils/calculators/game-phases');
const { calculateOpenings } = require('./utils/calculators/openings');
const { calculateAwards } = require('./utils/calculators/awards');

// FIDE-specific calculators
const { calculateMatchStats } = require('./utils/calculators/match-stats');
const { calculateRatingAnalysis } = require('./utils/calculators/rating-analysis');
const { calculateFideFunAwards } = require('./utils/calculators/fide-fun-awards');
const { calculateFunStats } = require('./utils/calculators/fun-stats');
const { calculateTimeAwards } = require('./utils/calculators/time-awards');

/**
 * Extract all games from matches
 * @param {Array<Object>} matches - Match objects
 * @returns {Array<Object>} Flat array of all games with player ratings
 */
function extractGamesFromMatches(matches) {
  const games = [];
  matches.forEach((match) => {
    const gameDetails = match.gameDetails || [];
    const players = match.players || [];

    // Create rating lookup by player name
    const ratingLookup = {};
    players.forEach((p) => {
      ratingLookup[p.name] = p.elo || null;
    });

    gameDetails.forEach((game) => {
      games.push({
        ...game,
        whiteRating: ratingLookup[game.white] || null,
        blackRating: ratingLookup[game.black] || null,
      });
    });
  });
  return games;
}

/**
 * Filter games by time control type
 * @param {Array<Object>} games - All games
 * @param {string} type - Time control type (CLASSICAL, RAPID, BLITZ)
 * @param {number|null} tier - Tier number (for rapid/blitz)
 * @returns {Array<Object>} Filtered games
 */
function filterByTimeControl(games, type, tier = null) {
  return games.filter((game) => {
    const classification = game.classification || {};
    if (tier !== null) {
      return classification.type === type && classification.tier === tier;
    }
    return classification.type === type;
  });
}

/**
 * Run Stockfish analysis on all games
 * @param {Array<Object>} games - Games with PGN data
 * @param {number} depth - Stockfish search depth
 * @param {number} sampleRate - Analyze every Nth move (1 = all moves)
 * @returns {Object|null} Analysis results or null if analysis fails
 */
function runStockfishAnalysis(games, depth = 15, sampleRate = 1) {
  console.log(`\n  Running Stockfish Analysis...`);
  console.log(`    → Depth: ${depth}, Sample rate: every ${sampleRate} move(s)`);
  console.log(`    → Analyzing ${games.length} games...`);

  // Prepare game metadata with PGN and ratings
  const gamesWithMetadata = games
    .filter(g => g.pgn)
    .map((g, idx) => ({
      gameIndex: idx,
      white: g.white,
      black: g.black,
      whiteRating: g.whiteRating,
      blackRating: g.blackRating,
      pgn: g.pgn
    }));

  if (gamesWithMetadata.length === 0) {
    console.log('    ⚠️  No PGN data found, skipping analysis');
    return null;
  }

  const pythonPath = path.join(process.cwd(), 'venv', 'bin', 'python3');
  const scriptPath = path.join(process.cwd(), 'scripts', 'analyze-pgn.py');

  try {
    const startTime = Date.now();
    const output = execSync(
      `${pythonPath} ${scriptPath} --depth ${depth} --sample ${sampleRate} --json-input`,
      {
        input: JSON.stringify({ games: gamesWithMetadata }),
        encoding: 'utf8',
        maxBuffer: 50 * 1024 * 1024, // 50MB buffer for large outputs
        cwd: process.cwd(),
        stdio: ['pipe', 'pipe', 'inherit'] // Show progress on stderr
      }
    );

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    const results = JSON.parse(output);

    console.log(`    ✓ Stockfish analysis complete in ${elapsed}s`);
    return results;

  } catch (error) {
    console.error('    ❌ Stockfish analysis failed:', error.message);
    console.error('    Continuing without analysis data...');
    return null;
  }
}

/**
 * Generate statistics for a set of games
 * @param {Array<Object>} games - Games to analyze
 * @param {Object} options - Generation options
 * @returns {Object} Statistics for these games
 */
function generateStatsForGames(games, options = {}) {
  if (!games || games.length === 0) {
    return null;
  }

  const { skipGamePhases = false } = options;

  // Calculate stats in order, reusing results where possible
  const overview = calculateOverview(games);
  const results = calculateResults(games);
  const tactics = calculateTactics(games);
  const pieces = calculatePieceStats(games);
  const checkmates = calculateCheckmates(games);
  const heatmap = calculateBoardHeatmap(games);

  // Game phases is VERY slow (replays all games with chess.js)
  // Skip it for per-time-control stats - only calculate for overall
  const gamePhases = skipGamePhases ? null : calculateGamePhases(games);

  const openings = calculateOpenings(games);

  // Pass precomputed stats to awards to avoid recalculation
  const awards = calculateAwards(games, { tactics, checkmates });

  return {
    overview,
    results,
    tactics,
    pieces,
    checkmates,
    heatmap,
    gamePhases,
    openings,
    awards,
  };
}

/**
 * Generate statistics for a round
 * @param {number} roundNum - Round number
 */
function generateStatsForRound(roundNum, options = {}) {
  console.log(`\n=== Generating Statistics for Round ${roundNum} ===\n`);

  // Read enriched data
  const enrichedPath = path.join(process.cwd(), 'data', 'enriched', `round-${roundNum}-enriched.json`);

  if (!fs.existsSync(enrichedPath)) {
    console.error(`❌ Enriched data not found: ${enrichedPath}`);
    console.error('   Run Stage 3 (opening enrichment) first!');
    process.exit(1);
  }

  const enrichedData = JSON.parse(fs.readFileSync(enrichedPath, 'utf-8'));
  console.log(`✓ Loaded enriched data: ${enrichedData.totalGames} games in ${enrichedData.totalMatches} matches`);

  // Extract all games from matches
  const allGames = extractGamesFromMatches(enrichedData.matches);
  console.log(`✓ Extracted ${allGames.length} games`);

  // Overall statistics (all games)
  console.log('\n  Calculating overall statistics...');
  console.log('    → Overview, results, tactics...');
  const overallStats = generateStatsForGames(allGames);
  console.log('    ✓ Overall statistics complete');

  // Statistics by time control
  console.log('\n  Calculating time-control-specific statistics...');
  const classical = filterByTimeControl(allGames, 'CLASSICAL');
  const rapidTier1 = filterByTimeControl(allGames, 'RAPID', 1);
  const rapidTier2 = filterByTimeControl(allGames, 'RAPID', 2);
  const blitzTier1 = filterByTimeControl(allGames, 'BLITZ', 1);
  const blitzTier2 = filterByTimeControl(allGames, 'BLITZ', 2);

  console.log(`    - Classical: ${classical.length} games`);
  console.log(`    - Rapid Tier 1: ${rapidTier1.length} games`);
  console.log(`    - Rapid Tier 2: ${rapidTier2.length} games`);
  console.log(`    - Blitz Tier 1: ${blitzTier1.length} games`);
  console.log(`    - Blitz Tier 2: ${blitzTier2.length} games`);

  const byTimeControl = {};

  // Skip game phases for time-control stats (very slow, not that useful broken down)
  const skipPhases = { skipGamePhases: true };

  if (classical.length > 0) {
    console.log('    → Processing classical games...');
    byTimeControl.classical = generateStatsForGames(classical, skipPhases);
  }
  if (rapidTier1.length > 0) {
    console.log('    → Processing rapid tier 1 games...');
    byTimeControl.rapidTier1 = generateStatsForGames(rapidTier1, skipPhases);
  }
  if (rapidTier2.length > 0) {
    console.log('    → Processing rapid tier 2 games...');
    byTimeControl.rapidTier2 = generateStatsForGames(rapidTier2, skipPhases);
  }
  if (blitzTier1.length > 0) {
    console.log('    → Processing blitz tier 1 games...');
    byTimeControl.blitzTier1 = generateStatsForGames(blitzTier1, skipPhases);
  }
  if (blitzTier2.length > 0) {
    console.log('    → Processing blitz tier 2 games...');
    byTimeControl.blitzTier2 = generateStatsForGames(blitzTier2, skipPhases);
  }

  console.log('    ✓ Time control statistics complete');

  // FIDE-specific statistics
  console.log('\n  Calculating FIDE-specific statistics...');
  const matchStats = calculateMatchStats(enrichedData.matches);
  const ratingAnalysis = calculateRatingAnalysis(enrichedData.matches);
  const fideFunAwards = calculateFideFunAwards(enrichedData.matches, ratingAnalysis);
  console.log('    ✓ FIDE-specific statistics complete');

  // Fun Stats (chess-based awards)
  console.log('\n  Calculating Fun Stats...');
  const funStats = calculateFunStats(allGames);
  console.log('    ✓ Fun Stats complete');

  // Time Awards (time-based awards)
  console.log('\n  Calculating Time Awards...');
  const timeAwards = calculateTimeAwards(allGames);
  console.log('    ✓ Time Awards complete');

  // Stockfish Analysis (optional, if --analyze flag is set)
  let analysis = null;
  if (options.analyze) {
    analysis = runStockfishAnalysis(allGames, options.depth || 15, options.sample || 1);
  }

  // Compile final output
  const statsOutput = {
    // Metadata
    roundNumber: roundNum,
    roundName: enrichedData.roundName || `Round ${roundNum}`,
    generatedAt: new Date().toISOString(),

    // Match-level stats (FIDE-specific)
    matchStats,

    // Overall stats (all games combined)
    ...overallStats,

    // Time control breakdown
    byTimeControl,

    // Rating analysis (FIDE-specific)
    ratingAnalysis,

    // FIDE fun awards
    fideFunAwards,

    // Fun Stats (chess-based awards)
    funStats,

    // Time Awards (time-based awards)
    timeAwards,

    // Stockfish Analysis (optional)
    analysis,

    // Raw data info
    dataInfo: {
      totalMatches: enrichedData.totalMatches,
      totalGames: enrichedData.totalGames,
      openingCoverage: enrichedData.openingStats?.coverageRate || 0,
    },
  };

  // Write output
  const outputDir = path.join(process.cwd(), 'public', 'stats');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const outputPath = path.join(outputDir, `round-${roundNum}-stats.json`);
  fs.writeFileSync(outputPath, JSON.stringify(statsOutput, null, 2));

  const sizeKB = (fs.statSync(outputPath).size / 1024).toFixed(1);
  console.log(`\n✓ Statistics generated: ${outputPath}`);
  console.log(`  File size: ${sizeKB} KB`);
  console.log(`  Matches: ${matchStats.totalMatches}`);
  console.log(`  Games: ${overallStats.overview.totalGames}`);
  console.log(`  Unique openings: ${overallStats.openings.totalUnique}`);
  console.log(`  Opening coverage: ${overallStats.openings.coverage}%`);
}

/**
 * Main execution
 */
function main() {
  const args = process.argv.slice(2);
  const roundArg = args.find((arg) => arg.startsWith('--round='));
  const analyzeFlag = args.includes('--analyze');
  const depthArg = args.find((arg) => arg.startsWith('--depth='));
  const sampleArg = args.find((arg) => arg.startsWith('--sample='));

  const options = {
    analyze: analyzeFlag,
    depth: depthArg ? parseInt(depthArg.split('=')[1]) : 15,
    sample: sampleArg ? parseInt(sampleArg.split('=')[1]) : 1
  };

  if (roundArg) {
    const roundNum = parseInt(roundArg.split('=')[1]);
    if (isNaN(roundNum)) {
      console.error('❌ Invalid round number');
      process.exit(1);
    }
    generateStatsForRound(roundNum, options);
  } else {
    // Generate for all available rounds
    const enrichedDir = path.join(process.cwd(), 'data', 'enriched');
    if (!fs.existsSync(enrichedDir)) {
      console.error('❌ Enriched data directory not found');
      console.error('   Run Stage 3 (opening enrichment) first!');
      process.exit(1);
    }

    const files = fs.readdirSync(enrichedDir).filter((f) => f.endsWith('-enriched.json'));
    const rounds = files
      .map((f) => {
        const match = f.match(/round-(\d+)-enriched\.json/);
        return match ? parseInt(match[1]) : null;
      })
      .filter((r) => r !== null)
      .sort((a, b) => a - b);

    if (rounds.length === 0) {
      console.error('❌ No enriched data found');
      console.error('   Run Stage 3 (opening enrichment) first!');
      process.exit(1);
    }

    console.log(`Found ${rounds.length} round(s) to process: ${rounds.join(', ')}`);
    if (options.analyze) {
      console.log(`⚙️  Stockfish analysis enabled (depth: ${options.depth}, sample: every ${options.sample} move)`);
    }
    rounds.forEach((round) => generateStatsForRound(round, options));
  }

  console.log('\n✅ Statistics generation complete!\n');
}

main();
