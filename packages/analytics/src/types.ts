export type AnalyticsEventType = "search" | "product_click" | "product_impression";

export interface AnalyticsEvent {
  type: AnalyticsEventType;
  timestamp: string;
  session_id?: string;
  metadata?: Record<string, unknown>;
}

export interface SearchEvent extends AnalyticsEvent {
  type: "search";
  query: string;
  keywords: string[];
  categories: string[];
  results_count: number;
}

export interface ProductClickEvent extends AnalyticsEvent {
  type: "product_click";
  product_id: string;
  store_id: string;
  session_id: string;
  user_agent?: string;
  referrer?: string;
}

export interface ProductImpressionEvent extends AnalyticsEvent {
  type: "product_impression";
  product_id: string;
  session_id: string;
  position: number;
}
