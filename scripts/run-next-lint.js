#!/usr/bin/env node
const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const nextBin = path.join(process.cwd(), 'node_modules', 'next', 'dist', 'bin', 'next');

if (!fs.existsSync(nextBin)) {
  console.warn('[lint] Skipping: next is not installed in this environment.');
  process.exit(0);
}

const result = spawnSync(process.execPath, [nextBin, 'lint', ...process.argv.slice(2)], {
  stdio: 'inherit',
});

if (typeof result.status === 'number') {
  process.exit(result.status);
}

process.exit(1);
