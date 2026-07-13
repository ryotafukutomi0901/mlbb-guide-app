export interface RadarSeries {
  name: string;
  color: string;
  values: number[]; // 0-100 に正規化済みの値(axesと同じ順序)
}

export function RadarChart({
  axes,
  series,
  size = 240,
}: {
  axes: string[];
  series: RadarSeries[];
  size?: number;
}) {
  const center = size / 2;
  const radius = size * 0.34;
  const ringCount = 4;
  const angleFor = (i: number) => (Math.PI * 2 * i) / axes.length - Math.PI / 2;

  const pointFor = (i: number, pct: number) => {
    const angle = angleFor(i);
    const r = radius * (pct / 100);
    return [center + r * Math.cos(angle), center + r * Math.sin(angle)] as const;
  };

  const gridRings = Array.from({ length: ringCount }, (_, ringIdx) => {
    const pct = ((ringIdx + 1) / ringCount) * 100;
    return axes.map((_, i) => pointFor(i, pct));
  });

  return (
    <div className="flex flex-col items-center gap-3">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* グリッド(recessive, hairline) */}
        {gridRings.map((ring, idx) => (
          <polygon
            key={idx}
            points={ring.map(([x, y]) => `${x},${y}`).join(" ")}
            fill="none"
            stroke="var(--color-border)"
            strokeWidth={1}
          />
        ))}
        {/* 軸線 */}
        {axes.map((_, i) => {
          const [x, y] = pointFor(i, 100);
          return (
            <line
              key={i}
              x1={center}
              y1={center}
              x2={x}
              y2={y}
              stroke="var(--color-border)"
              strokeWidth={1}
            />
          );
        })}
        {/* 各シリーズ(塗り+線+頂点) */}
        {series.map((s) => {
          const pts = s.values.map((v, i) => pointFor(i, Math.min(v, 100)));
          return (
            <g key={s.name}>
              <polygon
                points={pts.map(([x, y]) => `${x},${y}`).join(" ")}
                fill={s.color}
                fillOpacity={0.15}
                stroke={s.color}
                strokeWidth={2}
                strokeLinejoin="round"
              />
              {pts.map(([x, y], i) => (
                <circle key={i} cx={x} cy={y} r={4} fill={s.color} stroke="var(--color-surface)" strokeWidth={2} />
              ))}
            </g>
          );
        })}
        {/* 軸ラベル */}
        {axes.map((label, i) => {
          const [x, y] = pointFor(i, 118);
          return (
            <text
              key={label}
              x={x}
              y={y}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={11}
              fill="var(--color-text-muted)"
            >
              {label}
            </text>
          );
        })}
      </svg>

      {series.length > 1 && (
        <div className="flex flex-wrap items-center justify-center gap-3">
          {series.map((s) => (
            <div key={s.name} className="flex items-center gap-1.5 text-xs text-text-muted">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: s.color }} />
              {s.name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
