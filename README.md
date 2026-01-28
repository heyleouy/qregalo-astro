# Qué Regalo?

AI-powered gift discovery platform and lead-generation engine for online stores.

## 🎯 Product Vision

### AB1 (MVP - Current Version)
- B2C product discovery platform
- Natural language gift queries → AI-powered structured search
- Multi-currency support (USD + UYU)
- Product catalog search with Postgres FTS
- Lead tracking (search sessions + product clicks)

### AB2 (Future - Prepared)
- Advanced analytics dashboards
- Internal admin dashboard
- Store dashboards (B2B)
- Lead attribution and monetization
- Aggregated metrics and reporting

## 🏗️ Architecture

The system is built as a monorepo with layered engines:

1. **Discovery Engine** - AI parsing + intent modeling
2. **Catalog Engine** - Products + stores + categories
3. **Search Engine** - Postgres FTS (Meilisearch ready)
4. **Lead Engine** - Clicks → stores (hot leads)
5. **Analytics Engine** - Events → metrics
6. **Shared Domain Layer** - Reusable across web + mobile

### Monorepo Structure

```
/apps
  /web        → Astro app (B2C UI) ✅
  /mobile     → Placeholder for Expo RN app
  /admin      → Placeholder for internal dashboard
  /stores     → Placeholder for store dashboard

/packages
  /shared     → Types + Zod schemas + constants + currency utils
  /domain     → Business logic (search, ranking, attribution, currency)
  /api-client → Supabase HTTP client
  /search     → Search abstraction (PostgresFTS + Meilisearch adapters)
  /ai         → AI abstraction (OpenAI + DeepSeek + Local providers)
  /analytics  → Event tracking abstraction

/supabase
  /migrations → SQL migrations
  /functions
    /ai-parse → Edge Function for AI parsing
  /seed       → Seed scripts
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Docker Desktop (required for Supabase local development)
- Supabase CLI (for local development)
- OpenAI API key (for AI parsing)

### Setup

1. **Clone and install dependencies**

```bash
git clone <repo-url>
cd qregalo-astro
npm install
```

2. **Set up Supabase**

```bash
# Install Docker Desktop first (required!)
# Download from: https://docs.docker.com/desktop
# Make sure Docker Desktop is running before proceeding

# Install Supabase CLI if not installed
# macOS (recommended):
brew install supabase/tap/supabase

# Or download from: https://github.com/supabase/cli/releases
# Or use npx (no global install needed):
# npx supabase@latest

# Start Supabase locally (requires Docker Desktop to be running)
supabase start

# Run migrations
supabase migration up

# Seed database
cd supabase/seed
npm install
npm run seed
cd ../..
```

3. **Configure environment variables**

Create `.env` files:

**Root `.env`:**
```env
SUPABASE_URL=http://localhost:54321
SUPABASE_ANON_KEY=<your-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
OPENAI_API_KEY=<your-openai-api-key>
LLM_PROVIDER=openai
SEARCH_ENGINE=postgres
EXCHANGE_RATE_USD_UYU=40.0
```

**`apps/web/.env`:**
```env
PUBLIC_SUPABASE_URL=http://localhost:54321
PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
```

4. **Start the web app**

```bash
npm run dev
```

Visit `http://localhost:4321`

## 🔧 Configuration

### AI Provider Switching

Set `LLM_PROVIDER` environment variable:

- `openai` (default) - Uses OpenAI API
- `deepseek` - Uses DeepSeek API (requires `DEEPSEEK_API_KEY`)
- `local` - Uses heuristic fallback parser

Example:
```bash
LLM_PROVIDER=deepseek npm run dev
```

### Search Engine Switching

Set `SEARCH_ENGINE` environment variable:

- `postgres` (default) - Uses Postgres Full-Text Search
- `meilisearch` - Uses Meilisearch (skeleton ready for AB2)

Example:
```bash
SEARCH_ENGINE=meilisearch npm run dev
```

### Currency Exchange Rate

Set `EXCHANGE_RATE_USD_UYU` for USD ↔ UYU conversion (default: 40.0)

## 📊 Database Schema

### Core Tables

- `stores` - Store information
- `products` - Product catalog with FTS search_text
- `categories` - Product categories
- `product_categories` - Many-to-many relationship

### Analytics Tables (AB1)

- `search_sessions` - Tracked searches with AI parse results
- `product_clicks` - Hot leads (clicks on "Ver en tienda")

### Prepared Tables (AB2)

- `product_impressions` - Product view tracking
- `store_metrics_daily` - Aggregated daily metrics

## 🔍 Search Flow

1. User enters natural language query
2. Query sent to `/functions/v1/ai-parse` Edge Function
3. AI parses query → structured intent (keywords, categories, price range)
4. Search request mapped to Postgres FTS query
5. Results returned with ranking
6. Search session tracked in `search_sessions`
7. Product clicks tracked in `product_clicks` (hot leads)

## 💰 Multi-Currency Support

Products can have prices in USD or UYU. The system:

- Shows **original price** with "Oficial" badge
- Shows **converted price** with "Estimado" badge
- Uses `EXCHANGE_RATE_USD_UYU` for conversion

Example:
- Product: $100 USD (Oficial)
- Converted: UYU 4,000 (Estimado)

## 📈 Analytics (AB1)

### Tracked Events

1. **Search Sessions** - Every search is tracked with:
   - Original query
   - AI parse result (JSON)
   - Keywords and categories extracted
   - Results count

2. **Product Clicks** - Every "Ver en tienda" click is tracked as a HOT LEAD:
   - Session ID (links to search)
   - Product ID
   - Store ID
   - User agent and referrer

### Example Queries (AB2 Prepared)

See `/apps/admin/README.md` for example SQL queries:
- Total searches
- Total clicks (leads)
- CTR per store
- Top categories
- Top keywords

## 🎨 UI Features

### Pages

1. **`/`** - Home page with search form
2. **`/resultados?q=<query>`** - Search results page
3. **`/producto/[id]`** - Product detail page

### Components

- `SearchForm` - React island for search input
- `ProductCard` - Product display with pricing
- Currency badges (Oficial/Estimado)

## 🧪 Development

### Running Tests

```bash
# Run all tests (when implemented)
npm test
```

### Database Migrations

```bash
# Create new migration
supabase migration new <migration-name>

# Apply migrations
supabase migration up

# Reset database
supabase db reset
```

### Seed Data

```bash
cd supabase/seed
npm run seed
```

## 📦 Package Details

### `@qregalo/shared`
- Types, Zod schemas, constants
- Currency formatting utilities
- Reusable across all apps

### `@qregalo/domain`
- Business logic (search mapping, ranking, attribution)
- Currency conversion logic
- Price estimation utilities

### `@qregalo/api-client`
- Supabase client wrapper
- Type-safe database queries
- Search and analytics methods

### `@qregalo/search`
- Search engine abstraction
- Postgres FTS adapter (working)
- Meilisearch adapter (skeleton)

### `@qregalo/ai`
- AI provider abstraction
- OpenAI provider (working)
- DeepSeek provider (ready)
- Local/heuristic provider (fallback)

### `@qregalo/analytics`
- Event tracking abstraction
- Search session tracking
- Product click tracking (hot leads)

## 🔐 Security

- AI API keys never exposed to browser (Edge Functions only)
- Supabase RLS policies (to be configured)
- Rate limiting in Edge Functions
- CORS configured for API endpoints

## 🚢 Deployment

### Supabase

1. Create Supabase project
2. Push migrations: `supabase db push`
3. Deploy Edge Functions: `supabase functions deploy ai-parse`
4. Set environment variables in Supabase dashboard

### Web App

1. Build: `npm run build --workspace=apps/web`
2. Deploy to Vercel/Netlify/etc.
3. Set environment variables

## 📱 Mobile Reuse (Future)

The mobile app (AB2) will reuse:
- All packages from `/packages`
- Same API client (works in React Native)
- Same domain logic
- Same types and schemas

See `/apps/mobile/README.md` for details.

## 💼 Monetization Model (AB2)

- **B2B Lead Generation**: Stores pay per click (CPC) or per qualified lead
- **Subscription Model**: Stores pay monthly for premium placement
- **Commission Model**: Revenue share on completed purchases

See `/apps/admin/README.md` and `/apps/stores/README.md` for dashboard plans.

## 🐛 Troubleshooting

### AI parsing fails

- Check `OPENAI_API_KEY` is set
- Check rate limits
- Falls back to heuristic parser automatically

### Search returns no results

- Check database is seeded
- Check `search_text` tsvector is populated (trigger should handle this)
- Verify Postgres FTS is working

### Currency conversion incorrect

- Check `EXCHANGE_RATE_USD_UYU` environment variable
- Default is 40.0

## 📝 License

[Your License Here]

## 🤝 Contributing

[Contributing Guidelines]

---

Built with ❤️ using Astro, Supabase, and OpenAI
