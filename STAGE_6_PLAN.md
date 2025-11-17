# Stage 6: Tournament Overview Page

**Goal:** Create aggregated statistics page showing tournament-wide metrics across all rounds

**Status:** 🔄 READY TO START
**Priority:** High
**Estimated Time:** 4-6 hours

---

## Overview

Create a tournament overview page at `/stats/overview` that aggregates data from all 5 rounds, providing a bird's-eye view of the entire FIDE World Cup 2025. This page will complement the per-round statistics with cross-round analysis, hall of fame, and tournament-wide trends.

---

## Prerequisites Checklist

### Data Requirements
- [ ] Check if `public/stats/tournament-overview.json` exists
- [ ] Verify tournament overview JSON is up-to-date
- [ ] Review aggregation structure and fields
- [ ] Regenerate if needed using overview generator script

### Type Definitions
- [ ] Review existing types in `app/stats/types.ts`
- [ ] Add tournament overview types if not present
- [ ] Ensure type safety for all overview sections

### Reference Materials
- [ ] Review `lichess4545-stats` overview implementation
- [ ] Check available components from Stage 5
- [ ] Identify reusable patterns from round pages

---

## Implementation Tasks

### Phase 1: Data Review & Preparation (Priority: Critical)

#### Task 6.1: Review Tournament Overview JSON
**Time Estimate:** 30 minutes

**Steps:**
1. Check if file exists: `public/stats/tournament-overview.json`
2. Review JSON structure and completeness
3. Verify all rounds (1-5) are included
4. Check aggregated statistics make sense

**Expected Structure:**
```json
{
  "tournamentName": "FIDE World Cup 2025",
  "location": "Goa, India",
  "totalRounds": 5,
  "roundsCompleted": 5,
  "generatedAt": "...",

  "overall": {
    "totalGames": 437,
    "totalMatches": 143,
    "totalPlayers": 256,
    "totalMoves": 20547,
    "averageGameLength": 47.1,
    "longestGame": {...},
    "shortestGame": {...}
  },

  "byRound": [
    {
      "roundNumber": 1,
      "roundName": "Round 1 (128 matches)",
      "matches": 78,
      "games": 218,
      "avgGameLength": 47.1,
      "tiebreakRate": 25.6,
      "upsetRate": 15.4
    },
    // ... rounds 2-5
  ],

  "hallOfFame": {
    "mostAwards": {...},
    "biggestUpsets": [...],
    "longestGames": [...],
    "fastestWins": [...],
    "tiebreakKings": [...],
    "clockMasters": [...]
  },

  "awardFrequency": {
    "bloodbath": 5,
    "pacifist": 5,
    "giantSlayer": 5,
    // ... all awards with counts
  },

  "trends": {
    "avgGameLengthByRound": [47.1, 45.2, 43.8, 42.1, 40.5],
    "whiteWinRateByRound": [37.2, 38.1, 36.5, 39.0, 41.2],
    "tiebreakRateByRound": [25.6, 28.3, 31.0, 35.7, 40.0],
    "upsetRateByRound": [15.4, 12.8, 18.2, 20.1, 25.0]
  },

  "openings": {
    "mostPopular": [...],
    "highestWinRate": [...],
    "byRound": {...}
  },

  "players": {
    "stillActive": 16,
    "eliminated": 240,
    "byRound": {
      "round1": 128,
      "round2": 64,
      "round3": 32,
      "round4": 16,
      "round5": 8,
      "remaining": 4
    }
  }
}
```

**Decision Point:**
- If JSON doesn't exist or is outdated → Create/update generator script
- If JSON is good → Proceed to Phase 2

#### Task 6.2: Generate/Update Overview Data (If Needed)
**Time Estimate:** 1-2 hours (if needed)

**Create:** `scripts/generate-tournament-overview.js`

**Algorithm:**
```javascript
1. Read all round stat JSONs (rounds 1-5)
2. Aggregate overall statistics:
   - Sum total games, matches, moves
   - Calculate averages (weighted by games)
   - Find extremes (longest/shortest across all rounds)
3. Extract hall of fame entries:
   - Sort all awards by significance
   - Identify repeat winners
   - Find most impressive achievements
4. Count award frequency:
   - Tally each award type across rounds
   - Identify common vs rare awards
5. Calculate trends:
   - Track metrics across rounds
   - Identify patterns (game length, tiebreak rate, etc.)
6. Aggregate opening statistics:
   - Most popular openings overall
   - Opening evolution across rounds
7. Player tracking:
   - Count players remaining after each round
   - Track advancement progress
8. Write tournament-overview.json
```

---

### Phase 2: Page Structure (Priority: High)

#### Task 6.3: Create Overview Page Route
**Time Estimate:** 30 minutes

**File:** `app/stats/overview/page.tsx`

**Structure:**
```tsx
'use client'

import { useEffect, useState } from 'react'
import type { TournamentOverview } from '@/app/stats/types'

export default function TournamentOverviewPage() {
  const [overview, setOverview] = useState<TournamentOverview | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        const response = await fetch('/stats/tournament-overview.json', {
          cache: 'no-store'
        })
        if (!response.ok) throw new Error('Overview not found')
        const data = await response.json()
        setOverview(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchOverview()
  }, [])

  if (loading) return <LoadingSpinner />
  if (error) return <ErrorMessage error={error} />
  if (!overview) return null

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <TournamentHero overview={overview} />
        <HallOfFame hallOfFame={overview.hallOfFame} />
        <RoundSummaryTable rounds={overview.byRound} />
        <AwardFrequency awards={overview.awardFrequency} />
        <TrendsSection trends={overview.trends} />
        <OpeningsOverview openings={overview.openings} />
        <PlayerProgress players={overview.players} />
      </div>
    </div>
  )
}
```

---

### Phase 3: Core Sections (Priority: High)

#### Task 6.4: Tournament Hero Section
**Time Estimate:** 45 minutes

**Component:** `components/stats/overview/tournament-hero.tsx`

**Features:**
- Tournament title and location
- Overall statistics (games, matches, moves)
- Tournament progress indicator
- Completion status

**Layout:**
```
┌─────────────────────────────────────────┐
│   FIDE World Cup 2025                   │
│   Goa, India                            │
│                                         │
│   5/7 Rounds Complete  [========>  ]    │
│                                         │
│   [437 Games] [143 Matches] [20.5K Moves] │
│   [47.1 Avg Length] [98.6% Coverage]    │
└─────────────────────────────────────────┘
```

#### Task 6.5: Hall of Fame Section
**Time Estimate:** 1 hour

**Component:** `components/stats/overview/hall-of-fame.tsx`

**Categories:**
1. **Most Awards Won** - Player with most total awards
2. **Biggest Upsets** - Top 5 rating difference upsets
3. **Longest Games** - Top 5 by move count
4. **Fastest Wins** - Top 5 shortest decisive games
5. **Tiebreak Masters** - Most tiebreak wins
6. **Clock Wizards** - Best time management

**Layout:**
```
┌─────────────────────────────────────────┐
│  🏆 Hall of Fame                        │
├─────────────────────────────────────────┤
│  Most Awards        | Player X (12)     │
│  Biggest Upset      | +450 Elo          │
│  Longest Game       | 127 moves         │
│  Fastest Win        | 17 moves          │
│  Tiebreak King      | 5 wins            │
└─────────────────────────────────────────┘
```

#### Task 6.6: Round Summary Table
**Time Estimate:** 1 hour

**Component:** `components/stats/overview/round-summary-table.tsx`

**Columns:**
- Round Number & Name
- Matches / Games
- Avg Game Length
- Tiebreak Rate
- Upset Rate
- View Details (link)

**Layout:**
```
┌──────────────────────────────────────────────────────┐
│ Round              Matches  Games  Avg Len  Tiebreak │
├──────────────────────────────────────────────────────┤
│ Round 1 (128)         78     218    47.1     25.6%   │
│ Round 2 (64)          39     103    45.2     28.3%   │
│ Round 3 (32)          19      54    43.8     31.0%   │
│ Round 4 (16)           9      31    42.1     35.7%   │
│ Round 5 (8)            5      16    40.5     40.0%   │
└──────────────────────────────────────────────────────┘
```

---

### Phase 4: Enhanced Sections (Priority: Medium)

#### Task 6.7: Award Frequency Analysis
**Time Estimate:** 45 minutes

**Component:** `components/stats/overview/award-frequency.tsx`

**Features:**
- Bar chart showing how many times each award was won
- Identify common vs rare awards
- Highlight most competitive awards

**Data:**
- Bloodbath: 5 times (one per round)
- Giant Slayer: 5 times
- Tiebreak Warrior: 3 times (not all rounds had tiebreaks)
- etc.

#### Task 6.8: Trends Visualization
**Time Estimate:** 1 hour (if using charts)

**Component:** `components/stats/overview/trends-section.tsx`

**Charts:**
1. Average game length by round (line chart)
2. White win rate by round (line chart)
3. Tiebreak frequency by round (bar chart)
4. Upset rate by round (line chart)

**Options:**
- Use Recharts (already in package.json)
- Or simple CSS-based progress bars for MVP

#### Task 6.9: Player Progress Tracker
**Time Estimate:** 30 minutes

**Component:** `components/stats/overview/player-progress.tsx`

**Features:**
- Show bracket progression (128 → 64 → 32 → 16 → 8 → 4 → 2 → 1)
- Highlight current round
- Show elimination numbers

**Layout:**
```
Tournament Progression
128 → 64 → 32 → 16 → 8 → [4] → 2 → 1
└──────┘    └──────┘    └────┘
 Rounds 1-2  Rounds 3-4  Round 5
```

---

### Phase 5: Navigation & Polish (Priority: High)

#### Task 6.10: Add Navigation Links
**Time Estimate:** 30 minutes

**Updates:**
1. Add "Overview" link to round pages (header/breadcrumb)
2. Add "View Round N" links from overview page
3. Update main navigation to include overview
4. Breadcrumb: Home > Overview > Round N

**Files to modify:**
- `components/stats/round-header.tsx` - Add overview link
- `app/stats/overview/page.tsx` - Add round links
- Main navigation component

---

## Success Criteria

### Functional Requirements
- [ ] `/stats/overview` loads without errors
- [ ] Shows aggregated data from all 5 rounds
- [ ] Hall of Fame displays top achievements
- [ ] Round summary table is sortable/filterable
- [ ] Award frequency shows all awards
- [ ] Navigation works bidirectionally (overview ↔ rounds)

### Visual Requirements
- [ ] Consistent styling with round pages
- [ ] Dark mode works throughout
- [ ] Responsive on mobile/tablet/desktop
- [ ] Loading states prevent layout shift
- [ ] Error handling for missing data

### Data Quality
- [ ] All statistics are mathematically correct
- [ ] No missing or null data
- [ ] Trends show logical progression
- [ ] Links to round pages work

---

## File Structure

```
app/stats/overview/
└── page.tsx                              # Main overview page

components/stats/overview/
├── tournament-hero.tsx                   # Hero section
├── hall-of-fame.tsx                      # Hall of fame
├── round-summary-table.tsx               # Round table
├── award-frequency.tsx                   # Award frequency
├── trends-section.tsx                    # Trends charts
├── openings-overview.tsx                 # Opening stats
└── player-progress.tsx                   # Bracket progression

scripts/
└── generate-tournament-overview.js       # (If needed) Overview generator

public/stats/
└── tournament-overview.json              # Aggregated data
```

---

## Testing Plan

### Data Testing
1. Verify JSON loads correctly
2. Check all rounds are included
3. Validate aggregated statistics
4. Test with missing round data

### UI Testing
1. Test on desktop (1920x1080, 1366x768)
2. Test on tablet (768x1024)
3. Test on mobile (375x667, 414x896)
4. Test dark mode toggle
5. Test loading states
6. Test error states

### Navigation Testing
1. Overview → Round 1-5 links work
2. Round → Overview links work
3. Breadcrumb navigation works
4. Back button works correctly

---

## Performance Targets

- [ ] Initial page load < 2 seconds
- [ ] JSON fetch < 500ms
- [ ] Render complete < 1 second
- [ ] Smooth animations (60 fps)
- [ ] Lighthouse score > 90

---

## Dependencies

### Required
- Next.js 15 (already installed)
- React 19 (already installed)
- TailwindCSS 4 (already installed)

### Optional (for charts)
- Recharts 3.2.1 (already in package.json)
- Only if implementing trend visualizations

---

## Rollout Plan

### Phase 1: MVP (2-3 hours)
1. Create basic page structure
2. Implement tournament hero
3. Add hall of fame section
4. Create round summary table
5. Add navigation links

### Phase 2: Enhanced (2-3 hours)
1. Add award frequency
2. Implement player progress tracker
3. Polish styling
4. Add loading/error states
5. Test responsiveness

### Phase 3: Optional (If time permits)
1. Add trend visualizations (charts)
2. Implement sorting/filtering
3. Add export functionality
4. Performance optimizations

---

## Next Steps After Stage 6

### Stage 7: Landing Page
- Create main tournament page at `/`
- Add round cards grid
- Tournament information section
- Quick navigation

### Stage 8: Enhanced Features
- Time control filtering
- Interactive charts
- Knockout bracket visualization
- Individual match pages

---

## Notes & Decisions

### Data Source Priority
1. Use existing `tournament-overview.json` if available
2. Generate new file if missing or outdated
3. Ensure generator script is reusable for future rounds

### Chart Library Decision
- **Recommendation:** Use simple CSS for MVP, add Recharts later if needed
- Recharts adds ~100KB to bundle size
- CSS progress bars are lightweight and sufficient for initial version

### Mobile-First Approach
- Design for mobile first
- Enhance for larger screens
- Ensure touch-friendly interactions
- Test on real devices

---

## Risk Mitigation

### Risk: Tournament overview JSON doesn't exist
**Mitigation:** Create generator script (Task 6.2)

### Risk: Aggregated statistics are incorrect
**Mitigation:** Manual verification against round JSONs

### Risk: Performance issues with large dataset
**Mitigation:** Pagination, lazy loading, code splitting

### Risk: Charts increase bundle size
**Mitigation:** Use CSS for MVP, add charts incrementally

---

**Status:** 📋 PLANNED - Ready to begin implementation

**Next Action:** Task 6.1 - Review tournament overview JSON

**Last Updated:** 2025-11-17
