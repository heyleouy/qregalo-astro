import type { Product } from "@qregalo/shared";

export interface RankingScore {
  product: Product;
  score: number;
}

export function rankProducts(
  products: Product[],
  keywords: string[]
): RankingScore[] {
  const keywordLower = keywords.map((k) => k.toLowerCase());

  return products
    .map((product) => {
      let score = 0;

      // Title match (highest weight)
      const titleLower = product.title.toLowerCase();
      keywordLower.forEach((keyword) => {
        if (titleLower.includes(keyword)) {
          score += 10;
        }
      });

      // Description match
      const descLower = product.description.toLowerCase();
      keywordLower.forEach((keyword) => {
        if (descLower.includes(keyword)) {
          score += 5;
        }
      });

      // Tags match
      product.tags.forEach((tag) => {
        const tagLower = tag.toLowerCase();
        keywordLower.forEach((keyword) => {
          if (tagLower.includes(keyword)) {
            score += 3;
          }
        });
      });

      return { product, score };
    })
    .sort((a, b) => b.score - a.score);
}
