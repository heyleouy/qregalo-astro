import type { SearchRequest, SearchResponse, Product } from "@qregalo/shared";

export interface SearchEngine {
  searchProducts(request: SearchRequest): Promise<SearchResponse>;
}

export interface SearchEngineConfig {
  connectionString?: string;
  host?: string;
  port?: number;
  apiKey?: string;
}
