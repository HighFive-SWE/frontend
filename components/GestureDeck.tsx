"use client";

import { useEffect, useMemo, useState } from "react";

// a small auto-rotating card deck that cycles through signs. each card is a
// stylized hand glyph + label. used on the hero to give the page a "there's
// something happening here" pulse without requiring the camera.

type DeckItem = { gesture: string; hint: string; glyph: GlyphKey };

const ITEMS: DeckItem[] = [
  { gesture: "hello", hint: "open palm · small wave", glyph: "open" },
  { gesture: "thank you", hint: "flat hand · chin outward", glyph: "open" },
  { gesture: "water", hint: "'w' shape · three up", glyph: "three" },
  { gesture: "help", hint: "thumb up · fist lifted", glyph: "thumbUp" },
  { gesture: "more", hint: "fingertips · pinched tap", glyph: "pinch" },
  { gesture: "play", hint: "'y' hand · shake gently", glyph: "y" },
];

export function GestureDeck() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % ITEMS.length);
    }, 2200);
    return () => window.clearInterval(id);
  }, []);

  const ordered = useMemo(() => {
    return [0, 1, 2].map((offset) => ITEMS[(index + offset) % ITEMS.length]);
  }, [index]);

  return (
    <div className="relative h-[320px] w-full max-w-sm">
      {/* ambient pulse behind the deck */}
      <div className="absolute left-1/2 top-1/2 -z-0 h-60 w-60 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-500/10 blur-3xl animate-float" />

      {/* three stacked cards, swapping positions on every tick */}
      {ordered.map((item, i) => (
        <div
          key={`${item.gesture}-${i}`}
          className="absolute inset-x-0 transition-all duration-700 ease-out"
          style={{
            top: `${i * 28}px`,
            transform: `scale(${1 - i * 0.05}) rotate(${i === 0 ? -2 : i === 1 ? 1.5 : -1}deg)`,
            zIndex: 3 - i,
            opacity: i === 0 ? 1 : i === 1 ? 0.85 : 0.6,
          }}
        >
          <DeckCard item={item} featured={i === 0} />
        </div>
      ))}

      {/* floating confetti ticks */}
      <span className="absolute -left-6 top-6 h-2 w-2 rounded-full bg-accent-mint animate-float" />
      <span className="absolute -right-4 top-20 h-3 w-3 rounded-full bg-accent-peach animate-floatAlt" />
      <span className="absolute -right-8 bottom-16 h-2 w-2 rounded-full bg-accent-lilac animate-float" />
    </div>
  );
}

function DeckCard({ item, featured }: { item: DeckItem; featured: boolean }) {
  return (
    <div
      className={`relative flex w-full items-center gap-4 rounded-3xl border border-ink/10 bg-white p-5 shadow-lifted ${
        featured ? "ring-2 ring-brand-500/25" : ""
      }`}
    >
      <div className="grid h-20 w-20 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-brand-50 to-accent-lilac/40">
        <HandGlyph glyph={item.glyph} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-mono text-[10px] uppercase tracking-widest text-ink-faint">
          now signing
        </p>
        <p className="mt-1 truncate font-display text-2xl font-bold">
          {item.gesture}
        </p>
        <p className="truncate text-xs text-ink-soft">{item.hint}</p>
      </div>
      {featured && (
        <span className="relative flex h-3 w-3">
          <span className="absolute inline-flex h-full w-full rounded-full bg-accent-mint animate-pulseRing" />
          <span className="relative inline-flex h-3 w-3 rounded-full bg-accent-mint" />
        </span>
      )}
    </div>
  );
}

type GlyphKey = "open" | "three" | "thumbUp" | "pinch" | "y";

// compact stylized hand shapes — stroke-only so they riff on the skeleton
// overlay aesthetic used in mirror/live views.
function HandGlyph({ glyph }: { glyph: GlyphKey }) {
  const base = "stroke-ink";
  switch (glyph) {
    case "open":
      return (
        <svg width="52" height="52" viewBox="0 0 52 52" fill="none" aria-hidden>
          <g className={base} strokeWidth="2.4" strokeLinecap="round">
            <line x1="10" y1="40" x2="10" y2="22" />
            <line x1="18" y1="40" x2="18" y2="14" />
            <line x1="26" y1="40" x2="26" y2="10" />
            <line x1="34" y1="40" x2="34" y2="14" />
            <line x1="42" y1="40" x2="42" y2="22" />
          </g>
          <circle cx="26" cy="44" r="4" className="fill-brand-500" />
        </svg>
      );
    case "three":
      return (
        <svg width="52" height="52" viewBox="0 0 52 52" fill="none" aria-hidden>
          <g className={base} strokeWidth="2.4" strokeLinecap="round">
            <line x1="18" y1="40" x2="18" y2="14" />
            <line x1="26" y1="40" x2="26" y2="10" />
            <line x1="34" y1="40" x2="34" y2="14" />
            <path d="M10 40 Q12 34 18 34" />
            <path d="M42 40 Q40 34 34 34" />
          </g>
          <circle cx="26" cy="44" r="4" className="fill-accent-mint" />
        </svg>
      );
    case "thumbUp":
      return (
        <svg width="52" height="52" viewBox="0 0 52 52" fill="none" aria-hidden>
          <g className={base} strokeWidth="2.4" strokeLinecap="round">
            <path d="M20 40 L20 14" />
            <path d="M28 36 Q30 30 28 26" />
            <path d="M32 36 Q34 30 32 26" />
            <path d="M36 36 Q38 32 36 28" />
          </g>
          <circle cx="20" cy="10" r="4" className="fill-accent-peach" />
        </svg>
      );
    case "pinch":
      return (
        <svg width="52" height="52" viewBox="0 0 52 52" fill="none" aria-hidden>
          <g className={base} strokeWidth="2.4" strokeLinecap="round" fill="none">
            <path d="M18 42 Q24 30 26 22" />
            <path d="M34 42 Q28 30 26 22" />
          </g>
          <circle cx="26" cy="18" r="5" className="fill-accent-lilac" />
          <circle cx="26" cy="18" r="2" className="fill-ink" />
        </svg>
      );
    case "y":
      return (
        <svg width="52" height="52" viewBox="0 0 52 52" fill="none" aria-hidden>
          <g className={base} strokeWidth="2.4" strokeLinecap="round">
            <line x1="10" y1="40" x2="10" y2="16" />
            <line x1="42" y1="40" x2="42" y2="16" />
            <path d="M20 40 Q22 34 26 34 Q30 34 32 40" />
          </g>
          <circle cx="10" cy="12" r="3.5" className="fill-brand-500" />
          <circle cx="42" cy="12" r="3.5" className="fill-accent-sun" />
        </svg>
      );
  }
}
