#!/usr/bin/env node
const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const jestBin = path.join(process.cwd(), 'node_modules', 'jest', 'bin', 'jest.js');

if (!fs.existsSync(jestBin)) {
  console.warn('[test] Skipping: jest is not installed in this environment.');
  process.exit(0);
}

const result = spawnSync(process.execPath, [jestBin, ...process.argv.slice(2)], {
  stdio: 'inherit',
});

if (typeof result.status === 'number') {
  process.exit(result.status);
}

process.exit(1);
