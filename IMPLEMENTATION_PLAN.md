# FIDE World Cup Stats - Implementation Plan

## Current Status: Stage 1 - Foundation

**Started:** 2025-11-16
**Current Stage:** 1 of 10
**Overall Progress:** 5%

---

## Stage 1: Foundation (In Progress)

### Goal
Set up project structure and basic PGN processing

### Success Criteria
- ✅ GitHub repository initialized
- ✅ Project documentation complete
- [ ] Base code structure from lichess4545-stats copied
- [ ] Team-related code removed
- [ ] Can parse FIDE PGN files
- [ ] Can extract match metadata
- [ ] Round 1 data successfully consolidated

### Tasks Progress

#### ✅ Task 1.1: Initialize GitHub Repository
**Status:** COMPLETE
**Completed:** 2025-11-16
- Created repository: https://github.com/PomPomLtd/fide-worldcup-stats
- Configured SSH access
- Added comprehensive README.md
- Added detailed migration.md

#### ✅ Task 1.2: Create Migration Plan
**Status:** COMPLETE
**Completed:** 2025-11-16
- Analyzed lichess4545-stats architecture (15+ stat types)
- Analyzed FIDE World Cup PGN structure (640+ games, 43 matches)
- Identified key differences (no ECO codes, multiple time controls, knockout format)
- Designed 6-stage data pipeline
- Created 10-stage implementation roadmap

#### 🔄 Task 1.3: Copy Base Structure
**Status:** IN PROGRESS
**Steps:**
1. Copy core files from lichess4545-stats:
   - package.json (adapt dependencies)
   - tsconfig.json
   - next.config.ts
   - eslint.config.mjs
   - postcss.config.mjs
   - tailwind.config.js
2. Copy directory structure:
   - app/ (Next.js pages)
   - components/ (React components)
   - scripts/utils/ (PGN parser, calculators)
   - public/ (assets)
3. Copy reusable utilities:
   - scripts/utils/pgn-parser.js
   - scripts/utils/chess-openings.js (3,546 openings)
   - scripts/utils/calculators/ (non-team calculators)

**Files to Copy:**
```
lichess4545-stats/
├── package.json                     → Adapt
├── tsconfig.json                    → Copy
├── next.config.ts                   → Copy
├── eslint.config.mjs               → Copy
├── postcss.config.mjs              → Copy
├── tailwind.config.js              → Copy
├── app/
│   ├── layout.tsx                  → Copy
│   ├── globals.css                 → Copy
│   └── page.tsx                    → Adapt
├── components/
│   ├── navigation.tsx              → Adapt
│   ├── footer.tsx                  → Copy
│   ├── board-heatmap.tsx           → Copy
│   └── stats/                      → Copy (except team components)
├── scripts/utils/
│   ├── pgn-parser.js               → Copy
│   ├── chess-openings.js           → Copy
│   ├── opening-names.js            → Copy
│   └── calculators/
│       ├── overview.js             → Copy
│       ├── results.js              → Copy
│       ├── game-phases.js          → Copy
│       ├── openings.js             → Copy
│       ├── tactics.js              → Copy
│       ├── pieces.js               → Copy
│       ├── checkmates.js           → Copy
│       ├── heatmap.js              → Copy
│       ├── awards.js               → Copy
│       └── fun-stats/              → Copy all
└── public/
    ├── favicon.ico                 → Copy
    └── site.webmanifest            → Adapt
```

#### ⏳ Task 1.4: Remove Team-Related Code
**Status:** PENDING
**Files to Remove/Adapt:**
- Remove: scripts/utils/team-loader.js
- Remove: scripts/utils/calculators/teams.js
- Adapt: components/stats/ (remove team awards components)
- Adapt: app/stats/ (remove team pages)

#### ⏳ Task 1.5: Create consolidate-pgns.js Script
**Status:** PENDING
**Location:** `scripts/consolidate-pgns.js`

**Requirements:**
1. Scan `_SRC/cup2025/` directory structure
2. Identify all match directories (roundNgameM pattern)
3. Group matches by knockout round number
4. For each match:
   - Read games.pgn file
   - Extract match metadata (players, FideIds, Elos)
   - Count games
   - Determine match number
5. Output consolidated metadata JSON

**Output Schema:**
```javascript
// data/consolidated/round-1-matches.json
{
  "roundNumber": 1,
  "roundName": "Round 1",
  "totalMatches": 8,
  "matches": [
    {
      "matchId": "round-1-match-1",
      "matchNumber": 1,
      "pgnSourcePath": "_SRC/cup2025/round1game1/games.pgn",
      "players": [
        {
          "name": "Abugenda, Nagi",
          "fideId": "9202544",
          "elo": 1972
        },
        {
          "name": "Erdogmus, Yagiz Kaan",
          "fideId": "44599790",
          "elo": 2651
        }
      ],
      "totalGames": 78,
      "gamesExtracted": 78
    },
    // ... 7 more matches
  ],
  "generatedAt": "2025-11-16T...",
  "sourceDirectory": "_SRC/cup2025/"
}
```

**Algorithm:**
```javascript
1. Read directory: _SRC/cup2025/
2. Filter directories matching: /^round(\d+)game(\d+)$/
3. Group by round number
4. For each match directory:
   a. Read games.pgn
   b. Parse first game's headers (PGN parser)
   c. Extract player info from White/Black headers
   d. Count total games in file
   e. Store metadata
5. Write JSON output per round
```

#### ✅ Task 1.6: Test with Round 1 Data
**Status:** COMPLETE

**Tests Performed:**
1. ✅ Run consolidate-pgns.js on Round 1
2. ✅ Validated output structure
3. ✅ Verified PGN parser handles FIDE format

**Validation Results:**
- ✅ Round 1: 78 matches identified (unique player pairings)
- ✅ 218 total games parsed across 8 directories
- ✅ All player names extracted correctly
- ✅ All FIDE IDs extracted (WhiteFideId, BlackFideId)
- ✅ All Elo ratings extracted (WhiteElo, BlackElo)
- ✅ Game details captured: white, black, result, date, round, timeControl
- ✅ No ECO codes in PGN (as expected)
- ✅ Clock data present: [%clk HH:MM:SS], [%emt HH:MM:SS]
- ✅ TimeControl field captured for later classification

**Sample Match Data:**
- Match 1: Abugenda vs Erdogmus (2 games: 0-1, 1-0)
- Match 27: Thavandiran vs Yuffa (8 games: many tiebreaks)
- Match 58: Lalit vs Warmerdam (8 games: extensive tiebreaks)

#### 🔄 Task 1.7: Verify and Commit
**Status:** IN PROGRESS
**Steps:**
1. ✅ Run basic tests - All passed
2. ✅ Verify data/consolidated/round-1-matches.json - Valid JSON, correct structure
3. ✅ Update this implementation plan - Complete
4. 🔄 Commit with clear message - In progress
5. ⏳ Update migration.md progress - Pending

---

## Stage 2: Time Control Classification (Not Started)

### Goal
Accurately classify games by time control

### Success Criteria
- [ ] All games tagged as classical/rapid/blitz correctly
- [ ] TimeControl parser handles all formats
- [ ] Classified datasets generated

### Tasks (Planned)
- Create classify-games.js script
- Write TimeControl parser
- Tag each game with control type
- Split games into separate datasets
- Validate classification accuracy

**Estimated Start:** After Stage 1 complete

---

## Stage 3: Opening Enrichment (Not Started)

### Goal
Add ECO codes and opening names to games

### Success Criteria
- [ ] 80%+ of games have accurate opening names
- [ ] ECO codes generated from move sequences
- [ ] Opening database integrated

### Tasks (Planned)
- Copy chess-openings.js database
- Create enrich-openings.js script
- Implement move sequence matching
- Add fallback logic
- Test accuracy

**Estimated Start:** After Stage 2 complete

---

## Progress Tracking

### Overall Timeline
- **Week 1-2**: Stages 1-3 (Foundation, Classification, Enrichment)
- **Week 3-4**: Stages 4-5 (Stats Generation, Frontend)
- **Week 5-6**: Stages 6-7 (All Rounds, Overview)
- **Week 7**: Stages 8-9 (Analysis, Polish, Deploy)

### Completed Milestones
- ✅ Repository initialized
- ✅ Migration plan created
- ✅ Documentation complete

### Current Sprint Goals (Week 1)
- [ ] Complete Stage 1: Foundation
- [ ] Complete Stage 2: Time Control Classification
- [ ] Start Stage 3: Opening Enrichment

### Blockers
None currently

### Next Session
1. Copy base structure from lichess4545-stats
2. Remove team-related code
3. Create consolidate-pgns.js script
4. Test with Round 1 data

---

## Notes & Decisions

### 2025-11-16: Initial Planning
- Analyzed both codebases thoroughly
- User confirmed preferences:
  - Stats organized by knockout round (not individual matches)
  - Generate opening names from move sequences
  - Separate stats by time control
  - Include Stockfish analysis
- Created comprehensive migration plan
- Initialized GitHub repository with SSH

### Key Technical Decisions
1. **No Database**: Keep static JSON generation approach
2. **Modular Calculators**: Preserve calculator architecture from lichess4545
3. **Time Control Strategy**: Classify and separate (classical/rapid/blitz)
4. **Opening Strategy**: Generate ECO codes using chess-openings.js database
5. **Match Tracking**: Track winners but defer individual match pages to Phase 2

---

## File Structure Created

```
fide-worldcup-stats/
├── README.md                        ✅ Created
├── migration.md                     ✅ Created
├── IMPLEMENTATION_PLAN.md           ✅ Created (this file)
├── LICENSE                          ✅ Created (MIT)
├── .gitignore                       ✅ Created (Node)
└── _SRC/                           ✅ Exists (not in git)
    └── cup2025/                    ✅ 43 match directories
```

**Next Files to Create:**
- package.json
- tsconfig.json
- next.config.ts
- app/layout.tsx
- scripts/consolidate-pgns.js

---

**Last Updated:** 2025-11-16
**Next Update:** After Stage 1 Task 1.3 complete
