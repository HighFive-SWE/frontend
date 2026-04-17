"use client";

import Link from "next/link";
import type { Routine } from "@/services/api";

type Props = {
  routines: Routine[];
  completedIds: readonly string[];
  onSelect: (routine: Routine) => void;
};

export function RoutinePicker({ routines, completedIds, onSelect }: Props) {
  return (
    <section className="flex flex-col gap-4">
      <div className="grid gap-4 md:grid-cols-2">
        {routines.map((routine) => {
          const done = completedIds.includes(routine.id);
          const custom = routine.is_custom === true;
          return (
            <button
              key={routine.id}
              type="button"
              onClick={() => onSelect(routine)}
              className="group relative flex flex-col items-start gap-3 rounded-2xl border border-ink/5 bg-white p-6 text-left shadow-soft transition hover:-translate-y-0.5 hover:shadow-lifted"
            >
              <div className="flex items-center gap-2">
                <span className="pill">{routine.scenario_tag}</span>
                <span className="pill">{routine.steps.length} step{routine.steps.length === 1 ? "" : "s"}</span>
                {custom && (
                  <span className="pill bg-accent-lilac/40 text-ink">custom</span>
                )}
                {done && (
                  <span className="pill bg-accent-mint/40 text-ink">completed</span>
                )}
              </div>
              <h3 className="font-display text-xl font-semibold">{routine.name}</h3>
              <p className="text-ink-soft">{routine.description}</p>
              <div className="mt-2 flex items-center gap-3">
                <span className="text-sm font-medium text-brand-600 transition group-hover:text-brand-700">
                  {done ? "play again" : "start"} →
                </span>
                {custom && (
                  <Link
                    href={`/create-routine?edit=${routine.id}`}
                    onClick={(e) => e.stopPropagation()}
                    className="text-sm text-ink-faint hover:text-brand-600"
                  >
                    edit
                  </Link>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
