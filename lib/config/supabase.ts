import { createClient } from "@supabase/supabase-js";
import { env } from "@/app/env";
import type { Database } from "@/shared/types/supabase";

export const supabaseAdmin = createClient<Database>(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY ?? env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);
