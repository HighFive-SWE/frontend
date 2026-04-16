"use client";

import type { Band, CompareResult } from "./comparator";

type Props = {
  result: CompareResult | null;
  tracking: boolean;
};

const bandStyle: Record<Band, string> = {
  correct: "bg-accent-mint/90 text-ink",
  partial: "bg-accent-peach/90 text-ink",
  incorrect: "bg-[#ff8fa3]/90 text-ink",
};

const bandLabel: Record<Band, string> = {
  correct: "nice",
  partial: "almost",
  incorrect: "try again",
};

export function AccuracyBadge({ result, tracking }: Props) {
  if (!tracking) {
    return (
      <Pill className="bg-black/40 text-white">
        <Dot className="bg-white/60" />
        warming up…
      </Pill>
    );
  }
  if (!result) {
    return (
      <Pill className="bg-black/40 text-white">
        <Dot className="bg-white/60" />
        show your hand
      </Pill>
    );
  }

  const pct = Math.round(result.accuracy * 100);
  return (
    <Pill className={bandStyle[result.band]}>
      <Dot className="bg-ink/70" />
      {bandLabel[result.band]} · {pct}%
    </Pill>
  );
}

function Pill({ className, children }: { className: string; children: React.ReactNode }) {
  return (
    <div
      className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium shadow-soft backdrop-blur ${className}`}
    >
      {children}
    </div>
  );
}

function Dot({ className }: { className: string }) {
  return <span className={`h-2 w-2 rounded-full ${className}`} />;
}
