#!/usr/bin/env node

// Postinstall script to ensure rollup Linux binary is installed in Vercel/Linux environments
import { execSync } from 'child_process';
import os from 'os';

const isVercel = process.env.VERCEL === '1';
const isLinux = os.platform() === 'linux';
const isLinuxX64 = isLinux && os.arch() === 'x64';

// Only install Linux binary on Vercel or Linux x64 systems
// On macOS/Windows, npm will skip optionalDependencies automatically
if (isVercel || isLinuxX64) {
  try {
    console.log('Installing @rollup/rollup-linux-x64-gnu for Linux build...');
    execSync(
      'npm install @rollup/rollup-linux-x64-gnu@^4.57.0 --workspace=@qregalo/web --save-optional --no-save',
      { stdio: 'inherit', env: { ...process.env, npm_config_optional: 'true' } }
    );
    console.log('✓ Rollup Linux binary installed successfully');
  } catch (error) {
    // Silently ignore - optionalDependencies will be handled by npm automatically
    // This is expected on non-Linux systems
  }
}
// On non-Linux systems, npm will automatically skip optionalDependencies
// No action needed - this is the expected behavior