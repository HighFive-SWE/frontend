// reference gestures — wrist-centered, palm-span (landmark 9) scaled to 1.
// every vector is composed from the same thumb + finger state library used on
// the python side. keep in sync with /vision/gestures/samples.py — matching
// ids, matching numbers.

import type { Landmark } from "./landmarks";

export type GestureId =
  | "hello"
  | "thank_you"
  | "please"
  | "sorry"
  | "water"
  | "food"
  | "help"
  | "stop"
  | "yes"
  | "no"
  | "bathroom"
  | "pain"
  | "tired"
  | "play"
  | "sleep"
  | "drink"
  | "eat"
  | "friend"
  | "family"
  | "doctor"
  | "school"
  | "home"
  | "wait"
  | "come"
  | "go"
  | "more"
  | "finished";

type Reference = readonly Landmark[];
type ThumbState =
  | "side"
  | "across"
  | "up"
  | "between"
  | "pinch_index"
  | "touch_middle"
  | "corner"
  | "inline";
type FingerState = "ext" | "half" | "fold" | "tip_in" | "bent_tip";

const FINGER_BASE_X = [-0.22, 0.0, 0.22, 0.4] as const;

const THUMB_STATES: Record<ThumbState, [number, number, number][]> = {
  side:         [[-0.25, -0.15, 0.0], [-0.55, -0.3, -0.02], [-0.75, -0.5, -0.04], [-0.9, -0.7, -0.06]],
  across:       [[-0.2, -0.2, 0.0], [-0.1, -0.4, -0.05], [0.0, -0.5, -0.1], [0.1, -0.6, -0.15]],
  up:           [[-0.2, -0.25, 0.0], [-0.15, -0.55, -0.02], [-0.12, -0.8, -0.02], [-0.1, -1.0, -0.02]],
  between:      [[-0.2, -0.3, 0.0], [-0.15, -0.55, -0.05], [-0.1, -0.75, -0.05], [-0.08, -0.9, -0.05]],
  pinch_index:  [[-0.2, -0.25, 0.0], [-0.25, -0.5, -0.1], [-0.25, -0.75, -0.15], [-0.22, -0.9, -0.2]],
  touch_middle: [[-0.15, -0.35, -0.02], [-0.05, -0.6, -0.05], [0.05, -0.8, -0.1], [0.15, -0.95, -0.12]],
  corner:       [[-0.3, -0.2, 0.0], [-0.55, -0.3, -0.02], [-0.75, -0.4, -0.04], [-0.95, -0.55, -0.06]],
  inline:       [[-0.2, -0.2, 0.0], [-0.35, -0.3, -0.02], [-0.45, -0.5, -0.04], [-0.5, -0.7, -0.06]],
};

function finger(baseX: number, state: FingerState): [number, number, number][] {
  switch (state) {
    case "ext":
      return [
        [baseX, -0.95, 0.0],
        [baseX, -1.3, 0.0],
        [baseX, -1.55, 0.0],
        [baseX, -1.75, 0.0],
      ];
    case "half":
      return [
        [baseX, -0.95, 0.0],
        [baseX, -1.2, -0.1],
        [baseX, -1.2, -0.3],
        [baseX, -1.1, -0.4],
      ];
    case "fold":
      return [
        [baseX, -0.95, 0.0],
        [baseX, -1.1, -0.1],
        [baseX, -1.0, -0.25],
        [baseX, -0.85, -0.3],
      ];
    case "tip_in":
      return [
        [baseX, -0.95, 0.0],
        [baseX, -1.25, -0.05],
        [baseX * 0.5, -1.4, -0.15],
        [0.0, -1.5, -0.2],
      ];
    case "bent_tip":
      return [
        [baseX, -0.95, 0.0],
        [baseX, -1.25, 0.0],
        [baseX * 1.1, -1.45, -0.1],
        [baseX * 1.2, -1.5, -0.2],
      ];
  }
}

function build(
  thumb: ThumbState,
  fingers: readonly [FingerState, FingerState, FingerState, FingerState],
  zShift = 0,
): Reference {
  const pts: [number, number, number][] = [[0, 0, 0]];
  for (const p of THUMB_STATES[thumb]) pts.push([p[0], p[1], p[2]]);
  for (let i = 0; i < 4; i += 1) {
    for (const p of finger(FINGER_BASE_X[i], fingers[i])) pts.push(p);
  }
  return pts.map(([x, y, z], idx) => ({
    x,
    y,
    z: idx === 0 ? z : z + zShift,
  }));
}

export const GESTURES: Record<GestureId, Reference> = {
  hello:     build("side",         ["ext", "ext", "ext", "ext"]),
  thank_you: build("side",         ["ext", "ext", "ext", "ext"], -0.35),
  please:    build("side",         ["half", "half", "half", "half"]),
  sorry:     build("across",       ["fold", "fold", "fold", "fold"]),
  water:     build("across",       ["ext", "ext", "ext", "fold"]),
  food:      build("pinch_index",  ["tip_in", "tip_in", "tip_in", "tip_in"]),
  help:      build("up",           ["fold", "fold", "fold", "fold"]),
  stop:      build("inline",       ["ext", "ext", "ext", "ext"], 0.35),
  yes:       build("across",       ["fold", "fold", "fold", "fold"], 0.2),
  no:        build("touch_middle", ["ext", "ext", "fold", "fold"]),
  bathroom:  build("between",      ["fold", "fold", "fold", "fold"]),
  pain:      build("across",       ["ext", "fold", "fold", "fold"]),
  tired:     build("across",       ["bent_tip", "bent_tip", "bent_tip", "bent_tip"]),
  play:      build("corner",       ["fold", "fold", "fold", "ext"]),
  sleep:     build("inline",       ["half", "half", "half", "half"], -0.25),
  // phase 8 expansion
  drink:     build("side",         ["half", "half", "fold", "fold"], 0.15),
  eat:       build("inline",       ["half", "half", "half", "half"]),
  friend:    build("across",       ["ext", "fold", "fold", "fold"], -0.15),
  family:    build("pinch_index",  ["fold", "fold", "fold", "fold"], 0.10),
  doctor:    build("touch_middle", ["ext", "fold", "fold", "fold"], 0.15),
  school:    build("side",         ["ext", "ext", "ext", "ext"], 0.15),
  home:      build("pinch_index",  ["tip_in", "tip_in", "tip_in", "tip_in"], 0.15),
  wait:      build("side",         ["half", "half", "half", "half"], 0.20),
  come:      build("across",       ["ext", "fold", "fold", "fold"], 0.25),
  go:        build("up",           ["ext", "fold", "fold", "fold"]),
  more:      build("pinch_index",  ["tip_in", "tip_in", "tip_in", "tip_in"], -0.15),
  finished:  build("side",         ["ext", "ext", "ext", "ext"], -0.15),
};

export const GESTURE_LIST: { id: GestureId; title: string; hint: string }[] = [
  { id: "hello",     title: "hello",     hint: "open palm, fingers up, gentle wave." },
  { id: "thank_you", title: "thank you", hint: "flat hand from chin outward — palm tilted toward you." },
  { id: "please",    title: "please",    hint: "soft open hand, fingers half-curled, circling at the chest." },
  { id: "sorry",     title: "sorry",     hint: "closed fist, thumb across — small circle over the chest." },
  { id: "water",     title: "water",     hint: "'w' shape — index, middle, ring up; thumb across palm." },
  { id: "food",      title: "food",      hint: "pinch all fingertips together, tap toward the mouth." },
  { id: "help",      title: "help",      hint: "thumb up, fingers curled — lifted on the other palm." },
  { id: "stop",      title: "stop",      hint: "flat palm forward, fingers straight up, held still." },
  { id: "yes",       title: "yes",       hint: "closed fist, small nod motion — keep it steady." },
  { id: "no",        title: "no",        hint: "index and middle extended, snap down to thumb." },
  { id: "bathroom",  title: "bathroom",  hint: "fist with thumb peeking between index and middle, shake gently." },
  { id: "pain",      title: "pain",      hint: "index finger out, jab forward — one short point." },
  { id: "tired",     title: "tired",     hint: "fingers drooping at the second knuckle — loose and heavy." },
  { id: "play",      title: "play",      hint: "'y' hand — thumb and pinky out, other fingers curled; shake." },
  { id: "sleep",     title: "sleep",     hint: "soft fingers drifting down the face — palm turning inward." },
  { id: "drink",     title: "drink",     hint: "c-shape hand tilted back — like holding a cup to your lips." },
  { id: "eat",       title: "eat",       hint: "relaxed flat hand, fingertips tapping toward the mouth." },
  { id: "friend",    title: "friend",    hint: "hook index fingers together — swap which is on top." },
  { id: "family",    title: "family",    hint: "pinch hand sweeping in a circle — everyone together." },
  { id: "doctor",    title: "doctor",    hint: "'d' hand tapped on the opposite wrist — taking a pulse." },
  { id: "school",    title: "school",    hint: "flat palms clapping twice — calling attention." },
  { id: "home",      title: "home",      hint: "pinched fingertips from cheek to jaw — where you eat and sleep." },
  { id: "wait",      title: "wait",      hint: "open hands, fingers half-curled, held up with a small wiggle." },
  { id: "come",      title: "come",      hint: "index finger beckoning toward you — palm up." },
  { id: "go",        title: "go",        hint: "index finger pointing outward, thumb up — off you go." },
  { id: "more",      title: "more",      hint: "pinched fingertips tapped together twice." },
  { id: "finished",  title: "finished",  hint: "open palms flipped outward — all done." },
];
