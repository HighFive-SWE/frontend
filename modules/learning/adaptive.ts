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
// phase 8.5: kept the floor but raised consecutive-sample count from 3 → 5 and
// added a joint-drift gate (see useStepMachine) so a hand that briefly drifts
// through the correct band cannot accidentally clear the step. 5 samples at
// ~200ms cadence = ~1s of sustained pose, which is what a deliberate sign takes.
export const SUCCESS_ACCURACY_FLOOR = 0.60;
export const GREAT_ACCURACY = 0.70;
export const EXCELLENT_ACCURACY = 0.85;
export const SUCCESS_CONSECUTIVE = 5;
// max number of drifting landmarks a sample can have and still count as a
// "pass" toward the consecutive-hold streak. out of 21 joints — ~48% drift
// ceiling. catches the case where similarity is 0.6 but most fingers are off.
export const MAX_INCORRECT_FOR_PASS = 10;

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
