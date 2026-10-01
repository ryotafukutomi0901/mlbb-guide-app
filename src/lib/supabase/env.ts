/**
 * Supabaseの設定有無を1箇所で判定する。
 * 未設定でもアプリが動く(サンプル閲覧モード)ようにするため、
 * ここでthrowせず isSupabaseConfigured() で分岐させる。
 */
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export function isSupabaseConfigured(): boolean {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
}
