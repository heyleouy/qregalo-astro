# QueRegalo Admin Dashboard

Placeholder for future internal admin dashboard (AB2).

## Planned Features (AB2)

- Analytics overview (total searches, clicks, CTR)
- Store management
- Product catalog management
- User behavior analytics
- Revenue metrics
- Lead attribution reports

## Database Queries (Prepared)

Example SQL queries for analytics:

### Total Searches
```sql
SELECT COUNT(*) as total_searches
FROM search_sessions
WHERE created_at >= NOW() - INTERVAL '30 days';
```

### Total Clicks (Leads)
```sql
SELECT COUNT(*) as total_clicks
FROM product_clicks
WHERE created_at >= NOW() - INTERVAL '30 days';
```

### CTR per Store
```sql
SELECT 
  s.name as store_name,
  COUNT(DISTINCT pc.id) as clicks,
  COUNT(DISTINCT ss.id) as searches,
  CASE 
    WHEN COUNT(DISTINCT ss.id) > 0 
    THEN ROUND(COUNT(DISTINCT pc.id)::numeric / COUNT(DISTINCT ss.id)::numeric * 100, 2)
    ELSE 0 
  END as ctr_percentage
FROM stores s
LEFT JOIN product_clicks pc ON s.id = pc.store_id
LEFT JOIN search_sessions ss ON pc.session_id = ss.id
WHERE pc.created_at >= NOW() - INTERVAL '30 days'
GROUP BY s.id, s.name
ORDER BY clicks DESC;
```

### Top Categories
```sql
SELECT 
  c.name as category,
  COUNT(DISTINCT ss.id) as search_count
FROM categories c
JOIN product_categories pc ON c.id = pc.category_id
JOIN products p ON pc.product_id = p.id
JOIN search_sessions ss ON ss.categories @> ARRAY[c.name]
WHERE ss.created_at >= NOW() - INTERVAL '30 days'
GROUP BY c.id, c.name
ORDER BY search_count DESC
LIMIT 10;
```

### Top Keywords
```sql
SELECT 
  keyword,
  COUNT(*) as usage_count
FROM search_sessions,
LATERAL unnest(keywords) as keyword
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY keyword
ORDER BY usage_count DESC
LIMIT 20;
```

## Monetization Model

- **B2B Lead Generation**: Stores pay per click (CPC) or per qualified lead
- **Subscription Model**: Stores pay monthly for premium placement
- **Commission Model**: Revenue share on completed purchases

## Tech Stack (Future)

- Framework: Next.js or Remix
- UI: Tailwind CSS + shadcn/ui
- Charts: Recharts or Chart.js
- Auth: Supabase Auth
