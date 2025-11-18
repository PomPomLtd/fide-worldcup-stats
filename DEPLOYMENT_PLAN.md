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
- **Purpose**: Complete stats generation pipeline
- **Time**: 30 min (without Stockfish) or 3-5 hours (with Stockfish)
- **Generates**: All stats (awards, openings, tactics, etc.) + optional Stockfish analysis
- **Steps**:
  1. Download and extract PGN files from FIDE
  2. Consolidate PGNs by match
  3. Classify games by time control
  4. Enrich with opening names
  5. Generate statistics
  6. Optional: Run Stockfish analysis (sequential, with progress)
  7. Generate tournament overview
  8. Commit all results
  9. Triggers Vercel deployment

**🔬 Stockfish Analysis (Parallel)** (`.github/workflows/stockfish-analysis-parallel.yml`)
- **Purpose**: Fast parallel engine analysis
- **Time**: ~60 minutes (6x faster than sequential)
- **Generates**: Engine analysis only (accuracy, blunders, ACPL)
- **Architecture**:
  - Job 1: Download PGNs, upload as artifact
  - Job 2: Matrix of 6 parallel analysis jobs (one per round)
  - Job 3: Collect all results, commit
- **Note**: Run "Generate Statistics" first, then this workflow

**🔬 Stockfish Analysis** (`.github/workflows/stockfish-analysis.yml`)
- **Purpose**: Sequential analysis with detailed progress
- **Time**: 15-60 min per round, or 3-5 hours for all rounds
- **Use case**: Single round updates or troubleshooting

**🏆 Generate Tournament Overview** (`.github/workflows/generate-overview.yml`)
- **Purpose**: Aggregate stats across all rounds
- **Time**: <5 minutes
- **Use case**: Quick updates to tournament-wide stats

### 3. Data Pipeline

**Manual Trigger → Stats Generation → Commit → Vercel Deploy**

```
Manual workflow trigger via GitHub UI or CLI
  ↓
Download cup2025.zip from FIDE website
  ↓
Extract to _SRC/cup2025/
  ↓
Stage 1: Consolidate PGNs by match
Stage 2: Classify by time control
Stage 3: Enrich with opening names
Stage 4: Generate statistics
Stage 5: Optional Stockfish analysis
Stage 6: Generate tournament overview
  ↓
Commit to public/stats/*.json
  ↓
Push to main branch
  ↓
Vercel auto-deploys updated site
```

**Key Points:**
- PGN files are downloaded fresh from FIDE each run (not committed to git)
- Generated stats ARE committed to `public/stats/` for Vercel deployment
- Vercel automatically redeploys when stats are pushed
- No secrets or tokens required (public repository)

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

### Strategy 1: One-Shot (Recommended for First Run)
```bash
gh workflow run "📊 Generate Tournament Statistics" -f skip_stockfish=false -f depth=15
```
- **Time**: 3-5 hours
- **Result**: Complete stats including Stockfish in one run
- **Best for**: Initial setup, complete regeneration

### Strategy 2: Two-Step (Fastest for Updates)
```bash
# Step 1: Generate stats (30 min)
gh workflow run "📊 Generate Tournament Statistics"

# Step 2: Wait for completion, then run parallel Stockfish (60 min)
gh workflow run "🔬 Stockfish Analysis (Parallel)" -f depth=15
```
- **Total time**: ~90 minutes
- **Result**: Same as Strategy 1, but 3x faster
- **Best for**: Regular updates when data changes

### Strategy 3: Stats Only (Fastest)
```bash
gh workflow run "📊 Generate Tournament Statistics"
```
- **Time**: 30 minutes
- **Result**: All stats except Stockfish analysis
- **Best for**: Quick updates, testing

## Important Notes

### Stockfish Analysis
- **Performance**: Sequential = 3-5 hours, Parallel = ~60 minutes
- **Quality**: Both methods produce identical results
- **Progress**: Sequential shows nice progress bars, parallel output is interleaved
- **When to use**: Only needed for engine analysis (accuracy, blunders, ACPL)

### Workflow Timing
- Never run "Generate Statistics" and "Stockfish (Parallel)" simultaneously
- Always wait for stats generation to complete before running Stockfish
- Vercel deployment is automatic on push to main (no manual trigger needed)
- **Alternative**: Run locally when needed, commit results

### Git Operations in Actions
- Use GitHub Actions bot for commits
- Configure git user: `github-actions[bot]`
- Use PAT or GITHUB_TOKEN for push permissions

### Build Optimization
- Cache Node modules
- Cache Python packages
- Skip Stockfish for faster runs (default)

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

