/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Test Stockfish Analysis
 *
 * Extracts 2 sample games and runs Stockfish analysis to verify setup.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Extract first 2 games from Round 1 enriched data
function extractSampleGames() {
  const enrichedFile = path.join(__dirname, '..', 'data', 'enriched', 'round-1-enriched.json');
  const data = JSON.parse(fs.readFileSync(enrichedFile, 'utf8'));

  // Flatten all games from all matches
  const allGames = [];
  for (const match of data.matches) {
    for (const timeControl of Object.keys(match.gamesByTimeControl)) {
      const games = match.gamesByTimeControl[timeControl];
      for (const game of games) {
        if (game.pgn && game.pgn.length > 0) {
          allGames.push(game);
        }
      }
    }
  }

  // Get first 2 games
  const sampleGames = allGames.slice(0, 2);

  console.log(`Found ${sampleGames.length} sample games:`);
  sampleGames.forEach((g, i) => {
    console.log(`  ${i + 1}. ${g.white} vs ${g.black}`);
  });

  // Extract PGN strings
  const pgnData = sampleGames.map(g => g.pgn).join('\n\n');

  return pgnData;
}

// Run Stockfish analysis
function runAnalysis(pgnData, depth = 10) {
  console.log('\n🔍 Running Stockfish analysis...');
  console.log(`   Depth: ${depth}`);
  console.log(`   This will take ~2-3 minutes for 2 games\n`);

  const startTime = Date.now();

  // Use venv's Python
  const pythonPath = path.join(__dirname, '..', 'venv', 'bin', 'python3');

  try {
    const output = execSync(
      `${pythonPath} scripts/analyze-pgn.py --depth ${depth}`,
      {
        input: pgnData,
        encoding: 'utf8',
        maxBuffer: 10 * 1024 * 1024,
        cwd: path.join(__dirname, '..'),
        stdio: ['pipe', 'pipe', 'inherit'] // Show progress on stderr
      }
    );

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`\n✅ Analysis complete in ${elapsed}s`);

    const results = JSON.parse(output);
    return results;

  } catch (error) {
    console.error('❌ Analysis failed:', error.message);
    throw error;
  }
}

// Display results
function displayResults(results) {
  console.log('\n' + '='.repeat(60));
  console.log('STOCKFISH ANALYSIS RESULTS');
  console.log('='.repeat(60));

  results.games.forEach((game, i) => {
    console.log(`\nGame ${i + 1}: ${game.white} vs ${game.black}`);
    console.log('-'.repeat(60));
    console.log(`White: ${game.whiteAccuracy.toFixed(1)}% accuracy, ${game.whiteACPL} ACPL`);
    console.log(`       Blunders: ${game.whiteMoveQuality.blunders}, Mistakes: ${game.whiteMoveQuality.mistakes}, Inaccuracies: ${game.whiteMoveQuality.inaccuracies}`);
    console.log(`Black: ${game.blackAccuracy.toFixed(1)}% accuracy, ${game.blackACPL} ACPL`);
    console.log(`       Blunders: ${game.blackMoveQuality.blunders}, Mistakes: ${game.blackMoveQuality.mistakes}, Inaccuracies: ${game.blackMoveQuality.inaccuracies}`);

    if (game.biggestBlunder) {
      console.log(`\nBiggest Blunder: ${game.biggestBlunder.player} on move ${game.biggestBlunder.moveNumber}`);
      console.log(`                 Move: ${game.biggestBlunder.move}`);
      console.log(`                 CP Loss: ${game.biggestBlunder.cpLoss}`);
    }
  });

  console.log('\n' + '='.repeat(60));
  console.log('SUMMARY AWARDS');
  console.log('='.repeat(60));

  if (results.summary.accuracyKing) {
    const king = results.summary.accuracyKing;
    console.log(`\n👑 Accuracy King: ${king.player}`);
    console.log(`   Accuracy: ${king.accuracy.toFixed(1)}%`);
    console.log(`   ACPL: ${king.acpl}`);
  }

  if (results.summary.biggestBlunder) {
    const blunder = results.summary.biggestBlunder;
    console.log(`\n💥 Biggest Blunder: ${blunder.player}`);
    console.log(`   Move: ${blunder.move} (move ${blunder.moveNumber})`);
    console.log(`   CP Loss: ${blunder.cpLoss}`);
  }

  console.log('\n');
}

// Main
async function main() {
  console.log('Stockfish Analysis Test');
  console.log('='.repeat(60));

  // Check dependencies
  const missing = [];
  const pythonPath = path.join(__dirname, '..', 'venv', 'bin', 'python3');

  try {
    execSync('which stockfish', { stdio: 'ignore' });
    console.log('✅ Stockfish binary found');
  } catch (error) {
    missing.push('Stockfish binary: brew install stockfish');
  }

  // Check venv exists
  if (!fs.existsSync(pythonPath)) {
    missing.push('Virtual environment: python3 -m venv venv');
  } else {
    console.log('✅ Virtual environment found');
  }

  try {
    execSync(`${pythonPath} -c "import chess"`, { stdio: 'ignore' });
    console.log('✅ python-chess installed');
  } catch (error) {
    missing.push('python-chess: source venv/bin/activate && pip install python-chess');
  }

  try {
    execSync(`${pythonPath} -c "import stockfish"`, { stdio: 'ignore' });
    console.log('✅ stockfish Python package installed\n');
  } catch (error) {
    missing.push('stockfish package: source venv/bin/activate && pip install stockfish');
  }

  if (missing.length > 0) {
    console.error('\n❌ Missing dependencies:');
    missing.forEach(dep => console.error(`   ${dep}`));
    console.error('\nInstall all at once:');
    console.error('   brew install stockfish');
    console.error('   python3 -m venv venv');
    console.error('   source venv/bin/activate && pip install python-chess stockfish\n');
    process.exit(1);
  }

  // Extract sample games
  const pgnData = extractSampleGames();

  // Run analysis (depth 10 for faster testing)
  const results = runAnalysis(pgnData, 10);

  // Display results
  displayResults(results);

  // Save results
  const outputFile = path.join(__dirname, '..', 'test-analysis-results.json');
  fs.writeFileSync(outputFile, JSON.stringify(results, null, 2));
  console.log(`📁 Full results saved to: test-analysis-results.json`);
}

main().catch(error => {
  console.error('Error:', error);
  process.exit(1);
});
