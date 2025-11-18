# Deployment Plan: Vercel + GitHub Actions

## Overview
Deploy FIDE World Cup Stats to Vercel with automated stats generation via GitHub Actions.

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

### 2. GitHub Actions Workflow
**Purpose**: Automatically generate statistics when new PGN data is added

**Triggers**:
- Push to main branch (paths: `_SRC/cup2025/**`)
- Manual workflow dispatch
- Schedule: Daily at 2 AM UTC (during tournament)

**Jobs**:

#### Job 1: Generate Statistics
**Steps**:
1. Checkout code
2. Setup Node.js 20.x
3. Install Node dependencies
4. Setup Python 3.11
5. Install Python dependencies (python-chess, stockfish)
6. Install Stockfish binary
7. Run data pipeline:
   - `npm run consolidate`
   - `npm run classify`
   - `npm run enrich`
   - `npm run generate:stats`
   - `npm run analyze` (Stockfish - optional, slow)
   - `npm run generate:overview`
8. Commit generated JSON files to `public/stats/`
9. Push changes back to repository

#### Job 2: Deploy to Vercel (depends on Job 1)
**Steps**:
1. Trigger Vercel deployment via webhook
2. Wait for deployment completion
3. Report deployment URL

## Data Pipeline Flow

```
_SRC/cup2025/roundNgameM/games.pgn (manual upload)
  ↓ (GitHub Actions triggered)
Stage 1-3: Consolidate → Classify → Enrich → Stats → Overview
  ↓
public/stats/*.json (committed back to repo)
  ↓ (Vercel auto-deploy on push)
Next.js builds and deploys static site
```

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

## Considerations

### Stockfish Analysis
- **SLOW**: Can take hours for all rounds
- **Solution**: Make it optional in workflow (default: skip)
- **Configuration**: Use workflow input to enable/disable
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

