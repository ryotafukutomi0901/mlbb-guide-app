export default function Loading() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6">
      <div className="relative flex h-20 w-20 items-center justify-center">
        <div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-primary" />
        <div
          className="animate-spin-slow absolute inset-2 rounded-full border border-dashed border-neon/50"
          style={{ animationDirection: "reverse" }}
        />
        <span className="font-display text-lg font-black text-gradient-primary">ML</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <p className="font-display text-[10px] font-bold uppercase tracking-[0.4em] text-text-muted">
          Loading
        </p>
        <div className="h-0.5 w-40 overflow-hidden rounded-full bg-surface-2">
          <div className="shimmer h-full w-full" />
        </div>
      </div>
    </div>
  );
}
