import type { SearchEngine, SearchEngineConfig } from "./types.js";
import type { SearchRequest, SearchResponse, Product } from "@qregalo/shared";
import { buildSearchText } from "@qregalo/domain";
import { PostgresJsDatabase, postgres } from "drizzle-orm/postgres-js";
import { sql } from "drizzle-orm";

export class PostgresFTSEngine implements SearchEngine {
  private db: PostgresJsDatabase;

  constructor(config: SearchEngineConfig) {
    const connectionString =
      config.connectionString ||
      process.env.DATABASE_URL ||
      process.env.SUPABASE_DB_URL ||
      "";

    if (!connectionString) {
      throw new Error("Database connection string is required for PostgresFTS");
    }

    const client = postgres(connectionString);
    this.db = client as unknown as PostgresJsDatabase;
  }

  async searchProducts(request: SearchRequest): Promise<SearchResponse> {
    const limit = request.limit || 20;
    const offset = request.offset || 0;

    // Build search query
    const searchText = buildSearchText(request.keywords);
    const searchQuery = sql`to_tsvector('spanish', ${searchText})`;

    // Build WHERE conditions
    const conditions: string[] = [];
    const params: unknown[] = [];
    let paramIndex = 1;

    // Full-text search
    if (request.keywords.length > 0) {
      conditions.push(
        `products.search_text @@ ${searchQuery}::tsquery`
      );
    }

    // Category filter
    if (request.categories.length > 0) {
      conditions.push(
        `EXISTS (
          SELECT 1 FROM product_categories pc
          JOIN categories c ON pc.category_id = c.id
          WHERE pc.product_id = products.id
          AND c.name = ANY($${paramIndex}::text[])
        )`
      );
      params.push(request.categories);
      paramIndex++;
    }

    // Price range filter
    if (request.price_range) {
      if (request.price_range.min !== null) {
        conditions.push(`products.price_usd >= $${paramIndex}`);
        params.push(request.price_range.min);
        paramIndex++;
      }
      if (request.price_range.max !== null) {
        conditions.push(`products.price_usd <= $${paramIndex}`);
        params.push(request.price_range.max);
        paramIndex++;
      }
    }

    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    // Count total
    const countQuery = `
      SELECT COUNT(*) as total
      FROM products
      ${whereClause}
    `;

    // Get products with ranking
    const productsQuery = `
      SELECT 
        products.*,
        ts_rank(products.search_text, ${searchQuery}::tsquery) as rank
      FROM products
      ${whereClause}
      ORDER BY rank DESC, products.updated_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    params.push(limit, offset);

    try {
      // Execute queries
      const [countResult, productsResult] = await Promise.all([
        this.db.execute(sql.raw(countQuery, params.slice(0, paramIndex - 1))),
        this.db.execute(sql.raw(productsQuery, params)),
      ]);

      const total = parseInt(countResult.rows[0]?.total || "0");
      const products = productsResult.rows.map((row: any) => ({
        id: row.id,
        store_id: row.store_id,
        title: row.title,
        description: row.description,
        price_original: parseFloat(row.price_original),
        currency_original: row.currency_original,
        price_usd: row.price_usd ? parseFloat(row.price_usd) : null,
        price_uyu: row.price_uyu ? parseFloat(row.price_uyu) : null,
        original_url: row.original_url,
        location: row.location,
        tags: row.tags || [],
        image_url: row.image_url,
        updated_at: row.updated_at,
        created_at: row.created_at,
      })) as Product[];

      return {
        products,
        total,
        limit,
        offset,
      };
    } catch (error) {
      throw new Error(`PostgresFTS search error: ${error}`);
    }
  }
}
