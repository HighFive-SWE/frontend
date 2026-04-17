// adaptive feedback thresholds — phase 3 brief:
//   2 fails → show detailed hint
//   4 fails → slow the demo loop
//   6 fails → show the ghost-hand guide
export const HINT_AT_FAILS = 2;
export const SLOW_MODE_AT_FAILS = 4;
export const GHOST_AT_FAILS = 6;

// cadence (ms) for the demo loop — regular vs. slow.
export const DEMO_LOOP_MS = 3000;
export const DEMO_LOOP_SLOW_MS = 5000;

// success rule: a step clears when we observe this many consecutive samples
// at or above SUCCESS_ACCURACY_FLOOR. phase 6 recalibrated this from 0.78
// to 0.60 — humans aren't perfect and the old floor frustrated real learners.
// above this floor we still grade the shape: GREAT at 0.70, EXCELLENT at 0.85.
export const SUCCESS_ACCURACY_FLOOR = 0.60;
export const GREAT_ACCURACY = 0.70;
export const EXCELLENT_ACCURACY = 0.85;
export const SUCCESS_CONSECUTIVE = 3;

export type Quality = "good" | "great" | "excellent";

export function qualityFor(accuracy: number): Quality {
  if (accuracy >= EXCELLENT_ACCURACY) return "excellent";
  if (accuracy >= GREAT_ACCURACY) return "great";
  return "good";
}

export type Difficulty = "normal" | "hint" | "slow" | "ghost";

export function difficultyFor(fails: number): Difficulty {
  if (fails >= GHOST_AT_FAILS) return "ghost";
  if (fails >= SLOW_MODE_AT_FAILS) return "slow";
  if (fails >= HINT_AT_FAILS) return "hint";
  return "normal";
}

export function loopCadenceFor(difficulty: Difficulty): number {
  return difficulty === "slow" || difficulty === "ghost" ? DEMO_LOOP_SLOW_MS : DEMO_LOOP_MS;
}
