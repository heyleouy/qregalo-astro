#!/usr/bin/env node

/**
 * Script to seed production database
 * Usage: node scripts/seed-prod.js
 */

import { createClient } from "@supabase/supabase-js";

// Production credentials
const supabaseUrl = "https://utcceqbwkjjbyyrcrwqr.supabase.co";
const supabaseServiceRoleKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV0Y2NlcWJ3a2pqYnl5cmNyd3FyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTU3Mzk3MywiZXhwIjoyMDg1MTQ5OTczfQ.QQ4uqPhKA8Dj2p7gxAdrRR_EXx5mLZ67Gkne8GSG3EU";

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

// Deterministic UUIDs for stores (same as seed/index.ts)
const STORE_UUIDS = {
  tecnologia: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  ropa: "b2c3d4e5-f6a7-8901-bcde-f12345678901",
  libros: "c3d4e5f6-a7b8-9012-cdef-123456789012",
  deportes: "d4e5f6a7-b8c9-0123-def0-234567890123",
  hogar: "e5f6a7b8-c9d0-1234-ef01-345678901234",
  juguetes: "f6a7b8c9-d0e1-2345-f012-456789012345",
  belleza: "a7b8c9d0-e1f2-3456-0123-567890123456",
};

const stores = [
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

// Import products from seed file (simplified - you should import the full array)
// For now, we'll use a subset. In production, you should import the full array from seed/index.ts
const products = [
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
  // Add more products as needed - this is a subset for testing
  // In production, import the full array from seed/index.ts
];

async function seed() {
  console.log("🌱 Starting production seed...");

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
  const categoryMap = new Map();
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
  const productCategories = [];

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

  console.log("✨ Production seed completed successfully!");
  console.log("\n⚠️  Note: This script only seeds a subset of products.");
  console.log("   For full seed, use: cd supabase/seed && SUPABASE_URL=<prod-url> SUPABASE_SERVICE_ROLE_KEY=<key> npm run seed");
}

seed().catch((error) => {
  console.error("❌ Seed failed:", error);
  process.exit(1);
});
