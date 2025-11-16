# FIDE World Cup Stats - Next Steps Plan

**Current Status:** Stage 5 Complete (Frontend Round View)
**Date:** 2025-11-16
**Progress:** 50% (5 of 10 stages complete)

---

## Quick Summary

### ✅ Completed Stages (1-5)
1. **Foundation** - PGN consolidation, match grouping
2. **Time Control Classification** - Classical/rapid/blitz separation
3. **Opening Enrichment** - 98.6% ECO code coverage
4. **Statistics Generation** - All 12 calculator modules working
5. **Frontend Round View** - Complete round statistics display

### 🎯 Next Priorities

**Immediate (Stage 6):** Tournament overview page aggregating all rounds
**Short-term (Stage 7):** Landing page with round navigation
**Medium-term (Stage 8-9):** Polish, charts, deployment

---

## Stage 6: Tournament Overview Page

### Goal
Create `/stats/overview` page showing aggregated statistics across all rounds (1-5).

### Prerequisites
1. ✅ Tournament overview JSON exists at `public/stats/tournament-overview.json`
2. ✅ All round JSONs generated (rounds 1-5)
3. ⚠️ Need to check if overview JSON is up-to-date (may need regeneration)

### Tasks

#### 6.1 Review Data Structure
- [ ] Read `public/stats/tournament-overview.json`
- [ ] Understand aggregation structure
- [ ] Check TypeScript types in `app/stats/overview-types.ts`
- [ ] Verify data quality and completeness

#### 6.2 Create Overview Page Route
- [ ] Create `app/stats/overview/page.tsx`
- [ ] Implement data loading (fetch tournament-overview.json)
- [ ] Add loading/error states

#### 6.3 Implement Overview Sections

**Priority 1: Essential Sections**
- [ ] **Tournament Hero**
  - Total games across all rounds
  - Total moves, captures
  - Tournament progress (rounds completed)
  - Current round status

- [ ] **Hall of Fame**
  - Best performances across all rounds
  - Most awards won
  - Biggest upsets
  - Most active players

- [ ] **Round-by-Round Summary**
  - Table showing each round
  - Games per round, match count
  - Tiebreak frequency
  - Click through to round page

**Priority 2: Enhanced Sections**
- [ ] **Award Frequency Analysis**
  - Which awards were won most often
  - Distribution across rounds
  - Visualization (bar chart?)

- [ ] **Leaderboards**
  - Most awards by player
  - Most upsets
  - Most tiebreak wins
  - Longest games

- [ ] **Player Tracker**
  - Who's still in tournament
  - Eliminated players
  - Bracket progression

**Priority 3: Visual Enhancements**
- [ ] **Trends Visualizations**
  - Opening popularity over rounds
  - Average game length by round
  - Win rate trends (white/black)
  - Recharts integration

#### 6.4 Navigation
- [ ] Add "Overview" link to round pages
- [ ] Add "View Round N" links from overview
- [ ] Breadcrumb navigation

### Success Criteria
- [ ] `/stats/overview` loads without errors
- [ ] Shows aggregated data from all 5 rounds
- [ ] Hall of Fame section displays correctly
- [ ] Round summary table is clear and navigable
- [ ] Consistent styling with round pages
- [ ] Dark mode works throughout

### Estimated Time
**4-6 hours** (depends on existing components from lichess4545-stats)

---

## Stage 7: Tournament Landing Page

### Goal
Create main entry point at `/` with tournament information and round navigation.

### Tasks

#### 7.1 Tournament Hero Section
- [ ] FIDE World Cup 2025 branding
- [ ] Tournament dates and location (Goa, India)
- [ ] Quick stats summary (total games, players, etc.)
- [ ] Tournament status (ongoing/completed)

#### 7.2 Round Grid
- [ ] Create card component for each round
- [ ] Display round name, date, match count
- [ ] Show key stats per round
- [ ] Clickable to round detail page
- [ ] Visual indicators (completed/in-progress)

#### 7.3 Quick Links
- [ ] View Overview
- [ ] Latest Round
- [ ] Standings/Bracket (future)

#### 7.4 Tournament Information
- [ ] Format explanation (knockout, tiebreaks)
- [ ] Prize information (if available)
- [ ] Links to FIDE official pages

### Success Criteria
- [ ] Landing page is visually appealing
- [ ] Easy navigation to all rounds
- [ ] Mobile responsive
- [ ] Loading states for dynamic data

### Estimated Time
**3-4 hours**

---

## Stage 8: Enhanced Features

### Goal
Add interactive features, visualizations, and polish.

### Priority Features

#### 8.1 Time Control Filtering
**Why:** Allow users to view stats by Classical/Rapid/Blitz separately

Tasks:
- [ ] Add tabs to round pages (All/Classical/Rapid/Blitz)
- [ ] Load time-control-specific JSONs
- [ ] Update all sections to show filtered data
- [ ] Preserve tab state in URL (?timeControl=classical)

**Estimated:** 4-5 hours

#### 8.2 Charts & Visualizations (Recharts)
**Why:** Visual data is more engaging

Tasks:
- [ ] Results pie chart (White/Black/Draw)
- [ ] Opening popularity bar chart
- [ ] Trend lines (round-by-round)
- [ ] Rating distribution histogram
- [ ] Match outcome flow diagram

**Estimated:** 6-8 hours

#### 8.3 Interactive Knockout Bracket
**Why:** Core feature for knockout tournament

Tasks:
- [ ] Design bracket component
- [ ] Show all rounds (64 → 32 → 16 → 8 → 4 → 2 → 1)
- [ ] Display match winners
- [ ] Clickable to match detail
- [ ] Highlight upsets

**Estimated:** 8-10 hours (complex)

#### 8.4 Individual Match Pages
**Why:** Deep-dive into specific matches

Tasks:
- [ ] Create `/stats/round/[roundNumber]/match/[matchId]` route
- [ ] Display all games in match
- [ ] Show tiebreak progression
- [ ] Player head-to-head stats
- [ ] Opening choices per game

**Estimated:** 6-8 hours

### Optional Features (Time Permitting)
- [ ] Search functionality (find player, opening)
- [ ] PGN viewer/game replayer
- [ ] Export stats as CSV
- [ ] Social media sharing cards
- [ ] Player profile pages

---

## Stage 9: Polish & Deployment

### Goal
Production-ready deployment to Vercel.

### Tasks

#### 9.1 Code Quality
- [ ] Run ESLint, fix all warnings
- [ ] TypeScript strict mode check
- [ ] Remove console.logs
- [ ] Code cleanup and comments

#### 9.2 Performance Optimization
- [ ] Optimize JSON file sizes (compression)
- [ ] Lazy load images
- [ ] Code splitting
- [ ] Bundle size analysis
- [ ] Lighthouse audit (target: 90+ score)

#### 9.3 Mobile Optimization
- [ ] Test all pages on mobile
- [ ] Fix responsive issues
- [ ] Touch-friendly interactions
- [ ] PWA considerations

#### 9.4 SEO & Meta Tags
- [ ] Page titles and descriptions
- [ ] Open Graph tags
- [ ] Twitter cards
- [ ] Sitemap.xml
- [ ] robots.txt

#### 9.5 Deployment
- [ ] Test production build locally (`npm run build`)
- [ ] Deploy to Vercel
- [ ] Configure custom domain (if available)
- [ ] Set up analytics (Vercel Analytics or Google Analytics)
- [ ] Monitor errors (Sentry integration?)

#### 9.6 Documentation
- [ ] Update README with live URL
- [ ] Add screenshots
- [ ] Document deployment process
- [ ] Create user guide (if needed)

### Success Criteria
- [ ] Site loads fast (< 2s)
- [ ] No console errors
- [ ] Mobile responsive
- [ ] SEO optimized
- [ ] Deployed and accessible

### Estimated Time
**6-8 hours**

---

## Stage 10: Future Enhancements (Post-MVP)

### Ideas for Later
1. **Historical Data**
   - Add 2023, 2021 World Cup data
   - Multi-tournament comparison

2. **Advanced Analytics**
   - Stockfish analysis integration
   - Move-by-move accuracy graphs
   - Blunder detection and highlights

3. **Interactive Features**
   - Live updates during tournament
   - Real-time bracket updates
   - Game streaming integration

4. **Community Features**
   - User comments/discussions
   - Prediction games
   - Fantasy tournament brackets

5. **API**
   - Public API for statistics
   - JSON endpoints for developers
   - Webhook integrations

---

## Recommended Workflow

### This Week (Stage 6)
1. Check if `tournament-overview.json` needs regeneration
2. Run `npm run generate:overview` if needed
3. Create overview page route
4. Implement Hall of Fame section
5. Add round summary table
6. Test navigation flow

### Next Week (Stage 7-8)
1. Build landing page
2. Add time control tabs to round pages
3. Integrate Recharts for visualizations
4. Begin knockout bracket component

### Following Week (Stage 9)
1. Performance optimization
2. Mobile testing and fixes
3. SEO implementation
4. Deployment to Vercel
5. Final polish and launch

---

## Key Decisions Needed

### 1. Tournament Overview JSON
**Question:** Is the existing `tournament-overview.json` up-to-date?
**Action:** Check file, regenerate if needed with `npm run generate:overview`

### 2. Bracket Visualization
**Question:** Use library or build custom?
**Options:**
- Custom SVG/Canvas (full control, more work)
- react-tournament-bracket (pre-built, less flexible)
- D3.js (powerful, learning curve)
**Recommendation:** Start with react-tournament-bracket for MVP, enhance later

### 3. Charts Library
**Question:** Recharts vs other options?
**Current:** Recharts 3.2.1 already in package.json
**Action:** Stick with Recharts (already integrated)

### 4. Deployment Domain
**Question:** Use default Vercel domain or custom?
**Options:**
- `fide-worldcup-stats.vercel.app` (free)
- Custom domain (requires purchase/setup)
**Action:** Start with Vercel domain, add custom later if needed

---

## Progress Tracking

Use this checklist to track overall progress:

### Stage 6: Tournament Overview ⏳
- [ ] Data review complete
- [ ] Page route created
- [ ] Hall of Fame section
- [ ] Round summary table
- [ ] Navigation working
- [ ] Testing complete

### Stage 7: Landing Page ⏳
- [ ] Hero section
- [ ] Round cards grid
- [ ] Quick links
- [ ] Mobile responsive
- [ ] Polish complete

### Stage 8: Enhanced Features ⏳
- [ ] Time control tabs
- [ ] Charts implemented
- [ ] Bracket visualization
- [ ] Match pages (optional)

### Stage 9: Deployment ⏳
- [ ] Code quality check
- [ ] Performance optimized
- [ ] SEO implemented
- [ ] Deployed to Vercel
- [ ] Launch announcement

---

## Contact & Questions

For questions or issues:
- Check CLAUDE.md for development guidelines
- Review STAGE_*_PLAN.md for stage-specific details
- See migration.md for architecture decisions
- Refer to lichess4545-stats for component examples

---

**Last Updated:** 2025-11-16
**Next Review:** After Stage 6 completion
