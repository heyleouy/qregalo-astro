import type { ParseResult, SearchRequest } from "@qregalo/shared";
import { filterRelevantKeywords } from "./keyword-filter";

export function mapParseResultToSearchRequest(
  parseResult: ParseResult
): SearchRequest {
  // Filter out irrelevant keywords (stopwords)
  const relevantKeywords = filterRelevantKeywords(parseResult.keywords);
  
  return {
    keywords: relevantKeywords.length > 0 ? relevantKeywords : parseResult.keywords,
    categories: parseResult.categories,
    price_range: parseResult.price_range,
    limit: 20,
    offset: 0,
  };
}

export function buildSearchText(keywords: string[]): string {
  return keywords.join(" & ");
}
