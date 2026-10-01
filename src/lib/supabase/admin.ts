import { createClient } from "@supabase/supabase-js";
import { SUPABASE_URL } from "./env";
import { SUPABASE_TIMEOUT_MS, fetchWithTimeout } from "./fetch";

const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

export function isSupabaseAdminConfigured(): boolean {
  return Boolean(SUPABASE_URL && SERVICE_ROLE_KEY);
}

/**
 * service roleクライアント。RLSを迂回するのでサーバー側だけで使う。
 * 用途は「本人が書けてはいけないデータ」の書き込みに限る(利用量・課金状態)。
 * クライアントに渡さないこと。
 */
export function createSupabaseAdminClient() {
  if (!isSupabaseAdminConfigured()) return null;
  return createClient(SUPABASE_URL!, SERVICE_ROLE_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { fetch: fetchWithTimeout(SUPABASE_TIMEOUT_MS.server) },
  });
}
