export function AuroraBackground() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-bg">
      <div
        className="animate-aurora absolute -top-1/4 left-1/2 h-[80vmax] w-[80vmax] -translate-x-1/2 rounded-full opacity-40 blur-3xl"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(139,92,246,0.35), rgba(79,124,255,0.15) 45%, transparent 70%)",
        }}
      />
      <div
        className="animate-aurora absolute -bottom-1/3 -left-1/4 h-[70vmax] w-[70vmax] rounded-full opacity-30 blur-3xl"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(56,214,255,0.25), rgba(139,92,246,0.1) 50%, transparent 70%)",
          animationDelay: "-13s",
          animationDuration: "34s",
        }}
      />
      <div
        className="absolute -right-1/4 top-1/3 h-[50vmax] w-[50vmax] rounded-full opacity-20 blur-3xl"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(240,180,41,0.18), transparent 65%)",
        }}
      />
      <div
        className="absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(139,92,246,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.6) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          maskImage: "radial-gradient(ellipse at center, black 20%, transparent 75%)",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 0%, transparent 55%, rgba(3,4,9,0.9) 100%)",
        }}
      />
    </div>
  );
}
