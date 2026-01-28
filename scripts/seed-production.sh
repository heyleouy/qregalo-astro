#!/bin/bash

# Script to seed production database
# Usage: ./scripts/seed-production.sh (from project root)
#        or: bash scripts/seed-production.sh (from anywhere)

set -e

# Get the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$( cd "$SCRIPT_DIR/.." && pwd )"

echo "🌱 Seeding production database..."
echo "📍 Project root: $PROJECT_ROOT"

# Production credentials
export SUPABASE_URL="https://utcceqbwkjjbyyrcrwqr.supabase.co"
export SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV0Y2NlcWJ3a2pqYnl5cmNyd3FyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTU3Mzk3MywiZXhwIjoyMDg1MTQ5OTczfQ.QQ4uqPhKA8Dj2p7gxAdrRR_EXx5mLZ67Gkne8GSG3EU"

cd "$PROJECT_ROOT/supabase/seed"

if [ ! -f "package.json" ]; then
  echo "❌ Error: package.json not found in supabase/seed"
  exit 1
fi

echo "📦 Installing dependencies..."
npm install

echo "🌱 Running seed..."
npm run seed

echo "✅ Production seed completed!"
