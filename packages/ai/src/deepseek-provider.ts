import type { AIProvider, AIProviderConfig } from "./types.js";
import type { ParseResult } from "@qregalo/shared";
import { ParseResultSchema } from "@qregalo/shared";

export class DeepSeekProvider implements AIProvider {
  private apiKey: string;
  private model: string;
  private baseURL: string;

  constructor(config: AIProviderConfig) {
    this.apiKey = config.apiKey || process.env.DEEPSEEK_API_KEY || "";
    this.model = config.model || "deepseek-chat";
    this.baseURL = config.baseURL || "https://api.deepseek.com/v1";

    if (!this.apiKey) {
      throw new Error("DeepSeek API key is required");
    }
  }

  async parseGiftQuery(query: string): Promise<ParseResult> {
    // Same implementation as OpenAI, just different endpoint
    const systemPrompt = `Eres un asistente experto en análisis de intenciones de compra de regalos.
Analiza la consulta del usuario y extrae información estructurada sobre qué tipo de regalo están buscando.

Responde SOLO con un JSON válido en este formato exacto:
{
  "intent": "gift_search",
  "keywords": ["palabra1", "palabra2", ...],
  "categories": ["categoria1", "categoria2", ...],
  "price_range": { "min": número o null, "max": número o null },
  "age_range": { "min": número o null, "max": número o null },
  "notes": "observaciones adicionales"
}

Reglas:
- keywords: mínimo 1, máximo 10 palabras clave relevantes
- categories: categorías de productos (ej: "tecnología", "ropa", "libros", "deportes", "hogar", "juguetes", "belleza", "accesorios")
- price_range: extrae rangos de precio si se mencionan (en USD), null si no se menciona
- age_range: extrae rango de edad si se menciona, null si no se menciona
- notes: cualquier información adicional relevante`;

    const userPrompt = `Analiza esta consulta de búsqueda de regalo: "${query}"`;

    try {
      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          temperature: 0.3,
          response_format: { type: "json_object" },
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`DeepSeek API error: ${response.status} - ${error}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;

      if (!content) {
        throw new Error("No content in DeepSeek response");
      }

      let parsed: unknown;
      try {
        parsed = JSON.parse(content);
      } catch (e) {
        throw new Error(`Invalid JSON in response: ${content}`);
      }

      const result = ParseResultSchema.parse(parsed);
      return result;
    } catch (error) {
      if (error instanceof Error && error.message.includes("Invalid JSON")) {
        return this.parseGiftQuery(query);
      }
      throw error;
    }
  }
}
