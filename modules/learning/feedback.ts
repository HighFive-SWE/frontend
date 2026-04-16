import type { CompareResult } from "@/modules/mirror/comparator";

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

// produce coach copy for a given moment. never uses "wrong". suggests
// concrete adjustments instead — thumb a bit higher, fingers closer, etc.
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

  if (result.band === "correct") {
    return { headline: "great shape — hold it for a beat." };
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
