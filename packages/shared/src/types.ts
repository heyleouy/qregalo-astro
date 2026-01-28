export type Currency = "USD" | "UYU" | "other";

export interface Store {
  id: string;
  name: string;
  website_url: string;
  category: string | null;
  created_at: string;
}

export interface Product {
  id: string;
  store_id: string;
  title: string;
  description: string;
  price_original: number;
  currency_original: Currency;
  price_usd: number | null;
  price_uyu: number | null;
  original_url: string;
  location: string | null;
  tags: string[];
  image_url: string | null;
  updated_at: string;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  created_at: string;
}

export interface ProductCategory {
  product_id: string;
  category_id: string;
}

export interface SearchSession {
  id: string;
  query: string;
  ai_json: Record<string, unknown>;
  keywords: string[];
  categories: string[];
  results_count: number;
  created_at: string;
}

export interface ProductClick {
  id: string;
  session_id: string;
  product_id: string;
  store_id: string;
  created_at: string;
  user_agent: string | null;
  referrer: string | null;
}

export interface ParseResult {
  intent: "gift_search";
  keywords: string[];
  categories: string[];
  price_range: {
    min: number | null;
    max: number | null;
  };
  age_range: {
    min: number | null;
    max: number | null;
  };
  notes: string;
}

export interface SearchRequest {
  keywords: string[];
  categories: string[];
  price_range?: {
    min: number | null;
    max: number | null;
  };
  limit?: number;
  offset?: number;
}

export interface SearchResponse {
  products: Product[];
  total: number;
  limit: number;
  offset: number;
}
