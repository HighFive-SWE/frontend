"use client";

import type { TrendPoint } from "@/services/api";

type Props = {
  trend: TrendPoint[];
};

// inline-SVG sparkline so we stay dependency-free. the chart scales to its
// container; x steps are evenly spaced, y maps 0..1 accuracy to height.
export function TrendChart({ trend }: Props) {
  if (trend.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-ink/10 bg-white p-6 text-center text-sm text-ink-faint">
        no sessions logged yet — accuracy trend appears once the learner starts practising.
      </div>
    );
  }

  const width = 520;
  const height = 160;
  const padX = 20;
  const padY = 14;
  const innerW = width - padX * 2;
  const innerH = height - padY * 2;

  const n = trend.length;
  const x = (i: number) =>
    padX + (n === 1 ? innerW / 2 : (i / (n - 1)) * innerW);
  const y = (acc: number) => padY + (1 - Math.max(0, Math.min(1, acc))) * innerH;

  const points = trend.map((p, i) => `${x(i)},${y(p.accuracy)}`).join(" ");
  const area =
    `M ${x(0)},${padY + innerH} ` +
    trend.map((p, i) => `L ${x(i)},${y(p.accuracy)}`).join(" ") +
    ` L ${x(n - 1)},${padY + innerH} Z`;

  // success threshold rule at 0.60 — visual cue for the educator.
  const floorY = y(0.6);

  return (
    <div className="rounded-3xl border border-ink/5 bg-white p-6 shadow-soft">
      <div className="flex items-baseline justify-between">
        <div>
          <p className="text-xs uppercase tracking-widest text-ink-faint">accuracy trend</p>
          <p className="font-display text-lg">last {n} sessions</p>
        </div>
        <span className="text-xs text-ink-faint">dashed line · 0.60 success floor</span>
      </div>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="mt-4 h-40 w-full"
        role="img"
        aria-label="accuracy over time"
      >
        <defs>
          <linearGradient id="trendArea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#4b6eff" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#4b6eff" stopOpacity="0" />
          </linearGradient>
        </defs>

        <line
          x1={padX}
          x2={width - padX}
          y1={floorY}
          y2={floorY}
          stroke="#1a1d26"
          strokeOpacity={0.2}
          strokeDasharray="4 4"
        />

        <path d={area} fill="url(#trendArea)" />
        <polyline
          points={points}
          fill="none"
          stroke="#3857e6"
          strokeWidth={2.5}
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {trend.map((p, i) => (
          <circle
            key={i}
            cx={x(i)}
            cy={y(p.accuracy)}
            r={4}
            fill={p.succeeded ? "#2f8f70" : "#8a8fa1"}
            stroke="white"
            strokeWidth={1.5}
          >
            <title>{`${p.gesture_id} · ${Math.round(p.accuracy * 100)}%`}</title>
          </circle>
        ))}
      </svg>
    </div>
  );
}
