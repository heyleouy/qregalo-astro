#!/usr/bin/env node

/**
 * Script to verify environment variables are configured correctly
 * Run this before deploying to catch configuration issues early
 */

const requiredEnvVars = {
  // Vercel/Production
  PUBLIC_SUPABASE_URL: {
    description: "Supabase Project URL",
    example: "https://<project-ref>.supabase.co",
    where: "Vercel Dashboard → Settings → Environment Variables",
  },
  PUBLIC_SUPABASE_ANON_KEY: {
    description: "Supabase Anon/Public Key",
    example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    where: "Supabase Dashboard → Project Settings → API → anon/public key",
  },
};

const optionalEnvVars = {
  SUPABASE_URL: {
    description: "Supabase URL (for local development)",
    example: "http://localhost:54321",
  },
  SUPABASE_ANON_KEY: {
    description: "Supabase Anon Key (for local development)",
    example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  },
  SUPABASE_SERVICE_ROLE_KEY: {
    description: "Supabase Service Role Key (backend only)",
    example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    warning: "⚠️  NEVER use this in frontend code!",
  },
};

function validateUrl(url) {
  if (!url) return { valid: false, error: "URL is empty" };
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    return { valid: false, error: "URL must start with http:// or https://" };
  }
  if (url.includes("localhost") && process.env.VERCEL) {
    return { valid: false, error: "Cannot use localhost URL in production" };
  }
  return { valid: true };
}

function validateAnonKey(key) {
  if (!key) return { valid: false, error: "Key is empty" };
  if (!key.startsWith("eyJ")) {
    return {
      valid: false,
      error: "Key should start with 'eyJ' (JWT format). Make sure you're using anon key, not service_role key.",
    };
  }
  if (key.length < 100) {
    return { valid: false, error: "Key seems too short. Make sure it's the full anon key." };
  }
  return { valid: true };
}

function checkEnvVars() {
  console.log("🔍 Verifying environment variables...\n");

  let hasErrors = false;
  let hasWarnings = false;

  // Check required vars
  console.log("📋 Required Environment Variables:\n");
  for (const [varName, info] of Object.entries(requiredEnvVars)) {
    const value = process.env[varName];
    const isSet = !!value;

    if (!isSet) {
      console.log(`❌ ${varName}: MISSING`);
      console.log(`   Description: ${info.description}`);
      console.log(`   Example: ${info.example}`);
      console.log(`   Where to set: ${info.where}\n`);
      hasErrors = true;
    } else {
      // Validate format
      let validation = { valid: true };
      if (varName.includes("URL")) {
        validation = validateUrl(value);
      } else if (varName.includes("ANON_KEY")) {
        validation = validateAnonKey(value);
      }

      if (validation.valid) {
        // Mask sensitive values
        const masked = varName.includes("KEY") ? `${value.substring(0, 20)}...` : value;
        console.log(`✅ ${varName}: Set (${masked})`);
      } else {
        console.log(`⚠️  ${varName}: Set but invalid`);
        console.log(`   Error: ${validation.error}`);
        console.log(`   Current value: ${value.substring(0, 50)}...`);
        hasWarnings = true;
      }
      console.log();
    }
  }

  // Check optional vars
  console.log("📋 Optional Environment Variables:\n");
  for (const [varName, info] of Object.entries(optionalEnvVars)) {
    const value = process.env[varName];
    const isSet = !!value;

    if (isSet) {
      if (info.warning) {
        console.log(`⚠️  ${varName}: ${info.warning}`);
      } else {
        const masked = varName.includes("KEY") ? `${value.substring(0, 20)}...` : value;
        console.log(`✅ ${varName}: Set (${masked})`);
      }
    } else {
      console.log(`⚪ ${varName}: Not set (optional)`);
    }
    console.log(`   Description: ${info.description}\n`);
  }

  // Summary
  console.log("─".repeat(60));
  if (hasErrors) {
    console.log("\n❌ ERRORS FOUND: Please fix the missing required variables above.");
    console.log("\n💡 Quick Fix:");
    console.log("   1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables");
    console.log("   2. Add PUBLIC_SUPABASE_URL and PUBLIC_SUPABASE_ANON_KEY");
    console.log("   3. Get values from Supabase Dashboard → Project Settings → API");
    console.log("   4. Redeploy your project\n");
    process.exit(1);
  } else if (hasWarnings) {
    console.log("\n⚠️  WARNINGS: Some variables have invalid formats. Please review above.");
    process.exit(0);
  } else {
    console.log("\n✅ All required environment variables are configured correctly!");
    process.exit(0);
  }
}

// Run check
checkEnvVars();
