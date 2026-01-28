import type { SearchEngine, SearchEngineConfig } from "./types.js";
import { PostgresFTSEngineSimple } from "./postgres-fts-simple.js";
import { MeilisearchEngine } from "./meilisearch.js";
import { SEARCH_ENGINES } from "@qregalo/shared/constants.js";

export function createSearchEngine(
  engineName?: string,
  config?: SearchEngineConfig
): SearchEngine {
  const engine = engineName || process.env.SEARCH_ENGINE || SEARCH_ENGINES.POSTGRES;

  switch (engine) {
    case SEARCH_ENGINES.POSTGRES:
      return new PostgresFTSEngineSimple(config || {});
    case SEARCH_ENGINES.MEILISEARCH:
      return new MeilisearchEngine(config || {});
    default:
      throw new Error(`Unknown search engine: ${engine}`);
  }
}
