import type { CompareResult } from "@/modules/mirror/comparator";
import { EXCELLENT_ACCURACY, GREAT_ACCURACY, qualityFor } from "./adaptive";

// mediapipe landmark indices, grouped by finger tip — used to translate
// raw `incorrect_points` arrays into gentle, directional coach copy.
const FINGER_POINTS: Record<string, number[]> = {
  thumb: [1, 2, 3, 4],
  index: [5, 6, 7, 8],
  middle: [9, 10, 11, 12],
  ring: [13, 14, 15, 16],
  pinky: [17, 18, 19, 20],
};

function fingersInPlay(incorrect: readonly number[]): string[] {
  const hits = new Set<string>();
  for (const i of incorrect) {
    for (const [finger, ids] of Object.entries(FINGER_POINTS)) {
      if (ids.includes(i)) {
        hits.add(finger);
        break;
      }
    }
  }
  return [...hits];
}

export type Coach = {
  headline: string;
  detail?: string;
};

// phase 6 feedback layer — tone is always encouraging, never "wrong".
// within-success tiers:
//   0.60 – 0.70: good start, finger-level nudge
//   0.70 – 0.85: almost perfect, one specific polish
//   0.85+      : excellent form
// below 0.60 we still guide — the old band names just mean "more practice".
export function coachFor(
  result: CompareResult | null,
  hasHand: boolean,
  defaultHint: string,
): Coach {
  if (!hasHand) {
    return {
      headline: "hold your hand in the frame.",
      detail: defaultHint,
    };
  }
  if (!result) {
    return { headline: "hold steady — getting a read.", detail: defaultHint };
  }

  // success tiers (band === "correct" means accuracy >= 0.60 in phase 6).
  if (result.band === "correct") {
    const quality = qualityFor(result.accuracy);
    const fingers = fingersInPlay(result.incorrectPoints);
    const first = fingers[0];

    if (quality === "excellent") {
      return { headline: "excellent form — hold it." };
    }
    if (quality === "great") {
      if (first === "thumb") {
        return { headline: "almost perfect — refine the thumb placement." };
      }
      if (first) {
        return { headline: `almost perfect — tweak the ${first} a touch.` };
      }
      return { headline: "almost perfect — one small polish." };
    }
    // "good" — 0.60–0.70 range
    if (first === "thumb") {
      return { headline: "good start — adjust the thumb slightly." };
    }
    if (first) {
      return { headline: `good start — nudge the ${first} finger a bit.` };
    }
    return { headline: "good start — adjust finger positions slightly." };
  }

  const fingers = fingersInPlay(result.incorrectPoints);

  if (result.band === "partial") {
    const first = fingers[0];
    if (first === "thumb") {
      return { headline: "thumb a little higher — keep the rest steady." };
    }
    if (first === "index" || first === "middle" || first === "ring") {
      return { headline: `${first} finger closer in — almost there.` };
    }
    if (first === "pinky") {
      return { headline: "soften the pinky — let it rest." };
    }
    return { headline: "almost there — small adjustments.", detail: defaultHint };
  }

  if (fingers.length >= 3) {
    return {
      headline: "let's reset — match the loop, fingers relaxed.",
      detail: defaultHint,
    };
  }
  return {
    headline: `focus on the ${fingers.join(" & ") || "shape"} — try again.`,
    detail: defaultHint,
  };
}

// thresholds exported for the quality pill / excellence chip so UI and copy
// agree on what "great" vs "excellent" mean.
export const QUALITY_THRESHOLDS = {
  good: 0,
  great: GREAT_ACCURACY,
  excellent: EXCELLENT_ACCURACY,
};
