"use client";

import Link from "next/link";
import type { Routine } from "@/services/api";

type Props = {
  routines: Routine[];
  completedIds: readonly string[];
  onSelect: (routine: Routine) => void;
};

// palette cycled through routine cards so the grid has visual rhythm.
const ACCENTS = [
  "bg-accent-mint",
  "bg-accent-peach",
  "bg-accent-lilac",
  "bg-brand-400",
  "bg-accent-sun",
] as const;

export function RoutinePicker({ routines, completedIds, onSelect }: Props) {
  return (
    <section className="flex flex-col gap-4">
      <div className="grid gap-5 md:grid-cols-2">
        {routines.map((routine, i) => {
          const done = completedIds.includes(routine.id);
          const custom = routine.is_custom === true;
          const accent = ACCENTS[i % ACCENTS.length];
          return (
            <button
              key={routine.id}
              type="button"
              onClick={() => onSelect(routine)}
              className="group relative flex flex-col items-start gap-3 overflow-hidden rounded-3xl border border-ink/10 bg-white p-6 text-left shadow-soft transition duration-300 hover:-translate-y-1 hover:shadow-lifted"
            >
              <span
                className={`absolute -right-10 -top-10 h-28 w-28 rounded-full ${accent} opacity-30 blur-2xl transition duration-500 group-hover:opacity-60`}
              />
              <div className="relative flex flex-wrap items-center gap-2">
                <span className={`inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-medium ${accent} bg-opacity-30 text-ink`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${accent}`} />
                  {routine.scenario_tag}
                </span>
                <span className="pill">
                  {routine.steps.length} step{routine.steps.length === 1 ? "" : "s"}
                </span>
                {custom && (
                  <span className="pill bg-accent-lilac/40 text-ink">custom</span>
                )}
                {done && (
                  <span className="pill bg-accent-mint/40 text-ink">completed ✓</span>
                )}
              </div>
              <h3 className="relative font-display text-xl font-semibold">{routine.name}</h3>
              <p className="relative text-ink-soft">{routine.description}</p>
              <div className="relative mt-2 flex items-center gap-3">
                <span className="inline-flex items-center gap-1 text-sm font-semibold text-brand-600 transition group-hover:gap-2 group-hover:text-brand-700">
                  {done ? "play again" : "start"}
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
                    <path d="M2 7 H12 M8 3 L12 7 L8 11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
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
