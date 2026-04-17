"use client";

import { Button } from "@/components/Button";
import type { RoutineStep } from "@/services/api";

type Props = {
  steps: RoutineStep[];
  maxSteps: number;
  onRemove: (index: number) => void;
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
};

export function StepBuilder({ steps, maxSteps, onRemove, onMoveUp, onMoveDown }: Props) {
  if (steps.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-ink/10 bg-white p-6 text-center text-sm text-ink-faint">
        no steps yet — tap gestures above to build your routine.
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-ink/5 bg-white p-6 shadow-soft">
      <div className="flex items-baseline justify-between">
        <div>
          <p className="text-xs uppercase tracking-widest text-ink-faint">steps</p>
          <p className="font-display text-lg">
            {steps.length} / {maxSteps}
          </p>
        </div>
        {steps.length >= maxSteps && (
          <span className="text-xs text-ink-faint">max reached</span>
        )}
      </div>

      <ol className="mt-4 flex flex-col gap-2">
        {steps.map((step, i) => (
          <li
            key={`${step.gesture_id}-${i}`}
            className="flex items-center gap-3 rounded-2xl border border-ink/5 bg-surface-muted/60 px-4 py-3"
          >
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-brand-500 text-xs font-semibold text-white">
              {i + 1}
            </span>
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-medium capitalize">
                {step.gesture_id.replace(/_/g, " ")}
              </p>
              <p className="truncate text-xs text-ink-faint">{step.prompt}</p>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                disabled={i === 0}
                onClick={() => onMoveUp(i)}
              >
                ↑
              </Button>
              <Button
                variant="ghost"
                size="sm"
                disabled={i === steps.length - 1}
                onClick={() => onMoveDown(i)}
              >
                ↓
              </Button>
              <Button variant="ghost" size="sm" onClick={() => onRemove(i)}>
                ×
              </Button>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
