#!/bin/bash
set -e

# Get the directory where the script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# Change to project root
cd "$PROJECT_ROOT"

# Install dependencies
npm install

# Ensure rollup platform-specific binaries are installed on Linux (Vercel)
# This fixes the npm bug with optional dependencies in workspaces
if [[ "$OSTYPE" == "linux-gnu"* ]] || [[ -n "$VERCEL" ]]; then
  npm install @rollup/rollup-linux-x64-gnu@^4.57.0 --workspace=@qregalo/web --save-dev || true
fi
