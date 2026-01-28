import type { SearchEngine, SearchEngineConfig } from "./types.js";
import type { SearchRequest, SearchResponse, Product } from "@qregalo/shared";

/**
 * Simplified Postgres FTS adapter using Supabase client directly
 * This version uses the Supabase JS client for easier integration
 */
export class PostgresFTSEngineSimple implements SearchEngine {
  private supabaseUrl: string;
  private supabaseKey: string;

  constructor(config: SearchEngineConfig) {
    this.supabaseUrl =
      config.host || process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    this.supabaseKey =
      config.apiKey ||
      process.env.SUPABASE_ANON_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      "";

    if (!this.supabaseUrl || !this.supabaseKey) {
      throw new Error("Supabase URL and key are required for PostgresFTS");
    }
  }

  async searchProducts(request: SearchRequest): Promise<SearchResponse> {
    const limit = request.limit || 20;
    const offset = request.offset || 0;

    // Build search query using Postgres FTS
    const searchTerms = request.keywords.join(" & ");
    
    // Use Supabase RPC or direct query
    // For now, we'll use a simpler approach with text search
    let query = `
      SELECT 
        products.*,
        ts_rank(products.search_text, to_tsquery('spanish', $1)) as rank
      FROM products
      WHERE products.search_text @@ to_tsquery('spanish', $1)
    `;

    const params: unknown[] = [searchTerms];
    let paramIndex = 2;

    // Category filter
    if (request.categories.length > 0) {
      query += ` AND EXISTS (
        SELECT 1 FROM product_categories pc
        JOIN categories c ON pc.category_id = c.id
        WHERE pc.product_id = products.id
        AND c.name = ANY($${paramIndex}::text[])
      )`;
      params.push(request.categories);
      paramIndex++;
    }

    // Price range filter
    if (request.price_range) {
      if (request.price_range.min !== null) {
        query += ` AND products.price_usd >= $${paramIndex}`;
        params.push(request.price_range.min);
        paramIndex++;
      }
      if (request.price_range.max !== null) {
        query += ` AND products.price_usd <= $${paramIndex}`;
        params.push(request.price_range.max);
        paramIndex++;
      }
    }

    query += ` ORDER BY rank DESC, products.updated_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    // For MVP, we'll use a Supabase client approach
    // This will be implemented in the api-client package
    throw new Error(
      "PostgresFTSEngineSimple requires Supabase client - use api-client package"
    );
  }
}
