import type { ParseResult } from "@qregalo/shared";

export interface AIProvider {
  parseGiftQuery(query: string): Promise<ParseResult>;
}

export interface AIProviderConfig {
  apiKey?: string;
  model?: string;
  baseURL?: string;
}
