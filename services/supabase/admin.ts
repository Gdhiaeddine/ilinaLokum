import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { env } from "@/app/env";

let bucketEnsured = false;

export function createAdminClient() {
  if (!env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not configured");
  }
  return createSupabaseClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: { persistSession: false, autoRefreshToken: false },
    }
  );
}

export async function ensureBucket(bucket: string, isPublic = true) {
  if (bucketEnsured) return;
  const admin = createAdminClient();
  const { data, error } = await admin.storage.getBucket(bucket);
  if (error || !data) {
    const { error: createError } = await admin.storage.createBucket(bucket, {
      public: isPublic,
    });
    if (createError && !/already exists/i.test(createError.message)) {
      throw createError;
    }
  }
  bucketEnsured = true;
}
