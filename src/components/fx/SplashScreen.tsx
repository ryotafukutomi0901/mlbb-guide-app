"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { randomSplashVideo } from "@/lib/assets";

const SESSION_KEY = "mlbb:splash-seen";
/** GSAPが止まっても必ず閉じるための上限。演出は約5秒で終わる */
const FAILSAFE_MS = 6000;

export function SplashScreen() {
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => {
    document.body.style.overflow = "";
    setVideoSrc(null);
  }, []);

  useEffect(() => {
    if (sessionStorage.getItem(SESSION_KEY)) return;
    sessionStorage.setItem(SESSION_KEY, "1");
    // バックグラウンドタブではrAF/GSAPが進まないため、そもそも演出しない
    if (document.hidden) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = requestAnimationFrame(() => setVideoSrc(randomSplashVideo()));
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    if (!videoSrc) return;
    const root = rootRef.current;
    if (!root) return;

    document.body.style.overflow = "hidden";

    // GSAPの完了に依存しない安全弁
    const failsafe = window.setTimeout(close, FAILSAFE_MS);
    const onVisibility = () => {
      if (document.hidden) close();
    };
    document.addEventListener("visibilitychange", onVisibility);

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ onComplete: close });
      tl.fromTo(
        ".splash-video",
        { scale: 1.12, opacity: 0 },
        { scale: 1, opacity: 1, duration: 1.4, ease: "power2.out" }
      )
        .fromTo(
          ".splash-ring",
          { scale: 0.4, opacity: 0, rotate: -90 },
          { scale: 1, opacity: 1, rotate: 0, duration: 0.9, ease: "power3.out" },
          "-=0.9"
        )
        .fromTo(
          ".splash-letter",
          { y: 40, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.55, stagger: 0.05, ease: "back.out(1.7)" },
          "-=0.4"
        )
        .fromTo(
          ".splash-sub",
          { opacity: 0, letterSpacing: "0.8em" },
          { opacity: 1, letterSpacing: "0.35em", duration: 0.7, ease: "power2.out" },
          "-=0.2"
        )
        .fromTo(
          ".splash-bar span",
          { scaleX: 0 },
          { scaleX: 1, duration: 1.0, ease: "power2.inOut" },
          "-=0.3"
        )
        .to(root, { opacity: 0, duration: 0.7, ease: "power2.inOut", delay: 0.35 });
    }, root);

    return () => {
      window.clearTimeout(failsafe);
      document.removeEventListener("visibilitychange", onVisibility);
      ctx.revert();
      document.body.style.overflow = "";
    };
  }, [videoSrc, close]);

  if (!videoSrc) return null;

  return (
    <div
      ref={rootRef}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden bg-bg-deep"
    >
      <video
        className="splash-video absolute inset-0 h-full w-full object-cover"
        src={videoSrc}
        autoPlay
        muted
        loop
        playsInline
      />
      <div className="absolute inset-0 bg-gradient-to-t from-bg-deep via-bg-deep/55 to-bg-deep/40" />
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 30%, rgba(3,4,9,0.78) 100%)",
        }}
      />

      <div className="relative flex flex-col items-center">
        <div className="splash-ring relative mb-8 flex h-28 w-28 items-center justify-center">
          <div className="absolute inset-0 rounded-full border border-primary/50 bg-bg-deep/40 backdrop-blur-sm" />
          <div className="animate-spin-slow absolute inset-2 rounded-full border border-dashed border-neon/50" />
          <div className="absolute inset-0 rounded-full glow-primary" />
          <span className="relative font-display text-4xl font-black text-gradient-gold">ML</span>
        </div>
        <div className="flex gap-1 font-display text-3xl font-black tracking-widest md:text-5xl">
          {"MLBB LAB".split("").map((ch, i) => (
            <span
              key={i}
              className="splash-letter text-gradient-primary"
              style={{ textShadow: "0 2px 24px rgba(3,4,9,0.9)" }}
            >
              {ch === " " ? " " : ch}
            </span>
          ))}
        </div>
        <p className="splash-sub mt-4 text-[10px] font-semibold uppercase text-text-muted md:text-xs">
          Companion Platform
        </p>
        <div className="splash-bar mt-10 h-0.5 w-48 overflow-hidden rounded-full bg-surface-2/80">
          <span className="block h-full w-full origin-left gradient-primary" />
        </div>
      </div>

      <button
        type="button"
        onClick={close}
        className="absolute inset-0 h-full w-full cursor-pointer bg-transparent"
        aria-label="オープニングをスキップ"
      />
      <span className="pointer-events-none absolute bottom-8 font-display text-[10px] uppercase tracking-[0.3em] text-text-faint">
        Tap to skip
      </span>
    </div>
  );
}
