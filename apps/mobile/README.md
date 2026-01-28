# QueRegalo Mobile App

Placeholder for future React Native (Expo) mobile application.

## Planned Features (AB2)

- Native mobile experience for gift discovery
- Push notifications for new products
- Offline search capabilities
- Mobile-optimized UI/UX

## Architecture

The mobile app will reuse the shared packages from `/packages`:

- `@qregalo/shared` - Types, schemas, constants
- `@qregalo/domain` - Business logic (currency conversion, search mapping)
- `@qregalo/api-client` - Supabase client (works in React Native)
- `@qregalo/analytics` - Event tracking
- `@qregalo/search` - Search abstraction (can use Postgres FTS via API)

## Setup (Future)

```bash
npx create-expo-app@latest . --template blank-typescript
npm install @qregalo/shared @qregalo/domain @qregalo/api-client @qregalo/analytics
```

## Reusability

All core logic, types, and API clients are designed to work seamlessly across web and mobile, ensuring consistency and reducing code duplication.
