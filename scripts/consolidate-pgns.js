#!/usr/bin/env node

/**
 * consolidate-pgns.js
 *
 * FIDE World Cup 2025 - Stage 1: PGN Consolidation
 *
 * This script scans the _SRC/cup2025/ directory, parses all PGN files for a round,
 * and groups games by player pairings to identify true matches.
 *
 * Key insight: Directory structure (round1game1, etc.) does NOT represent individual matches.
 * Each directory contains games from multiple pairings. We must group by player pairs.
 *
 * Output: data/consolidated/round-N-matches.json files
 *
 * Usage:
 *   node scripts/consolidate-pgns.js [--round=N]
 *   node scripts/consolidate-pgns.js --round=1  # Process only Round 1
 *   node scripts/consolidate-pgns.js            # Process all rounds
 */

const fs = require('fs');
const path = require('path');

// Configuration
const SOURCE_DIR = path.join(__dirname, '../_SRC/cup2025');
const OUTPUT_DIR = path.join(__dirname, '../data/consolidated');

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
 * Extract headers from PGN content using regex
 * @param {string} pgnContent - Raw PGN file content
 * @returns {Object} Extracted headers
 */
function extractPGNHeaders(pgnContent) {
  const headers = {};
  const headerPattern = /^\[(\w+)\s+"([^"]*)"\]/gm;
  let match;
  let headerCount = 0;

  while ((match = headerPattern.exec(pgnContent)) !== null) {
    const [, key, value] = match;
    headers[key] = value;
    headerCount++;

    // Continue collecting headers for first game (usually 10-15 headers)
    if (headerCount > 20) {
      break;
    }
  }

  return headers;
}

/**
 * Split multi-game PGN into individual games
 * @param {string} pgnContent - Multi-game PGN content
 * @returns {Array<string>} Array of individual game PGN strings
 */
function splitPGNGames(pgnContent) {
  // Split on [Event header (start of each game)
  const games = [];
  const gamePattern = /\[Event "[^"]*"\]/g;
  let matches = [];
  let match;

  while ((match = gamePattern.exec(pgnContent)) !== null) {
    matches.push(match.index);
  }

  for (let i = 0; i < matches.length; i++) {
    const start = matches[i];
    const end = i < matches.length - 1 ? matches[i + 1] : pgnContent.length;
    games.push(pgnContent.slice(start, end).trim());
  }

  return games;
}

/**
 * Parse a single game's headers and basic info
 * @param {string} gamePGN - Single game PGN string
 * @returns {Object} Game metadata
 */
function parseGameMetadata(gamePGN) {
  const headers = extractPGNHeaders(gamePGN);

  return {
    white: headers.White || 'Unknown',
    black: headers.Black || 'Unknown',
    whiteFideId: headers.WhiteFideId || null,
    blackFideId: headers.BlackFideId || null,
    whiteElo: headers.WhiteElo ? parseInt(headers.WhiteElo, 10) : null,
    blackElo: headers.BlackElo ? parseInt(headers.BlackElo, 10) : null,
    result: headers.Result || '*',
    date: headers.Date || null,
    round: headers.Round || null,
    timeControl: headers.TimeControl || null,
    site: headers.Site || 'Goa, India',
  };
}

/**
 * Create a normalized pairing key from two player names
 * @param {string} player1 - First player name
 * @param {string} player2 - Second player name
 * @returns {string} Normalized pairing key (sorted alphabetically)
 */
function createPairingKey(player1, player2) {
  return [player1, player2].sort().join(' vs ');
}

/**
 * Scan _SRC/cup2025/ directory and find all match directories for a round
 * @param {number} roundNum - Round number
 * @returns {Array<string>} Array of directory names for this round
 */
function getDirectoriesForRound(roundNum) {
  if (!fs.existsSync(SOURCE_DIR)) {
    console.error(`❌ Error: Source directory not found: ${SOURCE_DIR}`);
    process.exit(1);
  }

  const entries = fs.readdirSync(SOURCE_DIR);
  const matchDirPattern = new RegExp(`^round${roundNum}game(\\d+)$`);
  const dirs = [];

  for (const entry of entries) {
    const match = entry.match(matchDirPattern);
    if (match) {
      dirs.push(entry);
    }
  }

  return dirs.sort();
}

/**
 * Process all games for a round and group by player pairings
 * @param {number} roundNum - Round number
 * @returns {Object} Round data with matches grouped by pairing
 */
function processRound(roundNum) {
  console.log(`\n🔄 Processing Round ${roundNum}...`);

  const dirs = getDirectoriesForRound(roundNum);

  if (dirs.length === 0) {
    console.error(`❌ No directories found for Round ${roundNum}`);
    return null;
  }

  console.log(`   Found ${dirs.length} game directories`);

  // Collect all games from all directories
  const allGames = [];
  let totalGamesRead = 0;

  for (const dir of dirs) {
    const pgnPath = path.join(SOURCE_DIR, dir, 'games.pgn');

    if (!fs.existsSync(pgnPath)) {
      console.warn(`   ⚠️  PGN not found: ${pgnPath}`);
      continue;
    }

    const pgnContent = fs.readFileSync(pgnPath, 'utf-8');
    const games = splitPGNGames(pgnContent);

    console.log(`   📂 ${dir}: ${games.length} games`);

    for (const gamePGN of games) {
      const metadata = parseGameMetadata(gamePGN);
      metadata.sourcePath = `_SRC/cup2025/${dir}/games.pgn`;
      allGames.push(metadata);
      totalGamesRead++;
    }
  }

  console.log(`\n   ✅ Total games read: ${totalGamesRead}`);

  // Group games by player pairings
  console.log(`\n   🔗 Grouping games by player pairings...`);

  const pairings = new Map();

  for (const game of allGames) {
    const pairingKey = createPairingKey(game.white, game.black);

    if (!pairings.has(pairingKey)) {
      pairings.set(pairingKey, {
        players: [game.white, game.black].sort(),
        fideIds: [],
        elos: [],
        games: [],
      });
    }

    const pairing = pairings.get(pairingKey);
    pairing.games.push(game);

    // Store FIDE IDs and Elos (from first occurrence)
    if (pairing.fideIds.length === 0) {
      pairing.fideIds = [
        game.white === pairing.players[0] ? game.whiteFideId : game.blackFideId,
        game.white === pairing.players[0] ? game.blackFideId : game.whiteFideId,
      ];
      pairing.elos = [
        game.white === pairing.players[0] ? game.whiteElo : game.blackElo,
        game.white === pairing.players[0] ? game.blackElo : game.whiteElo,
      ];
    }
  }

  console.log(`   ✅ Found ${pairings.size} unique pairings (matches)`);

  // Convert pairings to match objects
  const matches = [];
  let matchNumber = 1;

  for (const [pairingKey, pairing] of pairings.entries()) {
    const match = {
      matchId: `round-${roundNum}-match-${matchNumber}`,
      matchNumber,
      pairingKey,
      players: pairing.players.map((name, idx) => ({
        name,
        fideId: pairing.fideIds[idx],
        elo: pairing.elos[idx],
      })),
      totalGames: pairing.games.length,
      gameDetails: pairing.games.map(g => ({
        white: g.white,
        black: g.black,
        result: g.result,
        date: g.date,
        round: g.round,
        timeControl: g.timeControl,
      })),
      dates: [...new Set(pairing.games.map(g => g.date).filter(d => d))],
      site: pairing.games[0].site,
    };

    matches.push(match);
    matchNumber++;

    console.log(
      `   ✓ Match ${match.matchNumber}: ${pairing.players[0]} vs ${pairing.players[1]} (${match.totalGames} games)`
    );
  }

  // Sort matches by match number
  matches.sort((a, b) => a.matchNumber - b.matchNumber);

  // Create round summary
  const roundData = {
    roundNumber: roundNum,
    roundName: getRoundName(roundNum),
    totalMatches: matches.length,
    totalGames: totalGamesRead,
    matches,
    generatedAt: new Date().toISOString(),
    sourceDirectory: '_SRC/cup2025/',
  };

  return roundData;
}

/**
 * Get human-readable round name
 * @param {number} roundNum - Round number
 * @returns {string} Round name
 */
function getRoundName(roundNum) {
  const names = {
    1: 'Round 1',
    2: 'Round 2',
    3: 'Round 3 (Round of 16)',
    4: 'Round 4 (Quarter-finals)',
    5: 'Round 5 (Semi-finals)',
    6: 'Round 6 (Final)',
  };
  return names[roundNum] || `Round ${roundNum}`;
}

/**
 * Main execution
 */
function main() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  FIDE World Cup 2025 - PGN Consolidation (Stage 1)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  const options = parseArgs();

  // Process specific round or all rounds
  if (options.round !== null) {
    const roundData = processRound(options.round);

    if (roundData) {
      const outputPath = path.join(OUTPUT_DIR, `round-${options.round}-matches.json`);
      fs.writeFileSync(outputPath, JSON.stringify(roundData, null, 2), 'utf-8');

      console.log(`\n✅ Round ${options.round} complete:`);
      console.log(`   Matches: ${roundData.totalMatches}`);
      console.log(`   Total games: ${roundData.totalGames}`);
      console.log(`   Output: ${outputPath}`);
    }
  } else {
    // Detect all available rounds
    const allEntries = fs.readdirSync(SOURCE_DIR);
    const roundNumbers = new Set();

    for (const entry of allEntries) {
      const match = entry.match(/^round(\d+)game\d+$/);
      if (match) {
        roundNumbers.add(parseInt(match[1], 10));
      }
    }

    const rounds = Array.from(roundNumbers).sort((a, b) => a - b);

    console.log(`\n📂 Found ${rounds.length} rounds: ${rounds.join(', ')}`);

    for (const roundNum of rounds) {
      const roundData = processRound(roundNum);

      if (roundData) {
        const outputPath = path.join(OUTPUT_DIR, `round-${roundNum}-matches.json`);
        fs.writeFileSync(outputPath, JSON.stringify(roundData, null, 2), 'utf-8');

        console.log(`\n✅ Round ${roundNum} complete:`);
        console.log(`   Matches: ${roundData.totalMatches}`);
        console.log(`   Total games: ${roundData.totalGames}`);
        console.log(`   Output: ${outputPath}`);
      }
    }
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  ✅ Consolidation complete!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { processRound, createPairingKey, parseGameMetadata };
