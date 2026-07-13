import Link from "next/link";
import { Compass, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-6 text-center">
      <p className="font-display text-[10px] font-bold uppercase tracking-[0.4em] text-primary">
        Error 404
      </p>
      <h1 className="mt-4 font-display text-7xl font-black text-gradient-primary md:text-9xl">404</h1>
      <p className="mt-4 text-lg font-bold">エリア外に出ています</p>
      <p className="mt-2 max-w-md text-sm text-text-muted">
        このページはマップに存在しないか、別の場所へ移動しました。リコールしてホームへ戻りましょう。
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className="gradient-primary inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-white shadow-[0_0_18px_rgba(139,92,246,0.4)] transition-shadow hover:shadow-[0_0_28px_rgba(139,92,246,0.6)]"
        >
          <Home size={16} />
          ホームへリコール
        </Link>
        <Link
          href="/search"
          className="glass-bright inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold transition-colors hover:border-primary/60"
        >
          <Compass size={16} />
          検索する
        </Link>
      </div>
    </div>
  );
}
