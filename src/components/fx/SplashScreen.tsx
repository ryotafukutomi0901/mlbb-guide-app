"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

const SESSION_KEY = "mlbb:splash-seen";

export function SplashScreen() {
  const [visible, setVisible] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (sessionStorage.getItem(SESSION_KEY)) return;
    sessionStorage.setItem(SESSION_KEY, "1");
    const id = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    if (!visible) return;
    const root = rootRef.current;
    if (!root) return;

    document.body.style.overflow = "hidden";
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        onComplete: () => {
          document.body.style.overflow = "";
          setVisible(false);
        },
      });
      tl.fromTo(
        ".splash-ring",
        { scale: 0.4, opacity: 0, rotate: -90 },
        { scale: 1, opacity: 1, rotate: 0, duration: 0.9, ease: "power3.out" }
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
          { scaleX: 1, duration: 0.8, ease: "power2.inOut" },
          "-=0.3"
        )
        .to(root, { opacity: 0, duration: 0.6, ease: "power2.inOut", delay: 0.25 });
    }, root);

    return () => {
      ctx.revert();
      document.body.style.overflow = "";
    };
  }, [visible]);

  if (!visible) return null;

  return (
    <div
      ref={rootRef}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-bg-deep"
    >
      <div className="splash-ring relative mb-8 flex h-28 w-28 items-center justify-center">
        <div className="absolute inset-0 rounded-full border border-primary/40" />
        <div className="animate-spin-slow absolute inset-2 rounded-full border border-dashed border-neon/50" />
        <div className="absolute inset-0 rounded-full glow-primary" />
        <span className="font-display text-4xl font-black text-gradient-gold">ML</span>
      </div>
      <div className="flex gap-1 font-display text-3xl font-black tracking-widest md:text-5xl">
        {"MLBB LAB".split("").map((ch, i) => (
          <span key={i} className="splash-letter text-gradient-primary">
            {ch === " " ? " " : ch}
          </span>
        ))}
      </div>
      <p className="splash-sub mt-4 text-[10px] font-semibold uppercase text-text-muted md:text-xs">
        Companion Platform
      </p>
      <div className="splash-bar mt-10 h-0.5 w-48 overflow-hidden rounded-full bg-surface-2">
        <span className="block h-full w-full origin-left gradient-primary" />
      </div>
    </div>
  );
}
