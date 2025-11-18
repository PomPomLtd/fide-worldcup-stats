# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Git Commit Guidelines

**IMPORTANT:** No AI attribution in commit messages
- Do NOT add "Generated with Claude Code" or similar
- Do NOT add "Co-Authored-By: Claude" or AI co-author tags
- Keep commit messages clean and focused on technical changes

## Project Overview

FIDE World Cup 2025 Stats - A Next.js-based static site generator that processes chess tournament PGN files to create comprehensive statistics with beautiful visualizations. Adapted from lichess4545-stats architecture for knockout tournament format.

**Source Project:** Based on `/Users/sgis/DEV/pompom/lichess4545-stats` - a team-based chess league statistics platform. This project adapts that architecture for a single-elimination knockout tournament.

**Key Characteristics:**
- Static JSON generation (no database)
- Modular calculator architecture
- Multi-stage data pipeline (6 processing stages)
- Three time controls: classical (90+30), rapid (25+10, 10+10), blitz (5+3, 3+2)
- Knockout tournament structure (rounds 1-6, single elimination)

## Development Commands

### Data Pipeline (Run in Order)

```bash
# Full pipeline for processing tournament data
npm run consolidate        # Stage 1: Group PGN files by round and match
npm run classify           # Stage 2: Classify games by time control
npm run enrich             # Stage 3: Generate opening names (ECO codes)
npm run generate:stats     # Stage 4: Generate all statistics
npm run analyze            # Stage 5: Stockfish analysis (optional, slow)
npm run generate:overview  # Stage 6: Tournament-wide aggregation

# Process specific round
npm run stats:round1       # Generate stats for Round 1 only
npm run stats:all          # Generate stats for all rounds

# Shortcuts
npm run process:round      # Stages 1-4 for all rounds
npm run process:round1     # Stages 1-4 for Round 1
npm run process:all        # All stages (1-6) for all rounds
```

### Next.js Development

```bash
npm run dev                # Start dev server (with Turbopack)
npm run build              # Production build (with Turbopack)
npm run start              # Start production server
npm run lint               # Run ESLint
```

### Testing Individual Components

```bash
# Test single calculator
node -e "const {calculateOverview} = require('./scripts/utils/calculators/overview'); console.log(calculateOverview([/* games */]))"

# Inspect consolidated data
cat data/consolidated/round-1-matches.json | jq '.matches[0]'

# Check enriched opening data
cat data/enriched/round-1-all.json | jq '.[0].openingName'

# View generated stats
cat public/stats/round-1-stats.json | jq '.overview'
```

## Architecture

### Data Pipeline Flow

```
_SRC/cup2025/round{N}game{M}/games.pgn
  ↓
Stage 1: consolidate-pgns.js → data/consolidated/round-N-matches.json
  ↓
Stage 2: classify-games.js → data/classified/round-N-{all,classical,rapid,blitz}.json
  ↓
Stage 3: enrich-openings.js → data/enriched/round-N-*-enriched.json
  ↓
Stage 4: generate-stats.js → public/stats/round-N-stats.json
  ↓
Stage 5: analyze-pgn.py (optional) → Updated with Stockfish analysis
  ↓
Stage 6: generate-overview.js → public/stats/tournament-overview.json
  ↓
Frontend: Next.js builds static site from JSON files
```

### Key Architectural Patterns

**1. Match vs Game Distinction**
- PGN directories (round1game1, etc.) contain MULTIPLE player pairings
- consolidate-pgns.js groups games by player pairs to identify true matches
- Each match can have 2-80+ games (classical games + tiebreaks)

**2. Time Control Separation**
- Games classified by TimeControl header: classical/rapid/blitz
- Separate statistics generated for each time control
- Combined "all" dataset includes all time controls

**3. Opening Enrichment**
- FIDE PGNs lack ECO codes (unlike Lichess)
- enrich-openings.js matches move sequences against 3,546-opening database
- Uses chess-openings.js from lichess4545-stats
- 98.6% coverage achieved on Round 1

**4. Calculator Modularity**
- Each statistic type has its own calculator module
- Calculators are pure functions: `calculate*(games) => stats object`
- Helper functions in scripts/utils/calculators/helpers/
- No inter-calculator dependencies

**5. Static JSON Output**
- All stats pre-generated as JSON in public/stats/
- Frontend is pure presentation layer (no computation)
- Fast page loads, easy caching, simple deployment

### Directory Structure

```
scripts/
├── consolidate-pgns.js           # Stage 1: Match consolidation
├── classify-games.js             # Stage 2: Time control classification
├── enrich-openings.js            # Stage 3: Opening name generation
├── generate-stats.js             # Stage 4: Statistics orchestrator
├── generate-overview.js          # Stage 6: Tournament aggregation
└── utils/
    ├── pgn-parser.js             # PGN file parsing
    ├── chess-openings.js         # 3,546 opening database
    ├── opening-matcher.js        # Move sequence matching
    ├── time-control-classifier.js # TimeControl parsing
    ├── game-phases.js            # Phase detection logic
    └── calculators/
        ├── helpers.js            # Shared utilities
        ├── helpers/              # Specialized helpers
        │   ├── game-helpers.js   # Game-level utilities
        │   ├── move-helpers.js   # Move parsing
        │   ├── board-helpers.js  # Board state
        │   └── piece-helpers.js  # Piece tracking
        ├── overview.js           # Total games, moves, averages
        ├── results.js            # W/D/L percentages
        ├── game-phases.js        # Opening/middlegame/endgame
        ├── openings.js           # ECO popularity, win rates
        ├── tactics.js            # Captures, castling, promotions
        ├── pieces.js             # Piece activity, survival
        ├── checkmates.js         # Checkmate patterns
        ├── heatmap.js            # Board square popularity
        ├── awards.js             # 11 player awards
        ├── match-stats.js        # Match outcomes, tiebreaks
        ├── rating-analysis.js    # Elo-based insights
        ├── fide-fun-awards.js    # Tournament-specific awards
        ├── time-awards.js        # 10 time-based awards
        └── fun-stats/            # 19+ creative awards
            ├── index.js          # Award orchestrator
            ├── queen-trades.js
            ├── capture-sequence.js
            ├── check-sequence.js
            └── ... (16 more)

app/
├── layout.tsx                    # Root layout
├── page.tsx                      # Landing page
├── globals.css                   # TailwindCSS
└── stats/
    ├── types.ts                  # TypeScript definitions
    ├── overview-types.ts         # Overview page types
    └── round/
        └── [roundNumber]/
            └── page.tsx          # Round detail page

components/stats/
└── (React components for displaying stats)

data/                             # Intermediate data (gitignored)
├── consolidated/                 # Stage 1 output
├── classified/                   # Stage 2 output
└── enriched/                     # Stage 3 output

public/stats/                     # Final JSON (committed)
├── round-N-stats.json           # Per-round statistics
└── tournament-overview.json     # Aggregated stats
```

## Critical Implementation Details

### 1. Game Data Structure

After Stage 3 (enrichment), each game object has:

```javascript
{
  headers: {
    Event: "FIDE World Cup 2025",
    Round: "1.1",          // Match.Game notation
    White: "Player Name",
    Black: "Player Name",
    WhiteFideId: "12345",
    BlackFideId: "67890",
    WhiteElo: "2650",
    BlackElo: "2580",
    Result: "1-0",
    TimeControl: "90 minutes for the first 40 moves...",
    Date: "2025.11.01"
  },
  moves: 45,
  moveList: ["e4", "e5", "Nf3", ...],  // Lightweight format (70% smaller)
  timeControl: "classical",  // Added by classify-games.js
  openingName: "Sicilian Defense: Najdorf Variation",  // Added by enrich-openings.js
  openingEco: "B90",
  // ... additional fields from calculators
}
```

### 2. Calculator Contract

All calculators follow this pattern:

```javascript
/**
 * Calculate [stat name]
 * @param {Array<Object>} games - Enriched game objects
 * @returns {Object} Statistics object matching schema in app/stats/types.ts
 */
function calculateStatName(games) {
  // 1. Filter games if needed (e.g., only games with moves)
  // 2. Initialize accumulator
  // 3. Process each game
  // 4. Aggregate results
  // 5. Return stats object

  return {
    // ... stats matching TypeScript interface
  };
}
```

**Critical Rules:**
- Calculators must be pure functions (no side effects)
- Input: array of enriched game objects
- Output: statistics object matching TypeScript types
- Handle edge cases (empty arrays, missing data, forfeits)
- Use helper functions from helpers.js

### 3. Game Phase Detection

Uses Lichess Divider.scala algorithm (game-phases.js):

```javascript
// Opening: moves before first capture OR before move 15, whichever comes first
// Endgame: when ≤6 total pieces remain (excluding kings and pawns)
// Middlegame: everything else
```

**Important:** This matches Lichess definition, NOT chess theory definitions.

### 4. Time Control Classification

```javascript
// Classical: 90+30 (90min base + 30min increment after move 40)
// Rapid Tier 1: 25+10
// Rapid Tier 2: 10+10, 15+10
// Blitz Tier 1: 5+3
// Blitz Tier 2: 3+2, 3+0
// Armageddon: Special format (rare)
```

Classified in classify-games.js using time-control-classifier.js.

### 5. Performance Considerations

**Critical Performance Issue (Fixed in Stage 4):**
- Early calculator had O(n²) loop creating 78×78 = 6,084 iterations per game
- Caused 40x slowdown on Round 1 (78-game match)
- Solution: Batch operations, avoid nested game loops
- Lesson: ALWAYS consider worst-case match size (80+ games)

**Optimization Strategies:**
- Use helper functions (calculate once, reuse)
- Avoid deep cloning unless necessary
- Minimize moveList processing (pre-computed in enrichment)
- Cache opening lookups in enrich-openings.js

### 6. TypeScript Integration

**All stats must match types in app/stats/types.ts:**

```typescript
// When adding new statistics:
// 1. Add interface to app/stats/types.ts
// 2. Implement calculator in scripts/utils/calculators/
// 3. Add to orchestrator in generate-stats.js
// 4. Update RoundStats interface
// 5. Create React component in components/stats/
```

## Common Development Tasks

### Adding a New Statistic

1. Define TypeScript interface in `app/stats/types.ts`
2. Create calculator in `scripts/utils/calculators/new-stat.js`
3. Add to orchestrator in `scripts/generate-stats.js`:
   ```javascript
   const { calculateNewStat } = require('./utils/calculators/new-stat');
   // ...
   newStat: calculateNewStat(games),
   ```
4. Update `RoundStats` interface in types.ts
5. Run `npm run generate:stats` to test
6. Create React component to display the stat

### Processing New Round Data

```bash
# 1. Add PGN files to _SRC/cup2025/round6game1/, etc.
# 2. Run full pipeline
npm run process:all

# Or step-by-step for debugging:
npm run consolidate
npm run classify
npm run enrich
npm run stats:all
npm run generate:overview
```

### Debugging Pipeline Issues

```bash
# Check consolidation output
cat data/consolidated/round-1-matches.json | jq '.matches | length'

# Verify time control classification
cat data/classified/round-1-all.json | jq '.[0].timeControl'

# Check opening enrichment coverage
cat data/enriched/round-1-all.json | jq '[.[] | select(.openingEco != null)] | length'

# Validate final stats structure
cat public/stats/round-1-stats.json | jq 'keys'
```

### Testing Calculator Changes

```bash
# 1. Modify calculator file
# 2. Re-run stats generation
npm run generate:stats -- --round=1

# 3. Check output
cat public/stats/round-1-stats.json | jq '.overview'

# 4. View in browser
npm run dev
# Visit http://localhost:3000/stats/round/1
```

## Data Quality Notes

**Opening Coverage:**
- Round 1: 98.6% (215/218 games)
- 3 games without ECO: very short games or unusual move orders
- This is acceptable quality (target was 80%)

**Match Boundaries:**
- Consolidation groups by White-Black pairing (case-sensitive)
- Flipped colors create separate matches (intentional for stats)
- Each "match" represents one color pairing

**Forfeit Handling:**
- Games with 0 moves are forfeits
- Counted in totals but excluded from move-based analysis
- Check `game.moves > 0` before processing move data

## Migration Context

This project was adapted from lichess4545-stats (team league statistics) located at `/Users/sgis/DEV/pompom/lichess4545-stats`.

**Key changes:**

**Removed:**
- All team-related calculators and components
- Season/round comparison (single tournament)
- Multi-season navigation
- Team awards section

**Added:**
- Match consolidation logic (group by player pairs)
- Time control classification (classical/rapid/blitz)
- Opening enrichment (generate ECO codes from moves)
- Match statistics (tiebreak frequency, match outcomes)
- FIDE-specific awards (Giant Slayer, etc.)

**When adapting components from lichess4545-stats:**
1. Remove all team-related props and logic
2. Update data loading paths (`/stats/season-46-round-1.json` → `/stats/round-1-stats.json`)
3. Adapt URL structure (`/stats/46/round/1` → `/stats/round/1`)
4. Check for season/round navigation patterns and simplify to single tournament

**See migration.md for complete architectural analysis.**

## Project Status

Currently at Stage 4 (Statistics Generation) complete. Stages 5-10 remaining:
- Stage 5: Frontend round view
- Stage 6: All rounds processing
- Stage 7: Tournament overview
- Stage 8: Stockfish analysis
- Stage 9: Polish & deploy
- Stage 10: Future enhancements

**See IMPLEMENTATION_PLAN.md for detailed stage tracking.**

## Important Conventions

**File Naming:**
- PGN source: `_SRC/cup2025/round{N}game{M}/games.pgn`
- Consolidated: `data/consolidated/round-{N}-matches.json`
- Classified: `data/classified/round-{N}-{timeControl}.json`
- Enriched: `data/enriched/round-{N}-{timeControl}-enriched.json`
- Stats: `public/stats/round-{N}-stats.json`

**Player Names:**
- Format: "Last, First" (e.g., "Carlsen, Magnus")
- Case-sensitive for match pairing
- FIDE IDs available in headers

**Round Numbers:**
- Round 1-6 (knockout progression)
- Round 3 = Round of 16
- Round 4 = Quarter-finals
- Round 5 = Semi-finals
- Round 6 = Final

## Time-Based Awards

FIDE World Cup PGNs include clock annotations:
- `[%clk HH:MM:SS]` - Time remaining on clock
- `[%emt HH:MM:SS]` - Elapsed move time (direct measurement)

**Analyzer:** `scripts/utils/time-analyzer-fide.js`
- Extracts `%clk` and `%emt` from FIDE PGN annotations
- Direct time measurement (better than Lichess which requires calculation)
- Adaptive thresholds by time control (classical/rapid/blitz)

**Calculator:** `scripts/utils/calculators/time-awards.js`

**10 Time Awards:**

*Core Awards (6):*
1. **🤔 Longest Think** - Most time spent on a single move
2. **⏰ Zeitnot Addict** - Most moves in time pressure
3. **🏆 Time Scramble Survivor** - Won while under extreme time pressure
4. **⚡ Bullet Speed** - Fastest average move time (min 15-20 moves)
5. **📚 Opening Blitzer** - Fastest average time in opening (first 8-10 moves)
6. **🏃 Premove Master** - Most instant moves (< 1s classical, < 0.5s rapid/blitz)

*FIDE-Specific Awards (4):*
7. **🔥 Tiebreak Pressure King** - Won tiebreaks with critical time pressure
8. **📉 Classical Time Burner** - Used least time in classical games
9. **🌾 Increment Farmer** - Gained most time from increments (net positive)
10. **🎯 Time Control Specialist** - Best time management in specific time control

**Adaptive Thresholds:**
```javascript
classical:   { zeitnot: 300s, extreme: 120s, critical: 60s, premove: 1.0s }
rapidTier1:  { zeitnot: 120s, extreme: 60s,  critical: 30s, premove: 0.5s }
blitzTier1:  { zeitnot: 60s,  extreme: 30s,  critical: 10s, premove: 0.5s }
```

**Frontend:** `components/stats/time-awards.tsx`
- Beautiful card-based display with color coding
- Proper player name formatting via `formatPlayerName()`
- Time formatting helpers for MM:SS and HH:MM:SS display

## Known Issues & Gotchas

1. **Directory structure is misleading**: `round1game1/` contains multiple pairings, not one match
2. **No ECO codes in source**: Must generate from move sequences
3. **Match size varies wildly**: 2 games (quick win) to 80+ games (epic tiebreak)
4. **Performance**: Avoid O(n²) loops - 78×78 = 6,084 iterations!
5. **Time control parsing**: Multiple formats, test thoroughly
6. **Case sensitivity**: Player name matching is case-sensitive

## External Dependencies

**Node.js Libraries:**
- chess.js 1.4.0 - Game validation and move parsing
- @mliebelt/pgn-parser 1.4.18 - PGN file parsing
- next 15.5.2 - Framework
- react 19.1.0 - UI
- recharts 3.2.1 - Visualizations

**Python (Optional):**
- python-chess - Stockfish integration
- stockfish - Engine analysis

**Data:**
- chess-openings.js - 3,546 opening database from Lichess
