"use client";

import { createBrowserClient } from "@supabase/ssr";
import { SUPABASE_ANON_KEY, SUPABASE_URL, isSupabaseConfigured } from "./env";
import { SUPABASE_TIMEOUT_MS, fetchWithTimeout } from "./fetch";

/** ブラウザ用クライアント。未設定環境では null */
export function createSupabaseBrowserClient() {
  if (!isSupabaseConfigured()) return null;
  return createBrowserClient(SUPABASE_URL!, SUPABASE_ANON_KEY!, {
    global: { fetch: fetchWithTimeout(SUPABASE_TIMEOUT_MS.browser) },
  });
}
