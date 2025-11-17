#!/usr/bin/env node

/**
 * classify-games.js
 *
 * FIDE World Cup 2025 - Stage 2: Game Classification
 *
 * This script reads consolidated match data and enriches it with:
 * 1. Time control classification for each game (CLASSICAL, RAPID, BLITZ, ARMAGEDDON)
 * 2. Match outcome analysis (winner, advancing player, tiebreak type)
 * 3. Game-by-game score progression
 *
 * Input:  data/consolidated/round-N-matches.json
 * Output: data/classified/round-N-classified.json
 *
 * Usage:
 *   node scripts/classify-games.js [--round=N]
 *   node scripts/classify-games.js --round=1  # Classify only Round 1
 *   node scripts/classify-games.js            # Classify all rounds
 */

const fs = require('fs');
const path = require('path');
const { classifyByGameNumber, classifyByRoundField, getTimeControlLabel } = require('./utils/time-control-classifier');

// Configuration
const CONSOLIDATED_DIR = path.join(__dirname, '../data/consolidated');
const OUTPUT_DIR = path.join(__dirname, '../data/classified');

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
 * Calculate score from a PGN result string
 * @param {string} result - PGN result (e.g., '1-0', '0-1', '1/2-1/2', '*')
 * @param {string} color - 'white' or 'black'
 * @returns {number} Score (1 for win, 0.5 for draw, 0 for loss, null for ongoing)
 */
function getScoreForColor(result, color) {
  if (!result || result === '*') {
    return null; // Game ongoing or unknown
  }

  if (result === '1/2-1/2') {
    return 0.5; // Draw
  }

  if (result === '1-0') {
    return color === 'white' ? 1 : 0;
  }

  if (result === '0-1') {
    return color === 'black' ? 1 : 0;
  }

  return null; // Unknown result format
}

/**
 * Analyze a match to determine winner and tiebreak type
 * @param {Object} match - Match object with gameDetails
 * @returns {Object} Match outcome with winner, tiebreakType, scores
 */
function analyzeMatchOutcome(match) {
  const { players, gameDetails } = match;

  if (!gameDetails || gameDetails.length === 0) {
    return {
      winner: null,
      advancingPlayer: null,
      tiebreakType: null,
      scores: { [players[0].name]: 0, [players[1].name]: 0 },
      error: 'No game details available',
    };
  }

  // Initialize scores for each player
  const scores = {
    [players[0].name]: 0,
    [players[1].name]: 0,
  };

  let tiebreakType = null;
  let lastClassification = null;

  // Calculate cumulative scores
  for (const game of gameDetails) {
    const classification = classifyByRoundField(game.round);
    lastClassification = classification;

    const whiteScore = getScoreForColor(game.result, 'white');
    const blackScore = getScoreForColor(game.result, 'black');

    if (whiteScore !== null) {
      scores[game.white] = (scores[game.white] || 0) + whiteScore;
    }
    if (blackScore !== null) {
      scores[game.black] = (scores[game.black] || 0) + blackScore;
    }
  }

  // Determine winner (player with higher score)
  const [player1, player2] = players.map(p => p.name);
  const score1 = scores[player1] || 0;
  const score2 = scores[player2] || 0;

  let winner = null;
  let advancingPlayer = null;

  if (score1 > score2) {
    winner = player1;
    advancingPlayer = player1;
  } else if (score2 > score1) {
    winner = player2;
    advancingPlayer = player2;
  }

  // Determine tiebreak type based on when match was decided
  // Find at which game the match was actually decided
  let decisiveGameIndex = -1;
  let runningScores = { [player1]: 0, [player2]: 0 };

  for (let i = 0; i < gameDetails.length; i++) {
    const game = gameDetails[i];
    const whiteScore = getScoreForColor(game.result, 'white');
    const blackScore = getScoreForColor(game.result, 'black');

    if (whiteScore !== null) {
      runningScores[game.white] = (runningScores[game.white] || 0) + whiteScore;
    }
    if (blackScore !== null) {
      runningScores[game.black] = (runningScores[game.black] || 0) + blackScore;
    }

    // Check if match is decided (one player has more points than opponent can catch)
    const gamesLeft = gameDetails.length - (i + 1);
    const score1 = runningScores[player1] || 0;
    const score2 = runningScores[player2] || 0;
    const leadNeeded = gamesLeft; // Maximum points opponent can still score

    if (Math.abs(score1 - score2) > leadNeeded) {
      decisiveGameIndex = i;
      break;
    }
  }

  // If match went to the end without being mathematically decided earlier
  if (decisiveGameIndex === -1 && winner) {
    decisiveGameIndex = gameDetails.length - 1;
  }

  // Set tiebreak type based on the decisive game
  if (decisiveGameIndex >= 0) {
    const decisiveGame = gameDetails[decisiveGameIndex];
    const decisiveClassification = classifyByRoundField(decisiveGame.round);

    if (decisiveClassification) {
      if (decisiveClassification.type === 'CLASSICAL') {
        tiebreakType = 'CLASSICAL';
      } else if (decisiveClassification.type === 'RAPID') {
        tiebreakType = `RAPID_TIER_${decisiveClassification.tier}`;
      } else if (decisiveClassification.type === 'BLITZ') {
        tiebreakType = `BLITZ_TIER_${decisiveClassification.tier}`;
      } else if (decisiveClassification.type === 'ARMAGEDDON') {
        tiebreakType = 'ARMAGEDDON';
      }
    }
  }

  return {
    winner,
    advancingPlayer,
    tiebreakType,
    scores,
    totalGames: gameDetails.length,
    finalScore: winner ? `${Math.max(score1, score2)}-${Math.min(score1, score2)}` : 'Tied',
  };
}

/**
 * Classify and enrich a single match
 * @param {Object} match - Match object from consolidated data
 * @returns {Object} Enriched match with classifications and outcome
 */
function classifyMatch(match) {
  // Classify each game using position in match (1-indexed)
  const classifiedGames = match.gameDetails.map((game, index) => {
    // Use game position within match (1, 2, 3...) not PGN Round field
    const gameNumberInMatch = index + 1;
    const classification = classifyByGameNumber(gameNumberInMatch);
    return {
      ...game,
      gameNumberInMatch,
      classification,
      timeControlLabel: getTimeControlLabel(classification),
    };
  });

  // Group games by time control type
  const gamesByTimeControl = {};
  classifiedGames.forEach(game => {
    const { type } = game.classification;
    if (!gamesByTimeControl[type]) {
      gamesByTimeControl[type] = [];
    }
    gamesByTimeControl[type].push(game);
  });

  // Analyze match outcome
  const outcome = analyzeMatchOutcome(match);

  return {
    ...match,
    gameDetails: classifiedGames,
    gamesByTimeControl,
    outcome,
    timeControlSummary: {
      classical: gamesByTimeControl['CLASSICAL']?.length || 0,
      rapidTier1: gamesByTimeControl['RAPID']?.filter(g => g.classification.tier === 1).length || 0,
      rapidTier2: gamesByTimeControl['RAPID']?.filter(g => g.classification.tier === 2).length || 0,
      blitzTier1: gamesByTimeControl['BLITZ']?.filter(g => g.classification.tier === 1).length || 0,
      blitzTier2: gamesByTimeControl['BLITZ']?.filter(g => g.classification.tier === 2).length || 0,
      armageddon: gamesByTimeControl['ARMAGEDDON']?.length || 0,
    },
  };
}

/**
 * Process a single round's consolidated data
 * @param {number} roundNum - Round number
 * @returns {Object} Classified round data
 */
function processRound(roundNum) {
  console.log(`\n🔄 Classifying Round ${roundNum}...`);

  const inputPath = path.join(CONSOLIDATED_DIR, `round-${roundNum}-matches.json`);

  if (!fs.existsSync(inputPath)) {
    console.error(`❌ Consolidated data not found: ${inputPath}`);
    console.error(`   Run: node scripts/consolidate-pgns.js --round=${roundNum}`);
    return null;
  }

  // Read consolidated data
  const consolidatedData = JSON.parse(fs.readFileSync(inputPath, 'utf-8'));
  console.log(`   ✅ Loaded ${consolidatedData.totalMatches} matches`);

  // Classify each match
  console.log(`   🔍 Classifying games and analyzing outcomes...`);
  const classifiedMatches = consolidatedData.matches.map(classifyMatch);

  // Generate summary statistics
  const summary = {
    totalMatches: classifiedMatches.length,
    totalGames: classifiedMatches.reduce((sum, m) => sum + m.totalGames, 0),
    decidedInClassical: classifiedMatches.filter(m => m.outcome.tiebreakType === 'CLASSICAL').length,
    decidedInRapid: classifiedMatches.filter(m => m.outcome.tiebreakType?.startsWith('RAPID')).length,
    decidedInBlitz: classifiedMatches.filter(m => m.outcome.tiebreakType?.startsWith('BLITZ')).length,
    decidedInArmageddon: classifiedMatches.filter(m => m.outcome.tiebreakType === 'ARMAGEDDON').length,
    timeControlDistribution: {
      classical: classifiedMatches.reduce((sum, m) => sum + m.timeControlSummary.classical, 0),
      rapidTier1: classifiedMatches.reduce((sum, m) => sum + m.timeControlSummary.rapidTier1, 0),
      rapidTier2: classifiedMatches.reduce((sum, m) => sum + m.timeControlSummary.rapidTier2, 0),
      blitzTier1: classifiedMatches.reduce((sum, m) => sum + m.timeControlSummary.blitzTier1, 0),
      blitzTier2: classifiedMatches.reduce((sum, m) => sum + m.timeControlSummary.blitzTier2, 0),
      armageddon: classifiedMatches.reduce((sum, m) => sum + m.timeControlSummary.armageddon, 0),
    },
  };

  console.log(`\n   📊 Classification Summary:`);
  console.log(`      Matches decided in classical:  ${summary.decidedInClassical}`);
  console.log(`      Matches decided in rapid:      ${summary.decidedInRapid}`);
  console.log(`      Matches decided in blitz:      ${summary.decidedInBlitz}`);
  console.log(`      Matches decided in armageddon: ${summary.decidedInArmageddon}`);

  // Create classified data structure
  const classifiedData = {
    ...consolidatedData,
    matches: classifiedMatches,
    summary,
    classifiedAt: new Date().toISOString(),
  };

  return classifiedData;
}

/**
 * Main execution
 */
function main() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  FIDE World Cup 2025 - Game Classification (Stage 2)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  const options = parseArgs();

  // Process specific round or all rounds
  if (options.round !== null) {
    const classifiedData = processRound(options.round);

    if (classifiedData) {
      const outputPath = path.join(OUTPUT_DIR, `round-${options.round}-classified.json`);
      fs.writeFileSync(outputPath, JSON.stringify(classifiedData, null, 2), 'utf-8');

      console.log(`\n✅ Round ${options.round} classification complete:`);
      console.log(`   Output: ${outputPath}`);
    }
  } else {
    // Detect all available consolidated files
    if (!fs.existsSync(CONSOLIDATED_DIR)) {
      console.error(`❌ Consolidated directory not found: ${CONSOLIDATED_DIR}`);
      console.error(`   Run: node scripts/consolidate-pgns.js`);
      process.exit(1);
    }

    const files = fs.readdirSync(CONSOLIDATED_DIR);
    const roundNumbers = new Set();

    for (const file of files) {
      const match = file.match(/^round-(\d+)-matches\.json$/);
      if (match) {
        roundNumbers.add(parseInt(match[1], 10));
      }
    }

    const rounds = Array.from(roundNumbers).sort((a, b) => a - b);

    console.log(`\n📂 Found ${rounds.length} consolidated rounds: ${rounds.join(', ')}`);

    for (const roundNum of rounds) {
      const classifiedData = processRound(roundNum);

      if (classifiedData) {
        const outputPath = path.join(OUTPUT_DIR, `round-${roundNum}-classified.json`);
        fs.writeFileSync(outputPath, JSON.stringify(classifiedData, null, 2), 'utf-8');

        console.log(`\n✅ Round ${roundNum} classification complete:`);
        console.log(`   Output: ${outputPath}`);
      }
    }
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  ✅ Classification complete!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { classifyMatch, analyzeMatchOutcome };
