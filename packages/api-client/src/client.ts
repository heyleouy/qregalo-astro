import { createClient, SupabaseClient } from "@supabase/supabase-js";
import type {
  Product,
  Store,
  Category,
  SearchSession,
  ProductClick,
  SearchRequest,
  SearchResponse,
} from "@qregalo/shared";

export interface SupabaseConfig {
  url: string;
  anonKey: string;
}

export class QregaloClient {
  private supabase: SupabaseClient;

  constructor(config: SupabaseConfig) {
    this.supabase = createClient(config.url, config.anonKey);
  }

  // Products
  async getProduct(id: string): Promise<Product | null> {
    const { data, error } = await this.supabase
      .from("products")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    return data as Product | null;
  }

  async getProductsByStore(storeId: string): Promise<Product[]> {
    const { data, error } = await this.supabase
      .from("products")
      .select("*")
      .eq("store_id", storeId);

    if (error) throw error;
    return (data || []) as Product[];
  }

  // Stores
  async getStore(id: string): Promise<Store | null> {
    const { data, error } = await this.supabase
      .from("stores")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    return data as Store | null;
  }

  async getAllStores(): Promise<Store[]> {
    const { data, error } = await this.supabase.from("stores").select("*");

    if (error) throw error;
    return (data || []) as Store[];
  }

  // Search using Postgres FTS
  async searchProducts(request: SearchRequest): Promise<SearchResponse> {
    const limit = request.limit || 20;
    const offset = request.offset || 0;

    // Build search query
    const searchTerms = request.keywords.join(" & ");

    // Build base query
    let query = this.supabase
      .from("products")
      .select("*", { count: "exact" });

    // Full-text search
    if (request.keywords.length > 0) {
      query = query.textSearch("search_text", searchTerms, {
        type: "websearch",
        config: "spanish",
      });
    }

    // Category filter via RPC or subquery
    if (request.categories.length > 0) {
      // Use RPC function for category filtering
      const { data, error } = await this.supabase.rpc("search_products_with_categories", {
        search_query: searchTerms,
        category_names: request.categories,
        price_min: request.price_range?.min ?? null,
        price_max: request.price_range?.max ?? null,
        result_limit: limit,
        result_offset: offset,
      });

      if (error) throw error;

      // Get total count separately
      const { count } = await this.supabase
        .from("products")
        .select("*", { count: "exact", head: true })
        .textSearch("search_text", searchTerms, {
          type: "websearch",
          config: "spanish",
        });

      return {
        products: (data || []) as Product[],
        total: count || 0,
        limit,
        offset,
      };
    }

    // Price range filter
    if (request.price_range) {
      if (request.price_range.min !== null) {
        query = query.gte("price_usd", request.price_range.min);
      }
      if (request.price_range.max !== null) {
        query = query.lte("price_usd", request.price_range.max);
      }
    }

    // Execute query
    const { data, error, count } = await query
      .order("updated_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    return {
      products: (data || []) as Product[],
      total: count || 0,
      limit,
      offset,
    };
  }

  // Analytics - Search Sessions
  async createSearchSession(session: Omit<SearchSession, "id" | "created_at">): Promise<SearchSession> {
    const { data, error } = await this.supabase
      .from("search_sessions")
      .insert(session)
      .select()
      .single();

    if (error) throw error;
    return data as SearchSession;
  }

  async getSearchSession(id: string): Promise<SearchSession | null> {
    const { data, error } = await this.supabase
      .from("search_sessions")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    return data as SearchSession | null;
  }

  // Analytics - Product Clicks (HOT LEADS)
  async createProductClick(
    click: Omit<ProductClick, "id" | "created_at">
  ): Promise<ProductClick> {
    const { data, error } = await this.supabase
      .from("product_clicks")
      .insert(click)
      .select()
      .single();

    if (error) throw error;
    return data as ProductClick;
  }

  // Categories
  async getCategories(): Promise<Category[]> {
    const { data, error } = await this.supabase.from("categories").select("*");

    if (error) throw error;
    return (data || []) as Category[];
  }

  async getProductCategories(productId: string): Promise<Category[]> {
    const { data, error } = await this.supabase
      .from("product_categories")
      .select("categories(*)")
      .eq("product_id", productId);

    if (error) throw error;
    return (data || []).map((item: any) => item.categories) as Category[];
  }
}
