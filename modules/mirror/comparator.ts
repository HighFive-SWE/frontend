import { LANDMARK_COUNT, type Landmark } from "./landmarks";

export type Band = "correct" | "partial" | "incorrect";

export type CompareResult = {
  accuracy: number;
  incorrectPoints: number[];
  band: Band;
};

// phase 6 recalibration: success now starts at 0.60, "partial" covers the
// encouragement range below that. excellent is a within-success tier used
// by the feedback copy + quality indicator — not a separate band.
const JOINT_DRIFT_THRESHOLD = 0.22;
const CORRECT = 0.60;
const PARTIAL = 0.40;

export function bandFor(accuracy: number): Band {
  if (accuracy >= CORRECT) return "correct";
  if (accuracy >= PARTIAL) return "partial";
  return "incorrect";
}

export function normalizeLandmarks(landmarks: readonly Landmark[]): Landmark[] {
  if (landmarks.length !== LANDMARK_COUNT) {
    throw new Error(`expected ${LANDMARK_COUNT} landmarks, got ${landmarks.length}`);
  }
  const wrist = landmarks[0];
  const centered = landmarks.map((p) => ({
    x: p.x - wrist.x,
    y: p.y - wrist.y,
    z: p.z - wrist.z,
  }));

  // palm span = wrist -> middle mcp. non-zero for any real detection.
  const palm = centered[9];
  const span = Math.hypot(palm.x, palm.y, palm.z);
  if (span < 1e-6) return centered;
  const inv = 1 / span;
  return centered.map((p) => ({ x: p.x * inv, y: p.y * inv, z: p.z * inv }));
}

function mirrorX(landmarks: readonly Landmark[]): Landmark[] {
  return landmarks.map((p) => ({ x: -p.x, y: p.y, z: p.z }));
}

function similarity(
  user: readonly Landmark[],
  ref: readonly Landmark[],
): { sim: number; perJoint: number[] } {
  const perJoint: number[] = new Array(user.length);
  let total = 0;
  for (let i = 0; i < user.length; i += 1) {
    const dx = user[i].x - ref[i].x;
    const dy = user[i].y - ref[i].y;
    const dz = user[i].z - ref[i].z;
    const d = Math.hypot(dx, dy, dz);
    perJoint[i] = d;
    total += d;
  }
  const mean = total / user.length;
  return { sim: Math.exp(-mean * 1.5), perJoint };
}

// phase 9: split the normalize step out so live mode can normalize once per
// frame and compare that single vector against 27 references — instead of
// re-normalizing inside every compareGesture() call. saves ~27x the work in
// the live loop for no behavior change.
export function compareNormalized(
  userNormalized: readonly Landmark[],
  reference: readonly Landmark[],
  { allowMirror = true }: { allowMirror?: boolean } = {},
): CompareResult {
  let best = similarity(userNormalized, reference);
  if (allowMirror) {
    const mirrored = similarity(userNormalized, mirrorX(reference));
    if (mirrored.sim > best.sim) best = mirrored;
  }
  const incorrectPoints: number[] = [];
  for (let i = 0; i < best.perJoint.length; i += 1) {
    if (best.perJoint[i] > JOINT_DRIFT_THRESHOLD) incorrectPoints.push(i);
  }
  return {
    accuracy: best.sim,
    incorrectPoints,
    band: bandFor(best.sim),
  };
}

export function compareGesture(
  landmarks: readonly Landmark[],
  reference: readonly Landmark[],
  options: { allowMirror?: boolean } = {},
): CompareResult {
  return compareNormalized(normalizeLandmarks(landmarks), reference, options);
}

// phase 9: small rolling smoother used by the trackers to remove flicker
// between consecutive frames. we average accuracy across the last N samples
// while keeping the most recent per-joint drift (so the skeleton highlights
// stay responsive to what the user is doing *right now*).
const SMOOTH_WINDOW = 4;

export class ResultSmoother {
  private readonly window: number;
  private buf: number[] = [];

  constructor(window: number = SMOOTH_WINDOW) {
    this.window = Math.max(1, window);
  }

  push(result: CompareResult): CompareResult {
    this.buf.push(result.accuracy);
    if (this.buf.length > this.window) this.buf.shift();
    const mean = this.buf.reduce((sum, v) => sum + v, 0) / this.buf.length;
    return {
      accuracy: mean,
      band: bandFor(mean),
      incorrectPoints: result.incorrectPoints,
    };
  }

  reset() {
    this.buf = [];
  }
}
