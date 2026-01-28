import { QregaloClient, type SupabaseConfig } from "./client.js";

export function createQregaloClient(config?: SupabaseConfig): QregaloClient {
  const url =
    config?.url ||
    process.env.SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    "";

  const anonKey =
    config?.anonKey ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    "";

  if (!url || !anonKey) {
    throw new Error("Supabase URL and anon key are required");
  }

  return new QregaloClient({ url, anonKey });
}
