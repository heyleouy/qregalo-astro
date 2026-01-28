import { createClient } from "@supabase/supabase-js";
import { execSync } from "child_process";

// Get Supabase keys from status command or environment variables
function getSupabaseKeys() {
  // If environment variables are set (for production), use them directly
  if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return {
      url: process.env.SUPABASE_URL,
      serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
      anonKey: process.env.SUPABASE_ANON_KEY || "",
    };
  }

  // Otherwise, try to get from local supabase status
  try {
    const statusOutput = execSync("supabase status", {
      encoding: "utf-8",
      stdio: ["pipe", "pipe", "ignore"],
    });
    
    // Parse the status output - format: "│ Secret      │ sb_secret_... │"
    const lines = statusOutput.split("\n");
    let serviceRoleKey = "";
    let anonKey = "";
    let url = "http://127.0.0.1:54321";
    
    for (const line of lines) {
      // Match: │ Secret      │ sb_secret_... │
      if (line.includes("Secret") && line.includes("│") && line.includes("sb_secret")) {
        const match = line.match(/sb_secret_\S+/);
        if (match) serviceRoleKey = match[0];
      }
      // Match: │ Publishable │ sb_publishable_... │
      if (line.includes("Publishable") && line.includes("│") && line.includes("sb_publishable")) {
        const match = line.match(/sb_publishable_\S+/);
        if (match) anonKey = match[0];
      }
      // Match: │ Project URL    │ http://127.0.0.1:54321              │
      if (line.includes("Project URL") && line.includes("│")) {
        const match = line.match(/http:\/\/[^\s│]+/);
        if (match) url = match[0];
      }
    }
    
    return {
      url: url || process.env.SUPABASE_URL || "http://127.0.0.1:54321",
      serviceRoleKey: serviceRoleKey || process.env.SUPABASE_SERVICE_ROLE_KEY || "",
      anonKey: anonKey || process.env.SUPABASE_ANON_KEY || "",
    };
  } catch (error) {
    // Fallback to environment variables or defaults
    return {
      url: process.env.SUPABASE_URL || "http://127.0.0.1:54321",
      serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || "",
      anonKey: process.env.SUPABASE_ANON_KEY || "",
    };
  }
}

const { url: supabaseUrl, serviceRoleKey, anonKey } = getSupabaseKeys();
// Use service role key for seed (has full permissions), fallback to anon key
const supabaseKey = serviceRoleKey || anonKey || "";

if (!supabaseKey) {
  console.error("Error: Supabase key is required");
  console.error("Make sure Supabase is running: supabase start");
  console.error("Or set SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ANON_KEY environment variable");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Deterministic UUIDs for stores
const STORE_UUIDS = {
  tecnologia: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  ropa: "b2c3d4e5-f6a7-8901-bcde-f12345678901",
  libros: "c3d4e5f6-a7b8-9012-cdef-123456789012",
  deportes: "d4e5f6a7-b8c9-0123-def0-234567890123",
  hogar: "e5f6a7b8-c9d0-1234-ef01-345678901234",
  juguetes: "f6a7b8c9-d0e1-2345-f012-456789012345",
  belleza: "a7b8c9d0-e1f2-3456-0123-567890123456",
};

interface SeedStore {
  id: string;
  name: string;
  website_url: string;
  category: string | null;
}

interface SeedProduct {
  store_id: string;
  title: string;
  description: string;
  price_original: number;
  currency_original: "USD" | "UYU";
  original_url: string;
  location: string | null;
  tags: string[];
  image_url: string | null;
}

const stores: SeedStore[] = [
  {
    id: STORE_UUIDS.tecnologia,
    name: "TechStore Uruguay",
    website_url: "https://techstore.com.uy",
    category: "tecnología",
  },
  {
    id: STORE_UUIDS.ropa,
    name: "Moda Elegante",
    website_url: "https://modaelegante.com.uy",
    category: "ropa",
  },
  {
    id: STORE_UUIDS.libros,
    name: "Librería del Sur",
    website_url: "https://libreriadelsur.com.uy",
    category: "libros",
  },
  {
    id: STORE_UUIDS.deportes,
    name: "Deportes Total",
    website_url: "https://deportestotal.com.uy",
    category: "deportes",
  },
  {
    id: STORE_UUIDS.hogar,
    name: "Hogar y Decoración",
    website_url: "https://hogardecoracion.com.uy",
    category: "hogar",
  },
  {
    id: STORE_UUIDS.juguetes,
    name: "Juguetes del Mundo",
    website_url: "https://juguetesdelmundo.com.uy",
    category: "juguetes",
  },
  {
    id: STORE_UUIDS.belleza,
    name: "Belleza Natural",
    website_url: "https://bellezanatural.com.uy",
    category: "belleza",
  },
];

const products: SeedProduct[] = [
  // Tecnología - USD
  {
    store_id: STORE_UUIDS.tecnologia,
    title: "iPhone 15 Pro 256GB",
    description: "Smartphone Apple con pantalla Super Retina XDR, chip A17 Pro, cámara triple de 48MP",
    price_original: 999,
    currency_original: "USD",
    original_url: "https://techstore.com.uy/iphone-15-pro",
    location: "Montevideo",
    tags: ["smartphone", "apple", "tecnología", "premium"],
    image_url: null,
  },
  {
    store_id: STORE_UUIDS.tecnologia,
    title: "Samsung Galaxy S24 Ultra",
    description: "Teléfono Android con pantalla AMOLED de 6.8 pulgadas, cámara de 200MP, S Pen incluido",
    price_original: 899,
    currency_original: "USD",
    original_url: "https://techstore.com.uy/galaxy-s24-ultra",
    location: "Montevideo",
    tags: ["smartphone", "samsung", "android", "fotografía"],
    image_url: null,
  },
  {
    store_id: STORE_UUIDS.tecnologia,
    title: "MacBook Air M3 13 pulgadas",
    description: "Laptop ultradelgada con chip Apple M3, 8GB RAM, 256GB SSD, pantalla Retina",
    price_original: 1099,
    currency_original: "USD",
    original_url: "https://techstore.com.uy/macbook-air-m3",
    location: "Montevideo",
    tags: ["laptop", "apple", "portátil", "trabajo"],
    image_url: null,
  },
  {
    store_id: STORE_UUIDS.tecnologia,
    title: "AirPods Pro 2",
    description: "Auriculares inalámbricos con cancelación activa de ruido y sonido espacial",
    price_original: 249,
    currency_original: "USD",
    original_url: "https://techstore.com.uy/airpods-pro-2",
    location: "Montevideo",
    tags: ["auriculares", "apple", "inalámbrico", "audio"],
    image_url: null,
  },
  {
    store_id: STORE_UUIDS.tecnologia,
    title: "iPad Air 11 pulgadas",
    description: "Tablet con chip M2, pantalla Liquid Retina, compatible con Apple Pencil",
    price_original: 599,
    currency_original: "USD",
    original_url: "https://techstore.com.uy/ipad-air",
    location: "Montevideo",
    tags: ["tablet", "apple", "productividad", "creatividad"],
    image_url: null,
  },
  {
    store_id: STORE_UUIDS.tecnologia,
    title: "Smartwatch Apple Watch Series 9",
    description: "Reloj inteligente con GPS, monitor de salud, resistencia al agua",
    price_original: 399,
    currency_original: "USD",
    original_url: "https://techstore.com.uy/apple-watch-9",
    location: "Montevideo",
    tags: ["smartwatch", "apple", "salud", "deportes"],
    image_url: null,
  },
  {
    store_id: STORE_UUIDS.tecnologia,
    title: "Sony WH-1000XM5 Auriculares",
    description: "Auriculares over-ear con cancelación de ruido líder, sonido Hi-Res",
    price_original: 399,
    currency_original: "USD",
    original_url: "https://techstore.com.uy/sony-wh1000xm5",
    location: "Montevideo",
    tags: ["auriculares", "sony", "cancelación de ruido", "premium"],
    image_url: null,
  },
  {
    store_id: STORE_UUIDS.tecnologia,
    title: "Nintendo Switch OLED",
    description: "Consola portátil con pantalla OLED de 7 pulgadas, incluye Joy-Con",
    price_original: 349,
    currency_original: "USD",
    original_url: "https://techstore.com.uy/nintendo-switch-oled",
    location: "Montevideo",
    tags: ["consola", "nintendo", "videojuegos", "portátil"],
    image_url: null,
  },
  {
    store_id: STORE_UUIDS.tecnologia,
    title: "Cámara Canon EOS R6 Mark II",
    description: "Cámara mirrorless full-frame, 24MP, grabación de video 4K",
    price_original: 2499,
    currency_original: "USD",
    original_url: "https://techstore.com.uy/canon-eos-r6",
    location: "Montevideo",
    tags: ["cámara", "canon", "fotografía", "profesional"],
    image_url: null,
  },
  {
    store_id: STORE_UUIDS.tecnologia,
    title: "Monitor LG UltraGear 27 pulgadas",
    description: "Monitor gaming 4K, 144Hz, HDR10, compatible con G-Sync",
    price_original: 449,
    currency_original: "USD",
    original_url: "https://techstore.com.uy/lg-ultragear-27",
    location: "Montevideo",
    tags: ["monitor", "gaming", "4K", "alta frecuencia"],
    image_url: null,
  },
  // Tecnología - UYU
  {
    store_id: STORE_UUIDS.tecnologia,
    title: "Teclado Mecánico Logitech MX Keys",
    description: "Teclado inalámbrico con retroiluminación, diseño ergonómico",
    price_original: 8500,
    currency_original: "UYU",
    original_url: "https://techstore.com.uy/logitech-mx-keys",
    location: "Montevideo",
    tags: ["teclado", "logitech", "inalámbrico", "oficina"],
    image_url: null,
  },
  {
    store_id: STORE_UUIDS.tecnologia,
    title: "Mouse Logitech MX Master 3S",
    description: "Mouse inalámbrico ergonómico, sensor de alta precisión, batería de larga duración",
    price_original: 6500,
    currency_original: "UYU",
    original_url: "https://techstore.com.uy/logitech-mx-master",
    location: "Montevideo",
    tags: ["mouse", "logitech", "ergonómico", "productividad"],
    image_url: null,
  },
  // Ropa - USD
  {
    store_id: STORE_UUIDS.ropa,
    title: "Vestido Elegante de Noche",
    description: "Vestido largo de seda, corte A-line, disponible en varios colores",
    price_original: 89,
    currency_original: "USD",
    original_url: "https://modaelegante.com.uy/vestido-noche",
    location: "Montevideo",
    tags: ["vestido", "elegante", "noche", "formal"],
    image_url: null,
  },
  {
    store_id: STORE_UUIDS.ropa,
    title: "Chaqueta de Cuero Genuino",
    description: "Chaqueta de cuero de alta calidad, forro interior, estilo clásico",
    price_original: 199,
    currency_original: "USD",
    original_url: "https://modaelegante.com.uy/chaqueta-cuero",
    location: "Montevideo",
    tags: ["chaqueta", "cuero", "casual", "premium"],
    image_url: null,
  },
  {
    store_id: STORE_UUIDS.ropa,
    title: "Zapatos de Cuero Oxford",
    description: "Zapatos formales de cuero, suela de cuero, perfectos para oficina",
    price_original: 129,
    currency_original: "USD",
    original_url: "https://modaelegante.com.uy/zapatos-oxford",
    location: "Montevideo",
    tags: ["zapatos", "formal", "cuero", "oficina"],
    image_url: null,
  },
  {
    store_id: STORE_UUIDS.ropa,
    title: "Bolso de Mano de Diseñador",
    description: "Bolso de cuero italiano, múltiples compartimentos, correa ajustable",
    price_original: 159,
    currency_original: "USD",
    original_url: "https://modaelegante.com.uy/bolso-disenador",
    location: "Montevideo",
    tags: ["bolso", "cuero", "diseñador", "accesorio"],
    image_url: null,
  },
  // Ropa - UYU
  {
    store_id: STORE_UUIDS.ropa,
    title: "Camisa de Algodón Premium",
    description: "Camisa de algodón 100%, corte clásico, disponible en varios colores",
    price_original: 3200,
    currency_original: "UYU",
    original_url: "https://modaelegante.com.uy/camisa-algodon",
    location: "Montevideo",
    tags: ["camisa", "algodón", "casual", "oficina"],
    image_url: null,
  },
  {
    store_id: STORE_UUIDS.ropa,
    title: "Pantalón Chino Clásico",
    description: "Pantalón de algodón, corte recto, color beige, versátil y cómodo",
    price_original: 2800,
    currency_original: "UYU",
    original_url: "https://modaelegante.com.uy/pantalon-chino",
    location: "Montevideo",
    tags: ["pantalón", "casual", "algodón", "versátil"],
    image_url: null,
  },
  {
    store_id: STORE_UUIDS.ropa,
    title: "Sweater de Lana Merino",
    description: "Sweater de lana merino, cálido y suave, ideal para invierno",
    price_original: 4500,
    currency_original: "UYU",
    original_url: "https://modaelegante.com.uy/sweater-lana",
    location: "Montevideo",
    tags: ["sweater", "lana", "invierno", "cálido"],
    image_url: null,
  },
  // Libros - UYU
  {
    store_id: STORE_UUIDS.libros,
    title: "Cien Años de Soledad - Gabriel García Márquez",
    description: "Novela clásica de realismo mágico, edición especial con prólogo",
    price_original: 890,
    currency_original: "UYU",
    original_url: "https://libreriadelsur.com.uy/cien-anos-soledad",
    location: "Montevideo",
    tags: ["libro", "novela", "literatura", "clásico"],
    image_url: null,
  },
  {
    store_id: STORE_UUIDS.libros,
    title: "El Principito - Antoine de Saint-Exupéry",
    description: "Edición ilustrada del clásico infantil, tapa dura",
    price_original: 650,
    currency_original: "UYU",
    original_url: "https://libreriadelsur.com.uy/principito",
    location: "Montevideo",
    tags: ["libro", "infantil", "clásico", "ilustrado"],
    image_url: null,
  },
  {
    store_id: STORE_UUIDS.libros,
    title: "Sapiens - Yuval Noah Harari",
    description: "Breve historia de la humanidad, edición de bolsillo",
    price_original: 1200,
    currency_original: "UYU",
    original_url: "https://libreriadelsur.com.uy/sapiens",
    location: "Montevideo",
    tags: ["libro", "historia", "no ficción", "filosofía"],
    image_url: null,
  },
  {
    store_id: STORE_UUIDS.libros,
    title: "Harry Potter y la Piedra Filosofal",
    description: "Primera edición de la saga, tapa dura ilustrada",
    price_original: 950,
    currency_original: "UYU",
    original_url: "https://libreriadelsur.com.uy/harry-potter-1",
    location: "Montevideo",
    tags: ["libro", "fantasía", "juvenil", "saga"],
    image_url: null,
  },
  // Deportes - USD
  {
    store_id: STORE_UUIDS.deportes,
    title: "Zapatillas Nike Air Max 270",
    description: "Zapatillas deportivas con tecnología Air Max, cómodas para running",
    price_original: 120,
    currency_original: "USD",
    original_url: "https://deportestotal.com.uy/nike-air-max",
    location: "Montevideo",
    tags: ["zapatillas", "nike", "running", "deportes"],
    image_url: null,
  },
  {
    store_id: STORE_UUIDS.deportes,
    title: "Pelota de Fútbol Adidas",
    description: "Pelota oficial de fútbol, tamaño 5, diseño clásico",
    price_original: 35,
    currency_original: "USD",
    original_url: "https://deportestotal.com.uy/pelota-adidas",
    location: "Montevideo",
    tags: ["pelota", "fútbol", "adidas", "deportes"],
    image_url: null,
  },
  {
    store_id: STORE_UUIDS.deportes,
    title: "Bicicleta de Montaña Trek",
    description: "Bicicleta todo terreno, cambios Shimano, suspensión delantera",
    price_original: 599,
    currency_original: "USD",
    original_url: "https://deportestotal.com.uy/bicicleta-trek",
    location: "Montevideo",
    tags: ["bicicleta", "montaña", "deportes", "outdoor"],
    image_url: null,
  },
  // Deportes - UYU
  {
    store_id: STORE_UUIDS.deportes,
    title: "Raqueta de Tenis Wilson",
    description: "Raqueta profesional de tenis, peso balanceado, grip cómodo",
    price_original: 8500,
    currency_original: "UYU",
    original_url: "https://deportestotal.com.uy/raqueta-wilson",
    location: "Montevideo",
    tags: ["raqueta", "tenis", "wilson", "deportes"],
    image_url: null,
  },
  {
    store_id: STORE_UUIDS.deportes,
    title: "Mancuernas Ajustables 20kg",
    description: "Set de mancuernas ajustables, ideal para entrenamiento en casa",
    price_original: 12000,
    currency_original: "UYU",
    original_url: "https://deportestotal.com.uy/mancuernas",
    location: "Montevideo",
    tags: ["mancuernas", "gym", "fitness", "entrenamiento"],
    image_url: null,
  },
  // Hogar - USD
  {
    store_id: STORE_UUIDS.hogar,
    title: "Cafetera Nespresso Vertuo",
    description: "Máquina de café automática, sistema de cápsulas, espumador de leche incluido",
    price_original: 199,
    currency_original: "USD",
    original_url: "https://hogardecoracion.com.uy/nespresso-vertuo",
    location: "Montevideo",
    tags: ["cafetera", "nespresso", "hogar", "café"],
    image_url: null,
  },
  {
    store_id: STORE_UUIDS.hogar,
    title: "Aspiradora Robot Roomba",
    description: "Aspiradora inteligente con mapeo, control por app, programable",
    price_original: 349,
    currency_original: "USD",
    original_url: "https://hogardecoracion.com.uy/roomba",
    location: "Montevideo",
    tags: ["aspiradora", "robot", "hogar", "inteligente"],
    image_url: null,
  },
  {
    store_id: STORE_UUIDS.hogar,
    title: "Juego de Sábanas de Algodón Egipcio",
    description: "Juego completo de sábanas, algodón 100%, disponible en varios colores",
    price_original: 79,
    currency_original: "USD",
    original_url: "https://hogardecoracion.com.uy/sabanas-algodon",
    location: "Montevideo",
    tags: ["sábanas", "hogar", "algodón", "cama"],
    image_url: null,
  },
  // Hogar - UYU
  {
    store_id: STORE_UUIDS.hogar,
    title: "Lámpara de Pie Moderna",
    description: "Lámpara de diseño contemporáneo, base de mármol, luz LED regulable",
    price_original: 4500,
    currency_original: "UYU",
    original_url: "https://hogardecoracion.com.uy/lampara-pie",
    location: "Montevideo",
    tags: ["lámpara", "decoración", "hogar", "iluminación"],
    image_url: null,
  },
  {
    store_id: STORE_UUIDS.hogar,
    title: "Juego de Ollas Antiadherentes",
    description: "Set de 5 ollas con recubrimiento antiadherente, mangos ergonómicos",
    price_original: 6800,
    currency_original: "UYU",
    original_url: "https://hogardecoracion.com.uy/ollas-antiadherentes",
    location: "Montevideo",
    tags: ["ollas", "cocina", "hogar", "antiadherente"],
    image_url: null,
  },
  // Juguetes - USD
  {
    store_id: STORE_UUIDS.juguetes,
    title: "Lego Star Wars Millennium Falcon",
    description: "Set de construcción LEGO con más de 1300 piezas, modelo detallado",
    price_original: 169,
    currency_original: "USD",
    original_url: "https://juguetesdelmundo.com.uy/lego-millennium",
    location: "Montevideo",
    tags: ["lego", "star wars", "construcción", "juguete"],
    image_url: null,
  },
  {
    store_id: STORE_UUIDS.juguetes,
    title: "Muñeca Barbie Dreamhouse",
    description: "Casa de muñecas de 3 pisos, muebles incluidos, múltiples accesorios",
    price_original: 199,
    currency_original: "USD",
    original_url: "https://juguetesdelmundo.com.uy/barbie-dreamhouse",
    location: "Montevideo",
    tags: ["barbie", "muñeca", "casa", "juguete"],
    image_url: null,
  },
  {
    store_id: STORE_UUIDS.juguetes,
    title: "Hot Wheels Track Set",
    description: "Pista de carreras con loops y curvas, incluye 2 autos Hot Wheels",
    price_original: 49,
    currency_original: "USD",
    original_url: "https://juguetesdelmundo.com.uy/hot-wheels-track",
    location: "Montevideo",
    tags: ["hot wheels", "autos", "pista", "juguete"],
    image_url: null,
  },
  // Juguetes - UYU
  {
    store_id: STORE_UUIDS.juguetes,
    title: "Puzzle 1000 Piezas Paisaje",
    description: "Puzzle de alta calidad, imagen de paisaje natural, piezas grandes",
    price_original: 1200,
    currency_original: "UYU",
    original_url: "https://juguetesdelmundo.com.uy/puzzle-1000",
    location: "Montevideo",
    tags: ["puzzle", "juego", "educativo", "juguete"],
    image_url: null,
  },
  {
    store_id: STORE_UUIDS.juguetes,
    title: "Peluche Oso Grande",
    description: "Oso de peluche suave, 50cm de altura, ideal para niños",
    price_original: 1800,
    currency_original: "UYU",
    original_url: "https://juguetesdelmundo.com.uy/peluche-oso",
    location: "Montevideo",
    tags: ["peluche", "oso", "juguete", "niños"],
    image_url: null,
  },
  // Belleza - USD
  {
    store_id: STORE_UUIDS.belleza,
    title: "Perfume Chanel No. 5",
    description: "Fragancia icónica, 50ml, Eau de Parfum, presentación elegante",
    price_original: 89,
    currency_original: "USD",
    original_url: "https://bellezanatural.com.uy/chanel-no5",
    location: "Montevideo",
    tags: ["perfume", "chanel", "fragancia", "belleza"],
    image_url: null,
  },
  {
    store_id: STORE_UUIDS.belleza,
    title: "Kit de Maquillaje Profesional",
    description: "Set completo con sombras, labiales, base y brochas, 50 piezas",
    price_original: 79,
    currency_original: "USD",
    original_url: "https://bellezanatural.com.uy/kit-maquillaje",
    location: "Montevideo",
    tags: ["maquillaje", "kit", "belleza", "cosméticos"],
    image_url: null,
  },
  // Belleza - UYU
  {
    store_id: STORE_UUIDS.belleza,
    title: "Crema Facial Anti-edad",
    description: "Crema hidratante con retinol, vitamina C, envase de 50ml",
    price_original: 3200,
    currency_original: "UYU",
    original_url: "https://bellezanatural.com.uy/crema-antiedad",
    location: "Montevideo",
    tags: ["crema", "cuidado facial", "anti-edad", "belleza"],
    image_url: null,
  },
  {
    store_id: STORE_UUIDS.belleza,
    title: "Secador de Pelo Profesional",
    description: "Secador de 2000W, tecnología iónica, múltiples velocidades",
    price_original: 5500,
    currency_original: "UYU",
    original_url: "https://bellezanatural.com.uy/secador-pelo",
    location: "Montevideo",
    tags: ["secador", "pelo", "belleza", "electrodoméstico"],
    image_url: null,
  },
];

async function seed() {
  console.log("🌱 Starting seed...");

  // Clear existing data
  console.log("🗑️  Clearing existing data...");
  await supabase.from("product_clicks").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await supabase.from("search_sessions").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await supabase.from("product_categories").delete().neq("product_id", "00000000-0000-0000-0000-000000000000");
  await supabase.from("products").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await supabase.from("categories").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await supabase.from("stores").delete().neq("id", "00000000-0000-0000-0000-000000000000");

  // Insert stores
  console.log("🏪 Inserting stores...");
  const { error: storesError } = await supabase.from("stores").insert(stores);
  if (storesError) {
    console.error("Error inserting stores:", storesError);
    throw storesError;
  }
  console.log(`✅ Inserted ${stores.length} stores`);

  // Create categories
  const categoryNames = [
    "tecnología",
    "ropa",
    "libros",
    "deportes",
    "hogar",
    "juguetes",
    "belleza",
    "accesorios",
  ];

  console.log("📁 Creating categories...");
  const categories = categoryNames.map((name) => ({ name }));
  const { data: insertedCategories, error: categoriesError } = await supabase
    .from("categories")
    .insert(categories)
    .select();

  if (categoriesError) {
    console.error("Error inserting categories:", categoriesError);
    throw categoriesError;
  }
  console.log(`✅ Created ${insertedCategories?.length || 0} categories`);

  // Create category map
  const categoryMap = new Map<string, string>();
  insertedCategories?.forEach((cat) => {
    categoryMap.set(cat.name, cat.id);
  });

  // Insert products
  console.log("📦 Inserting products...");
  const { data: insertedProducts, error: productsError } = await supabase
    .from("products")
    .insert(products)
    .select();

  if (productsError) {
    console.error("Error inserting products:", productsError);
    throw productsError;
  }
  console.log(`✅ Inserted ${insertedProducts?.length || 0} products`);

  // Link products to categories
  console.log("🔗 Linking products to categories...");
  const productCategories: Array<{ product_id: string; category_id: string }> = [];

  insertedProducts?.forEach((product) => {
    const store = stores.find((s) => s.id === product.store_id);
    if (store?.category) {
      const categoryId = categoryMap.get(store.category);
      if (categoryId) {
        productCategories.push({
          product_id: product.id,
          category_id: categoryId,
        });
      }
    }
  });

  if (productCategories.length > 0) {
    const { error: linkError } = await supabase
      .from("product_categories")
      .insert(productCategories);

    if (linkError) {
      console.error("Error linking products to categories:", linkError);
      throw linkError;
    }
    console.log(`✅ Linked ${productCategories.length} product-category relationships`);
  }

  console.log("✨ Seed completed successfully!");
}

seed().catch((error) => {
  console.error("❌ Seed failed:", error);
  process.exit(1);
});
