"use client";

import type { RoutineStep } from "@/services/api";

type Props = {
  name: string;
  description: string;
  steps: RoutineStep[];
};

export function RoutinePreview({ name, description, steps }: Props) {
  if (steps.length === 0) return null;

  return (
    <div className="rounded-3xl border border-ink/5 bg-white p-6 shadow-soft">
      <p className="text-xs uppercase tracking-widest text-ink-faint">preview</p>
      <h3 className="mt-2 font-display text-xl font-semibold">
        {name || "untitled routine"}
      </h3>
      <p className="mt-1 text-sm text-ink-soft">{description || "no description."}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {steps.map((s, i) => (
          <span
            key={i}
            className="rounded-full bg-surface-muted px-3 py-1 text-xs font-medium capitalize text-ink-soft"
          >
            {i + 1}. {s.gesture_id.replace(/_/g, " ")}
          </span>
        ))}
      </div>
    </div>
  );
}
