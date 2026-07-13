import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-12 border-t border-border py-8 pb-24 text-center text-xs text-text-muted lg:pb-8">
      <div className="flex items-center justify-center gap-4">
        <Link href="/privacy" className="transition-colors hover:text-text">
          プライバシーポリシー
        </Link>
        <span className="text-text-faint">|</span>
        <Link href="/settings" className="transition-colors hover:text-text">
          設定
        </Link>
      </div>
      <p className="mt-2 text-text-faint">
        © {new Date().getFullYear()} MLBB LAB — 非公式ファンサイト。Mobile Legends: Bang BangはMoonton社の登録商標です。
      </p>
    </footer>
  );
}
