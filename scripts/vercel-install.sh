#!/bin/bash
set -e

# Install dependencies
npm install

# Ensure rollup platform-specific binaries are installed on Linux (Vercel)
# This fixes the npm bug with optional dependencies in workspaces
if [[ "$OSTYPE" == "linux-gnu"* ]] || [[ -n "$VERCEL" ]]; then
  npm install @rollup/rollup-linux-x64-gnu@^4.57.0 --workspace=@qregalo/web --save-dev || true
fi
