"use client";

import { useEffect, useState } from "react";
import { useAppStore, type MascotMood } from "@/lib/store";

// reactive mascot — floats in the bottom-right corner, reads mood from the store.
// visual design: simple rounded "five" hand glyph with eyes. reads as warm,
// not childish. appearance swaps by mood; a gentle bounce plays on transitions.
export function Mascot() {
  const mood = useAppStore((s) => s.mascotMood);
  const setMood = useAppStore((s) => s.setMascotMood);

  const [pulseKey, setPulseKey] = useState(0);
  useEffect(() => {
    setPulseKey((k) => k + 1);
  }, [mood]);

  // wind high-energy moods back down to idle after a beat so the mascot doesn't
  // stay perpetually "celebrating".
  useEffect(() => {
    if (mood === "celebrating" || mood === "excited") {
      const t = window.setTimeout(() => setMood("happy"), 1800);
      return () => window.clearTimeout(t);
    }
    if (mood === "happy") {
      const t = window.setTimeout(() => setMood("idle"), 3000);
      return () => window.clearTimeout(t);
    }
  }, [mood, setMood]);

  const { face, bg, label, animation } = styleFor(mood);

  return (
    <div
      className="pointer-events-none fixed bottom-6 right-6 z-40 flex flex-col items-end gap-2"
      aria-live="polite"
    >
      <div
        key={pulseKey}
        className={`pointer-events-auto grid h-16 w-16 place-items-center rounded-2xl shadow-soft ${bg} ${animation}`}
        title={label}
      >
        <span className="text-2xl">{face}</span>
      </div>
      {mood !== "idle" && (
        <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-ink shadow-soft backdrop-blur">
          {label}
        </span>
      )}
    </div>
  );
}

function styleFor(mood: MascotMood): {
  face: string;
  bg: string;
  label: string;
  animation: string;
} {
  switch (mood) {
    case "celebrating":
      return {
        face: "🎉",
        bg: "bg-gradient-to-br from-accent-mint to-brand-400",
        label: "yes! nailed it.",
        animation: "animate-bounceSoft",
      };
    case "excited":
      return {
        face: "✨",
        bg: "bg-gradient-to-br from-accent-peach to-accent-lilac",
        label: "you're on a roll",
        animation: "animate-bounceSoft",
      };
    case "happy":
      return {
        face: "😊",
        bg: "bg-gradient-to-br from-brand-400 to-brand-600",
        label: "nice work",
        animation: "",
      };
    case "encouraging":
      return {
        face: "💪",
        bg: "bg-gradient-to-br from-accent-peach to-brand-400",
        label: "shake it off — try again",
        animation: "",
      };
    case "idle":
    default:
      return {
        face: "✋",
        bg: "bg-gradient-to-br from-brand-500 to-brand-700",
        label: "ready when you are",
        animation: "",
      };
  }
}
