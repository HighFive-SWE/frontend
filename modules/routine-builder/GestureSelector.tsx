"use client";

import { GESTURE_LIST, type GestureId } from "@/modules/mirror/gestures";

type Props = {
  onAdd: (gestureId: GestureId) => void;
  disabled?: boolean;
};

export function GestureSelector({ onAdd, disabled }: Props) {
  return (
    <div className="rounded-3xl border border-ink/5 bg-white p-6 shadow-soft">
      <p className="text-xs uppercase tracking-widest text-ink-faint">gesture library</p>
      <p className="mt-1 font-display text-lg">tap to add a step</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {GESTURE_LIST.map((g) => (
          <button
            key={g.id}
            type="button"
            disabled={disabled}
            onClick={() => onAdd(g.id)}
            className="flex flex-col items-start gap-1 rounded-2xl border border-ink/5 bg-surface-muted px-4 py-3 text-left transition hover:border-brand-400 hover:bg-brand-50 disabled:opacity-40"
          >
            <span className="text-sm font-medium capitalize">{g.title}</span>
            <span className="text-xs text-ink-faint">{g.hint}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
