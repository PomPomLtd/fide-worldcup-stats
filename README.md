# FIDE World Cup 2025 Statistics

> Comprehensive statistics platform for the FIDE World Cup 2025 - Beautiful visualizations of games, openings, tactics, and player awards

[![Live Site](https://img.shields.io/badge/Live-Coming%20Soon-blue)](https://fide-worldcup-stats.vercel.app)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Overview

This project creates beautiful, comprehensive statistics for the **FIDE World Cup 2025** held in Goa, India. Inspired by the [lichess4545-stats](https://github.com/lakinwecker/lichess4545-stats) architecture, it adapts a league-based stats system to a knockout tournament format.

### Features

- **Comprehensive Statistics**: 15+ stat categories including openings, tactics, piece activity, checkmates, and more
- **Time Control Separation**: Distinct stats for classical, rapid, and blitz games
- **Player Awards**: 32+ awards including "Bloodbath", "Speed Demon", "Opening Hipster", and creative fun stats
- **Stockfish Analysis**: Engine analysis for accuracy, blunders, and best moves
- **Beautiful UI**: Modern Next.js frontend with TailwindCSS and dark mode
- **Static Generation**: No database required, fast static site deployment
- **Knockout Bracket**: Track match winners through the tournament

## Tournament Structure

The FIDE World Cup is a single-elimination knockout tournament:

- **Round 1**: 64 players → 32 advance
- **Round 2**: 32 players → 16 advance
- **Round 3** (Round of 16): 16 players → 8 advance
- **Round 4** (Quarter-finals): 8 players → 4 advance
- **Round 5** (Semi-finals): 4 players → 2 advance
- **Round 6** (Final): 2 players → 1 champion

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

🚧 **In Development** - Migration plan complete, starting implementation

See [migration.md](./migration.md) for the comprehensive migration plan.

### Implementation Stages

- [ ] **Stage 1**: Foundation - PGN processing and project structure
- [ ] **Stage 2**: Time control classification
- [ ] **Stage 3**: Opening enrichment (generate ECO codes)
- [ ] **Stage 4**: Core statistics generation
- [ ] **Stage 5**: Frontend - Round view
- [ ] **Stage 6**: Process all rounds
- [ ] **Stage 7**: Tournament overview and aggregation
- [ ] **Stage 8**: Stockfish analysis integration
- [ ] **Stage 9**: Polish and deploy
- [ ] **Stage 10**: Future enhancements

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

## Installation

```bash
# Clone the repository
git clone https://github.com/PomPomLtd/fide-worldcup-stats.git
cd fide-worldcup-stats

# Install dependencies
npm install

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

- **Architecture**: Based on [lichess4545-stats](https://github.com/lakinwecker/lichess4545-stats)
- **Chess Library**: [chess.js](https://github.com/jhlywa/chess.js)
- **Opening Database**: Lichess opening database (3,546+ openings)
- **Engine**: [Stockfish](https://stockfishchess.org/)
- **Framework**: [Next.js](https://nextjs.org/)

## Contact

For questions or feedback, please [open an issue](https://github.com/PomPomLtd/fide-worldcup-stats/issues).

---

**Status**: 🚧 In Development | **Target**: Production by end of 2025 World Cup
