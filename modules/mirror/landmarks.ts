// mediapipe hand landmark indices — 21 points per hand.
// keep connectivity definition in sync with the model.
export const LANDMARK_COUNT = 21;

export type Landmark = { x: number; y: number; z: number };

// bones to draw between landmark pairs — palm + five fingers.
export const HAND_CONNECTIONS: ReadonlyArray<readonly [number, number]> = [
  [0, 1], [1, 2], [2, 3], [3, 4],
  [0, 5], [5, 6], [6, 7], [7, 8],
  [5, 9], [9, 10], [10, 11], [11, 12],
  [9, 13], [13, 14], [14, 15], [15, 16],
  [13, 17], [17, 18], [18, 19], [19, 20],
  [0, 17],
];

// joint groups used for friendly error copy.
export const JOINT_LABELS: Record<number, string> = {
  0: "wrist",
  4: "thumb",
  8: "index",
  12: "middle",
  16: "ring",
  20: "pinky",
};

export function fingertipLabelFor(indices: readonly number[]): string[] {
  const tips = new Set<string>();
  for (const i of indices) {
    const label = JOINT_LABELS[i];
    if (label) tips.add(label);
  }
  return [...tips];
}
