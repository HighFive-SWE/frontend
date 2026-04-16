"use client";

import { useEffect } from "react";
import { useAppStore } from "@/lib/store";

// stack of ephemeral event chips (xp gained, achievements, level-ups, streaks).
// auto-dismiss after 2.6s each. positioned above the mascot.
export function EventToasts() {
  const events = useAppStore((s) => s.eventQueue);
  const acknowledge = useAppStore((s) => s.acknowledgeEvent);

  useEffect(() => {
    if (!events.length) return;
    const timers = events.map((evt) =>
      window.setTimeout(() => acknowledge(evt.id), 2600),
    );
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [events, acknowledge]);

  if (!events.length) return null;

  return (
    <div className="pointer-events-none fixed bottom-32 right-6 z-40 flex flex-col items-end gap-2">
      {events.slice(-4).map((evt) => (
        <div
          key={evt.id}
          className={`rounded-full px-4 py-2 text-sm font-medium shadow-soft backdrop-blur transition ${styleFor(
            evt.kind,
          )}`}
        >
          {evt.message}
        </div>
      ))}
    </div>
  );
}

function styleFor(kind: "xp" | "levelup" | "achievement" | "streak" | "profile"): string {
  switch (kind) {
    case "xp":
      return "bg-brand-500/95 text-white";
    case "levelup":
      return "bg-gradient-to-r from-brand-500 to-accent-lilac text-white";
    case "achievement":
      return "bg-accent-mint/95 text-ink";
    case "streak":
      return "bg-accent-peach/95 text-ink";
    case "profile":
      return "bg-accent-lilac/95 text-ink";
  }
}
