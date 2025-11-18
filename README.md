# FIDE World Cup 2025 Stats

> Comprehensive statistics platform for the FIDE World Cup 2025 - Beautiful visualizations of games, openings, tactics, and player awards

[![Live Site](https://img.shields.io/badge/Live-Production-brightgreen)](https://fide-worldcup-stats-aykqc3m10-pompom-projects.vercel.app)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Deploy](https://img.shields.io/badge/Deploy-Vercel-black)](https://vercel.com)

## Overview

This project creates beautiful, comprehensive statistics for the **FIDE World Cup 2025** held in Goa, India.

### Features

- **Comprehensive Statistics**: 15+ stat categories including openings, tactics, piece activity, checkmates, and more
- **Time Control Separation**: Distinct stats for classical, rapid, and blitz games
- **Player Awards**: 32+ awards including "Bloodbath", "Speed Demon", "Opening Hipster", and creative fun stats
- **Stockfish Analysis**: Engine analysis for accuracy, blunders, and best moves
- **Beautiful UI**: Modern Next.js frontend with TailwindCSS and dark mode
- **Static Generation**: No database required, fast static site deployment
- **Knockout Bracket**: Track match winners through the tournament

## Tournament Structure

The FIDE World Cup is a 206-player single-elimination knockout tournament with 8 rounds:

- **Round 1**: First elimination
- **Round 2** (Round of 128): Top 50 seeds enter here
- **Round 3** (Round of 64)
- **Round 4** (Round of 32)
- **Round 5** (Round of 16)
- **Round 6** (Quarterfinals)
- **Round 7** (Semifinals)
- **Round 8** (Final + 3rd/4th place playoff)

Each match consists of:
- 2 classical games (90+30 time control)
- If tied: rapid tiebreaks (25+10 or faster)
- If still tied: blitz tiebreaks (5+3 or 3+2)
- If still tied: Armageddon

## Technology Stack

- **Frontend**: Next.js 15, React 19, TailwindCSS 4
- **Visualization**: Recharts 3.2.1
- **Chess Engine**: chess.js 1.4.0, Stockfish (via Python)
- **Language**: TypeScript 5
- **Deployment**: Vercel
- **No Database**: Static JSON generation

## Project Status

✅ **Live in Production** - Deployed to Vercel with automated stats generation

🔴 **Live Site**: [https://fide-worldcup-stats-aykqc3m10-pompom-projects.vercel.app](https://fide-worldcup-stats-aykqc3m10-pompom-projects.vercel.app)

See [DEPLOYMENT_PLAN.md](./DEPLOYMENT_PLAN.md) for deployment details.

### Implementation Stages

- [x] **Stage 1**: Foundation - PGN processing and project structure ✅
- [x] **Stage 2**: Time control classification ✅
- [x] **Stage 3**: Opening enrichment (generate ECO codes) ✅
- [x] **Stage 4**: Core statistics generation ✅
- [x] **Stage 5**: Frontend - Round view ✅
- [x] **Stage 6**: Process all rounds (1-6 complete) ✅
- [x] **Stage 7**: Tournament overview and aggregation ✅
- [x] **Stage 8**: Deployment and automation ✅
- [ ] **Stage 9**: Stockfish analysis integration (optional, manual)
- [ ] **Stage 10**: Future enhancements (Round 7-8 when available)

## Data Pipeline

```
PGN Files → Consolidate → Classify → Enrich → Generate Stats → Analyze → Aggregate → Frontend
```

1. **Consolidate**: Group PGN files by knockout round
2. **Classify**: Tag games by time control (classical/rapid/blitz)
3. **Enrich**: Generate opening names and ECO codes from move sequences
4. **Generate**: Calculate 15+ statistic types per round
5. **Analyze**: Run Stockfish engine analysis (optional)
6. **Aggregate**: Create tournament-wide overview stats
7. **Frontend**: Display in beautiful Next.js UI

## Key Innovations

### 1. Time Control Separation
Unlike league play, World Cup matches include multiple time controls. Stats are generated separately for:
- Classical games (strategic depth)
- Rapid games (faster tactics)
- Blitz games (intuition and speed)

### 2. Opening Enrichment
FIDE PGN files lack ECO codes. We generate them by:
- Matching move sequences against 3,546 opening database
- Using chess-openings.js from lichess4545
- Falling back to first-move classification

### 3. Match Winner Tracking
Knockout format requires tracking:
- Match outcomes (classical score + tiebreak winner)
- Who advances to next round
- Bracket progression

## Deployment

### Live Site
**Production URL**: [https://fide-worldcup-stats-aykqc3m10-pompom-projects.vercel.app](https://fide-worldcup-stats-aykqc3m10-pompom-projects.vercel.app)

### GitHub Actions Workflows

All workflows are **manual-trigger only** (no automatic runs). Choose the workflow that fits your needs:

#### 📊 Generate Tournament Statistics
**Purpose**: Complete stats generation (awards, openings, tactics, etc.)
**Time**: ~30 minutes
**Architecture**: Reads existing Stockfish analysis if available (decoupled)
**When to use**: Always - for any stats update

```bash
gh workflow run "📊 Generate Tournament Statistics"
```

**Note**: This workflow reads `data/analysis/*.json` files if present. Stockfish analysis persists across stats regenerations.

#### 🔬 Stockfish Analysis (Parallel)
**Purpose**: Fast parallel engine analysis across all 6 rounds (independent)
**Time**: ~60 minutes
**Architecture**: Writes to `data/analysis/*.json` (persists across stats runs)
**When to use**: First run, or when updating engine analysis depth

```bash
gh workflow run "🔬 Stockfish Analysis (Parallel)" -f depth=15
```

**Benefits**: Analysis files persist - stats can regenerate quickly without re-running Stockfish.

#### 🔬 Stockfish Analysis (Sequential)
**Purpose**: Single-round or sequential analysis with detailed progress
**Time**: Varies by round (15-60 min per round)
**When to use**: Testing, single round updates, or troubleshooting

```bash
# Analyze specific round
gh workflow run "🔬 Stockfish Analysis" -f round=6 -f depth=15

# Analyze all rounds (slow - 3-5 hours)
gh workflow run "🔬 Stockfish Analysis" -f depth=15
```

#### 🏆 Generate Tournament Overview
**Purpose**: Aggregate stats across all rounds
**Time**: <5 minutes
**When to use**: After updating individual round stats

```bash
gh workflow run "🏆 Generate Tournament Overview"
```

### Recommended Workflow

**First Run (Complete Setup):**
```bash
# Step 1: Generate stats (30 min)
gh workflow run "📊 Generate Tournament Statistics"

# Step 2: After completion, run Stockfish analysis (60 min)
gh workflow run "🔬 Stockfish Analysis (Parallel)" -f depth=15

# Total: ~90 minutes
```
Analysis data persists in `data/analysis/*.json` for future stats regenerations.

**Daily Updates (When PGN Data Changes):**
```bash
# Just regenerate stats (30 min) - uses cached Stockfish analysis
gh workflow run "📊 Generate Tournament Statistics"
```
Stats will automatically include existing Stockfish data from previous runs.

**Updating Stockfish Analysis (Optional):**
```bash
# Run Stockfish independently (60 min)
gh workflow run "🔬 Stockfish Analysis (Parallel)" -f depth=15

# Then regenerate stats to include new analysis (30 min)
gh workflow run "📊 Generate Tournament Statistics"
```

## Installation

```bash
# Clone the repository
git clone https://github.com/PomPomLtd/fide-worldcup-stats.git
cd fide-worldcup-stats

# Install dependencies
npm install

# Install Python dependencies (for Stockfish analysis)
pip install -r requirements.txt

# Run development server
npm run dev
```

## Usage

### Process Tournament Data

```bash
# Full pipeline
npm run consolidate        # Group PGNs by round
npm run classify           # Classify by time control
npm run enrich             # Add opening names
npm run generate:stats     # Generate statistics
npm run analyze            # Stockfish analysis (optional)
npm run generate:overview  # Tournament aggregation

# Or process everything at once
npm run process:all
```

### Development

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Start production server
npm run start
```

## Statistics Categories

### Core Stats (12 categories)
1. **Overview** - Games, moves, longest/shortest games
2. **Results** - Win/draw/loss percentages by time control
3. **Game Phases** - Opening/middlegame/endgame duration
4. **Openings** - ECO codes, popularity, win rates
5. **Tactics** - Captures, castling, promotions, en passant
6. **Pieces** - Activity, survival rates, captures
7. **Checkmates** - Patterns by piece type
8. **Board Heatmap** - Square popularity and capture density
9. **Player Awards** - 11 performance awards
10. **Fun Stats** - 21+ creative awards
11. **Match Stats** - Match winners, tiebreak frequency
12. **Rating Analysis** - Elo-based insights, upsets

### Player Awards (11 categories)
- Bloodbath (most captures)
- Pacifist (fewest captures)
- Speed Demon (most moves in won game)
- Endgame Wizard (longest endgame)
- Opening Sprinter (shortest opening)
- Marathon Match (most games in match)
- Tiebreak Specialist (won in rapid/blitz)
- Comeback King (won after losing game 1)
- And more...

### Fun Stats (21+ creative awards)
- Queen Trades (fastest/slowest)
- Capture Sequences (longest streak)
- Check Sequences (longest check streak)
- Pawn Storm (aggressive pawn play)
- Piece Loyalty (stays on same square)
- Square Tourist (visits most squares)
- Opening Hipster (most obscure opening)
- Dadbod Shuffler (most king moves)
- And 13+ more creative categories...

## Contributing

Contributions welcome! This project is in active development.

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## License

MIT License - see [LICENSE](LICENSE) file for details

## Acknowledgments

- **Chess Library**: [chess.js](https://github.com/jhlywa/chess.js)
- **Opening Database**: Lichess opening database (3,546+ openings)
- **Engine**: [Stockfish](https://stockfishchess.org/)
- **Framework**: [Next.js](https://nextjs.org/)

## Contact

For questions or feedback, please [open an issue](https://github.com/PomPomLtd/fide-worldcup-stats/issues).

---

**Status**: ✅ Live in Production | **Last Updated**: November 18, 2025 | **Rounds**: 6/8
