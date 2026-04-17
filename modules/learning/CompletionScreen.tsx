"use client";

import { Button } from "@/components/Button";
import { AchievementShelf } from "@/modules/gamification/AchievementShelf";
import type { Routine } from "@/services/api";

type Props = {
  routine: Routine;
  attempts: number;
  avgAccuracy: number;
  onPlayAgain: () => void;
  onExit: () => void;
};

export function CompletionScreen({ routine, attempts, avgAccuracy, onPlayAgain, onExit }: Props) {
  const pct = Math.round(avgAccuracy * 100);
  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-2xl border border-ink/5 bg-white p-10 text-center shadow-soft">
        <div className="flex flex-col items-center gap-4">
          <div className="grid h-14 w-14 place-items-center rounded-xl bg-accent-mint/80 font-display text-xl font-bold text-white">
            ✓
          </div>
          <span className="font-mono text-xs tracking-wide text-ink-faint">scenario complete</span>
          <h2 className="font-display text-3xl font-semibold md:text-4xl">{routine.name}</h2>
          <p className="max-w-md text-ink-soft">
            you signed all {routine.steps.length} step{routine.steps.length === 1 ? "" : "s"}. nice
            work — your hand is getting the rhythm.
          </p>
          <dl className="mt-2 flex gap-6 text-left">
            <Stat label="avg accuracy" value={`${pct}%`} />
            <Stat label="attempts" value={`${attempts}`} />
          </dl>
          <div className="mt-4 flex flex-wrap justify-center gap-3">
            <Button onClick={onPlayAgain} size="lg">
              play again
            </Button>
            <Button onClick={onExit} variant="ghost" size="lg">
              pick another routine
            </Button>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-ink/5 bg-white p-6 shadow-soft">
        <AchievementShelf />
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-widest text-ink-faint">{label}</dt>
      <dd className="font-display text-2xl font-semibold">{value}</dd>
    </div>
  );
}
