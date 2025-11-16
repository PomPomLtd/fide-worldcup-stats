# Time-Based Awards Proposal for FIDE World Cup 2025

**Date:** 2025-11-16
**Status:** PROPOSAL - Ready for Implementation

---

## Executive Summary

FIDE World Cup PGNs contain **excellent time data** (`%clk` and `%emt`). We can implement comprehensive time-based awards that adapt to multiple time controls and highlight the unique pressure of knockout tournament play.

**Proposed:** 12 time-based awards (8 from lichess4545 adapted, 4 new FIDE-specific)

---

## Part 1: Lichess4545 Awards to Adopt (8 awards)

### ✅ Take Over (6 awards - NO STOCKFISH NEEDED)

#### 1. 🤔 Longest Think
**Definition:** Longest time spent on a single move (highest `%emt`)
**Why Keep:** Universal appeal, works across all time controls
**Adaptation:** Display time control type to provide context
**Implementation:** Direct max of `%emt` values

**Sample Output:**
```json
{
  "longestThink": {
    "white": "Ding, Liren",
    "black": "Gukesh, D",
    "player": "Ding, Liren",
    "color": "white",
    "timeSpent": 1847,  // 30min 47sec
    "moveNumber": 24,
    "move": "Qh6",
    "gameId": "...",
    "timeControl": "classical"
  }
}
```

---

#### 2. ⏰ Zeitnot Addict
**Definition:** Most moves made in time pressure
**Why Keep:** Classic chess award, shows player under pressure
**Adaptation:** **CRITICAL - Adjust thresholds by time control**

**Proposed Thresholds:**
| Time Control | Zeitnot (<) | Extreme (<) | Critical (<) |
|--------------|-------------|-------------|--------------|
| Classical    | 5:00        | 2:00        | 1:00         |
| Rapid Tier 1 | 2:00        | 1:00        | 0:30         |
| Rapid Tier 2 | 1:30        | 0:45        | 0:20         |
| Blitz Tier 1 | 1:00        | 0:30        | 0:10         |
| Blitz Tier 2 | 0:45        | 0:20        | 0:05         |

**Rationale:** Blitz players are naturally in "zeitnot" - 60 seconds is meaningless in 5+3. Classical < 5 minutes is genuinely notable.

**Implementation:**
```javascript
function getZeitnotThreshold(timeControl) {
  const thresholds = {
    'classical': 300,      // 5:00
    'rapidTier1': 120,     // 2:00
    'rapidTier2': 90,      // 1:30
    'blitzTier1': 60,      // 1:00
    'blitzTier2': 45       // 0:45
  };
  return thresholds[timeControl] || 60;
}
```

---

#### 3. 🏆 Time Scramble Survivor
**Definition:** Won a game after having < 10 seconds at some point
**Why Keep:** Dramatic, shows clutch performance
**Adaptation:** Also adjust threshold by time control

**Proposed Critical Thresholds:**
- Classical: < 1:00 (more dramatic)
- Rapid: < 0:30
- Blitz: < 0:10

**Enhanced Version:** Track **minimum clock time** reached by winner

---

#### 4. ⚡ Bullet Speed
**Definition:** Fastest average `%emt` across a game (minimum 20 moves)
**Why Keep:** Shows calculation speed
**Adaptation:**
- Separate by time control
- Award "Bullet Speed (Classical)", "Bullet Speed (Rapid)", etc.
- Require 15+ moves (not 20) for rapid/blitz

---

#### 5. 📚 Opening Blitzer
**Definition:** Fastest average `%emt` in first 10 moves
**Why Keep:** Shows opening preparation/book knowledge
**Adaptation:**
- Classical: First 10 moves
- Rapid/Blitz: First 8 moves (games are shorter)
- Require minimum 7 moves to qualify

---

#### 6. 🏃 Premove Master (renamed from "Most Premoves")
**Definition:** Most moves made in < 1 second
**Why Keep:** Shows speed and confidence
**Adaptation:**
- Lichess uses < 0.5 sec, but FIDE increment is 30 sec in classical
- Use < 1 sec for classical (still impressive with 30 sec increment)
- Use < 0.5 sec for rapid/blitz

**Note:** In classical with 30 sec increment, you gain 30 sec after each move. A 1-second move means you're playing incredibly fast despite having time.

---

### ⏸️ Defer to Stockfish Stage (2 awards)

#### 7. 🎯 Sniper (NEEDS STOCKFISH)
**Definition:** Fastest execution of checkmate when mate-in-N was available
**Why Defer:** Requires engine evaluation to detect "mate was available"
**Status:** Implement in Stage 8 (Stockfish Integration)

**Alternative Now:** "Checkmate Executioner" - fastest execution of actual checkmate move (no eval needed)

---

#### 8. 😢 Sad Times Award (NEEDS STOCKFISH)
**Definition:** Longest think in a totally lost position (eval < -5)
**Why Defer:** Requires engine evaluation
**Status:** Implement in Stage 8 (Stockfish Integration)

---

## Part 2: New FIDE World Cup Specific Awards (4 awards)

These leverage the unique knockout format and multiple time controls.

### 🆕 9. 🔥 Tiebreak Pressure King
**Definition:** Won the most tiebreak games while in "critical" time pressure

**Logic:**
- Only count tiebreak games (rapid/blitz in a drawn match)
- Player must have been in critical pressure (< 30 sec rapid, < 10 sec blitz)
- Player must have won
- Count total tiebreak wins meeting criteria

**Why Unique to FIDE:** Knockout format creates high-pressure tiebreaks

**Sample Output:**
```json
{
  "tiebreakPressureKing": {
    "player": "Praggnanandhaa, R",
    "tiebreakWins": 3,
    "criticalGames": [
      {
        "white": "Praggnanandhaa, R",
        "black": "Caruana, Fabiano",
        "timeControl": "blitzTier1",
        "minClock": 8,
        "round": 4
      }
    ],
    "totalTiebreakGames": 12
  }
}
```

---

### 🆕 10. 📉 Classical Time Burner
**Definition:** Ended a classical game with the least time remaining (among games that didn't go to tiebreak)

**Logic:**
- Only classical games
- Only games that ended in a decisive result (1-0 or 0-1)
- Find player with minimum `%clk` at end of game
- Shows deep calculation vs time management

**Why Unique to FIDE:** Classical games have 90+30, very different from Lichess 45+45

**Sample Output:**
```json
{
  "classicalTimeBurner": {
    "white": "Vidit, Santosh Gujrathi",
    "black": "Abasov, Nijat",
    "player": "Vidit, Santosh Gujrathi",
    "color": "white",
    "finalClock": 12,  // 12 seconds left!
    "totalMoves": 87,
    "gameId": "...",
    "result": "1-0"
  }
}
```

---

### 🆕 11. 🎲 Increment Farmer
**Definition:** Gained the most net time from increment in a classical game

**Logic:**
- Only classical games (30 sec increment)
- Calculate: (final clock) - (starting clock of 90 min) + (time used)
- = total increment accumulated - time spent
- Shows ability to play fast and accumulate time

**Example:**
- Start: 90:00
- End: 45:00 after 60 moves
- Time gained from increment: 60 moves * 30 sec = 30:00
- Net: 45:00 - 90:00 + 30:00 = -15:00 (lost 15 minutes net)
- Another player: End 75:00 after 80 moves = +45:00 net gain!

**Why Unique to FIDE:** Classical increment from move 1 is unusual

---

### 🆕 12. 🎭 Time Control Specialist
**Definition:** Player with the best time management differential across time controls

**Logic:**
- Calculate avg final clock time / game length ratio for each time control
- Find player with highest variance
- Example: Player is super fast in blitz (high time left) but slow in classical (low time left)

**Why Unique to FIDE:** Multiple time controls per player

**Sample Output:**
```json
{
  "timeControlSpecialist": {
    "player": "Nakamura, Hikaru",
    "specialist": "blitz",
    "stats": {
      "classical": { "avgFinalClock": 180, "avgMoves": 45, "ratio": 4.0 },
      "rapid": { "avgFinalClock": 120, "avgMoves": 38, "ratio": 3.2 },
      "blitz": { "avgFinalClock": 90, "avgMoves": 35, "ratio": 2.6 }
    },
    "bestRatio": 2.6,
    "worstRatio": 4.0
  }
}
```

---

## Part 3: Implementation Plan

### Phase 1: Core Awards (Immediate)
**Implement 10 awards without Stockfish:**

1. ✅ Longest Think
2. ✅ Zeitnot Addict (adaptive thresholds)
3. ✅ Time Scramble Survivor (adaptive thresholds)
4. ✅ Bullet Speed (by time control)
5. ✅ Opening Blitzer (adaptive move count)
6. ✅ Premove Master (adaptive threshold)
7. ✅ Tiebreak Pressure King (NEW)
8. ✅ Classical Time Burner (NEW)
9. ✅ Increment Farmer (NEW)
10. ✅ Time Control Specialist (NEW)

**Estimated Time:** 6-8 hours

### Phase 2: Stockfish Awards (Stage 8)
**Add 2 awards with engine analysis:**

11. ⏸️ Sniper (mate execution speed)
12. ⏸️ Sad Times (long think in lost position)

**Estimated Time:** 2-3 hours (after Stockfish integrated)

---

## Part 4: Technical Implementation

### File Structure

```
scripts/utils/
├── time-analyzer-fide.js        # NEW: FIDE-specific time parser
│   ├── parseClockTime()
│   ├── extractFideClockTimes()  # Parse %clk and %emt
│   ├── analyzeGameTime()
│   └── analyzeAllGames()
│
└── calculators/
    ├── time-awards.js           # NEW: Time awards calculator
    │   ├── calculateLongestThink()
    │   ├── calculateZeitnotAddict()
    │   ├── calculateTimeScrambleSurvivor()
    │   ├── calculateBulletSpeed()
    │   ├── calculateOpeningBlitzer()
    │   ├── calculatePremoveMaster()
    │   ├── calculateTiebreakPressureKing()
    │   ├── calculateClassicalTimeBurner()
    │   ├── calculateIncrementFarmer()
    │   └── calculateTimeControlSpecialist()
    │
    └── stockfish-time-awards.js # LATER: Stockfish-dependent awards
        ├── calculateSniper()
        └── calculateSadTimes()
```

### Key Differences from Lichess4545

#### 1. Direct `%emt` Extraction
Lichess4545 calculates time spent: `(prevClock + increment) - currClock`
FIDE gives us `%emt` directly - **more accurate!**

```javascript
// Lichess4545 approach (calculated)
const timeSpent = (prevClock + increment) - currClock;

// FIDE approach (direct)
const timeSpent = parseClockTime(emtMatch[1]); // Direct from PGN!
```

#### 2. Adaptive Thresholds
```javascript
function getThresholds(timeControl) {
  const config = {
    'classical': {
      zeitnot: 300,    // 5:00
      extreme: 120,    // 2:00
      critical: 60,    // 1:00
      premove: 1.0     // < 1 sec
    },
    'blitzTier1': {
      zeitnot: 60,     // 1:00
      extreme: 30,     // 0:30
      critical: 10,    // 0:10
      premove: 0.5     // < 0.5 sec
    }
    // ... etc
  };
  return config[timeControl] || config.classical;
}
```

#### 3. Match Context Integration
```javascript
// Identify tiebreak games
function isTiebreakGame(game, match) {
  // Game is tiebreak if:
  // 1. Not classical time control
  // 2. Match had 2+ classical games that were drawn
  return game.timeControl !== 'classical' &&
         match.classicalScore === '1-1';
}
```

### Data Extraction Logic

```javascript
function extractFideClockTimes(pgnString) {
  const times = [];

  // FIDE format has two annotation blocks per move:
  // 1. e4 {[%clk 01:30:54]} {[%emt 00:00:05]}
  //       ^^^^^^^^^^^^^^^    ^^^^^^^^^^^^^^^^
  //       clock remaining    time spent on move

  const moveRegex = /(\d+)\.\s+(\S+)\s*\{[^}]*\[%clk\s+([0-9:]+)\][^}]*\}\s*\{[^}]*\[%emt\s+([0-9:]+)\][^}]*\}/g;

  let match;
  while ((match = moveRegex.exec(pgnString)) !== null) {
    const [_, moveNum, move, clk, emt] = match;

    times.push({
      moveNumber: parseInt(moveNum),
      move,
      clockRemaining: parseClockTime(clk),
      timeSpent: parseClockTime(emt),  // Direct! No calculation needed!
      color: 'white'  // Determine from context
    });
  }

  return times;
}
```

---

## Part 5: Frontend Display

### New Section on Round Page

```tsx
{/* Time-Based Awards */}
{stats.timeAwards && (
  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
      ⏰ Time Management Awards
    </h2>
    <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
      Awards for time management, pressure performance, and speed of play
    </p>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {/* Longest Think */}
      {stats.timeAwards.longestThink && (
        <div className="border border-purple-200 dark:border-purple-800 rounded-lg p-4 bg-purple-50 dark:bg-purple-900/20">
          <div className="text-sm font-semibold text-purple-900 dark:text-purple-300 mb-2">
            🤔 Deep Thinker
          </div>
          <div className="text-gray-900 dark:text-white font-medium">
            {formatPlayerName(stats.timeAwards.longestThink.player)}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {formatTime(stats.timeAwards.longestThink.timeSpent)} on move {stats.timeAwards.longestThink.moveNumber}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {stats.timeAwards.longestThink.timeControl} • {stats.timeAwards.longestThink.move}
          </div>
        </div>
      )}

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

      {/* Tiebreak Pressure King (FIDE-specific) */}
      {stats.timeAwards.tiebreakPressureKing && (
        <div className="border border-orange-200 dark:border-orange-800 rounded-lg p-4 bg-orange-50 dark:bg-orange-900/20">
          <div className="text-sm font-semibold text-orange-900 dark:text-orange-300 mb-2">
            🔥 Tiebreak Pressure King
          </div>
          <div className="text-gray-900 dark:text-white font-medium">
            {formatPlayerName(stats.timeAwards.tiebreakPressureKing.player)}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {stats.timeAwards.tiebreakPressureKing.tiebreakWins} clutch tiebreak wins
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Min clock: {formatTime(stats.timeAwards.tiebreakPressureKing.minClock)}
          </div>
        </div>
      )}

      {/* More awards... */}
    </div>
  </div>
)}
```

### Helper Function

```typescript
function formatTime(seconds: number): string {
  if (seconds >= 3600) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  } else if (seconds >= 60) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  } else {
    return `${seconds}s`;
  }
}
```

---

## Part 6: Testing Strategy

### Test Data

Use Round 1, Game 1 (Abugenda vs Erdogmus):
- Classical game
- Extreme zeitnot (White down to 00:00:31 on move 14!)
- Black in comfortable time throughout
- Perfect test case

### Validation Checklist

- [ ] `%clk` and `%emt` parsed correctly
- [ ] Time spent matches `%emt` values
- [ ] Zeitnot thresholds work for classical (5:00)
- [ ] Awards identify correct players
- [ ] Frontend displays time formatted correctly
- [ ] Works across all time controls
- [ ] Match context (tiebreak detection) works

---

## Part 7: Recommended Implementation Order

### Step 1: Create time-analyzer-fide.js (2 hours)
- Copy from lichess4545
- Adapt regex for FIDE format
- Use direct `%emt` extraction
- Add time control parameter
- Test parsing on sample game

### Step 2: Create time-awards.js calculator (3 hours)
- Implement 6 core awards (Longest Think, Zeitnot, etc.)
- Adaptive thresholds by time control
- Test with Round 1 data

### Step 3: Add 4 FIDE-specific awards (2 hours)
- Tiebreak Pressure King
- Classical Time Burner
- Increment Farmer
- Time Control Specialist

### Step 4: Integration (1 hour)
- Add to generate-stats.js
- Update TypeScript types
- Regenerate Round 1 stats
- Verify output

### Step 5: Frontend display (2 hours)
- Add time awards section
- Format time display
- Test all awards
- Dark mode verification

**Total Estimated Time: 10 hours**

---

## Part 8: Success Metrics

- [ ] 10 time awards implemented and working
- [ ] Adaptive thresholds by time control validated
- [ ] Awards display on round pages
- [ ] Time formatting is clear and readable
- [ ] Awards are distributed (not all to same player)
- [ ] FIDE-specific awards (tiebreak, increment) working
- [ ] Ready for Stockfish awards in Stage 8

---

## Recommendation

**PROCEED WITH IMPLEMENTATION** - Time-based awards are:
1. ✅ High value (unique insights into player behavior)
2. ✅ Ready to implement (all data available)
3. ✅ Low risk (proven pattern from lichess4545)
4. ✅ FIDE-specific adaptations add tournament flavor

**Priority:** Implement 10 awards now (Phase 1), defer 2 Stockfish awards to Stage 8

---

**Next:** Should I start implementing? I'll create the time-analyzer-fide.js first.
