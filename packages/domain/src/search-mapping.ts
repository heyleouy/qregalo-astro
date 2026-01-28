import type { ParseResult, SearchRequest } from "@qregalo/shared";

export function mapParseResultToSearchRequest(
  parseResult: ParseResult
): SearchRequest {
  return {
    keywords: parseResult.keywords,
    categories: parseResult.categories,
    price_range: parseResult.price_range,
    limit: 20,
    offset: 0,
  };
}

export function buildSearchText(keywords: string[]): string {
  return keywords.join(" & ");
}
