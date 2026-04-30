"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

// phase 10: subtle first-visit nudge. surfaces three short cues — start with
// a routine, then mirror, then live — and bows out forever once dismissed or
// completed. lives only on the landing page so we never sit on top of the
// camera UI mid-practice.
const STORAGE_KEY = "highfive:onboarded:v1";

type Tip = {
  eyebrow: string;
  body: string;
  cta: string;
  href: string;
};

const TIPS: Tip[] = [
  {
    eyebrow: "01 · start with a routine",
    body: "scenario lessons walk you through a tiny conversation, step by step.",
    cta: "open learn",
    href: "/learn",
  },
  {
    eyebrow: "02 · sharpen with mirror",
    body: "pick any sign and watch your hand skeleton in real time. drift shows up instantly.",
    cta: "open mirror",
    href: "/mirror",
  },
  {
    eyebrow: "03 · communicate with live",
    body: "sign freely — HighFive builds your sentence as you go.",
    cta: "open live",
    href: "/live",
  },
];

export function OnboardingHint() {
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(0);
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    let seen = false;
    try {
      seen = window.localStorage.getItem(STORAGE_KEY) === "1";
    } catch {
      // localStorage blocked — show the hint once for this session and move on.
    }
    if (seen) return;
    setVisible(true);
    const t = window.setTimeout(() => setEntered(true), 600);
    return () => window.clearTimeout(t);
  }, []);

  if (!visible) return null;

  const tip = TIPS[step];
  const isLast = step === TIPS.length - 1;

  const dismiss = () => {
    try {
      window.localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // ignored — at worst the hint reappears next visit.
    }
    setVisible(false);
  };

  const advance = () => {
    if (isLast) {
      dismiss();
      return;
    }
    setStep((s) => s + 1);
  };

  return (
    <div
      role="dialog"
      aria-label="getting started with HighFive"
      className={[
        "fixed bottom-5 right-5 z-40 w-[min(20rem,calc(100vw-2.5rem))]",
        "rounded-2xl border border-ink/10 bg-white/95 p-4 shadow-lifted backdrop-blur",
        "transition duration-500",
        entered ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0",
      ].join(" ")}
    >
      <button
        type="button"
        onClick={dismiss}
        aria-label="dismiss tips"
        className="absolute right-2 top-2 grid h-6 w-6 place-items-center rounded-full text-ink-faint transition hover:bg-surface-muted hover:text-ink"
      >
        <span aria-hidden>×</span>
      </button>

      <p className="font-mono text-[10px] uppercase tracking-widest text-ink-faint">
        {tip.eyebrow}
      </p>
      <p className="mt-2 text-sm leading-relaxed text-ink">{tip.body}</p>

      <div className="mt-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-1.5" aria-hidden>
          {TIPS.map((_, i) => (
            <span
              key={i}
              className={[
                "h-1.5 rounded-full transition-all",
                i === step ? "w-6 bg-brand-500" : "w-1.5 bg-ink/15",
              ].join(" ")}
            />
          ))}
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={tip.href}
            onClick={dismiss}
            className="text-xs font-medium text-brand-700 underline-offset-2 hover:underline"
          >
            {tip.cta}
          </Link>
          <button
            type="button"
            onClick={advance}
            className="rounded-lg border border-ink/10 bg-surface-muted px-3 py-1 text-xs font-medium text-ink transition hover:border-ink/30 hover:bg-white"
          >
            {isLast ? "got it" : "next"}
          </button>
        </div>
      </div>
    </div>
  );
}
