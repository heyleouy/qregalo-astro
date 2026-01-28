-- Use OR logic for multiple keywords instead of AND
-- This allows finding products that match ANY keyword, not ALL keywords

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
  search_words TEXT[];
BEGIN
  -- Build tsquery from search_query if provided and not empty
  -- Use OR logic: match ANY keyword, not ALL keywords
  IF search_query IS NOT NULL AND trim(search_query) != '' THEN
    -- Split into words and join with OR operator
    search_words := string_to_array(trim(search_query), ' ');
    -- Build tsquery with OR logic: word1 | word2 | word3
    IF array_length(search_words, 1) > 1 THEN
      -- Multiple keywords: use OR logic
      tsquery_term := to_tsquery('spanish', array_to_string(search_words, ' | '));
    ELSE
      -- Single keyword: use plainto_tsquery
      tsquery_term := plainto_tsquery('spanish', trim(search_query));
    END IF;
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
