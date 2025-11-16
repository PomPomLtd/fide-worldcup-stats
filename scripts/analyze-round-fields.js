const fs = require('fs');
const data = JSON.parse(fs.readFileSync('data/consolidated/round-1-matches.json', 'utf-8'));

console.log('='.repeat(70));
console.log('Round Field Pattern Analysis');
console.log('='.repeat(70));
console.log('');

// Group all games by their round number (first part before the dot)
const gamesByRoundNum = new Map();

data.matches.forEach(match => {
  match.gameDetails.forEach(game => {
    const roundNum = game.round ? game.round.split('.')[0] : 'unknown';
    if (!gamesByRoundNum.has(roundNum)) {
      gamesByRoundNum.set(roundNum, 0);
    }
    gamesByRoundNum.set(roundNum, gamesByRoundNum.get(roundNum) + 1);
  });
});

// Sort by round number
const sorted = Array.from(gamesByRoundNum.entries()).sort((a, b) => {
  const numA = parseInt(a[0]);
  const numB = parseInt(b[0]);
  return numA - numB;
});

console.log('Game distribution by Round number:');
console.log('Round # | Count | Inferred Type (Based on Official Structure)');
console.log('-'.repeat(70));

sorted.forEach(([roundNum, count]) => {
  let type = '';
  const num = parseInt(roundNum);
  if (num === 1 || num === 2) type = 'CLASSICAL';
  else if (num === 3 || num === 4) type = 'RAPID Tier 1 (15+10)';
  else if (num === 5 || num === 6) type = 'RAPID Tier 2 (10+10)';
  else if (num === 7 || num === 8) type = 'BLITZ Tier 1 (5+3)';
  else if (num === 9 || num === 10) type = 'BLITZ Tier 2 (3+2)';
  else if (num === 11) type = 'ARMAGEDDON';
  else type = 'UNKNOWN';

  const roundStr = String(roundNum).padEnd(7);
  const countStr = String(count).padStart(5);
  console.log(`  ${roundStr} | ${countStr} | ${type}`);
});

console.log('');
console.log('Total games:', Array.from(gamesByRoundNum.values()).reduce((a,b) => a+b, 0));

// Sample a few matches to verify pattern
console.log('');
console.log('='.repeat(70));
console.log('Sample Match Verification');
console.log('='.repeat(70));

// Find one match with 2 games, one with 4, one with 6, one with 8
const match2 = data.matches.find(m => m.totalGames === 2);
const match4 = data.matches.find(m => m.totalGames === 4);
const match6 = data.matches.find(m => m.totalGames === 6);
const match8 = data.matches.find(m => m.totalGames === 8);

if (match2) {
  console.log('\nMatch with 2 games (classical decision):');
  console.log(`  ${match2.pairingKey}`);
  match2.gameDetails.forEach((g, i) => {
    console.log(`    Game ${i+1}: Round ${g.round}, Result ${g.result}`);
  });
}

if (match4) {
  console.log('\nMatch with 4 games (rapid tier 1 decision):');
  console.log(`  ${match4.pairingKey}`);
  match4.gameDetails.forEach((g, i) => {
    console.log(`    Game ${i+1}: Round ${g.round}, Result ${g.result}`);
  });
}

if (match6) {
  console.log('\nMatch with 6 games (rapid tier 2 decision):');
  console.log(`  ${match6.pairingKey}`);
  match6.gameDetails.forEach((g, i) => {
    console.log(`    Game ${i+1}: Round ${g.round}, Result ${g.result}`);
  });
}

if (match8) {
  console.log('\nMatch with 8 games (blitz tier 1 decision):');
  console.log(`  ${match8.pairingKey}`);
  match8.gameDetails.forEach((g, i) => {
    console.log(`    Game ${i+1}: Round ${g.round}, Result ${g.result}`);
  });
}
