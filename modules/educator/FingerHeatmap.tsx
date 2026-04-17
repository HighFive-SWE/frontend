"use client";

import type { FingerHeat } from "@/services/api";

type Props = {
  heat: FingerHeat[];
};

// stacked mini-bars per finger — width encodes the share of total misses.
// intentionally low-chrome: a colored list, not a chart library.
export function FingerHeatmap({ heat }: Props) {
  const totalMisses = heat.reduce((sum, h) => sum + h.misses, 0);
  const hottest = heat.reduce((best, h) => (h.share > best.share ? h : best), heat[0] ?? null);

  return (
    <div className="rounded-3xl border border-ink/5 bg-white p-6 shadow-soft">
      <div className="flex items-baseline justify-between">
        <div>
          <p className="text-xs uppercase tracking-widest text-ink-faint">finger heatmap</p>
          <p className="font-display text-lg">joints that most often drift</p>
        </div>
        <span className="text-xs text-ink-faint">
          {totalMisses === 0 ? "no misses logged" : `${totalMisses} misses tracked`}
        </span>
      </div>

      <ul className="mt-4 flex flex-col gap-3">
        {heat.map((h) => {
          const share = Math.max(0, Math.min(1, h.share));
          const isHot = totalMisses > 0 && hottest && hottest.finger === h.finger;
          return (
            <li key={h.finger} className="flex items-center gap-3">
              <span className="w-16 text-sm capitalize text-ink-soft">{h.finger}</span>
              <div className="relative h-3 flex-1 overflow-hidden rounded-full bg-surface-muted">
                <div
                  className={`h-full rounded-full transition-all ${
                    isHot ? "bg-accent-peach" : "bg-brand-400/80"
                  }`}
                  style={{ width: `${Math.max(share * 100, h.misses > 0 ? 4 : 0)}%` }}
                />
              </div>
              <span className="w-20 text-right text-xs tabular-nums text-ink-faint">
                {h.misses === 0
                  ? "—"
                  : `${h.misses} · ${Math.round(share * 100)}%`}
              </span>
            </li>
          );
        })}
      </ul>

      <p className="mt-4 text-xs text-ink-faint">
        {totalMisses === 0
          ? "once attempts accumulate, drift hot-spots will surface here."
          : `highlight: the ${hottest?.finger} tends to drift most — worth practising.`}
      </p>
    </div>
  );
}
