export const CURRENCIES = {
  USD: "USD",
  UYU: "UYU",
} as const;

export const DEFAULT_EXCHANGE_RATE_USD_UYU = 40.0;

export const SEARCH_DEFAULTS = {
  LIMIT: 20,
  OFFSET: 0,
} as const;

export const AI_PROVIDERS = {
  OPENAI: "openai",
  DEEPSEEK: "deepseek",
  LOCAL: "local",
} as const;

export const SEARCH_ENGINES = {
  POSTGRES: "postgres",
  MEILISEARCH: "meilisearch",
} as const;
