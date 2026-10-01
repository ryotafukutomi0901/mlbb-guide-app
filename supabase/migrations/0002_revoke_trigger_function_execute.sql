-- handle_new_user() は auth.users のトリガー専用。
-- REST API(/rest/v1/rpc/)から誰でも直接呼べる状態は不要な攻撃面なので実行権限を剥奪する。
-- (2026-09-02 に Supabase MCP で本番DBへ適用済み。security advisor の警告2件を解消)
revoke execute on function public.handle_new_user() from public;
revoke execute on function public.handle_new_user() from anon;
revoke execute on function public.handle_new_user() from authenticated;
