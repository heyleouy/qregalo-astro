/**
 * Utility functions to filter and clean keywords for product search
 */

// Spanish stopwords that are not relevant for product search
const SPANISH_STOPWORDS = new Set([
  // Common verbs and pronouns
  "tengo", "tiene", "tienen", "tener", "tenemos",
  "soy", "es", "son", "ser", "somos",
  "estoy", "está", "están", "estar", "estamos",
  "hacer", "hace", "hacen", "hago", "hacemos",
  "dar", "doy", "da", "dan", "damos",
  "ver", "veo", "ve", "ven", "vemos",
  "saber", "sé", "sabe", "saben", "sabemos",
  "querer", "quiero", "quiere", "quieren", "queremos",
  "poder", "puedo", "puede", "pueden", "podemos",
  "decir", "digo", "dice", "dicen", "decimos",
  "ir", "voy", "va", "van", "vamos",
  "venir", "vengo", "viene", "vienen", "venimos",
  
  // Pronouns
  "yo", "tú", "él", "ella", "nosotros", "nosotras", "ustedes", "ellos", "ellas",
  "me", "te", "le", "nos", "les",
  "mi", "mis", "tu", "tus", "su", "sus", "nuestro", "nuestra", "nuestros", "nuestras",
  
  // Common words
  "que", "qué", "cual", "cuál", "como", "cómo", "cuando", "cuándo", "donde", "dónde",
  "un", "una", "unos", "unas", "el", "la", "los", "las",
  "de", "del", "al", "a", "en", "con", "por", "para", "sin", "sobre",
  "y", "o", "pero", "mas", "más", "menos", "muy", "mucho", "muchos", "muchas",
  "este", "esta", "estos", "estas", "ese", "esa", "esos", "esas", "aquel", "aquella", "aquellos", "aquellas",
  "se", "le", "lo", "la", "los", "las",
  
  // Time/age related (not product-relevant)
  "años", "año", "mes", "meses", "día", "días", "semana", "semanas",
  "hoy", "ayer", "mañana", "ahora", "después", "antes",
  
  // Common phrases
  "no", "sí", "si", "también", "tampoco", "solo", "sólo", "solamente",
  "apasiona", "apasionan", "gusta", "gustan", "encanta", "encantan",
  "regalarle", "regalar", "regalo", "regalos", "regalarles",
  "busco", "busca", "buscan", "buscamos", "encontrar", "encontrar",
]);

// Words that indicate product relevance (keep these even if they might be common)
const PRODUCT_RELEVANT_WORDS = new Set([
  "anime", "manga", "tecnologia", "tecnología", "tech", "electronico", "electrónico",
  "smartphone", "laptop", "tablet", "computadora", "pc",
  "ropa", "vestido", "camisa", "pantalon", "pantalón", "zapatos",
  "libro", "libros", "lectura", "novela",
  "deporte", "deportes", "futbol", "fútbol", "gym", "ejercicio", "running",
  "hogar", "cocina", "decoracion", "decoración", "mueble", "muebles",
  "juguete", "juguetes", "toy", "niño", "niña", "niños", "niñas",
  "belleza", "cosmetico", "cosmético", "perfume", "maquillaje",
  "accesorio", "accesorios", "reloj", "bolso", "cartera",
]);

/**
 * Filters out irrelevant keywords (stopwords) from a keyword array
 * Keeps only keywords that are relevant for product search
 */
export function filterRelevantKeywords(keywords: string[]): string[] {
  return keywords
    .map((kw) => kw.toLowerCase().trim())
    .filter((kw) => {
      // Keep if it's a product-relevant word
      if (PRODUCT_RELEVANT_WORDS.has(kw)) {
        return true;
      }
      
      // Remove if it's a stopword
      if (SPANISH_STOPWORDS.has(kw)) {
        return false;
      }
      
      // Keep if it's longer than 3 characters (likely a meaningful word)
      // But exclude common short words that slipped through
      if (kw.length <= 3) {
        return false;
      }
      
      return true;
    });
}

/**
 * Extracts relevant keywords from a query string
 * Removes stopwords and keeps only product-relevant terms
 */
export function extractRelevantKeywords(query: string): string[] {
  // Split into words and filter
  const words = query
    .toLowerCase()
    .split(/\s+/)
    .map((w) => w.replace(/[.,!?;:()\[\]{}'"]/g, "").trim())
    .filter((w) => w.length > 0);
  
  return filterRelevantKeywords(words);
}
