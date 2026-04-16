"use client";

import { useAppStore } from "@/lib/store";

// compact daily-goal strip shown on /learn. hidden when no summary is loaded yet.
export function DailyGoalStrip() {
  const goal = useAppStore((s) => s.summary?.daily_goal ?? null);
  if (!goal) return null;

  const target = Math.max(goal.target, 1);
  const progress = Math.min(goal.progress, target);
  const pct = Math.round((progress / target) * 100);
  const met = progress >= target;

  return (
    <div className="flex items-center gap-4 rounded-3xl border border-ink/5 bg-white p-4 shadow-soft">
      <div className="flex items-center gap-2 text-sm">
        <span className="pill w-fit">daily goal</span>
        <span className="font-medium">
          {progress} / {target} signs today
        </span>
      </div>
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface-muted">
        <div
          className={`h-full rounded-full transition-[width] duration-500 ${
            met ? "bg-accent-mint" : "bg-brand-500"
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs text-ink-faint">{met ? "goal met ✓" : `${target - progress} to go`}</span>
    </div>
  );
}
