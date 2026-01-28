#!/usr/bin/env node

// Postinstall script to ensure rollup Linux binary is installed in Vercel/Linux environments
import { execSync } from 'child_process';
import os from 'os';

const isVercel = process.env.VERCEL === '1';
const isLinux = os.platform() === 'linux';
const isLinuxX64 = isLinux && os.arch() === 'x64';

if (isVercel || isLinuxX64) {
  try {
    console.log('Installing @rollup/rollup-linux-x64-gnu for Linux build...');
    execSync(
      'npm install @rollup/rollup-linux-x64-gnu@^4.57.0 --workspace=@qregalo/web --save-dev --no-save',
      { stdio: 'inherit' }
    );
    console.log('✓ Rollup Linux binary installed successfully');
  } catch (error) {
    console.warn('⚠ Could not install rollup Linux binary (this is OK on non-Linux systems):', error.message);
    process.exit(0); // Don't fail the build
  }
} else {
  console.log('Skipping rollup Linux binary installation (not Linux/Vercel environment)');
}