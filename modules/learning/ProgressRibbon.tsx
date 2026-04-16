"use client";

type Props = {
  stepIndex: number;
  stepCount: number;
};

export function ProgressRibbon({ stepIndex, stepCount }: Props) {
  const safeCount = Math.max(stepCount, 1);
  const completed = Math.min(stepIndex, safeCount);
  const pct = Math.round((completed / safeCount) * 100);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between text-sm text-ink-soft">
        <span className="font-medium">
          step {Math.min(stepIndex + 1, safeCount)} of {safeCount}
        </span>
        <span className="tabular-nums">{pct}%</span>
      </div>
      <div className="flex gap-1.5">
        {Array.from({ length: safeCount }).map((_, i) => {
          const isDone = i < stepIndex;
          const isCurrent = i === stepIndex;
          return (
            <span
              key={i}
              className={`h-2 flex-1 rounded-full transition-colors ${
                isDone
                  ? "bg-brand-500"
                  : isCurrent
                    ? "bg-brand-500/60"
                    : "bg-surface-muted"
              }`}
            />
          );
        })}
      </div>
    </div>
  );
}
