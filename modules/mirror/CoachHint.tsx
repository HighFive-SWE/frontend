"use client";

import { useMemo } from "react";
import type { CompareResult } from "./comparator";
import { fingertipLabelFor } from "./landmarks";

type Props = {
  result: CompareResult | null;
  hasHand: boolean;
  gestureHint: string;
};

// keep coaching gentle — no red-light messaging, no "wrong".
export function CoachHint({ result, hasHand, gestureHint }: Props) {
  const copy = useMemo(() => buildCopy(result, hasHand, gestureHint), [
    result,
    hasHand,
    gestureHint,
  ]);

  return (
    <div className="rounded-3xl border border-ink/5 bg-white p-5 shadow-soft">
      <p className="text-sm uppercase tracking-widest text-ink-faint">{copy.eyebrow}</p>
      <p className="mt-1 font-display text-lg">{copy.headline}</p>
      {copy.detail && <p className="mt-2 text-ink-soft">{copy.detail}</p>}
    </div>
  );
}

function buildCopy(
  result: CompareResult | null,
  hasHand: boolean,
  gestureHint: string,
): { eyebrow: string; headline: string; detail?: string } {
  if (!hasHand) {
    return {
      eyebrow: "coach",
      headline: "hold your hand in the frame.",
      detail: gestureHint,
    };
  }
  if (!result) {
    return { eyebrow: "coach", headline: "hold steady — getting a read.", detail: gestureHint };
  }
  if (result.band === "correct") {
    return { eyebrow: "coach", headline: "great shape — hold it for a beat." };
  }
  if (result.band === "partial") {
    const tips = fingertipLabelFor(result.incorrectPoints);
    const where = tips.length ? ` around the ${tips.join(", ")}` : "";
    return {
      eyebrow: "coach",
      headline: `almost there — adjust${where}.`,
      detail: gestureHint,
    };
  }
  return { eyebrow: "coach", headline: "let's reset and match the loop.", detail: gestureHint };
}
