import type { AIProvider } from "./types.js";
import type { ParseResult } from "@qregalo/shared";

export class LocalProvider implements AIProvider {
  async parseGiftQuery(query: string): Promise<ParseResult> {
    // Fallback heuristic parser
    const lowerQuery = query.toLowerCase();

    // Extract keywords (simple word extraction)
    const keywords = query
      .split(/\s+/)
      .filter((word) => word.length > 3)
      .slice(0, 10);

    // Simple category detection
    const categories: string[] = [];
    const categoryKeywords: Record<string, string[]> = {
      tecnología: ["tecnologia", "tech", "electronico", "smartphone", "laptop", "tablet"],
      ropa: ["ropa", "vestido", "camisa", "pantalon", "zapatos"],
      libros: ["libro", "lectura", "novela", "cuento"],
      deportes: ["deporte", "futbol", "gym", "ejercicio", "running"],
      hogar: ["hogar", "cocina", "decoracion", "mueble"],
      juguetes: ["juguete", "toy", "niño", "niña", "bebe"],
      belleza: ["belleza", "cosmetico", "perfume", "maquillaje"],
      accesorios: ["accesorio", "reloj", "bolso", "cartera"],
    };

    for (const [category, keywords] of Object.entries(categoryKeywords)) {
      if (keywords.some((kw) => lowerQuery.includes(kw))) {
        categories.push(category);
      }
    }

    // Extract price range (simple regex)
    const priceMatch = query.match(/\$?(\d+)\s*-\s*\$?(\d+)/i) ||
      query.match(/(\d+)\s*(?:a|hasta|hasta)\s*(\d+)/i);
    const priceRange = priceMatch
      ? { min: parseInt(priceMatch[1]), max: parseInt(priceMatch[2]) }
      : { min: null, max: null };

    // Extract age range
    const ageMatch = query.match(/(\d+)\s*(?:años|años de edad|años)/i);
    const ageRange = ageMatch
      ? { min: parseInt(ageMatch[1]), max: parseInt(ageMatch[1]) + 5 }
      : { min: null, max: null };

    return {
      intent: "gift_search",
      keywords: keywords.length > 0 ? keywords : [query],
      categories: categories.length > 0 ? categories : [],
      price_range: priceRange,
      age_range: ageRange,
      notes: "",
    };
  }
}
