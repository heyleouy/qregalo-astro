-- Function to search products with categories, price range, and full-text search
CREATE OR REPLACE FUNCTION public.search_products_with_categories(
  search_query TEXT DEFAULT NULL,
  category_names TEXT[] DEFAULT NULL,
  price_min NUMERIC DEFAULT NULL,
  price_max NUMERIC DEFAULT NULL,
  result_limit INTEGER DEFAULT 20,
  result_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  store_id UUID,
  title TEXT,
  description TEXT,
  price_original NUMERIC(10, 2),
  currency_original TEXT,
  price_usd NUMERIC(10, 2),
  price_uyu NUMERIC(10, 2),
  original_url TEXT,
  location TEXT,
  tags TEXT[],
  image_url TEXT,
  search_text TSVECTOR,
  updated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ
) AS $$
DECLARE
  tsquery_term TSQUERY;
BEGIN
  -- Build tsquery from search_query if provided
  IF search_query IS NOT NULL AND search_query != '' THEN
    tsquery_term := plainto_tsquery('spanish', search_query);
  ELSE
    tsquery_term := to_tsquery('spanish', '');
  END IF;

  RETURN QUERY
  SELECT 
    p.id,
    p.store_id,
    p.title,
    p.description,
    p.price_original,
    p.currency_original,
    p.price_usd,
    p.price_uyu,
    p.original_url,
    p.location,
    p.tags,
    p.image_url,
    p.search_text,
    p.updated_at,
    p.created_at
  FROM products p
  WHERE
    -- Full-text search condition
    (search_query IS NULL OR search_query = '' OR p.search_text @@ tsquery_term)
    -- Category filter
    AND (
      category_names IS NULL 
      OR array_length(category_names, 1) IS NULL
      OR EXISTS (
        SELECT 1 
        FROM product_categories pc
        JOIN categories c ON pc.category_id = c.id
        WHERE pc.product_id = p.id
        AND c.name = ANY(category_names)
      )
    )
    -- Price range filter
    AND (price_min IS NULL OR p.price_usd >= price_min)
    AND (price_max IS NULL OR p.price_usd <= price_max)
  ORDER BY
    -- Rank by relevance if search query exists
    CASE 
      WHEN search_query IS NOT NULL AND search_query != '' 
      THEN ts_rank(p.search_text, tsquery_term)
      ELSE 0
    END DESC,
    p.updated_at DESC
  LIMIT result_limit
  OFFSET result_offset;
END;
$$ LANGUAGE plpgsql STABLE;

-- Grant execute permission to authenticated and anon users
GRANT EXECUTE ON FUNCTION public.search_products_with_categories TO authenticated;
GRANT EXECUTE ON FUNCTION public.search_products_with_categories TO anon;
