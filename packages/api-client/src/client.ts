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
      // Try to use RPC function for category filtering (if available)
      const rpcResult = await this.supabase.rpc("search_products_with_categories", {
        search_query: searchTerms || null,
        category_names: request.categories,
        price_min: request.price_range?.min ?? null,
        price_max: request.price_range?.max ?? null,
        result_limit: limit,
        result_offset: offset,
      });

      // If RPC function exists and works, use it
      if (!rpcResult.error && rpcResult.data) {
        // Get total count using a separate query with same filters
        let countQuery = this.supabase
          .from("products")
          .select("*", { count: "exact", head: true });

        if (request.keywords.length > 0) {
          countQuery = countQuery.textSearch("search_text", searchTerms, {
            type: "websearch",
            config: "spanish",
          });
        }

        // Get product IDs that match categories
        const { data: categoryIds } = await this.supabase
          .from("categories")
          .select("id")
          .in("name", request.categories);

        if (categoryIds && categoryIds.length > 0) {
          const categoryIdArray = categoryIds.map((c) => c.id);
          const { data: productCategoryData } = await this.supabase
            .from("product_categories")
            .select("product_id")
            .in("category_id", categoryIdArray);

          if (productCategoryData && productCategoryData.length > 0) {
            const productIds = productCategoryData.map((pc) => pc.product_id);
            countQuery = countQuery.in("id", productIds);
          } else {
            return {
              products: [],
              total: 0,
              limit,
              offset,
            };
          }
        }

        // Add price range filter
        if (request.price_range) {
          if (request.price_range.min !== null) {
            countQuery = countQuery.gte("price_usd", request.price_range.min);
          }
          if (request.price_range.max !== null) {
            countQuery = countQuery.lte("price_usd", request.price_range.max);
          }
        }

        const { count } = await countQuery;

        return {
          products: rpcResult.data as Product[],
          total: count || 0,
          limit,
          offset,
        };
      }

      // Fallback: Use direct query with category filter
      // Get category IDs first
      const { data: categoryIds } = await this.supabase
        .from("categories")
        .select("id")
        .in("name", request.categories);

      if (!categoryIds || categoryIds.length === 0) {
        // No categories found, return empty result
        return {
          products: [],
          total: 0,
          limit,
          offset,
        };
      }

      const categoryIdArray = categoryIds.map((c) => c.id);

      // Get product IDs that have these categories
      const { data: productCategoryData } = await this.supabase
        .from("product_categories")
        .select("product_id")
        .in("category_id", categoryIdArray);

      if (!productCategoryData || productCategoryData.length === 0) {
        // No products match categories, return empty result
        return {
          products: [],
          total: 0,
          limit,
          offset,
        };
      }

      const productIds = productCategoryData.map((pc) => pc.product_id);
      query = query.in("id", productIds);
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
