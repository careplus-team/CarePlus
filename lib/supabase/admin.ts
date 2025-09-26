import { createClient } from "@supabase/supabase-js";
// Create a single supabase client for interacting with your database
export const supabaseServer = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!, // Your Supabase project URL
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Server-only key
);
