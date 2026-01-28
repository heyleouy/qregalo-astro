import type { SearchEngine, SearchEngineConfig } from "./types.js";
import type { SearchRequest, SearchResponse, Product } from "@qregalo/shared";

/**
 * Meilisearch adapter (skeleton for AB2)
 * Not implemented in AB1, but structure is ready
 */
export class MeilisearchEngine implements SearchEngine {
  private host: string;
  private apiKey: string;

  constructor(config: SearchEngineConfig) {
    this.host = config.host || process.env.MEILISEARCH_HOST || "http://localhost:7700";
    this.apiKey = config.apiKey || process.env.MEILISEARCH_API_KEY || "";

    if (!this.host) {
      throw new Error("Meilisearch host is required");
    }
  }

  async searchProducts(request: SearchRequest): Promise<SearchResponse> {
    // TODO: Implement Meilisearch integration for AB2
    throw new Error(
      "Meilisearch adapter is not implemented yet. Use PostgresFTS for AB1."
    );
  }
}
