import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { SUPABASE_TIMEOUT_MS, fetchWithTimeout } from "@/lib/supabase/fetch";

/**
 * Supabaseセッションの更新(Next.js 16ではmiddlewareがproxyに改称)。
 * Server Componentからはcookieを書けないため、ここでトークンを更新する。
 * Supabase未設定時は何もしない。
 */
export async function proxy(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return NextResponse.next();

  let response = NextResponse.next({ request });

  const supabase = createServerClient(url, key, {
    // 全ページのリクエストで走るため短く打ち切る(Supabase停止中にサイト全体が固まらないように)
    global: { fetch: fetchWithTimeout(SUPABASE_TIMEOUT_MS.proxy) },
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (list) => {
        for (const { name, value } of list) request.cookies.set(name, value);
        response = NextResponse.next({ request });
        for (const { name, value, options } of list) response.cookies.set(name, value, options);
      },
    },
  });

  // getUser() を呼ぶことでセッションが更新される。
  // 認証基盤に届かなくてもページ表示は止めない(認証が要る処理は各ルートで判定する)
  try {
    await supabase.auth.getUser();
  } catch {
    // 時間切れ等。セッション更新だけを諦めて先へ進む
  }

  return response;
}

export const config = {
  matcher: [
    // 静的アセットと画像最適化を除く全ルート
    "/((?!_next/static|_next/image|favicon.ico|images|videos|.*\\.(?:svg|png|jpg|jpeg|gif|webp|mp4)$).*)",
  ],
};
