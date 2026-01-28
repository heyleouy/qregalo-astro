#!/usr/bin/env node

/**
 * Script to check database state and search functionality
 * Usage: node scripts/check-db.js [local|cloud]
 */

import { createClient } from "@supabase/supabase-js";
import { execSync } from "child_process";

const environment = process.argv[2] || "local";

function getSupabaseKeys() {
  if (environment === "cloud") {
    // For cloud, use environment variables
    return {
      url: process.env.SUPABASE_URL || "",
      serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || "",
      anonKey: process.env.SUPABASE_ANON_KEY || "",
    };
  }

  // For local, parse from supabase status
  try {
    const statusOutput = execSync("supabase status", {
      encoding: "utf-8",
      stdio: ["pipe", "pipe", "ignore"],
    });

    const lines = statusOutput.split("\n");
    let serviceRoleKey = "";
    let anonKey = "";
    let url = "http://127.0.0.1:54321";

    for (const line of lines) {
      if (line.includes("Secret") && line.includes("│") && line.includes("sb_secret")) {
        const match = line.match(/sb_secret_\S+/);
        if (match) serviceRoleKey = match[0];
      }
      if (line.includes("Publishable") && line.includes("│") && line.includes("sb_publishable")) {
        const match = line.match(/sb_publishable_\S+/);
        if (match) anonKey = match[0];
      }
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
    return {
      url: process.env.SUPABASE_URL || "http://127.0.0.1:54321",
      serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || "",
      anonKey: process.env.SUPABASE_ANON_KEY || "",
    };
  }
}

const { url: supabaseUrl, serviceRoleKey, anonKey } = getSupabaseKeys();
const supabaseKey = serviceRoleKey || anonKey || "";

if (!supabaseKey) {
  console.error("❌ Error: Supabase key is required");
  console.error("Make sure Supabase is running: supabase start");
  console.error("Or set SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ANON_KEY environment variable");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDatabase() {
  console.log(`\n🔍 Checking database (${environment})...`);
  console.log(`📍 URL: ${supabaseUrl}\n`);

  // Check stores
  console.log("📊 Checking stores...");
  const { data: stores, error: storesError } = await supabase
    .from("stores")
    .select("*");

  if (storesError) {
    console.error("❌ Error fetching stores:", storesError.message);
    return;
  }
  console.log(`✅ Found ${stores?.length || 0} stores`);
  if (stores && stores.length > 0) {
    console.log(`   Examples: ${stores.slice(0, 3).map((s) => s.name).join(", ")}`);
  }

  // Check categories
  console.log("\n📁 Checking categories...");
  const { data: categories, error: categoriesError } = await supabase
    .from("categories")
    .select("*");

  if (categoriesError) {
    console.error("❌ Error fetching categories:", categoriesError.message);
    return;
  }
  console.log(`✅ Found ${categories?.length || 0} categories`);
  if (categories && categories.length > 0) {
    console.log(`   Categories: ${categories.map((c) => c.name).join(", ")}`);
  }

  // Check products
  console.log("\n📦 Checking products...");
  const { data: products, error: productsError } = await supabase
    .from("products")
    .select("id, title, search_text, tags")
    .limit(10);

  if (productsError) {
    console.error("❌ Error fetching products:", productsError.message);
    return;
  }
  console.log(`✅ Found products (showing first 10 of total)`);
  
  // Get total count
  const { count: totalProducts } = await supabase
    .from("products")
    .select("*", { count: "exact", head: true });
  console.log(`   Total products: ${totalProducts || 0}`);

  if (products && products.length > 0) {
    console.log("\n   Sample products:");
    products.forEach((p, i) => {
      console.log(`   ${i + 1}. ${p.title}`);
      console.log(`      Tags: ${p.tags?.join(", ") || "none"}`);
      console.log(`      Search text populated: ${p.search_text ? "✅ Yes" : "❌ No"}`);
    });
  } else {
    console.log("⚠️  No products found! Run seed script:");
    console.log("   cd supabase/seed && npm run seed");
    return;
  }

  // Check search_text population
  console.log("\n🔎 Checking search_text population...");
  const { data: productsWithSearchText, error: searchTextError } = await supabase
    .from("products")
    .select("id, title, search_text")
    .is("search_text", null);

  if (searchTextError) {
    console.error("❌ Error checking search_text:", searchTextError.message);
  } else {
    const nullCount = productsWithSearchText?.length || 0;
    if (nullCount > 0) {
      console.log(`⚠️  Found ${nullCount} products with NULL search_text`);
      console.log("   The trigger should populate this automatically.");
    } else {
      console.log("✅ All products have search_text populated");
    }
  }

  // Test search functionality
  console.log("\n🔍 Testing search functionality...");
  
  // Test 1: Search for "tecnologia"
  console.log("\n   Test 1: Searching for 'tecnologia'...");
  const { data: techResults, error: techError } = await supabase
    .from("products")
    .select("*", { count: "exact" })
    .textSearch("search_text", "tecnologia", {
      type: "websearch",
      config: "spanish",
    })
    .limit(5);

  if (techError) {
    console.error(`   ❌ Error: ${techError.message}`);
  } else {
    console.log(`   ✅ Found ${techResults?.length || 0} products (total: ${techResults?.length || 0})`);
  }

  // Test 2: Search for "anime"
  console.log("\n   Test 2: Searching for 'anime'...");
  const { data: animeResults, error: animeError } = await supabase
    .from("products")
    .select("*", { count: "exact" })
    .textSearch("search_text", "anime", {
      type: "websearch",
      config: "spanish",
    })
    .limit(5);

  if (animeError) {
    console.error(`   ❌ Error: ${animeError.message}`);
  } else {
    console.log(`   ${animeResults?.length === 0 ? "⚠️" : "✅"} Found ${animeResults?.length || 0} products`);
    if (animeResults?.length === 0) {
      console.log("   ⚠️  No products contain 'anime' - this is expected as seeds don't include anime products");
    }
  }

  // Test 3: Search with category filter
  console.log("\n   Test 3: Searching for 'tecnologia' in 'tecnología' category...");
  const { data: techCategory } = await supabase
    .from("categories")
    .select("id")
    .eq("name", "tecnología")
    .single();

  if (techCategory) {
    const { data: productCategories } = await supabase
      .from("product_categories")
      .select("product_id")
      .eq("category_id", techCategory.id);

    if (productCategories && productCategories.length > 0) {
      const productIds = productCategories.map((pc) => pc.product_id);
      const { data: categoryResults, error: categoryError } = await supabase
        .from("products")
        .select("*", { count: "exact" })
        .in("id", productIds)
        .textSearch("search_text", "tecnologia", {
          type: "websearch",
          config: "spanish",
        })
        .limit(5);

      if (categoryError) {
        console.error(`   ❌ Error: ${categoryError.message}`);
      } else {
        console.log(`   ✅ Found ${categoryResults?.length || 0} products in tecnología category`);
      }
    }
  }

  // Test 4: Test RPC function
  console.log("\n   Test 4: Testing RPC function search_products_with_categories...");
  const { data: rpcResults, error: rpcError } = await supabase.rpc(
    "search_products_with_categories",
    {
      search_query: "tecnologia",
      category_names: ["tecnología"],
      price_min: null,
      price_max: null,
      result_limit: 5,
      result_offset: 0,
    }
  );

  if (rpcError) {
    console.error(`   ❌ Error: ${rpcError.message}`);
  } else {
    console.log(`   ✅ RPC function returned ${rpcResults?.length || 0} products`);
  }

  console.log("\n✨ Database check completed!\n");
}

checkDatabase().catch((error) => {
  console.error("❌ Check failed:", error);
  process.exit(1);
});
