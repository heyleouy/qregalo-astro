#!/usr/bin/env node

/**
 * Script to check database state in production
 */

import { createClient } from "@supabase/supabase-js";

// Production credentials
const supabaseUrl = "https://utcceqbwkjjbyyrcrwqr.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV0Y2NlcWJ3a2pqYnl5cmNyd3FyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk1NzM5NzMsImV4cCI6MjA4NTE0OTk3M30.8AAO5sx3k3IP1pLfOkf94yh8kPnkdv1JkYLlji86KlU";

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDatabase() {
  console.log(`\n🔍 Checking PRODUCTION database...`);
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
    .select("id, title, search_text, tags, store_id")
    .limit(10);

  if (productsError) {
    console.error("❌ Error fetching products:", productsError.message);
    return;
  }
  
  // Get total count
  const { count: totalProducts } = await supabase
    .from("products")
    .select("*", { count: "exact", head: true });
  console.log(`✅ Found ${totalProducts || 0} total products`);
  console.log(`   Showing first ${products?.length || 0} products:`);

  if (products && products.length > 0) {
    products.forEach((p, i) => {
      console.log(`   ${i + 1}. ${p.title}`);
      console.log(`      Tags: ${p.tags?.join(", ") || "none"}`);
      console.log(`      Search text populated: ${p.search_text ? "✅ Yes" : "❌ No"}`);
    });
  } else {
    console.log("⚠️  No products found! Run seed script in production.");
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
    console.log(`   ✅ Found ${techResults?.length || 0} products`);
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

  // Test 3: Search with category filter using RPC
  console.log("\n   Test 3: Testing RPC function with 'tecnologia' category...");
  const { data: rpcResults, error: rpcError } = await supabase.rpc(
    "search_products_with_categories",
    {
      search_query: "anime tecnologia",
      category_names: ["tecnología"],
      price_min: null,
      price_max: null,
      result_limit: 10,
      result_offset: 0,
    }
  );

  if (rpcError) {
    console.error(`   ❌ Error: ${rpcError.message}`);
    console.log("   ⚠️  This might mean the migration 003 hasn't been applied yet.");
  } else {
    console.log(`   ✅ RPC function returned ${rpcResults?.length || 0} products`);
    if (rpcResults && rpcResults.length > 0) {
      console.log(`   Sample results:`);
      rpcResults.slice(0, 3).forEach((p, i) => {
        console.log(`     ${i + 1}. ${p.title}`);
      });
    } else {
      console.log("   ⚠️  No results - this might be expected if migration 003 hasn't been applied");
    }
  }

  // Test 4: Search with category filter only (no keywords)
  console.log("\n   Test 4: Testing category-only search (tecnología)...");
  const { data: categoryOnlyResults, error: categoryOnlyError } = await supabase.rpc(
    "search_products_with_categories",
    {
      search_query: null,
      category_names: ["tecnología"],
      price_min: null,
      price_max: null,
      result_limit: 5,
      result_offset: 0,
    }
  );

  if (categoryOnlyError) {
    console.error(`   ❌ Error: ${categoryOnlyError.message}`);
  } else {
    console.log(`   ✅ Found ${categoryOnlyResults?.length || 0} products in tecnología category`);
  }

  console.log("\n✨ Production database check completed!\n");
}

checkDatabase().catch((error) => {
  console.error("❌ Check failed:", error);
  process.exit(1);
});
