# QueRegalo Store Dashboard

Placeholder for future B2B store dashboard (AB2).

## Planned Features (AB2)

- Store-specific analytics
- Product performance metrics
- Lead quality insights
- Revenue attribution
- Product upload/management
- Performance optimization suggestions

## Store Metrics (Prepared)

Example queries for store dashboards:

### Store Performance Overview
```sql
SELECT 
  COUNT(DISTINCT ss.id) as total_searches,
  COUNT(DISTINCT pc.id) as total_clicks,
  COUNT(DISTINCT pc.product_id) as products_clicked,
  ROUND(COUNT(DISTINCT pc.id)::numeric / NULLIF(COUNT(DISTINCT ss.id), 0) * 100, 2) as ctr_percentage
FROM stores s
LEFT JOIN products p ON s.id = p.store_id
LEFT JOIN product_clicks pc ON p.id = pc.product_id
LEFT JOIN search_sessions ss ON pc.session_id = ss.id
WHERE s.id = $1
  AND pc.created_at >= NOW() - INTERVAL '30 days';
```

### Top Performing Products
```sql
SELECT 
  p.title,
  p.id,
  COUNT(pc.id) as click_count,
  COUNT(DISTINCT pc.session_id) as unique_sessions
FROM products p
JOIN product_clicks pc ON p.id = pc.product_id
WHERE p.store_id = $1
  AND pc.created_at >= NOW() - INTERVAL '30 days'
GROUP BY p.id, p.title
ORDER BY click_count DESC
LIMIT 10;
```

### Search Keywords Leading to Clicks
```sql
SELECT 
  keyword,
  COUNT(DISTINCT ss.id) as search_count,
  COUNT(DISTINCT pc.id) as click_count
FROM search_sessions ss
JOIN product_clicks pc ON ss.id = pc.session_id
JOIN products p ON pc.product_id = p.id,
LATERAL unnest(ss.keywords) as keyword
WHERE p.store_id = $1
  AND pc.created_at >= NOW() - INTERVAL '30 days'
GROUP BY keyword
ORDER BY click_count DESC
LIMIT 20;
```

## Monetization

Stores can:
- View their lead quality and conversion metrics
- Optimize product listings based on search patterns
- Upgrade to premium placement
- Access advanced analytics

## Tech Stack (Future)

- Framework: Next.js
- UI: Tailwind CSS + shadcn/ui
- Auth: Supabase Auth (store-specific access)
