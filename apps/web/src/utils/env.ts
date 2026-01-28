/**
 * Environment variable validation and helpers
 * Provides clear error messages when variables are missing
 */

export function getSupabaseConfig() {
  const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
  const supabaseKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl) {
    throw new Error(
      `Missing PUBLIC_SUPABASE_URL environment variable.\n` +
        `Please configure it in Vercel Dashboard:\n` +
        `Settings → Environment Variables → Add PUBLIC_SUPABASE_URL\n` +
        `Value should be: https://<your-project-ref>.supabase.co`
    );
  }

  if (!supabaseKey) {
    throw new Error(
      `Missing PUBLIC_SUPABASE_ANON_KEY environment variable.\n` +
        `Please configure it in Vercel Dashboard:\n` +
        `Settings → Environment Variables → Add PUBLIC_SUPABASE_ANON_KEY\n` +
        `Get the value from: Supabase Dashboard → Project Settings → API → anon/public key`
    );
  }

  // Validate URL format
  if (!supabaseUrl.startsWith("http://") && !supabaseUrl.startsWith("https://")) {
    throw new Error(
      `Invalid PUBLIC_SUPABASE_URL format: "${supabaseUrl}"\n` +
        `Should start with http:// or https://`
    );
  }

  // Validate key format
  // Production keys: JWT tokens start with eyJ
  // Local keys: Supabase local keys start with sb_publishable_
  const isProductionKey = supabaseKey.startsWith("eyJ");
  const isLocalKey = supabaseKey.startsWith("sb_publishable_");
  
  if (!isProductionKey && !isLocalKey) {
    throw new Error(
      `Invalid PUBLIC_SUPABASE_ANON_KEY format.\n` +
        `Expected format:\n` +
        `  - Production: eyJ... (JWT token from Supabase Dashboard)\n` +
        `  - Local: sb_publishable_... (from 'supabase status' command)\n` +
        `Make sure you're using the anon/public key (not service_role key).`
    );
  }

  return {
    url: supabaseUrl,
    anonKey: supabaseKey,
  };
}

/**
 * Check if we're running in production (Vercel)
 */
export function isProduction(): boolean {
  return import.meta.env.PROD && typeof process !== "undefined" && !!process.env.VERCEL;
}

/**
 * Get environment info for debugging
 */
export function getEnvInfo() {
  return {
    supabaseUrl: import.meta.env.PUBLIC_SUPABASE_URL ? "✅ Set" : "❌ Missing",
    supabaseKey: import.meta.env.PUBLIC_SUPABASE_ANON_KEY ? "✅ Set" : "❌ Missing",
    isProduction: isProduction(),
    nodeEnv: typeof process !== "undefined" ? process.env.NODE_ENV : "unknown",
  };
}
