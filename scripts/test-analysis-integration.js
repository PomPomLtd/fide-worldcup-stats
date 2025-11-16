/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Test Stockfish Analysis Integration
 *
 * Creates a mini enriched dataset with just 2 games and runs full stats generation with analysis.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function main() {
  console.log('Testing Stockfish Analysis Integration');
  console.log('='.repeat(60));

  // Read Round 1 enriched data
  const enrichedPath = path.join(__dirname, '..', 'data', 'enriched', 'round-1-enriched.json');
  const data = JSON.parse(fs.readFileSync(enrichedPath, 'utf8'));

  // Extract first 2 games
  const firstMatch = data.matches[0];
  const firstTimeControl = Object.keys(firstMatch.gamesByTimeControl)[0];
  const twoGames = firstMatch.gamesByTimeControl[firstTimeControl].slice(0, 2);

  // Create mini dataset
  const miniData = {
    ...data,
    matches: [{
      ...firstMatch,
      gamesByTimeControl: {
        [firstTimeControl]: twoGames
      },
      gameDetails: twoGames,
      totalGames: 2
    }],
    totalMatches: 1,
    totalGames: 2
  };

  // Write temp enriched file (use round 99 for testing)
  const tempPath = path.join(__dirname, '..', 'data', 'enriched', 'round-99-enriched.json');
  fs.writeFileSync(tempPath, JSON.stringify(miniData, null, 2));

  console.log(`✓ Created test dataset with 2 games`);
  console.log(`  ${twoGames[0].white} vs ${twoGames[0].black}`);
  console.log(`  ${twoGames[1].white} vs ${twoGames[1].black}\n`);

  // Run stats generation with analysis
  console.log('Running stats generation with Stockfish analysis...\n');

  try {
    execSync(
      'node scripts/generate-stats.js --round=99 --analyze --depth=10 --sample=1',
      {
        stdio: 'inherit',
        cwd: path.join(__dirname, '..')
      }
    );

    console.log('\n✅ Test successful!');
    console.log('\nCheck the output:');
    console.log('  public/stats/round-99-stats.json\n');

    // Show a preview of the analysis data
    const statsPath = path.join(__dirname, '..', 'public', 'stats', 'round-99-stats.json');
    if (fs.existsSync(statsPath)) {
      const stats = JSON.parse(fs.readFileSync(statsPath, 'utf8'));

      if (stats.analysis && stats.analysis.summary) {
        console.log('Analysis Summary:');
        if (stats.analysis.summary.accuracyKing) {
          console.log(`  👑 Accuracy King: ${stats.analysis.summary.accuracyKing.player} (${stats.analysis.summary.accuracyKing.accuracy.toFixed(1)}%)`);
        }
        if (stats.analysis.summary.biggestBlunder) {
          console.log(`  💥 Biggest Blunder: ${stats.analysis.summary.biggestBlunder.player} - ${stats.analysis.summary.biggestBlunder.move}`);
        }
      }
    }

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    process.exit(1);
  } finally {
    // Cleanup
    if (fs.existsSync(tempPath)) {
      fs.unlinkSync(tempPath);
    }
    const testStatsPath = path.join(__dirname, '..', 'public', 'stats', 'round-99-stats.json');
    if (fs.existsSync(testStatsPath)) {
      fs.unlinkSync(testStatsPath);
    }
  }
}

main();
