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
      <section className="relative overflow-hidden rounded-3xl border border-ink/5 bg-white p-10 text-center shadow-soft">
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-accent-mint/40" />
        <div className="absolute -bottom-10 -left-10 h-36 w-36 rounded-full bg-accent-lilac/40" />
        <div className="relative flex flex-col items-center gap-4">
          <div className="grid h-20 w-20 place-items-center rounded-full bg-accent-mint text-3xl shadow-soft">
            ✓
          </div>
          <span className="pill">scenario complete</span>
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

      <section className="rounded-3xl border border-ink/5 bg-white p-6 shadow-soft">
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
