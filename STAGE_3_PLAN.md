# Stage 3: Opening Enrichment - Detailed Plan

## Current State Review

### What We Have ✅
1. **Stage 1 Output:** Consolidated match data with metadata
   - Players, FIDE IDs, Elos, results, dates
   - ❌ **Missing:** Actual PGN moves (only headers extracted)

2. **Stage 2 Output:** Classified data with time control info
   - Game classifications (CLASSICAL/RAPID/BLITZ)
   - Match outcomes (winner, scores, tiebreak type)
   - Separate files per time control

3. **Source Data Available:**
   - Full PGN files with complete move sequences in `_SRC/cup2025/`
   - Each game includes:
     - Move sequences (e.g., `1. e4 e5 2. Nf3 Nc6 ...`)
     - Clock times (`{[%clk 01:30:54]}`)
     - Move timestamps (`{[%emt 00:00:05]}`)

4. **Opening Database Available:**
   - `/Users/sgis/DEV/pompom/lichess4545-stats/scripts/utils/chess-openings.js`
   - 2,000+ openings with ECO codes
   - `getOpeningName(moveSequence)` function
   - Matches progressively shorter sequences (longest match wins)

---

## Stage 3 Goals

### Primary Objectives
1. ✅ **Extract Move Sequences** from source PGN files
2. ✅ **Parse Moves** into structured format (SAN notation)
3. ✅ **Match Openings** using chess-openings database
4. ✅ **Enrich Data** with opening names and ECO codes
5. ✅ **Generate Opening Statistics** (most popular, by time control, etc.)

### Success Criteria
- [ ] 90%+ of games have opening names identified
- [ ] ECO codes assigned where available
- [ ] Opening statistics generated per time control
- [ ] Move sequences stored for future analysis
- [ ] Data pipeline remains clean and reusable

---

## Technical Approach

### Architecture Decision
We need to decide **WHERE** to add opening data in our pipeline:

**Option A: Modify Stage 1 (Consolidation)**
- ✅ Pros: All data extracted once, clean separation
- ❌ Cons: Stage 1 becomes heavier, harder to re-run

**Option B: Modify Stage 2 (Classification)**
- ✅ Pros: Builds on existing classified data
- ❌ Cons: Stage 2 is already complex

**Option C: Create New Stage 3 (Opening Enrichment)** ⭐ RECOMMENDED
- ✅ Pros: Clean separation of concerns, easy to iterate
- ✅ Pros: Can re-run opening matching without re-parsing PGNs
- ✅ Pros: Follows lichess4545 pattern
- ❌ Cons: One more pipeline step

**Decision: Option C** - Create separate enrichment stage

---

## Implementation Plan

### Pipeline Flow (Updated)
```
Stage 1: Consolidation
  _SRC/cup2025/*.pgn → data/consolidated/round-N-matches.json
  (Extract: metadata + FULL PGN moves)

Stage 2: Classification
  data/consolidated/*.json → data/classified/round-N-*.json
  (Add: time control classification, outcomes, splits)

Stage 3: Opening Enrichment ⭐ NEW
  data/classified/*.json + _SRC/cup2025/*.pgn → data/enriched/round-N-*.json
  (Add: opening names, ECO codes, move sequences)

Stage 4: Statistics Generation
  data/enriched/*.json → public/stats/*.json
  (Generate: final stats for frontend)
```

---

## Tasks Breakdown

### Task 3.1: Update Stage 1 to Store PGN Moves ⭐ CRITICAL
**Why:** Currently only storing metadata, need full PGN for opening analysis

**Changes to `consolidate-pgns.js`:**
```javascript
// Current: Only extracts headers
function parseGameMetadata(gamePGN) {
  const headers = extractPGNHeaders(gamePGN);
  return { white, black, result, ... };
}

// New: Also store full PGN and move sequence
function parseGameMetadata(gamePGN) {
  const headers = extractPGNHeaders(gamePGN);
  const moves = extractMoves(gamePGN);  // NEW
  const pgn = gamePGN.trim();          // NEW - store full PGN

  return {
    white, black, result,
    pgn,                               // NEW
    moves,                             // NEW
    moveCount: moves.length,           // NEW
    ...
  };
}
```

**New Function Needed:**
```javascript
/**
 * Extract moves from PGN (without clock/timestamp annotations)
 * @param {string} pgnContent - Full PGN string
 * @returns {string} - Clean move sequence (e.g., "e4 e5 Nf3 Nc6")
 */
function extractMoves(pgnContent) {
  // Find moves section (after headers)
  // Remove annotations: {[%clk ...]} {[%emt ...]}
  // Remove move numbers: 1. 2. 3.
  // Join into space-separated string
  // Return: "e4 e5 Nf3 Nc6 Bb5 a6 ..."
}
```

**Testing:**
- [ ] Re-run Stage 1 on Round 1
- [ ] Verify `moves` field exists in consolidated data
- [ ] Verify `pgn` field stores full original PGN
- [ ] Verify `moveCount` is accurate

---

### Task 3.2: Copy Opening Database
**Goal:** Make chess-openings database available in our project

**Actions:**
```bash
cp /Users/sgis/DEV/pompom/lichess4545-stats/scripts/utils/chess-openings.js \
   scripts/utils/chess-openings.js
```

**Verify:**
- [ ] File copied successfully
- [ ] `getOpeningName()` function available
- [ ] Test: `getOpeningName("e4 e5")` returns King's Pawn Opening

---

### Task 3.3: Create Opening Matcher Module
**Location:** `scripts/utils/opening-matcher.js`

**Purpose:** Thin wrapper around chess-openings database

```javascript
const { getOpeningName } = require('./chess-openings');

/**
 * Match opening from move sequence
 * @param {string} moveSequence - Space-separated moves
 * @returns {Object} - { eco, name, matchedMoves, confidence }
 */
function matchOpening(moveSequence) {
  const opening = getOpeningName(moveSequence);

  if (!opening) {
    return {
      eco: null,
      name: 'Unknown Opening',
      matchedMoves: null,
      confidence: 'none'
    };
  }

  // Calculate confidence based on match length
  const movesInSequence = moveSequence.split(' ').length;
  const movesMatched = opening.moveSequence.split(' ').length;

  let confidence = 'low';
  if (movesMatched >= 10) confidence = 'high';
  else if (movesMatched >= 6) confidence = 'medium';

  return {
    eco: opening.eco,
    name: opening.name,
    matchedMoves: opening.moveSequence,
    confidence,
    matchDepth: movesMatched
  };
}

module.exports = { matchOpening };
```

---

### Task 3.4: Create Opening Enrichment Script
**Location:** `scripts/enrich-openings.js`

**Purpose:** Add opening data to classified games

**Pseudocode:**
```javascript
// 1. Read classified data (round-N-classified.json)
// 2. For each match, for each game:
//    a) Get move sequence from game.moves
//    b) Match opening using matchOpening()
//    c) Add opening fields to game
// 3. Generate opening statistics
// 4. Write to data/enriched/round-N-enriched.json

const enrichedGame = {
  ...game,
  opening: {
    eco: 'C89',
    name: 'Ruy Lopez: Marshall Attack',
    matchedMoves: 'e4 e5 Nf3 Nc6 Bb5...',
    confidence: 'high',
    matchDepth: 12
  },
  moveCount: 45,
  moves: 'e4 e5 Nf3 ...'  // Full sequence
};
```

**Opening Statistics to Generate:**
```javascript
const openingStats = {
  totalGames: 218,
  gamesWithOpenings: 215,
  coverageRate: 98.6,

  byEco: {
    'C89': { count: 5, name: 'Ruy Lopez: Marshall Attack' },
    'D49': { count: 3, name: 'Semi-Slav Defense: Meran' }
  },

  mostPopular: [
    { eco: 'C89', name: 'Ruy Lopez: Marshall Attack', count: 5 },
    { eco: 'B90', name: 'Sicilian Defense: Najdorf', count: 4 }
  ],

  byTimeControl: {
    classical: { totalGames: 156, uniqueOpenings: 45 },
    rapid: { totalGames: 52, uniqueOpenings: 32 },
    blitz: { totalGames: 10, uniqueOpenings: 8 }
  }
};
```

---

### Task 3.5: Update Data Schema
**Add to IMPLEMENTATION_PLAN.md:**

**Enriched Data Schema:**
```javascript
{
  "roundNumber": 1,
  "roundName": "Round 1",
  "totalMatches": 78,
  "totalGames": 218,

  "openingStats": {
    "totalGames": 218,
    "gamesWithOpenings": 215,
    "coverageRate": 98.6,
    "mostPopular": [...],
    "byTimeControl": {...}
  },

  "matches": [
    {
      "matchId": "round-1-match-1",
      "players": [...],
      "outcome": {...},
      "gameDetails": [
        {
          // ... existing fields
          "moves": "e4 e5 Nf3 Nc6 ...",      // NEW
          "moveCount": 45,                   // NEW
          "opening": {                       // NEW
            "eco": "C89",
            "name": "Ruy Lopez: Marshall Attack",
            "confidence": "high",
            "matchDepth": 12
          }
        }
      ]
    }
  ]
}
```

---

### Task 3.6: Test on Round 1
**Test Cases:**
1. ✅ Famous opening (e.g., Sicilian Defense) - should match with high confidence
2. ✅ Rare opening - should still match if in database
3. ✅ Very short game (< 5 moves) - should match basic opening
4. ✅ Opening statistics accuracy

**Validation:**
- [ ] Coverage rate > 90%
- [ ] Most popular openings look reasonable
- [ ] ECO codes are valid
- [ ] Confidence levels make sense

---

### Task 3.7: Generate Time Control Opening Splits
**Optional but useful:**

Create opening-enriched versions of time control splits:
- `data/enriched/round-1-classical-enriched.json`
- `data/enriched/round-1-rapid-enriched.json`
- `data/enriched/round-1-blitz-enriched.json`

This enables questions like:
- "What openings are most popular in classical games?"
- "Do rapid games have different opening preferences?"
- "What's the most common opening in blitz tiebreaks?"

---

## Dependencies

### Required
- ✅ chess.js (already in package.json) - for PGN parsing
- ✅ chess-openings.js database - copy from lichess4545

### Optional
- Consider: chess-openings npm package (but custom DB has more openings)

---

## Risks & Mitigation

### Risk 1: PGN Parsing Complexity
**Issue:** Clock annotations make parsing harder
**Mitigation:** Write robust regex to strip annotations first

### Risk 2: Opening Database Mismatches
**Issue:** Some FIDE games may use uncommon openings
**Mitigation:** Accept some games won't match, track coverage rate

### Risk 3: Data Size Growth
**Issue:** Storing full PGN + moves increases file size
**Mitigation:**
- Keep enriched data separate
- Can always regenerate from source
- Consider gzip for large files

---

## Success Metrics

After Stage 3 completion:
- [ ] 90%+ opening coverage rate
- [ ] All 218 Round 1 games have move sequences
- [ ] Opening statistics generated
- [ ] Data pipeline still runs cleanly
- [ ] Can identify most popular openings by time control
- [ ] Ready for Stage 4 (stats generation)

---

## Next Steps After Stage 3

**Stage 4: Core Statistics Generation**
- Win rates by opening
- Average game length by opening/time control
- Player performance by opening
- Critical positions identification
- Material imbalances analysis

**Stage 5: Frontend - Round View**
- Display opening statistics
- Interactive opening explorer
- Time control breakdowns
- Match-by-match view

---

## Questions for Review

1. **Scope:** Should we store full PGN in consolidated data, or only in enriched data?
   - **Recommendation:** Store in consolidated (Stage 1) - single source of truth

2. **Granularity:** Should we enrich time control splits separately?
   - **Recommendation:** Yes, enables time-control-specific opening analysis

3. **Performance:** 218 games is small, but what about all rounds?
   - **Recommendation:** Benchmark on Round 1 first, optimize if needed

4. **Database:** Use lichess chess-openings or build our own?
   - **Recommendation:** Use lichess (2000+ openings, well-tested)

---

## Estimated Effort

- **Task 3.1** (Update consolidation): 1-2 hours
- **Task 3.2** (Copy database): 5 minutes
- **Task 3.3** (Opening matcher): 30 minutes
- **Task 3.4** (Enrichment script): 2-3 hours
- **Task 3.5** (Documentation): 30 minutes
- **Task 3.6** (Testing): 1 hour
- **Task 3.7** (Time control splits): 1 hour

**Total:** ~6-8 hours of focused work

**Critical Path:** Task 3.1 blocks everything else
