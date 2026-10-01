"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import gsap from "gsap";
import { ChevronRight, Crown, Swords } from "lucide-react";
import { Badge, TierBadge } from "@/components/ui/Badge";
import { CountUp } from "@/components/ui/CountUp";
import type { HeroMeta, HeroSummary } from "@/data/types";
import { ROLE_LABEL } from "@/data/types";
import { heroImage } from "@/lib/assets";

export function HomeHero({
  hero,
  meta,
  banner,
  patchVersion,
}: {
  hero: HeroSummary;
  meta: HeroMeta;
  banner: string;
  patchVersion: string;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const parallaxRef = useRef<HTMLDivElement>(null);
  const portrait = heroImage(hero.slug);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".hero-reveal",
        { y: 34, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.9, stagger: 0.1, ease: "power3.out", delay: 0.15 }
      );
      gsap.fromTo(
        ".hero-portrait",
        { x: 60, opacity: 0, scale: 1.06 },
        { x: 0, opacity: 1, scale: 1, duration: 1.1, ease: "power3.out", delay: 0.3 }
      );
    }, root);

    const onMove = (e: MouseEvent) => {
      const el = parallaxRef.current;
      if (!el) return;
      const rect = root.getBoundingClientRect();
      const dx = (e.clientX - rect.left) / rect.width - 0.5;
      const dy = (e.clientY - rect.top) / rect.height - 0.5;
      gsap.to(el, { x: dx * -18, y: dy * -10, duration: 0.8, ease: "power2.out" });
    };
    root.addEventListener("mousemove", onMove);
    return () => {
      ctx.revert();
      root.removeEventListener("mousemove", onMove);
    };
  }, []);

  return (
    <div
      ref={rootRef}
      className="relative overflow-hidden rounded-3xl border border-border"
    >
      <div ref={parallaxRef} className="absolute -inset-6">
        <Image src={banner} alt="" fill priority sizes="100vw" className="object-cover opacity-35" />
        <div className="absolute inset-0 bg-gradient-to-r from-bg-deep via-bg-deep/75 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-bg-deep via-transparent to-bg-deep/40" />
      </div>

      <div className="relative grid gap-6 p-6 md:grid-cols-2 md:p-10 lg:p-12">
        <div className="flex flex-col items-start justify-center">
          <span className="hero-reveal">
            <Badge variant="gold">
              <Crown size={11} />
              今週のフィーチャーヒーロー
            </Badge>
          </span>
          <p className="hero-reveal mt-4 font-display text-xs font-bold uppercase tracking-[0.35em] text-primary">
            {hero.nameEn}
          </p>
          <h1 className="hero-reveal mt-1 text-4xl font-black leading-tight md:text-5xl lg:text-6xl">
            {hero.name}
          </h1>
          <div className="hero-reveal mt-3 flex flex-wrap items-center gap-2">
            <TierBadge tier={hero.tier} />
            {hero.roles.map((role) => (
              <Badge key={role} variant="primary">
                {ROLE_LABEL[role]}
              </Badge>
            ))}
            <span className="text-xs text-text-muted">Patch {patchVersion}</span>
          </div>

          <div className="hero-reveal mt-5 flex gap-5">
            {[
              { label: "勝率", value: meta.winRate, tone: "text-success" },
              { label: "ピック率", value: meta.pickRate, tone: "text-neon" },
              { label: "バン率", value: meta.banRate, tone: "text-danger" },
            ].map((stat) => (
              <div key={stat.label}>
                <p className={`font-display text-2xl font-black ${stat.tone}`}>
                  <CountUp value={stat.value} decimals={1} suffix="%" />
                </p>
                <p className="text-[10px] text-text-muted">{stat.label}</p>
              </div>
            ))}
          </div>

          <div className="hero-reveal mt-7 flex flex-wrap gap-3">
            <Link
              href={`/heroes/${hero.slug}`}
              className="gradient-primary group inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-bold text-white shadow-[0_0_20px_rgba(139,92,246,0.45)] transition-all hover:shadow-[0_0_32px_rgba(139,92,246,0.65)]"
            >
              ヒーロー詳細
              <ChevronRight size={16} className="transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href={`/simulator?hero=${hero.slug}`}
              className="glass-bright inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-bold transition-colors hover:border-primary/60"
            >
              <Swords size={16} className="text-primary" />
              ビルドを組む
            </Link>
          </div>
        </div>

        <div className="hero-portrait relative hidden min-h-[320px] md:block">
          {portrait && (
            <div className="absolute inset-y-0 right-4 my-auto aspect-[4/5] max-h-full">
              <div className="animate-float relative h-full w-full">
                <div className="absolute -inset-4 rounded-full bg-primary/25 blur-3xl" />
                <Image
                  src={portrait}
                  alt={hero.name}
                  fill
                  sizes="(max-width: 1024px) 40vw, 420px"
                  className="relative rounded-2xl border border-primary/30 object-cover object-top shadow-[0_0_48px_rgba(139,92,246,0.35)]"
                />
                <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl">
                  <div className="absolute inset-x-0 h-16 bg-gradient-to-b from-transparent via-neon/15 to-transparent" style={{ animation: "scan 4s linear infinite" }} />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
