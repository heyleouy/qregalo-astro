import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Import types and schemas (inline for Deno compatibility)
const ParseResultSchema = {
  intent: "gift_search",
  keywords: (v: unknown) => Array.isArray(v) && v.length > 0,
  categories: (v: unknown) => Array.isArray(v),
  price_range: (v: unknown) =>
    v && typeof v === "object" && "min" in v && "max" in v,
  age_range: (v: unknown) =>
    v && typeof v === "object" && "min" in v && "max" in v,
  notes: (v: unknown) => typeof v === "string",
};

interface ParseResult {
  intent: "gift_search";
  keywords: string[];
  categories: string[];
  price_range: {
    min: number | null;
    max: number | null;
  };
  age_range: {
    min: number | null;
    max: number | null;
  };
  notes: string;
}

interface AIParseRequest {
  query: string;
}

// Rate limiting (naive in-memory)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const RATE_LIMIT_MAX = 10; // 10 requests per minute

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now > record.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (record.count >= RATE_LIMIT_MAX) {
    return false;
  }

  record.count++;
  return true;
}

// Fallback heuristic parser
function fallbackParse(query: string): ParseResult {
  const lowerQuery = query.toLowerCase();

  const keywords = query
    .split(/\s+/)
    .filter((word) => word.length > 3)
    .slice(0, 10);

  const categories: string[] = [];
  const categoryKeywords: Record<string, string[]> = {
    tecnología: [
      "tecnologia",
      "tech",
      "electronico",
      "smartphone",
      "laptop",
      "tablet",
    ],
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

  const priceMatch =
    query.match(/\$?(\d+)\s*-\s*\$?(\d+)/i) ||
    query.match(/(\d+)\s*(?:a|hasta|hasta)\s*(\d+)/i);
  const priceRange = priceMatch
    ? { min: parseInt(priceMatch[1]), max: parseInt(priceMatch[2]) }
    : { min: null, max: null };

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

// OpenAI provider
async function parseWithOpenAI(query: string): Promise<ParseResult> {
  const apiKey = Deno.env.get("OPENAI_API_KEY");
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY not configured");
  }

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
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: Deno.env.get("OPENAI_MODEL") || "gpt-4o-mini",
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
      throw new Error(`OpenAI API error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      throw new Error("No content in OpenAI response");
    }

    const parsed = JSON.parse(content);

    // Basic validation
    if (
      !parsed.intent ||
      !Array.isArray(parsed.keywords) ||
      parsed.keywords.length === 0
    ) {
      throw new Error("Invalid response format");
    }

    return {
      intent: "gift_search",
      keywords: parsed.keywords || [],
      categories: parsed.categories || [],
      price_range: parsed.price_range || { min: null, max: null },
      age_range: parsed.age_range || { min: null, max: null },
      notes: parsed.notes || "",
    };
  } catch (error) {
    console.error("OpenAI error:", error);
    throw error;
  }
}

serve(async (req) => {
  // CORS headers
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type",
  };

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Rate limiting
    const clientIp =
      req.headers.get("x-forwarded-for")?.split(",")[0] ||
      req.headers.get("x-real-ip") ||
      "unknown";

    if (!checkRateLimit(clientIp)) {
      return new Response(
        JSON.stringify({ error: "Rate limit exceeded" }),
        {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Parse request
    const body: AIParseRequest = await req.json();

    if (!body.query || typeof body.query !== "string" || body.query.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: "Query is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Determine provider
    const provider = Deno.env.get("LLM_PROVIDER") || "openai";

    let result: ParseResult;

    try {
      if (provider === "openai") {
        result = await parseWithOpenAI(body.query);
      } else {
        // Fallback to heuristic
        result = fallbackParse(body.query);
      }
    } catch (error) {
      console.error("AI parsing error, using fallback:", error);
      // Retry once with fallback
      result = fallbackParse(body.query);
    }

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
