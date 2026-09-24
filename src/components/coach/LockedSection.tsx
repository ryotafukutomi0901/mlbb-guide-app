import Link from "next/link";
import { ArrowRight, Lock } from "lucide-react";

/**
 * Proでロックされている領域。
 * 「Proで何ができるか」ではなく「Proで何が上手くなるか」を見せる
 * (docs/redesign/05_PHASE3_SAAS.md S4)。
 */
export function LockedSection({
  title,
  items,
}: {
  title: string;
  items: { label: string; benefit: string }[];
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-gold/30 bg-gradient-to-b from-gold/[0.07] to-transparent p-5">
      <div className="flex items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-gold/40 bg-gold/10 text-gold">
          <Lock size={14} />
        </span>
        <h3 className="text-sm font-bold">{title}</h3>
      </div>

      <ul className="mt-4 flex flex-col gap-3">
        {items.map((item) => (
          <li key={item.label} className="flex gap-3">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold/70" />
            <div>
              <p className="text-sm font-semibold">{item.label}</p>
              <p className="mt-0.5 text-xs leading-relaxed text-text-muted">{item.benefit}</p>
            </div>
          </li>
        ))}
      </ul>

      <Link
        href="/pricing"
        className="mt-5 inline-flex items-center gap-1.5 rounded-xl border border-gold/50 bg-gold/15 px-5 py-2.5 text-sm font-bold text-gold transition-colors hover:bg-gold/25"
      >
        Proの内容を見る
        <ArrowRight size={15} />
      </Link>
    </div>
  );
}
