// reference gestures — wrist-centered, palm-span (landmark 9) scaled to 1.
// every vector is composed from the same thumb + finger state library used on
// the python side. keep in sync with /vision/gestures/samples.py — matching
// ids, matching numbers.

import type { Landmark } from "./landmarks";

export type WordGestureId =
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

export type LetterGestureId =
  | "letter_a" | "letter_b" | "letter_c" | "letter_d" | "letter_e"
  | "letter_f" | "letter_g" | "letter_h" | "letter_i" | "letter_j"
  | "letter_k" | "letter_l" | "letter_m" | "letter_n" | "letter_o"
  | "letter_p" | "letter_q" | "letter_r" | "letter_s" | "letter_t"
  | "letter_u" | "letter_v" | "letter_w" | "letter_x" | "letter_y"
  | "letter_z";

export type GestureId = WordGestureId | LetterGestureId;

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

// the original word library — what live mode iterates over for the phrase
// builder. kept under its own name so the alphabet additions don't leak into
// live matching (live mode would otherwise collide a user's open palm with
// every "extended" letter).
export const WORD_GESTURES: Record<WordGestureId, Reference> = {
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

// asl fingerspelling — the 26-letter alphabet. each shape is composed from the
// same thumb + finger state library so the comparator sees them just like any
// word. z_shift differentiates letters that share a finger configuration but
// differ in palm tilt (e.g. e/yes, w/water, o/food).
export const ALPHABET_GESTURES: Record<LetterGestureId, Reference> = {
  letter_a: build("up",           ["fold", "fold", "fold", "fold"], -0.10),
  letter_b: build("across",       ["ext", "ext", "ext", "ext"]),
  letter_c: build("side",         ["half", "half", "half", "half"], -0.10),
  letter_d: build("pinch_index",  ["ext", "fold", "fold", "fold"]),
  letter_e: build("across",       ["fold", "fold", "fold", "fold"], -0.10),
  letter_f: build("pinch_index",  ["fold", "ext", "ext", "ext"]),
  letter_g: build("up",           ["ext", "fold", "fold", "fold"], 0.20),
  letter_h: build("inline",       ["ext", "ext", "fold", "fold"]),
  letter_i: build("across",       ["fold", "fold", "fold", "ext"]),
  letter_j: build("across",       ["fold", "fold", "fold", "ext"], 0.15),
  letter_k: build("between",      ["ext", "half", "fold", "fold"]),
  letter_l: build("up",           ["ext", "fold", "fold", "fold"], -0.05),
  letter_m: build("between",      ["fold", "fold", "fold", "fold"], 0.10),
  letter_n: build("between",      ["fold", "fold", "fold", "fold"], -0.10),
  letter_o: build("pinch_index",  ["tip_in", "tip_in", "tip_in", "tip_in"], 0.05),
  letter_p: build("between",      ["ext", "half", "fold", "fold"], -0.25),
  letter_q: build("up",           ["ext", "fold", "fold", "fold"], -0.20),
  letter_r: build("across",       ["ext", "half", "fold", "fold"]),
  letter_s: build("across",       ["fold", "fold", "fold", "fold"], 0.10),
  letter_t: build("between",      ["fold", "fold", "fold", "fold"], 0.25),
  letter_u: build("across",       ["ext", "ext", "fold", "fold"]),
  letter_v: build("across",       ["ext", "ext", "fold", "fold"], 0.15),
  letter_w: build("across",       ["ext", "ext", "ext", "fold"], 0.10),
  letter_x: build("across",       ["bent_tip", "fold", "fold", "fold"]),
  letter_y: build("corner",       ["fold", "fold", "fold", "ext"], 0.05),
  letter_z: build("across",       ["ext", "fold", "fold", "fold"], 0.05),
};

// combined lookup so the comparator, demo loop, and ghost-hand can resolve any
// id — word or letter — without caring which library it comes from.
export const GESTURES: Record<GestureId, Reference> = {
  ...WORD_GESTURES,
  ...ALPHABET_GESTURES,
};

export const GESTURE_LIST: { id: WordGestureId; title: string; hint: string }[] = [
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

export type AlphabetEntry = {
  id: LetterGestureId;
  letter: string;
  hint: string;
  shape: string;
  words: string[];
};

// the alphabet section. `words` are short, recognisable picks for fingerspelling
// practice — each word's letters all live inside ALPHABET_GESTURES, so the
// per-letter detail page can build a synthetic routine from them on the fly.
export const ALPHABET_LIST: AlphabetEntry[] = [
  { id: "letter_a", letter: "a", shape: "closed fist, thumb resting along the side.",                hint: "make a fist, then rest the thumb against the side of the index — flat, not tucked.",            words: ["ant", "apple", "arm", "ask"] },
  { id: "letter_b", letter: "b", shape: "four fingers up flat, thumb folded across the palm.",        hint: "fingers straight up and pressed together; thumb crosses the palm to meet the pinky base.",       words: ["bee", "bird", "book", "bread"] },
  { id: "letter_c", letter: "c", shape: "fingers and thumb curved like the letter c.",                hint: "shape a relaxed c — fingers curl as a unit, thumb mirrors them on the other side.",             words: ["cat", "car", "cup", "cake"] },
  { id: "letter_d", letter: "d", shape: "index up; thumb meets the curled middle/ring/pinky tips.",   hint: "index finger straight; the other three curl down so their tips touch the thumb pad.",           words: ["dog", "duck", "dad", "drum"] },
  { id: "letter_e", letter: "e", shape: "all fingers curled down to meet the thumb in front.",        hint: "fingers fold flat at the second knuckle; thumb tucks horizontally across the fingertips.",      words: ["egg", "ear", "eat", "eye"] },
  { id: "letter_f", letter: "f", shape: "thumb and index pinch; middle, ring, pinky stay extended.",  hint: "make an 'ok' with thumb and index; keep the other three fingers tall and apart.",              words: ["fish", "fox", "fan", "frog"] },
  { id: "letter_g", letter: "g", shape: "thumb and index extended sideways, pointing forward.",       hint: "fist on its side; thumb and index extend out parallel like a tiny pointing pistol.",            words: ["go", "girl", "gum", "gate"] },
  { id: "letter_h", letter: "h", shape: "index and middle extended together, pointing sideways.",     hint: "two fingers stacked, pointing sideways; the other two and thumb stay folded down.",             words: ["hat", "hi", "hop", "horse"] },
  { id: "letter_i", letter: "i", shape: "pinky up, all other fingers folded with thumb across.",      hint: "make a fist and lift just the pinky — keep the wrist still.",                                     words: ["ice", "ink", "in", "iron"] },
  { id: "letter_j", letter: "j", shape: "i-hand drawing a small 'j' in the air.",                     hint: "start in 'i'; trace the hook of a j — pinky leads the curve.",                                    words: ["jam", "jet", "joy", "jump"] },
  { id: "letter_k", letter: "k", shape: "index up, middle out, thumb between them.",                  hint: "v-shape with index up and middle angled forward; thumb rests in the v's gap.",                   words: ["key", "kid", "king", "kite"] },
  { id: "letter_l", letter: "l", shape: "index up and thumb out — a clean 90° angle.",                hint: "thumb out sideways, index straight up; the other three fingers curl in tight.",                  words: ["lion", "leaf", "log", "love"] },
  { id: "letter_m", letter: "m", shape: "thumb tucked under the first three fingers.",                hint: "fold the first three fingers down over the thumb; pinky stays curled to the side.",              words: ["mom", "milk", "moon", "mug"] },
  { id: "letter_n", letter: "n", shape: "thumb tucked under the first two fingers.",                  hint: "fold index and middle over the thumb; ring and pinky stay curled tight.",                        words: ["net", "nut", "no", "nest"] },
  { id: "letter_o", letter: "o", shape: "fingers curve to meet the thumb — round and closed.",        hint: "all fingertips touch the thumb pad to form a round o; relaxed, not pinched.",                    words: ["ox", "owl", "oat", "open"] },
  { id: "letter_p", letter: "p", shape: "k-hand rotated so the index points downward.",               hint: "make 'k', then tip the whole hand forward so the index aims at the floor.",                       words: ["pig", "pen", "pop", "pear"] },
  { id: "letter_q", letter: "q", shape: "g-hand rotated so the fingers point downward.",              hint: "make 'g', then tip your knuckles forward so thumb and index point at the floor.",                 words: ["quiet", "quack", "queen", "quill"] },
  { id: "letter_r", letter: "r", shape: "index and middle crossed, others folded.",                   hint: "twist the index over the middle; the other fingers curl with thumb across.",                     words: ["rain", "red", "run", "rabbit"] },
  { id: "letter_s", letter: "s", shape: "closed fist with the thumb wrapped over the front.",         hint: "tight fist; thumb crosses in front of the fingers — not on the side.",                            words: ["sun", "snow", "sky", "song"] },
  { id: "letter_t", letter: "t", shape: "thumb peeking between index and middle.",                    hint: "fold all four fingers; let the thumb tip pop up between index and middle knuckles.",              words: ["tea", "top", "toy", "tent"] },
  { id: "letter_u", letter: "u", shape: "index and middle up together, others curled.",               hint: "two fingers straight up and touching; ring and pinky curl over the thumb.",                       words: ["up", "us", "use", "uncle"] },
  { id: "letter_v", letter: "v", shape: "index and middle up, spread into a v.",                      hint: "index and middle straight up but split apart; thumb crosses the curled ring and pinky.",          words: ["van", "vet", "view", "vase"] },
  { id: "letter_w", letter: "w", shape: "index, middle, and ring up — three-finger w.",               hint: "three fingers up like a fan; thumb pins the pinky down across the palm.",                         words: ["water", "wind", "web", "wagon"] },
  { id: "letter_x", letter: "x", shape: "index curled into a hook — like a small candy cane.",        hint: "fist with the index out and bent at the middle knuckle; the other fingers stay tight.",          words: ["box", "fox", "ox", "wax"] },
  { id: "letter_y", letter: "y", shape: "thumb and pinky out — middle three folded down.",            hint: "extend thumb and pinky; index, middle, and ring fold to the palm — the 'hang loose' shape.",     words: ["yes", "you", "yak", "yard"] },
  { id: "letter_z", letter: "z", shape: "index extended, drawing a 'z' in the air.",                  hint: "point with the index and trace a clean z — three quick strokes, fingers stay tight.",            words: ["zip", "zoo", "zero", "zebra"] },
];

// fast id-keyed lookup for the alphabet detail pages.
export const ALPHABET_BY_ID: Record<LetterGestureId, AlphabetEntry> = ALPHABET_LIST.reduce(
  (acc, entry) => {
    acc[entry.id] = entry;
    return acc;
  },
  {} as Record<LetterGestureId, AlphabetEntry>,
);

export function letterToGestureId(letter: string): LetterGestureId | null {
  const ch = letter.toLowerCase();
  if (ch.length !== 1 || ch < "a" || ch > "z") return null;
  return `letter_${ch}` as LetterGestureId;
}

// turn a word into a sequence of letter gesture ids — used by the alphabet
// detail page to build a "spell this word" practice routine on the fly.
export function spellWord(word: string): LetterGestureId[] {
  const out: LetterGestureId[] = [];
  for (const ch of word) {
    const id = letterToGestureId(ch);
    if (id) out.push(id);
  }
  return out;
}
