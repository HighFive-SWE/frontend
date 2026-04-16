"use client";

import { useAppStore } from "@/lib/store";

// small shelf rendered under the completion screen — shows all unlocked badges
// plus the locked catalog so the user can see what's next.
const LOCKED_CATALOG = [
  { code: "first_step", title: "first step", description: "completed your first sign." },
  { code: "first_routine", title: "first scenario", description: "finished a whole routine end-to-end." },
  { code: "three_day_streak", title: "three-day streak", description: "showed up three days in a row." },
  { code: "ten_perfect_steps", title: "ten clean signs", description: "ten steps at 95%+ accuracy." },
];

export function AchievementShelf() {
  const unlocked = useAppStore((s) => s.summary?.achievements ?? []);
  const unlockedCodes = new Set(unlocked.map((a) => a.code));

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-baseline justify-between">
        <h3 className="font-display text-lg font-semibold">badges</h3>
        <span className="text-xs text-ink-faint">
          {unlocked.length} / {LOCKED_CATALOG.length} unlocked
        </span>
      </div>
      <ul className="grid gap-3 sm:grid-cols-2">
        {LOCKED_CATALOG.map((entry) => {
          const isUnlocked = unlockedCodes.has(entry.code);
          return (
            <li
              key={entry.code}
              className={`rounded-2xl border p-4 transition ${
                isUnlocked
                  ? "border-accent-mint/70 bg-accent-mint/25"
                  : "border-ink/5 bg-surface-muted/60"
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">{isUnlocked ? "★" : "☆"}</span>
                <p className="font-medium">{entry.title}</p>
              </div>
              <p className={`mt-1 text-sm ${isUnlocked ? "text-ink-soft" : "text-ink-faint"}`}>
                {entry.description}
              </p>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
