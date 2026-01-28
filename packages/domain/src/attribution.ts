import type { ProductClick, SearchSession } from "@qregalo/shared";

export interface LeadAttribution {
  store_id: string;
  session_id: string;
  product_id: string;
  click_id: string;
  timestamp: string;
}

export function attributeLead(click: ProductClick): LeadAttribution {
  return {
    store_id: click.store_id,
    session_id: click.session_id,
    product_id: click.product_id,
    click_id: click.id,
    timestamp: click.created_at,
  };
}

export function calculateCTR(
  clicks: ProductClick[],
  impressions: number
): number {
  if (impressions === 0) return 0;
  return clicks.length / impressions;
}
