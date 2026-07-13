"use client";

import { useState } from "react";
import { Skull } from "lucide-react";
import { cn } from "@/lib/utils";

type Layer = "movement" | "deaths" | "vision";

const LAYER_LABEL: Record<Layer, string> = {
  movement: "移動",
  deaths: "デス",
  vision: "視界",
};

function cellColor(layer: Layer, value: number): string {
  if (value <= 0.05) return "transparent";
  if (layer === "vision") return `rgba(56, 214, 255, ${value * 0.75})`;
  if (value < 0.35) return `rgba(79, 124, 255, ${value * 1.4})`;
  if (value < 0.65) return `rgba(240, 180, 41, ${value})`;
  return `rgba(244, 63, 94, ${value})`;
}

export function Heatmap({
  movement,
  deaths,
  vision,
}: {
  movement: number[][];
  deaths: [number, number][];
  vision: number[][];
}) {
  const [layer, setLayer] = useState<Layer>("movement");
  const grid = layer === "vision" ? vision : movement;
  const size = grid.length;

  return (
    <div>
      <div className="mb-3 flex gap-1.5">
        {(Object.keys(LAYER_LABEL) as Layer[]).map((l) => (
          <button
            key={l}
            onClick={() => setLayer(l)}
            className={cn(
              "cursor-pointer rounded-lg border px-3 py-1.5 text-[11px] font-bold transition-all",
              layer === l
                ? "border-primary/60 bg-primary/15 text-white"
                : "border-border bg-surface/60 text-text-muted hover:text-text"
            )}
          >
            {LAYER_LABEL[l]}
          </button>
        ))}
      </div>

      <div className="relative mx-auto aspect-square w-full max-w-sm overflow-hidden rounded-2xl border border-border bg-bg-deep">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "linear-gradient(rgba(139,92,246,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.5) 1px, transparent 1px)",
            backgroundSize: `${100 / size}% ${100 / size}%`,
          }}
        />
        <div className="absolute inset-0 rotate-45 scale-75 rounded-3xl border border-border/60" />
        <div className="absolute inset-x-0 top-1/2 h-[14%] -translate-y-1/2 -rotate-45 bg-primary-2/10" />

        {layer !== "deaths" && (
          <div
            className="absolute inset-0 grid"
            style={{ gridTemplateColumns: `repeat(${size}, 1fr)` }}
          >
            {grid.flatMap((row, y) =>
              row.map((value, x) => (
                <div
                  key={`${x}-${y}`}
                  style={{ backgroundColor: cellColor(layer, value), filter: "blur(3px)" }}
                />
              ))
            )}
          </div>
        )}

        {layer === "deaths" &&
          deaths.map(([x, y], i) => (
            <span
              key={i}
              className="absolute flex h-6 w-6 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-danger/60 bg-danger/25 text-danger shadow-[0_0_12px_rgba(244,63,94,0.5)]"
              style={{ left: `${((x + 0.5) / size) * 100}%`, top: `${((y + 0.5) / size) * 100}%` }}
            >
              <Skull size={12} />
            </span>
          ))}

        <span className="absolute bottom-2 left-2 font-display text-[9px] uppercase tracking-widest text-text-faint">
          味方陣地
        </span>
        <span className="absolute right-2 top-2 font-display text-[9px] uppercase tracking-widest text-text-faint">
          敵陣地
        </span>
      </div>
    </div>
  );
}
