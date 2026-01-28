-- Fix keyword filtering in search function
-- Handle empty strings properly and ensure keywords are optional when categories are present

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
  -- Build tsquery from search_query if provided and not empty
  -- Trim whitespace to handle empty strings
  IF search_query IS NOT NULL AND trim(search_query) != '' THEN
    tsquery_term := plainto_tsquery('spanish', trim(search_query));
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
    -- Category filter (required if categories are specified)
    (
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
    -- Full-text search condition
    -- Strategy: If categories are present, keywords are optional (for ranking only)
    --           If no categories, keywords are required for filtering
    AND (
      -- If we have categories, keywords are optional (they enhance ranking but don't filter)
      (category_names IS NOT NULL AND array_length(category_names, 1) > 0)
      -- If no categories, keywords must match (or no search query)
      OR search_query IS NULL 
      OR trim(search_query) = ''
      OR p.search_text @@ tsquery_term
    )
    -- Price range filter
    AND (price_min IS NULL OR p.price_usd >= price_min)
    AND (price_max IS NULL OR p.price_usd <= price_max)
  ORDER BY
    -- Rank by relevance if search query exists
    -- When categories are present, keywords boost ranking but don't filter
    CASE 
      WHEN search_query IS NOT NULL AND trim(search_query) != '' 
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
