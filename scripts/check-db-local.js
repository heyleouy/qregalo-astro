#!/usr/bin/env node

/**
 * Script to check LOCAL database state
 */

import { createClient } from "@supabase/supabase-js";

// Local credentials from .env
const supabaseUrl = "http://127.0.0.1:54321";
const supabaseKey = "sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH";

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDatabase() {
  console.log(`\n🔍 Checking LOCAL database...`);
  console.log(`📍 URL: ${supabaseUrl}\n`);

  try {
    // Check stores
    console.log("📊 Checking stores...");
    const { data: stores, error: storesError } = await supabase
      .from("stores")
      .select("*");

    if (storesError) {
      console.error("❌ Error fetching stores:", storesError.message);
      console.log("   💡 Make sure Supabase local is running: supabase start");
      return;
    }
    console.log(`✅ Found ${stores?.length || 0} stores`);
    if (stores && stores.length > 0) {
      console.log(`   Examples: ${stores.slice(0, 3).map((s) => s.name).join(", ")}`);
    } else {
      console.log("   ⚠️  No stores found! Run: cd supabase/seed && npm run seed");
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
    } else {
      console.log("   ⚠️  No categories found! Run: cd supabase/seed && npm run seed");
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
      console.log("⚠️  No products found! Run: cd supabase/seed && npm run seed");
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

    // Test 2: Test RPC function
    console.log("\n   Test 2: Testing RPC function with 'tecnologia' category...");
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
      console.log("   Run: supabase migration up");
    } else {
      console.log(`   ✅ RPC function returned ${rpcResults?.length || 0} products`);
      if (rpcResults && rpcResults.length > 0) {
        console.log(`   Sample results:`);
        rpcResults.slice(0, 3).forEach((p, i) => {
          console.log(`     ${i + 1}. ${p.title}`);
        });
      }
    }

    console.log("\n✨ Local database check completed!\n");
  } catch (error) {
    console.error("\n❌ Connection error:", error.message);
    console.log("\n💡 Troubleshooting:");
    console.log("   1. Make sure Supabase local is running: supabase start");
    console.log("   2. Check that Docker Desktop is running");
    console.log("   3. Verify the URL and keys in .env file");
  }
}

checkDatabase().catch((error) => {
  console.error("❌ Check failed:", error);
  process.exit(1);
});
