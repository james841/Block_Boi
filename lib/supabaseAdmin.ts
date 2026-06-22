// lib/supabaseAdmin.ts
import { createClient } from "@supabase/supabase-js";

let supabaseAdminInstance: ReturnType<typeof createClient> | null = null;

export function getSupabaseAdmin() {
  if (!supabaseAdminInstance) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !key) {
      throw new Error("supabaseUrl and SUPABASE_SERVICE_ROLE_KEY are required");
    }

    supabaseAdminInstance = createClient(url, key, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
  }

  return supabaseAdminInstance;
}