# Stage 4: Statistics Generation - Detailed Plan

## Review of Lichess4545 Approach

### Their Structure
```javascript
{
  roundNumber, seasonNumber, generatedAt,
  overview: { totalGames, avgLength, longest/shortest },
  gamePhases: { opening, middlegame, endgame stats },
  results: { white/black/draw percentages },
  openings: { firstMoves, popularSequences },
  tactics: { captures, promotions, en passant },
  pieces: { piece-specific stats },
  checkmates: { checkmate analysis },
  boardHeatmap: { square usage, captures },
  awards: { bloodbath, pacifist, speed demon, etc. },
  funStats: { various fun categories },
  teams: { team-specific stats }, // NOT RELEVANT
  tacticalPatterns: { from Python analysis }, // OPTIONAL
  analysis: { Stockfish data } // OPTIONAL (Stage 8)
}
```

### What We Can Reuse
- ✅ Overview calculator
- ✅ Results calculator
- ✅ Tactics calculator (captures, promotions)
- ✅ Pieces calculator
- ✅ Checkmates calculator
- ✅ Board Heatmap calculator
- ✅ Awards calculator
- ✅ Fun Stats calculator
- ✅ Game Phases calculator

### What We DON'T Need
- ❌ Team stats (no teams in FIDE World Cup)
- ❌ League-specific metrics

### What We Need to ADD
- ✅ Match statistics (tiebreak analysis)
- ✅ Time control breakdown stats
- ✅ Rating-based analysis (Elo differences)
- ✅ Round-specific context

---

## FIDE World Cup Unique Requirements

### 1. Match-Level Statistics
Unlike lichess4545 (individual games), FIDE World Cup is about MATCHES:

```javascript
matchStats: {
  totalMatches: 78,
  decidedInClassical: 58,
  decidedInRapid: 15,
  decidedInBlitz: 5,
  decidedInArmageddon: 0,

  tiebreakAnalysis: {
    classicalDecisive: "74.4%",
    rapidTier1Decisive: "75%", // of those that went to rapid
    rapidTier2Needed: 6,
    blitzNeeded: 5
  },

  averageMovesToDecision: {
    classical: 41.2,
    rapidTier1: 38.5,
    blitzTier1: 29.3
  }
}
```

### 2. Time Control Breakdown
Each time control should have separate stats:

```javascript
byTimeControl: {
  classical: {
    totalGames: 156,
    overview: { avgLength, ... },
    results: { white%, black%, draw% },
    openings: { mostPopular, ... },
    tactics: { ... },
    // ... all standard stats
  },
  rapidTier1: { ... },
  rapidTier2: { ... },
  blitzTier1: { ... }
}
```

### 3. Rating-Based Analysis
```javascript
ratingAnalysis: {
  averageEloDifference: 245.3,
  upsets: [
    {
      underdog: "Player A",
      favorite: "Player B",
      eloDifference: 679,
      result: "1-0"
    }
  ],
  biggestUpset: { ... },
  favoritePerformance: {
    wins: 62,
    draws: 12,
    losses: 4 // 4 upsets
  }
}
```

---

## Implementation Strategy

### Option A: Adapt Existing Calculators
Pros:
- Faster implementation
- Proven, tested code
- Consistent with 4545

Cons:
- Designed for league play
- Team-specific code to remove
- May not fit our data structure

### Option B: Write New Calculators from Scratch
Pros:
- Clean, FIDE-specific design
- Better match-level thinking
- Cleaner code

Cons:
- More work
- Reinventing wheel
- Need to replicate good ideas

### **Decision: Hybrid Approach** ⭐
1. **Reuse** simple calculators (overview, results, tactics, pieces)
2. **Adapt** complex calculators (openings - already have better data!)
3. **Create new** FIDE-specific calculators (match stats, rating analysis)
4. **Skip** team-related code entirely

---

## Data Flow

```
Input:  data/enriched/round-N-enriched.json
        ├── Contains: matches with classified & enriched games
        ├── Has: opening data, time control classifications
        └── Has: match outcomes, player info

Process: scripts/generate-stats.js
         ├── Calculate overall round stats
         ├── Calculate per-time-control stats
         ├── Calculate match-specific stats
         ├── Calculate rating-based stats
         └── Generate awards

Output: public/stats/round-N-stats.json
        ├── Used by frontend
        ├── Self-contained (all data needed for display)
        └── Matches schema expected by components
```

---

## Planned Statistics Structure

```javascript
{
  // Metadata
  roundNumber: 1,
  roundName: "Round 1",
  generatedAt: "2025-11-16T...",

  // Match-level stats (UNIQUE TO FIDE)
  matchStats: {
    totalMatches: 78,
    decidedInClassical: 58,
    decidedInRapid: 15,
    decidedInBlitz: 5,
    tiebreakAnalysis: { ... }
  },

  // Overall stats (all games combined)
  overview: {
    totalGames: 218,
    totalMoves: 8942,
    averageGameLength: 41.0,
    longestGame: { ... },
    shortestGame: { ... }
  },

  results: {
    whiteWins: 92,
    blackWins: 78,
    draws: 48,
    whiteWinPercentage: 42.2,
    blackWinPercentage: 35.8,
    drawPercentage: 22.0
  },

  // Opening stats (enhanced from our enrichment)
  openings: {
    totalUnique: 82,
    coverage: "98.6%",
    mostPopular: [
      { eco: "A13", name: "...", count: 12, winRate: "58%" }
    ],
    byResult: {
      bestForWhite: { eco: "C89", winRate: "75%" },
      bestForBlack: { eco: "B90", winRate: "60%" }
    }
  },

  // Tactics
  tactics: {
    totalCaptures: 3452,
    averageCapturesPerGame: 15.8,
    enPassantGames: [...],
    promotions: 23,
    queensidePromotions: 12,
    kingsidePromotions: 11
  },

  // Pieces
  pieces: {
    queenSurvivalRate: 45.2,
    averagePiecesRemaining: 12.3,
    // ... more piece stats
  },

  // Checkmates
  checkmates: {
    total: 89,
    byPiece: { queen: 45, rook: 23, ... },
    averageMoveNumber: 38.2
  },

  // Board Heatmap
  boardHeatmap: {
    mostPopularSquare: { square: "e4", visits: 198 },
    bloodiestSquare: { square: "d5", captures: 45 },
    quietestSquares: ["a1", "h1"], // never visited
    data: { a1: 0, a2: 12, ... } // all 64 squares
  },

  // Awards
  awards: {
    bloodbath: { white: "...", black: "...", captures: 38 },
    pacifist: { white: "...", black: "...", captures: 2 },
    speedDemon: { white: "...", black: "...", moves: 15 },
    endgameWizard: { white: "...", black: "...", endgameMoves: 45 },
    // ... more awards
  },

  // Fun Stats
  funStats: {
    // Various fun categories from lichess4545
    // + FIDE-specific fun stats
  },

  // By Time Control (UNIQUE TO FIDE)
  byTimeControl: {
    classical: {
      overview: { totalGames: 156, avgLength: 43.2 },
      results: { white: 41%, black: 36%, draw: 23% },
      openings: { mostPopular: [...] },
      tactics: { ... },
      pieces: { ... },
      awards: { ... }
    },
    rapidTier1: { ... },
    rapidTier2: { ... },
    blitzTier1: { ... }
  },

  // Rating Analysis (UNIQUE TO FIDE)
  ratingAnalysis: {
    averageEloDifference: 245.3,
    upsets: [...],
    biggestUpset: { ... },
    favoritePerformance: { wins: 62, draws: 12, losses: 4 }
  }
}
```

---

## Implementation Tasks

### Task 4.1: Copy and Adapt Calculators
**Copy from lichess4545:**
- `scripts/utils/calculators/overview.js`
- `scripts/utils/calculators/results.js`
- `scripts/utils/calculators/tactics.js`
- `scripts/utils/calculators/pieces.js`
- `scripts/utils/calculators/checkmates.js`
- `scripts/utils/calculators/heatmap.js`
- `scripts/utils/calculators/awards.js`
- `scripts/utils/calculators/game-phases.js`
- `scripts/utils/calculators/fun-stats/` (entire directory)

**Adapt:**
- Remove team-related code
- Ensure compatibility with our data structure
- Test with enriched data

### Task 4.2: Create FIDE-Specific Calculators
**New files:**
- `scripts/utils/calculators/match-stats.js` - Match-level analysis
- `scripts/utils/calculators/rating-analysis.js` - Elo-based stats
- `scripts/utils/calculators/time-control-breakdown.js` - Per-TC stats

### Task 4.3: Enhance Opening Calculator
We already have better opening data than lichess4545!
- Use our enriched opening data
- Calculate win rates by opening
- Find best openings for white/black
- Identify most decisive openings

### Task 4.4: Create Main Stats Generator
**Create:** `scripts/generate-stats.js`

Similar to lichess4545 but:
- Read from `data/enriched/` instead of parsing PGN
- No team loading logic
- Call all calculators
- Combine per-time-control stats
- Output to `public/stats/round-N-stats.json`

### Task 4.5: Test on Round 1
- Run on Round 1 enriched data
- Verify all statistics
- Check output JSON structure
- Ensure frontend compatibility (check against components)

### Task 4.6: Update package.json Scripts
Add convenience scripts:
```json
{
  "stats:round1": "node scripts/generate-stats.js --round=1",
  "stats:all": "node scripts/generate-stats.js",
  "pipeline:round1": "npm run consolidate && npm run classify && npm run enrich && npm run stats:round1"
}
```

---

## Success Criteria

- [ ] All lichess4545 calculators adapted and working
- [ ] Match statistics generated correctly
- [ ] Time control breakdown complete
- [ ] Rating analysis implemented
- [ ] Awards working (bloodbath, pacifist, etc.)
- [ ] Board heatmap generated
- [ ] Output JSON matches expected schema
- [ ] File size reasonable (< 1MB per round)
- [ ] Round 1 stats complete and verified

---

## Calculators Breakdown

### Simple (Direct Copy)
1. **Overview** - Total games, avg length, longest/shortest
2. **Results** - Win/draw/loss percentages
3. **Tactics** - Captures, promotions, en passant
4. **Pieces** - Piece survival rates, remaining pieces
5. **Checkmates** - Checkmate patterns, piece delivering mate

### Medium (Adaptation Needed)
6. **Board Heatmap** - Square usage (remove team coloring)
7. **Awards** - Bloodbath, pacifist, etc. (remove team awards)
8. **Game Phases** - Opening/middlegame/endgame analysis
9. **Fun Stats** - Various fun categories (keep relevant ones)

### Complex (FIDE-Specific)
10. **Openings** - Use our enriched data, calculate win rates
11. **Match Stats** - Tiebreak analysis, match-level metrics
12. **Rating Analysis** - Elo differences, upset tracking
13. **Time Control Breakdown** - Run all calculators per TC

---

## Testing Strategy

1. **Unit Testing**
   - Test each calculator with sample data
   - Verify output structure

2. **Integration Testing**
   - Run full pipeline on Round 1
   - Check all stats are present
   - Validate against expected values

3. **Frontend Compatibility**
   - Ensure output matches schema expected by components
   - Test with actual frontend rendering

4. **Performance**
   - Benchmark stats generation time
   - Optimize if needed (should be < 5 seconds for 218 games)

---

## Estimated Effort

- **Task 4.1** (Copy calculators): 2-3 hours
- **Task 4.2** (FIDE calculators): 3-4 hours
- **Task 4.3** (Opening enhancement): 1-2 hours
- **Task 4.4** (Main generator): 2-3 hours
- **Task 4.5** (Testing): 2 hours
- **Task 4.6** (Scripts): 30 minutes

**Total:** ~12-15 hours

---

## Next Session Plan

1. ✅ Review lichess4545 implementation (DONE)
2. ✅ Create this plan (DONE)
3. Start with Task 4.1: Copy simple calculators
4. Test each calculator as we go
5. Move to FIDE-specific calculators
6. Create main generator
7. Test on Round 1
8. Commit Stage 4

Ready to proceed!
