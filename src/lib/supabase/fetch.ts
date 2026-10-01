/**
 * Supabase への通信に上限時間を付ける。
 *
 * 無料プランの自動停止や障害で Supabase が応答しないと、既定の fetch は待ち続けるため、
 * ページやAPIが固まる。決めた時間で打ち切り、呼び出し側で「使えない」として扱わせる。
 * AbortSignal.any は Safari 17.4 未満に無いため、手で組み合わせる。
 */
export function fetchWithTimeout(ms: number): typeof fetch {
  return (input, init) => {
    const controller = new AbortController();
    const timer = setTimeout(
      () => controller.abort(new DOMException(`Supabase did not respond within ${ms}ms`, "TimeoutError")),
      ms
    );
    const outer = init?.signal;
    if (outer) {
      if (outer.aborted) controller.abort(outer.reason);
      else outer.addEventListener("abort", () => controller.abort(outer.reason), { once: true });
    }
    return fetch(input, { ...init, signal: controller.signal }).finally(() => clearTimeout(timer));
  };
}

/**
 * 用途別の待ち時間。proxy は全ページのリクエストで走るので短くする。
 * 平常時の応答は数百ミリ秒なので、いずれも十分な余裕がある。
 */
export const SUPABASE_TIMEOUT_MS = {
  proxy: 1500,
  server: 3000,
  browser: 5000,
} as const;
