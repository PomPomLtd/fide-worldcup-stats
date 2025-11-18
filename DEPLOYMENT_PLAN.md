# Deployment Plan: Vercel + GitHub Actions

## Overview
Deploy FIDE World Cup Stats to Vercel with manual-trigger GitHub Actions workflows for stats generation.

## Architecture

### 1. Vercel Deployment
**Purpose**: Host the Next.js static site
**Configuration**:
- Framework: Next.js 15
- Build Command: `npm run build`
- Output Directory: `.next` (automatic)
- Install Command: `npm install`
- Root Directory: `/`

**Environment**:
- Node.js version: 20.x (match local development)
- No environment variables needed (static JSON generation)

**Deployment**:
- Automatic deployment on push to `main` branch
- Vercel monitors repository and redeploys when stats are updated
- Static site generation ensures fast page loads

### 2. GitHub Actions Workflows

**All workflows are manual-trigger only** (workflow_dispatch). This provides full control over when stats are regenerated.

#### Available Workflows

**📊 Generate Tournament Statistics** (`.github/workflows/generate-stats.yml`)
- **Purpose**: Complete stats generation pipeline (Stockfish-independent)
- **Time**: ~30 minutes
- **Generates**: All stats (awards, openings, tactics, etc.) + reads existing Stockfish analysis if available
- **Steps**:
  1. Download and extract PGN files from FIDE
  2. Consolidate PGNs by match
  3. Classify games by time control
  4. Enrich with opening names
  5. Generate statistics (reads Stockfish data from `data/analysis/*.json` if present)
  6. Generate tournament overview
  7. Commit all results
  8. Triggers Vercel deployment

**🔬 Stockfish Analysis (Parallel)** (`.github/workflows/stockfish-analysis-parallel.yml`)
- **Purpose**: Fast parallel engine analysis (independent of stats generation)
- **Time**: ~90-120 minutes (Rounds 1-2 are heavy with 200+ games each)
- **Generates**: Engine analysis files (`data/analysis/round-N-analysis.json`)
- **Architecture**:
  - Job 1: Download PGNs, upload as artifact
  - Job 2: Matrix of 6 parallel analysis jobs (one per round, 2-hour timeout each)
  - Job 3: Collect all results, commit to `data/analysis/`
- **Note**: Analysis persists across stats regenerations. Run this workflow whenever you want to update engine data.

**🔬 Stockfish Analysis** (`.github/workflows/stockfish-analysis.yml`)
- **Purpose**: Sequential analysis with detailed progress
- **Time**: 15-60 min per round, or 3-5 hours for all rounds
- **Use case**: Single round updates or troubleshooting

**🏆 Generate Tournament Overview** (`.github/workflows/generate-overview.yml`)
- **Purpose**: Aggregate stats across all rounds
- **Time**: <5 minutes
- **Use case**: Quick updates to tournament-wide stats

### 3. Data Pipeline

**Decoupled Architecture: Stats ↔ Stockfish Analysis**

```
📊 Stats Generation (30 min):
  Manual trigger → Download PGNs → Consolidate → Classify → Enrich
    → Generate Stats (reads data/analysis/*.json if present)
    → Generate Overview → Commit → Push → Vercel Deploy

🔬 Stockfish Analysis (60 min, independent):
  Manual trigger → Download PGNs → Parallel Analysis (6 rounds)
    → Write data/analysis/round-N-analysis.json → Commit → Push
```

**Key Benefits:**
- **Fast stats regeneration**: 30 min (no Stockfish blocking)
- **Persistent analysis**: Stockfish data survives stats regenerations
- **On-demand engine updates**: Run Stockfish whenever needed
- **Flexible workflow**: Update stats daily, analysis weekly

**Data Flow:**
1. PGN files downloaded fresh from FIDE (not committed)
2. Stats committed to `public/stats/` for Vercel
3. Analysis committed to `data/analysis/` (persistent)
4. Stats generation reads analysis files if present
5. Vercel auto-deploys on push to main

## Dependencies

### Node.js (package.json)
- Already configured ✓
- No changes needed

### Python (new requirements.txt)
```
python-chess>=1.10.0
stockfish>=3.28.0
```

## Configuration Files Needed

### 1. .github/workflows/generate-stats.yml
Full GitHub Actions workflow with:
- Node.js setup
- Python setup
- Stockfish installation (via apt-get on Ubuntu runner)
- Data pipeline execution
- Git commit and push

### 2. requirements.txt
Python dependencies for Stockfish analysis

### 3. vercel.json (optional)
Configuration for Vercel deployment (if needed for custom settings)

### 4. .gitignore updates
Ensure intermediate data files are ignored but final stats are committed

## Deployment Steps

### Phase 1: Vercel Setup
1. Run `vercel login` (if needed)
2. Run `vercel link` to connect to project
3. Run `vercel --prod` for initial deployment
4. Note project ID and org ID for GitHub Actions

### Phase 2: GitHub Actions Setup
1. Create requirements.txt
2. Create .github/workflows/generate-stats.yml
3. Add GitHub secrets (if needed for Vercel):
   - VERCEL_TOKEN
   - VERCEL_ORG_ID
   - VERCEL_PROJECT_ID
4. Test workflow with manual dispatch
5. Verify stats generation and commit

### Phase 3: Testing
1. Add test PGN file to trigger workflow
2. Verify stats are generated correctly
3. Verify Vercel deployment updates
4. Check build logs for errors

## Workflow Execution Strategies

### Strategy 1: Complete First Run (Stats + Stockfish)
```bash
# Step 1: Generate stats (30 min)
gh workflow run "📊 Generate Tournament Statistics"

# Step 2: After completion, run Stockfish analysis (90-120 min)
gh workflow run "🔬 Stockfish Analysis (Parallel)" -f depth=15
```
- **Total time**: ~2-2.5 hours
- **Result**: Complete stats with Stockfish analysis
- **Best for**: Initial setup, first complete dataset

### Strategy 2: Stats Only (Fastest, Recommended for Updates)
```bash
gh workflow run "📊 Generate Tournament Statistics"
```
- **Time**: ~30 minutes
- **Result**: All stats (reads existing Stockfish data if available)
- **Best for**: Daily updates, new PGN data, quick regeneration
- **Note**: Uses cached Stockfish analysis from previous runs

### Strategy 3: Stockfish Update Only
```bash
gh workflow run "🔬 Stockfish Analysis (Parallel)" -f depth=15
```
- **Time**: ~60 minutes
- **Result**: Updates engine analysis only
- **Best for**: Improving analysis depth, fixing analysis bugs
- **Note**: Stats won't include new analysis until next stats run

## Important Notes

### Decoupled Architecture Benefits
- **Fast iteration**: Stats regenerate in 30 min vs 3-5 hours
- **Persistent analysis**: Stockfish data survives across stats runs
- **Flexible updates**: Update stats daily, analysis weekly
- **Independent workflows**: Run stats and Stockfish in any order
- **No blocking**: Stats generation never waits for Stockfish

### Stockfish Analysis
- **Performance**: Sequential = 3-5 hours, Parallel = ~60 minutes
- **Quality**: Both methods produce identical results
- **Persistence**: Analysis files (`data/analysis/*.json`) are committed
- **When to use**: Initial run, depth changes, or analysis improvements
- **When to skip**: Daily stats updates with unchanged PGN data

### Workflow Timing
- Workflows can run independently (no dependencies)
- Stats generation reads analysis files if present
- Vercel deployment is automatic on push to main
- **Recommended flow**: Stats → Stockfish (first run), then Stats only for updates

### Git Operations in Actions
- Use GitHub Actions bot for commits
- Configure git user: `github-actions[bot]`
- Use PAT or GITHUB_TOKEN for push permissions
- Both workflows commit to git (stats and analysis separately)

### Build Optimization
- Cache Node modules (npm ci)
- Cache Python packages (for Stockfish workflows only)
- Stats workflow no longer installs Python/Stockfish (30 min saved)

### Vercel Integration
- Auto-deploy on push (built-in)
- No need for manual webhook trigger
- GitHub integration handles everything

## Timeline

1. **Setup requirements.txt**: 2 min
2. **Create GitHub Actions workflow**: 15 min
3. **Test workflow locally**: 5 min
4. **Initial Vercel deployment**: 5 min
5. **Test GitHub Actions in cloud**: 10 min
6. **Documentation**: 5 min

**Total**: ~45 minutes

## Risks & Mitigations

### Risk 1: Stockfish installation fails
**Mitigation**: Use apt-get with retry logic, fallback to skip analysis

### Risk 2: Large JSON files exceed commit size
**Mitigation**: Already using public/stats/*.json (~1-2MB each, acceptable)

### Risk 3: Rate limiting on GitHub Actions
**Mitigation**: Use caching, skip Stockfish by default

### Risk 4: Build timeout on Vercel
**Mitigation**: Stats pre-generated, Vercel only builds Next.js (fast)

## Success Criteria

- ✅ Vercel deployment accessible via public URL
- ✅ GitHub Actions workflow runs successfully
- ✅ Stats automatically regenerated on new PGN data
- ✅ Vercel auto-deploys when stats are updated
- ✅ Build completes in < 5 minutes
- ✅ Stats generation (without Stockfish) completes in < 2 minutes

