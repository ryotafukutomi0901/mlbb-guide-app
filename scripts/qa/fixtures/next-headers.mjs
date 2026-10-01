// テスト用の next/headers の差し替え(scripts/qa/coach-resilience.mjs が使う)。
// リクエストの外でルートハンドラを呼べるよう、globalThis.__TEST_COOKIES__ の内容を返す。
export async function cookies() {
  const jar = globalThis.__TEST_COOKIES__ ?? [];
  return {
    getAll: () => jar.map(({ name, value }) => ({ name, value })),
    get: (name) => jar.find((c) => c.name === name),
    set: () => {},
  };
}

export async function headers() {
  return new Headers();
}
