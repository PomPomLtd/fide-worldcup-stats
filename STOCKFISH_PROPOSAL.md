# Stockfish Analysis Proposal for FIDE World Cup 2025

**Date:** 2025-11-16
**Status:** PROPOSAL - Ready for Implementation
**Dependencies:** Stockfish engine, python-chess library

---

## Executive Summary

Stockfish analysis adds **objective quality metrics** to complement statistics. We can calculate accuracy, blunders, mistakes, and identify the best/worst moves.

**Proposed:** Integrate Stockfish analysis into the data pipeline, adding 8 quality-based statistics and 4 new awards.

---

## Part 1: What Stockfish Analysis Provides

### Core Metrics (from Lichess4545)

#### 1. **Move Quality Classification**
Based on win percentage loss:
- **Excellent:** < 2% win loss
- **Good:** 2-5% win loss
- **Inaccuracy:** 5-10% win loss
- **Mistake:** 10-20% win loss
- **Blunder:** > 20% win loss

#### 2. **Accuracy Percentage**
Lichess formula: `103.1668 * e^(-0.04354 * avg_win_loss) - 3.1669`
- 100% = perfect play
- 90%+ = strong performance
- 80-90% = good
- 70-80% = average
- < 70% = weak

#### 3. **ACPL (Average Centipawn Loss)**
Traditional metric:
- 0 = perfect
- < 25 = excellent
- 25-50 = good
- 50-100 = average
- > 100 = poor

#### 4. **Move-by-Move Evaluations**
- Eval before move
- Eval after move
- Best move (if different)
- Eval of best move

---

## Part 2: Stockfish Awards (from Lichess4545)

### Existing Awards from Analysis Section

#### 1. 👑 Accuracy King
**Definition:** Highest accuracy percentage in a game
**Requires:** Full game analysis
**Example:** 98.5% accuracy

#### 2. 💥 Biggest Blunder
**Definition:** Largest single-move win percentage loss
**Requires:** Move-by-move analysis
**Example:** Lost 45% win probability on one move

#### 3. 🎯 Most Accurate Opening
**Definition:** Highest accuracy in opening phase (first 12 moves)
**Requires:** Phase detection + analysis
**Example:** 100% accuracy in opening

#### 4. 🧠 Calculation King
**Definition:** Found the most "brilliant" moves (top engine choice in complex positions)
**Requires:** Best move comparison
**Example:** Played engine's #1 choice 15 times in critical positions

---

## Part 3: Time-Stockfish Combined Awards

These leverage BOTH time data AND Stockfish analysis:

### 🆕 5. 🎯 Sniper (FULL VERSION)
**Definition:** Fastest execution of checkmate when mate-in-N was available
**Requires:** Stockfish to detect "mate was available"
**Logic:**
- Analyze position before move
- If Stockfish says #5 available
- Player delivers checkmate in N moves
- Time taken from `%emt`
- Award goes to fastest mate execution

**Why Better Than Simple Version:** Rewards finding mate quickly, not just delivering it

### 🆕 6. 😢 Sad Times Award
**Definition:** Longest think in a totally lost position (eval < -5.0)
**Requires:** Stockfish evaluation
**Logic:**
- Position eval < -5.0 from player's perspective
- Player thinks for > X minutes
- Shows frustration/desperation

### 🆕 7. ⚡ Blitz Brilliance
**Definition:** Highest accuracy in a blitz game with < 30 sec average move time
**Requires:** Time data + Stockfish
**Logic:**
- Blitz game
- Average `%emt` < 30 seconds
- Accuracy > 85%
- Shows speed + accuracy combo

### 🆕 8. 🎭 Zeitnot Accuracy Paradox
**Definition:** Player with highest accuracy while in zeitnot (< 1 min)
**Requires:** Time data + Stockfish
**Logic:**
- Moves made with < 1:00 on clock
- Calculate accuracy only for those moves
- Rewards maintaining quality under pressure

---

## Part 4: FIDE-Specific Stockfish Analysis

### Challenge: Volume

**640+ games in tournament**
- Stockfish analysis at depth 15-20
- ~30 seconds per game = ~5 hours total
- Manageable but slow

**Solutions:**
1. **Parallel processing** - Analyze multiple games simultaneously
2. **Selective depth** - Classical depth 18, Rapid depth 15, Blitz depth 12
3. **Move sampling** - Analyze every N moves for speed
4. **Caching** - Save analysis, don't re-run

### Proposed Depths by Time Control

| Time Control | Depth | Est. Time/Game | Rationale |
|--------------|-------|----------------|-----------|
| Classical    | 18    | 45s            | Deepest analysis for slow games |
| Rapid Tier 1 | 15    | 30s            | Good balance |
| Rapid Tier 2 | 15    | 30s            | Same as Tier 1 |
| Blitz Tier 1 | 12    | 20s            | Faster games need less depth |
| Blitz Tier 2 | 10    | 15s            | Quickest analysis |

**Total estimate:** ~8 hours for all 640 games (parallelized: ~2 hours with 4 cores)

---

## Part 5: Implementation Plan

### Prerequisites

#### Install Dependencies

```bash
# Install Stockfish
brew install stockfish  # macOS
# or apt-get install stockfish  # Linux

# Install Python libraries
pip3 install python-chess stockfish
```

#### Verify Installation

```bash
which stockfish
# Should output: /opt/homebrew/bin/stockfish or similar

python3 -c "from stockfish import Stockfish; print('OK')"
# Should output: OK
```

### Phase 1: Basic Stockfish Integration (4 hours)

**Files to create:**

```
scripts/
├── analyze-pgn.py           # Copied from lichess4545, adapted
└── utils/
    └── calculators/
        └── stockfish-awards.js   # NEW: Stockfish-based awards
```

**Steps:**

1. **Copy analyze-pgn.py from lichess4545** (30 min)
   - Adapt for FIDE PGN format
   - Add depth configuration by time control
   - Test on single game

2. **Create analysis wrapper** (1 hour)
   ```javascript
   // scripts/utils/stockfish-analyzer.js
   const { spawn } = require('child_process');

   function analyzeGames(games, depth = 15) {
     // Spawn Python process
     // Pass games as JSON
     // Receive analysis back
     return analysis;
   }
   ```

3. **Add to generate-stats pipeline** (30 min)
   ```javascript
   // In generate-stats.js
   const stockfishAnalysis = await analyzeGames(enrichedGames);
   stats.analysis = stockfishAnalysis;
   ```

4. **Test with Round 1** (2 hours)
   - Analyze subset (10 games)
   - Verify output structure
   - Check accuracy calculations
   - Measure performance

### Phase 2: Stockfish Awards (3 hours)

**Implement 4 core awards:**

1. **Accuracy King** (30 min)
   - Find max accuracy across all games
   - Include game context

2. **Biggest Blunder** (30 min)
   - Find max win% loss single move
   - Include position, move, eval change

3. **Sniper (full version)** (1 hour)
   - Detect mate-available positions
   - Match with actual mate delivery
   - Cross-reference time data

4. **Sad Times** (1 hour)
   - Detect losing positions (eval < -5)
   - Cross-reference time data
   - Find longest think

### Phase 3: Advanced Integration (2 hours)

**Combine time + Stockfish:**

1. **Blitz Brilliance** (45 min)
2. **Zeitnot Accuracy Paradox** (45 min)
3. **Move-by-move quality charts** (30 min - frontend)

### Phase 4: Optimization (2 hours)

**Performance improvements:**

1. **Parallel processing** (1 hour)
   ```python
   from multiprocessing import Pool

   with Pool(4) as pool:
       results = pool.map(analyze_game, games)
   ```

2. **Caching** (30 min)
   - Save analysis to `data/analysis/round-N-analysis.json`
   - Skip re-analysis if exists
   - Add `--force` flag to regenerate

3. **Progress bar** (30 min)
   ```python
   from tqdm import tqdm

   for game in tqdm(games, desc="Analyzing"):
       analyze_game(game)
   ```

**Total estimated time: 11 hours**

---

## Part 6: Technical Details

### Analysis Output Structure

```json
{
  "games": [
    {
      "gameIndex": 0,
      "white": "Carlsen, Magnus",
      "black": "Nakamura, Hikaru",
      "whiteElo": 2830,
      "blackElo": 2794,
      "whiteAccuracy": 94.3,
      "blackAccuracy": 91.7,
      "whiteACPL": 18,
      "blackACPL": 28,
      "whiteMoveQuality": {
        "excellent": 25,
        "good": 15,
        "inaccuracies": 3,
        "mistakes": 2,
        "blunders": 0
      },
      "blackMoveQuality": {
        "excellent": 22,
        "good": 16,
        "inaccuracies": 4,
        "mistakes": 2,
        "blunders": 1
      },
      "biggestBlunder": {
        "player": "black",
        "moveNumber": 32,
        "move": "Rxf3",
        "evalBefore": 1.2,
        "evalAfter": -3.5,
        "winLoss": 35.2,
        "bestMove": "Rd8"
      },
      "brilliantMoves": [
        {
          "player": "white",
          "moveNumber": 24,
          "move": "Qh6!",
          "eval": 2.8,
          "complexity": "high"
        }
      ]
    }
  ],
  "summary": {
    "accuracyKing": {
      "white": "Carlsen, Magnus",
      "black": "Nakamura, Hikaru",
      "player": "Carlsen, Magnus",
      "accuracy": 94.3,
      "gameIndex": 0
    },
    "biggestBlunder": {
      "white": "Caruana, Fabiano",
      "black": "Ding, Liren",
      "player": "Ding, Liren",
      "move": "Qg4",
      "winLoss": 42.8,
      "gameIndex": 15
    }
  }
}
```

### Integration with Existing Stats

```javascript
// In generate-stats.js
const stats = {
  // ... existing stats ...
  overview: calculateOverview(games),
  results: calculateResults(games),

  // Add Stockfish analysis
  analysis: stockfishAnalysis || null,

  // Merge stockfish awards with existing awards
  awards: {
    ...calculateAwards(games),
    ...stockfishAwards(stockfishAnalysis)
  }
};
```

---

## Part 7: Frontend Display

### Analysis Section

```tsx
{/* Stockfish Analysis */}
{stats.analysis && (
  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
      🔬 Move Quality Analysis
    </h2>
    <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
      Powered by Stockfish engine analysis
    </p>

    {/* Accuracy King */}
    {stats.analysis.summary.accuracyKing && (
      <div className="border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 bg-yellow-50 dark:bg-yellow-900/20 mb-4">
        <div className="text-sm font-semibold text-yellow-900 dark:text-yellow-300 mb-2">
          👑 Accuracy King
        </div>
        <div className="text-gray-900 dark:text-white font-medium">
          {formatPlayerName(stats.analysis.summary.accuracyKing.player)}
        </div>
        <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
          {stats.analysis.summary.accuracyKing.accuracy.toFixed(1)}% accuracy
        </div>
      </div>
    )}

    {/* Biggest Blunder */}
    {stats.analysis.summary.biggestBlunder && (
      <div className="border border-red-200 dark:border-red-800 rounded-lg p-4 bg-red-50 dark:bg-red-900/20">
        <div className="text-sm font-semibold text-red-900 dark:text-red-300 mb-2">
          💥 Biggest Blunder
        </div>
        <div className="text-gray-900 dark:text-white font-medium mb-2">
          {formatPlayerName(stats.analysis.summary.biggestBlunder.player)}
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {stats.analysis.summary.biggestBlunder.move} (move {stats.analysis.summary.biggestBlunder.moveNumber})
        </div>
        <div className="text-sm text-red-600 dark:text-red-400 font-medium">
          Lost {stats.analysis.summary.biggestBlunder.winLoss.toFixed(1)}% win probability
        </div>
        <div className="text-xs text-gray-500 mt-1">
          Best move: {stats.analysis.summary.biggestBlunder.bestMove}
        </div>
      </div>
    )}
  </div>
)}
```

---

## Part 8: Performance Optimization

### Parallel Processing Strategy

```python
#!/usr/bin/env python3
import multiprocessing as mp
from functools import partial

def analyze_game_wrapper(game_data, depth):
    """Wrapper for parallel processing"""
    try:
        return analyze_game(game_data, depth)
    except Exception as e:
        return {"error": str(e), "gameIndex": game_data['gameIndex']}

def analyze_all_games_parallel(games, depth=15, num_processes=4):
    """Analyze games in parallel"""
    with mp.Pool(num_processes) as pool:
        analyze_fn = partial(analyze_game_wrapper, depth=depth)
        results = pool.map(analyze_fn, games)
    return results
```

### Caching Strategy

```javascript
// scripts/utils/stockfish-analyzer.js
const fs = require('fs');
const path = require('path');

function getCachedAnalysis(roundNumber) {
  const cachePath = path.join(__dirname, '../../data/analysis', `round-${roundNumber}-analysis.json`);
  if (fs.existsSync(cachePath)) {
    return JSON.parse(fs.readFileSync(cachePath, 'utf-8'));
  }
  return null;
}

function saveAnalysisCache(roundNumber, analysis) {
  const cacheDir = path.join(__dirname, '../../data/analysis');
  if (!fs.existsSync(cacheDir)) {
    fs.mkdirSync(cacheDir, { recursive: true });
  }
  const cachePath = path.join(cacheDir, `round-${roundNumber}-analysis.json`);
  fs.writeFileSync(cachePath, JSON.stringify(analysis, null, 2));
}
```

---

## Part 9: Command Line Usage

### Analyze Single Round

```bash
# Basic analysis
npm run analyze -- --round=1

# With specific depth
npm run analyze -- --round=1 --depth=18

# Force re-analysis (ignore cache)
npm run analyze -- --round=1 --force

# Parallel processing
npm run analyze -- --round=1 --processes=4
```

### Add to package.json

```json
{
  "scripts": {
    "analyze": "python3 scripts/analyze-pgn.py",
    "analyze:round1": "npm run analyze -- --round=1",
    "analyze:all": "npm run analyze -- --all",
    "pipeline:full": "npm run process:all && npm run analyze:all"
  }
}
```

---

## Part 10: Testing Strategy

### Phase 1: Single Game Test

```bash
# Test on first game of Round 1
node -e "
  const fs = require('fs');
  const games = JSON.parse(fs.readFileSync('data/enriched/round-1-all-enriched.json'));
  const testGame = games.slice(0, 1);
  fs.writeFileSync('test-game.json', JSON.stringify(testGame));
"

python3 scripts/analyze-pgn.py < test-game.json
```

### Phase 2: Validation Checklist

- [ ] Stockfish engine found and working
- [ ] python-chess library installed
- [ ] Can analyze single game
- [ ] Accuracy calculation matches Lichess formula
- [ ] ACPL values reasonable (< 100 for good games)
- [ ] Blunder detection works
- [ ] Analysis JSON structure correct
- [ ] Integration with stats generation works
- [ ] Frontend displays analysis correctly

---

## Part 11: Recommended Implementation Order

### Week 1: Time Stats (10 hours)
**Priority:** Implement time-based awards first
**Reason:** No dependencies, immediate value

### Week 2: Stockfish Integration (11 hours)
**Priority:** Add engine analysis
**Reason:** Unlocks quality metrics + time-stockfish combined awards

### Combined Timeline (21 hours total)

**Day 1-2:** Time stats (10 hours)
- time-analyzer-fide.js
- time-awards.js
- Frontend display
- Test and regenerate

**Day 3-4:** Stockfish setup (6 hours)
- Install dependencies
- Copy and adapt analyze-pgn.py
- Test on sample games
- Caching system

**Day 5:** Stockfish awards (5 hours)
- Accuracy King, Biggest Blunder
- Sniper, Sad Times
- Blitz Brilliance, Zeitnot Accuracy
- Frontend display

---

## Part 12: Success Criteria

### Time Stats
- [ ] 10 time awards implemented
- [ ] Adaptive thresholds working
- [ ] Awards displayed on frontend
- [ ] All 5 rounds regenerated

### Stockfish Analysis
- [ ] Stockfish engine integrated
- [ ] Can analyze all games
- [ ] Analysis cached (don't re-run)
- [ ] 4 stockfish awards working
- [ ] 2 combined time-stockfish awards working
- [ ] Frontend analysis section complete
- [ ] Performance < 3 hours for full tournament

---

## Recommendation

**Proposed Order:**
1. ✅ **TIME STATS FIRST** (10 hours) - No blockers, high value
2. ✅ **STOCKFISH SECOND** (11 hours) - Unlocks advanced awards
3. ⏭️ **Then Stage 6** - Tournament overview

**Total time investment:** 21 hours
**Value added:** Massive - objective quality metrics + pressure performance insights

**Alternative:** Start both in parallel if you want to move faster.

---

**Ready to start?** Should I begin with time-analyzer-fide.js implementation?
