import type { QregaloClient } from "@qregalo/api-client";
import type {
  SearchEvent,
  ProductClickEvent,
  ProductImpressionEvent,
} from "./types.js";
import type { ParseResult } from "@qregalo/shared";

export class AnalyticsTracker {
  private client: QregaloClient;

  constructor(client: QregaloClient) {
    this.client = client;
  }

  async trackSearch(
    query: string,
    parseResult: ParseResult,
    resultsCount: number
  ): Promise<string> {
    const session = await this.client.createSearchSession({
      query,
      ai_json: parseResult as unknown as Record<string, unknown>,
      keywords: parseResult.keywords,
      categories: parseResult.categories,
      results_count: resultsCount,
    });

    return session.id;
  }

  async trackProductClick(
    sessionId: string,
    productId: string,
    storeId: string,
    userAgent?: string,
    referrer?: string
  ): Promise<void> {
    await this.client.createProductClick({
      session_id: sessionId,
      product_id: productId,
      store_id: storeId,
      user_agent: userAgent || null,
      referrer: referrer || null,
    });
  }

  // AB2 prepared, not used in AB1
  async trackProductImpression(
    sessionId: string,
    productId: string,
    position: number
  ): Promise<void> {
    // Not implemented in AB1
    // Will be implemented in AB2
  }
}
