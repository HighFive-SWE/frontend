import { LANDMARK_COUNT, type Landmark } from "./landmarks";

export type Band = "correct" | "partial" | "incorrect";

export type CompareResult = {
  accuracy: number;
  incorrectPoints: number[];
  band: Band;
};

const JOINT_DRIFT_THRESHOLD = 0.22;
const CORRECT = 0.8;
const PARTIAL = 0.5;

function bandFor(accuracy: number): Band {
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

export function compareGesture(
  landmarks: readonly Landmark[],
  reference: readonly Landmark[],
  { allowMirror = true }: { allowMirror?: boolean } = {},
): CompareResult {
  const user = normalizeLandmarks(landmarks);
  let best = similarity(user, reference);

  if (allowMirror) {
    const mirrored = similarity(user, mirrorX(reference));
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
