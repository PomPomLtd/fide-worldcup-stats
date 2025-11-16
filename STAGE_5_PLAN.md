# Stage 5: Frontend Implementation Plan

**Goal:** Create Next.js frontend to display Round 1 statistics

**Status:** 🔄 In Progress
**Started:** 2025-11-16 Evening

---

## Overview

Build React components and pages to display the generated statistics JSON files. Adapt lichess4545-stats architecture for knockout tournament format.

### Key Adaptations from Lichess4545

| Aspect | Lichess4545 | FIDE World Cup |
|--------|-------------|----------------|
| **URL Structure** | `/stats/46/round/1` | `/stats/round/1` |
| **JSON Files** | `season-46-round-1.json` | `round-1-stats.json` |
| **Context** | Team-based league | Knockout tournament |
| **Team Components** | Yes (board assignments) | No (remove all) |
| **Round Names** | "Round 1", "Round 2" | "Round 1", "Round 2 (64 players)" |
| **Overview** | Season aggregation | Tournament aggregation |

---

## Implementation Strategy

### Phase 1: Core Infrastructure (Priority 1)
**Goal:** Get basic stats display working

1. ✅ **Page Routes** (already exist - need adaptation)
   - `app/page.tsx` - Tournament landing page
   - `app/stats/round/[roundNumber]/page.tsx` - Round statistics page

2. **Base Components** (copy from lichess4545)
   - `components/stats/stat-card.tsx` - Already exists ✅
   - `components/stats/award-card.tsx` - Already exists ✅
   - `components/stats/player-name.tsx` - Already exists ✅

3. **Data Loading Pattern**
   - Client-side fetch from `/stats/round-{N}-stats.json`
   - Loading states
   - Error handling

### Phase 2: Round Statistics Page (Priority 1)
**Goal:** Display all Round 1 statistics

**Sections to implement (in order):**

1. **Round Header** (`components/stats/round-header.tsx`)
   - Breadcrumb navigation
   - Round name display
   - Round pagination (Previous/Next)

2. **Overview Stats** (`components/stats/overview-stats.tsx`)
   - 4 gradient stat boxes
   - Total games, moves, average length, opening coverage

3. **Results Breakdown** (`components/stats/results-section.tsx`)
   - Win/Draw/Loss percentages
   - Pie chart visualization
   - Decisive game percentage

4. **Awards Section** (`components/stats/awards-section.tsx`)
   - Bloodbath, Pacifist, Speed Demon, Endgame Wizard, Opening Sprinter
   - Clickable game links (future: link to game viewer)

5. **FIDE Fun Awards** (`components/stats/fide-awards-section.tsx`) - NEW
   - Tiebreak Warrior, Giant Slayer, Rapid Fire, Blitz Wizard
   - Classical Purist, Marathon Master, Fortress Builder, Upset Artist

6. **Match Statistics** (`components/stats/match-stats-section.tsx`) - NEW
   - Tiebreak analysis
   - Time control breakdown
   - Match outcome distribution

7. **Game Phases** (`components/stats/game-phases-section.tsx`)
   - Opening/Middlegame/Endgame averages
   - Longest phases
   - Longest wait till capture

8. **Tactics Section** (`components/stats/tactics-section.tsx`)
   - Captures, promotions, castling
   - En passant games
   - Bloodiest/quietest games

9. **Openings Section** (`components/stats/openings-section.tsx`)
   - Most popular openings
   - Opening variations chart
   - Win rate by opening (if available)

10. **Piece Statistics** (`components/stats/pieces-section.tsx`)
    - Piece activity
    - Captures by piece
    - Most active pieces

11. **Checkmates** (`components/stats/checkmates-section.tsx`)
    - Checkmate patterns
    - Fastest checkmate
    - Checkmate by piece

12. **Board Heatmap** (`components/stats/board-heatmap.tsx`)
    - Already exists ✅
    - Square activity visualization
    - Capture heatmap

### Phase 3: Tournament Landing Page (Priority 2)
**Goal:** Show round list and tournament overview

1. **Tournament Hero** (`components/tournament-hero.tsx`)
   - Tournament info
   - Total stats summary

2. **Round Grid** (`components/round-card.tsx`)
   - Card for each round
   - Match count, game count
   - Click to round stats

### Phase 4: Tournament Overview (Priority 3)
**Goal:** Aggregate statistics across all rounds (future)

**Defer to later:** Will implement after multiple rounds are available

---

## Technical Implementation Details

### TypeScript Interfaces

Create `app/stats/types.ts` with interfaces matching our JSON structure:

```typescript
export interface RoundStats {
  roundNumber: number;
  roundName: string;
  generatedAt: string;

  // Match-level (FIDE-specific)
  matchStats: MatchStats;

  // Game-level statistics
  overview: OverviewStats;
  results: ResultsStats;
  tactics: TacticsStats;
  pieces: PieceStats;
  checkmates: CheckmateStats;
  heatmap: HeatmapStats;
  gamePhases: GamePhaseStats | null;
  openings: OpeningStats;
  awards: AwardStats;

  // Time control breakdown
  byTimeControl: {
    classical?: RoundStats;
    rapidTier1?: RoundStats;
    rapidTier2?: RoundStats;
    blitzTier1?: RoundStats;
    blitzTier2?: RoundStats;
  };

  // FIDE-specific
  ratingAnalysis: RatingAnalysis;
  fideFunAwards: FideFunAwards;

  dataInfo: DataInfo;
}
```

### Data Loading Pattern

```typescript
// app/stats/round/[roundNumber]/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import type { RoundStats } from '@/app/stats/types'

export default function RoundPage() {
  const params = useParams()
  const roundNumber = parseInt(params.roundNumber as string)

  const [stats, setStats] = useState<RoundStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(`/stats/round-${roundNumber}-stats.json`, {
          cache: 'no-store'
        })

        if (!response.ok) {
          throw new Error(`Round ${roundNumber} not found`)
        }

        const data = await response.json()
        setStats(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [roundNumber])

  if (loading) return <LoadingSpinner />
  if (error) return <ErrorMessage error={error} />
  if (!stats) return null

  return (
    <div>
      <RoundHeader roundNumber={roundNumber} roundName={stats.roundName} />
      <OverviewStats stats={stats.overview} />
      <ResultsSection stats={stats.results} />
      {/* ... more sections */}
    </div>
  )
}
```

### Component Structure

Each section component follows this pattern:

```typescript
// components/stats/overview-stats.tsx
import { StatCard } from './stat-card'

interface OverviewStatsProps {
  stats: {
    totalGames: number;
    totalMoves: number;
    averageGameLength: number;
    longestGame: { moves: number; white: string; black: string };
  }
}

export function OverviewStats({ stats }: OverviewStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatBox title="Total Games" value={stats.totalGames} />
      <StatBox title="Total Moves" value={stats.totalMoves} />
      <StatBox title="Average Length" value={`${stats.averageGameLength} moves`} />
      <StatBox title="Longest Game" value={`${stats.longestGame.moves} moves`} />
    </div>
  )
}
```

---

## Files to Create

### Pages
- [ ] `app/stats/round/[roundNumber]/page.tsx` - Round statistics page
- [ ] Adapt `app/page.tsx` - Tournament landing

### Type Definitions
- [ ] `app/stats/types.ts` - TypeScript interfaces for all stats

### Components (Section Components)
- [ ] `components/stats/round-header.tsx`
- [ ] `components/stats/overview-stats.tsx`
- [ ] `components/stats/results-section.tsx`
- [ ] `components/stats/awards-section.tsx`
- [ ] `components/stats/fide-awards-section.tsx` (NEW)
- [ ] `components/stats/match-stats-section.tsx` (NEW)
- [ ] `components/stats/game-phases-section.tsx`
- [ ] `components/stats/tactics-section.tsx`
- [ ] `components/stats/openings-section.tsx`
- [ ] `components/stats/pieces-section.tsx`
- [ ] `components/stats/checkmates-section.tsx`

### Utility Components
- [ ] `components/loading-spinner.tsx`
- [ ] `components/error-message.tsx`
- [ ] `components/stat-box.tsx` (gradient stat boxes)

---

## Testing Strategy

1. **Start dev server:** `npm run dev`
2. **Test incremental:** Add one section at a time
3. **Check data binding:** Verify JSON data displays correctly
4. **Test navigation:** Round pagination, breadcrumbs
5. **Dark mode:** Test all components in dark mode
6. **Responsive:** Test mobile, tablet, desktop layouts

---

## Success Criteria

- [ ] Round 1 page loads at `/stats/round/1`
- [ ] All statistics sections display correctly
- [ ] Match stats show tiebreak analysis
- [ ] FIDE fun awards display properly
- [ ] Charts render (Recharts)
- [ ] Dark mode works throughout
- [ ] Responsive on all screen sizes
- [ ] No TypeScript errors
- [ ] No console errors

---

## Next Steps After Stage 5

1. **Stage 6:** Process all rounds (2-7) and generate stats
2. **Stage 7:** Tournament overview page (aggregate across rounds)
3. **Stage 8:** Additional features (game viewer, search, filters)
4. **Stage 9:** Polish and deploy to Vercel

---

**Last Updated:** 2025-11-16 Evening
