#!/usr/bin/env node

/**
 * Generate build information file
 * Called during build process to capture commit and timestamp
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

try {
  // Get commit hash
  const commitHash = execSync('git rev-parse --short HEAD', { encoding: 'utf-8' }).trim();

  // Get build timestamp
  const buildTime = new Date().toISOString();

  // Create build info object
  const buildInfo = {
    commit: commitHash,
    timestamp: buildTime,
    timestampFormatted: new Date(buildTime).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short'
    })
  };

  // Write to public directory so it's accessible at runtime
  const outputPath = path.join(process.cwd(), 'public', 'build-info.json');
  fs.writeFileSync(outputPath, JSON.stringify(buildInfo, null, 2));

  console.log('✓ Build info generated:', buildInfo);
} catch (error) {
  console.error('Error generating build info:', error.message);
  // Don't fail the build, just use fallback values
  const fallbackInfo = {
    commit: 'unknown',
    timestamp: new Date().toISOString(),
    timestampFormatted: 'Build time unavailable'
  };
  const outputPath = path.join(process.cwd(), 'public', 'build-info.json');
  fs.writeFileSync(outputPath, JSON.stringify(fallbackInfo, null, 2));
}
