# Time-Based Statistics Analysis

**Question:** Can we implement time-based awards like Lichess4545's "Sad Times" and "Zeitnot Addict" using FIDE World Cup PGN data?

**Answer:** **YES!** The FIDE PGNs contain excellent time data. We can implement most time-based awards with some adaptations.

---

## Available Time Data in FIDE PGNs

### Clock Annotations Present

FIDE PGNs include **two types** of time annotations:

1. **`%clk` - Clock Time Remaining**
   - Format: `[%clk HH:MM:SS]` or `[%clk MM:SS]`
   - Example: `[%clk 01:30:54]` = 1h 30min 54sec remaining
   - Updated after each move
   - Shows how much time the player has left

2. **`%emt` - Elapsed Move Time**
   - Format: `[%emt HH:MM:SS]` or `[%emt MM:SS]`
   - Example: `[%emt 00:06:31]` = 6min 31sec spent on this move
   - Shows exactly how long the player thought on this specific move
   - **This is better than Lichess data!** We don't need to calculate it.

### Example from Actual PGN

```
1. e4 {[%clk 01:30:54]} {[%emt 00:00:05]} e6 {[%clk 01:30:57]} {[%emt 00:00:03]}
2. d4 {[%clk 01:24:53]} {[%emt 00:06:31]} d5 {[%clk 01:31:15]} {[%emt 00:00:12]}
...
14. Qe3 {[%clk 00:02:29]} {[%emt 00:23:18]} Bd5 {[%clk 00:38:28]} {[%emt 00:00:04]}
15. Kf1 {[%clk 00:01:51]} {[%emt 00:01:09]} Bxh1 {[%clk 00:36:01]} {[%emt 00:02:58]}
```

**Observations:**
- White spent 23min 18sec on move 14 (!) and was down to 2:29 left
- Black responded in just 4 seconds
- White in extreme zeitnot (< 2 minutes)
- All the data we need is present!

---

## Lichess4545 Time-Based Awards

Here are the 8 time-based awards from lichess4545-stats:

### 1. 🏃 Most Premoves
**Definition:** Most moves made in < 0.5 seconds
**Feasibility:** ✅ **YES** - We have `%emt` data directly
**Implementation:** Count moves where `%emt` < 00:00:01

### 2. 🤔 Longest Think
**Definition:** Longest time spent on a single move
**Feasibility:** ✅ **YES** - Direct from `%emt`
**Implementation:** Find max `%emt` value across all games

### 3. ⏰ Zeitnot Addict
**Definition:** Most moves made with < 60 seconds remaining
**Feasibility:** ✅ **YES** - Direct from `%clk`
**Implementation:** Count moves where `%clk` < 00:01:00

### 4. 🏆 Time Scramble Survivor
**Definition:** Won a game after having < 10 seconds at some point
**Feasibility:** ✅ **YES**
**Implementation:**
- Find games where winner had `%clk` < 00:00:10
- Check game result matches

### 5. ⚡ Bullet Speed
**Definition:** Fastest average move time (minimum 20 moves)
**Feasibility:** ✅ **YES**
**Implementation:** Calculate average `%emt` per player per game

### 6. 🎯 Sniper
**Definition:** Fastest time to execute checkmate
**Feasibility:** ⚠️ **PARTIAL** - No engine evals in FIDE PGNs
**Implementation:**
- Can identify checkmate moves (ending in `#`)
- **Cannot** detect "mate was available" without Stockfish
- Simplified version: fastest execution of actual checkmate move
- Full version: requires Stockfish analysis (Stage 8)

### 7. 📚 Opening Blitzer
**Definition:** Fastest average move time in first 10 moves
**Feasibility:** ✅ **YES**
**Implementation:** Calculate average `%emt` for moves 1-10

### 8. 😢 Sad Times Award
**Definition:** Longest think in a totally lost position (eval < -5)
**Feasibility:** ⚠️ **REQUIRES STOCKFISH** - No evals in FIDE PGNs
**Implementation:**
- Need Stockfish analysis to calculate evals
- Part of Stage 8 (optional Stockfish integration)
- **Deferred** until Stockfish pipeline is implemented

---

## FIDE-Specific Considerations

### Time Control Complexity

Unlike Lichess (uniform 45+45), FIDE World Cup has:
- **Classical:** 90+30 (90min for first 40 moves, then +30min + 30sec/move)
- **Rapid Tier 1:** 15+10
- **Rapid Tier 2:** 10+10
- **Blitz Tier 1:** 5+3
- **Blitz Tier 2:** 3+2

**Implications:**
- Classical games have **increment starting from move 1** (unlike typical classical)
- Time pressure is more meaningful in rapid/blitz
- Should calculate zeitnot awards **separately by time control**

### Additional FIDE-Specific Awards

We can create **new** time-based awards unique to the World Cup format:

#### 9. 🔥 Tiebreak Time Warrior
**Definition:** Won the most tiebreak games in under 30 seconds at some point
**Why:** Highlights clutch performance under extreme pressure in knockout format

#### 10. 📉 Classical Burnout
**Definition:** Used the most time in classical games (least time left at end)
**Why:** Shows deep preparation vs time management

#### 11. ⚡ Blitz Specialist Clock Master
**Definition:** Won blitz games with the most time remaining
**Why:** Demonstrates blitz skill vs scrambling

#### 12. 🎲 Increment Hunter
**Definition:** Made the most moves (gained the most increment) in a classical game
**Why:** Long classical games = more increment accumulation

---

## Implementation Plan

### Phase 1: Core Time Awards (Immediate) ✅ READY

**Can implement NOW without Stockfish:**

1. **Most Premoves** - `%emt` < 1 second
2. **Longest Think** - max `%emt`
3. **Zeitnot Addict** - most moves with `%clk` < 60 seconds
4. **Time Scramble Survivor** - won with `%clk` < 10 seconds
5. **Bullet Speed** - fastest avg `%emt` (20+ moves)
6. **Opening Blitzer** - fastest avg `%emt` (first 10 moves)
7. **Tiebreak Time Warrior** (FIDE-specific)
8. **Classical Burnout** (FIDE-specific)

**Estimated implementation time:** 4-6 hours

**Files to create:**
- `scripts/utils/time-analyzer.js` (adapt from lichess4545)
- `scripts/utils/calculators/time-awards.js` (new calculator)
- Update `scripts/generate-stats.js` to include time awards
- Update `app/stats/types.ts` with time award interfaces
- Update round page to display time awards

### Phase 2: Stockfish-Dependent Awards (Later)

**Requires Stockfish analysis (Stage 8):**

1. **Sniper** (full version) - fastest mate execution when mate was available
2. **Sad Times** - longest think in lost position

These should wait until we implement the Stockfish pipeline.

---

## Data Extraction Strategy

### Parsing Approach

We can **reuse and adapt** lichess4545's `time-analyzer.js`:

```javascript
// Extract from FIDE PGN format
function extractFideClockTimes(pgnString) {
  const times = [];

  // FIDE format: {[%clk HH:MM:SS]} {[%emt HH:MM:SS]}
  const moveRegex = /(\d+)\.\s+(\S+)\s*\{[^}]*\[%clk\s+([0-9:]+)\][^}]*\}\s*\{[^}]*\[%emt\s+([0-9:]+)\][^}]*\}/g;

  let match;
  while ((match = moveRegex.exec(pgnString)) !== null) {
    const moveNumber = parseInt(match[1]);
    const move = match[2];
    const clockTime = parseClockTime(match[3]);  // Already in seconds
    const elapsedTime = parseClockTime(match[4]); // Direct from PGN!

    times.push({
      moveNumber,
      move,
      clockTime,
      elapsedTime // Don't need to calculate - FIDE gives it to us!
    });
  }

  return times;
}
```

**Advantage:** FIDE's `%emt` is more accurate than Lichess's calculated time
- Lichess: `timeSpent = (prevClock + increment) - currentClock` (estimation)
- FIDE: Direct measurement from DGT boards

### Time Control Detection

Need to pass time control info to analyzer:

```javascript
// In generate-stats.js
const { classifyTimeControl } = require('./utils/time-control-classifier');

for (const game of games) {
  const tc = classifyTimeControl(game.headers.TimeControl);
  game.timeControl = tc; // 'classical', 'rapidTier1', etc.
  game.baseTime = tc === 'classical' ? 90*60 : tc === 'rapidTier1' ? 15*60 : ...;
  game.increment = tc === 'classical' ? 30 : tc === 'rapidTier1' ? 10 : ...;
}

const timeAwards = analyzeAllGames(games);
```

---

## Recommended Zeitnot Thresholds by Time Control

Adjust thresholds based on time control to make awards meaningful:

| Time Control | Base Time | Zeitnot (<) | Extreme (<) | Critical (<) |
|--------------|-----------|-------------|-------------|--------------|
| Classical    | 90+30     | 5:00        | 2:00        | 1:00         |
| Rapid Tier 1 | 15+10     | 2:00        | 1:00        | 0:30         |
| Rapid Tier 2 | 10+10     | 1:30        | 0:45        | 0:20         |
| Blitz Tier 1 | 5+3       | 1:00        | 0:30        | 0:10         |
| Blitz Tier 2 | 3+2       | 0:45        | 0:20        | 0:05         |

**Rationale:**
- Blitz players are expected to be in "zeitnot" most of the game
- Classical < 5 minutes is genuinely notable
- Scale thresholds proportionally to base time

---

## Sample Output Structure

```json
{
  "timeAwards": {
    "mostPremoves": {
      "white": "Carlsen, Magnus",
      "black": "Nakamura, Hikaru",
      "player": "Nakamura, Hikaru",
      "color": "black",
      "count": 15,
      "gameId": "round-3-game-2",
      "timeControl": "blitz_tier1"
    },
    "longestThink": {
      "white": "Ding, Liren",
      "black": "Gukesh, D",
      "player": "Ding, Liren",
      "color": "white",
      "timeSpent": 1847,  // 30min 47sec in seconds
      "moveNumber": 24,
      "move": "Qh6",
      "gameId": "round-5-game-1",
      "timeControl": "classical"
    },
    "zeitnotAddict": {
      "white": "So, Wesley",
      "black": "Caruana, Fabiano",
      "player": "Caruana, Fabiano",
      "color": "black",
      "count": 18,  // 18 moves with < 5min in classical
      "gameId": "round-4-game-3",
      "timeControl": "classical",
      "minClock": 32  // Got down to 32 seconds
    },
    "timeScrambleSurvivor": {
      "white": "Praggnanandhaa, R",
      "black": "Abdusattorov, Nodirbek",
      "winner": "Praggnanandhaa, R",
      "color": "white",
      "minClock": 4,  // Won with 4 seconds left!
      "gameId": "round-3-game-7",
      "timeControl": "blitz_tier1"
    },
    "bulletSpeed": {
      "white": "Nakamura, Hikaru",
      "black": "Firouzja, Alireza",
      "player": "Nakamura, Hikaru",
      "color": "white",
      "avgTime": 2.3,  // 2.3 seconds per move
      "moveCount": 42,
      "gameId": "round-2-game-8",
      "timeControl": "blitz_tier1"
    },
    "openingBlitzer": {
      "white": "Keymer, Vincent",
      "black": "Giri, Anish",
      "player": "Giri, Anish",
      "color": "black",
      "avgTime": 0.8,  // 0.8 seconds per move in opening
      "moveCount": 10,
      "gameId": "round-2-game-5",
      "timeControl": "rapid_tier1"
    },
    "tiebreakTimeWarrior": {
      "player": "Erigaisi, Arjun",
      "tiebreakWins": 3,
      "criticalGames": 2,  // Won 2 games with < 30 sec
      "minClock": 8
    },
    "classicalBurnout": {
      "white": "Vidit, Santosh Gujrathi",
      "black": "Abasov, Nijat",
      "player": "Vidit, Santosh Gujrathi",
      "color": "white",
      "finalClock": 12,  // Only 12 seconds left at end
      "totalMoves": 87,
      "gameId": "round-1-game-15",
      "timeControl": "classical"
    }
  }
}
```

---

## Frontend Display

Add new section to round page:

```tsx
{/* Time-Based Awards */}
{stats.timeAwards && (
  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
    <h2 className="text-2xl font-bold mb-4">⏰ Time-Based Awards</h2>
    <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
      Awards for time management, pressure performance, and speed of play
    </p>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {/* Zeitnot Addict */}
      {stats.timeAwards.zeitnotAddict && (
        <div className="border border-red-200 dark:border-red-800 rounded-lg p-4 bg-red-50 dark:bg-red-900/20">
          <div className="text-sm font-semibold text-red-900 dark:text-red-300 mb-2">
            ⏰ Zeitnot Addict
          </div>
          <div className="text-gray-900 dark:text-white font-medium">
            {formatPlayerName(stats.timeAwards.zeitnotAddict.player)}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {stats.timeAwards.zeitnotAddict.count} moves in time pressure
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Lowest: {formatTime(stats.timeAwards.zeitnotAddict.minClock)}
          </div>
        </div>
      )}

      {/* More awards... */}
    </div>
  </div>
)}
```

---

## Conclusion & Recommendation

### ✅ Strongly Recommended

**Implement 6 core time awards NOW (Phase 1):**
1. Longest Think
2. Zeitnot Addict
3. Time Scramble Survivor
4. Bullet Speed
5. Opening Blitzer
6. Tiebreak Time Warrior (FIDE-specific)

**Reasons:**
- Data is readily available in PGNs
- No external dependencies needed
- Adds significant value to tournament stats
- Relatively quick implementation (4-6 hours)
- Unique insights into player behavior under pressure

### ⏸️ Defer to Later

**Wait for Stockfish integration (Stage 8):**
1. Sad Times Award
2. Sniper (full version)

**Reasons:**
- Require engine evaluations
- Stage 8 is specifically for Stockfish integration
- Not critical for MVP

### 🎯 Implementation Priority

1. **NOW (before Stage 6):** Add time awards to existing calculators
2. **Stage 6:** Display in frontend
3. **Stage 8:** Add Stockfish-dependent awards

---

## Next Steps

1. Copy `time-analyzer.js` from lichess4545-stats
2. Adapt for FIDE PGN format (`%emt` makes it simpler!)
3. Create `time-awards.js` calculator
4. Add to `generate-stats.js` orchestrator
5. Update TypeScript types
6. Add frontend display section
7. Test with Round 1 data
8. Regenerate all round stats

**Estimated total effort:** 4-6 hours
**Impact:** HIGH - unique and engaging statistics
**Dependencies:** None (all data available)

---

**Recommendation:** **IMPLEMENT NOW** - This is low-hanging fruit with high value!
