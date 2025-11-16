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
const { Chess } = require('chess.js');

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
 * Normalize PGN for chess.js parsing
 * Removes annotations and FIDE-specific headers that cause parsing issues
 * @param {string} pgnString - Raw PGN string
 * @returns {string} Normalized PGN
 */
function normalizePGN(pgnString) {
  // Remove [ePGN "..."] header (not standard, causes issues)
  let normalized = pgnString.replace(/^\[ePGN\s+"[^"]*"\]\n?/gm, '');

  // Remove all brace comments (clock times, move times, etc.)
  // Format: {[%clk 01:30:54]} {[%emt 00:00:05]}
  // Use character-by-character parsing to handle nested braces
  let result = '';
  let braceDepth = 0;
  let inHeader = false;

  for (let i = 0; i < normalized.length; i++) {
    const char = normalized[i];

    // Track when we're inside PGN headers (don't strip braces from headers)
    if (char === '[' && braceDepth === 0) {
      inHeader = true;
      result += char;
    } else if (char === ']' && inHeader && braceDepth === 0) {
      inHeader = false;
      result += char;
    } else if (inHeader) {
      // Inside header - keep everything
      result += char;
    } else if (char === '{') {
      // Start of brace comment
      braceDepth++;
    } else if (char === '}' && braceDepth > 0) {
      // End of brace comment
      braceDepth--;
    } else if (braceDepth === 0) {
      // Not in comment - keep the character
      result += char;
    }
  }

  normalized = result;

  // Ensure blank line between headers and moves
  const lines = normalized.split('\n');
  const finalResult = [];
  let lastHeaderIndex = -1;

  for (let i = 0; i < lines.length; i++) {
    if (lines[i].match(/^\[[\w]+\s+"[^"]*"\]/)) {
      lastHeaderIndex = i;
    }
  }

  for (let i = 0; i < lines.length; i++) {
    finalResult.push(lines[i]);
    if (i === lastHeaderIndex && i + 1 < lines.length) {
      const nextLine = lines[i + 1].trim();
      if (nextLine.match(/^1\.\s/)) {
        finalResult.push(''); // Add blank line
      }
    }
  }

  return finalResult.join('\n');
}

/**
 * Parse a single game's headers, moves, and timing data
 * @param {string} gamePGN - Single game PGN string
 * @returns {Object} Game metadata with move data
 */
function parseGameMetadata(gamePGN) {
  const headers = extractPGNHeaders(gamePGN);
  const chess = new Chess();

  let moveList = [];
  let moves = '';
  let moveCount = 0;
  let pgn = '';

  try {
    // Normalize and load PGN into chess.js
    const normalizedPGN = normalizePGN(gamePGN);
    chess.loadPgn(normalizedPGN);

    // Get move history (verbose for detailed info)
    const verboseMoves = chess.history({ verbose: true });
    moveCount = verboseMoves.length;

    // Get clean move sequence for opening matching
    // Format: "e4 e5 Nf3 Nc6 Bb5 a6" (space-separated SAN)
    moves = verboseMoves.map(m => m.san).join(' ');

    // Create lightweight moveList (only fields we actually use)
    // Note: 'from' field added for fun-stats calculators
    moveList = verboseMoves.map(m => ({
      piece: m.piece,
      captured: m.captured,
      promotion: m.promotion,
      flags: m.flags,
      san: m.san,
      from: m.from,
      to: m.to,
      color: m.color,
    }));

    // Get normalized PGN from chess.js (clean, no annotations)
    pgn = chess.pgn();

  } catch (error) {
    // If parsing fails, log warning but continue with partial data
    console.warn(`   ⚠️  Move parsing failed for ${headers.White} vs ${headers.Black}: ${error.message}`);
  }

  return {
    // Player info
    white: headers.White || 'Unknown',
    black: headers.Black || 'Unknown',
    whiteFideId: headers.WhiteFideId || null,
    blackFideId: headers.BlackFideId || null,
    whiteElo: headers.WhiteElo ? parseInt(headers.WhiteElo, 10) : null,
    blackElo: headers.BlackElo ? parseInt(headers.BlackElo, 10) : null,

    // Game outcome
    result: headers.Result || '*',
    date: headers.Date || null,
    round: headers.Round || null,
    timeControl: headers.TimeControl || null,
    site: headers.Site || 'Goa, India',

    // NEW: Move data
    moves,                // Clean move sequence for opening matching
    moveCount,            // Number of moves
    moveList,             // Full verbose move history from chess.js

    // NEW: PGN data
    pgn,                  // Normalized PGN from chess.js
    rawPgn: gamePGN.trim(), // Original PGN with clock times for time analysis
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
        // Player info
        white: g.white,
        black: g.black,
        result: g.result,
        date: g.date,
        round: g.round,
        timeControl: g.timeControl,

        // NEW: Move data
        moves: g.moves || '',
        moveCount: g.moveCount || 0,
        moveList: g.moveList || [],

        // NEW: PGN data (includes timing annotations)
        pgn: g.pgn || '',
        rawPgn: g.rawPgn || '',
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
