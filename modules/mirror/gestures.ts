// reference gestures — wrist-centered, palm-span (landmark 9) scaled to 1.
// must stay in sync with /vision/gestures/samples.py.

import type { Landmark } from "./landmarks";

export type GestureId = "hello" | "water";

type Reference = readonly Landmark[];

const HELLO: Reference = [
  { x: 0.0, y: 0.0, z: 0.0 },
  { x: -0.25, y: -0.15, z: 0.0 },
  { x: -0.55, y: -0.3, z: -0.02 },
  { x: -0.75, y: -0.5, z: -0.04 },
  { x: -0.9, y: -0.7, z: -0.06 },
  { x: -0.22, y: -0.95, z: 0.0 },
  { x: -0.22, y: -1.3, z: 0.0 },
  { x: -0.22, y: -1.55, z: 0.0 },
  { x: -0.22, y: -1.75, z: 0.0 },
  { x: 0.0, y: -1.0, z: 0.0 },
  { x: 0.0, y: -1.4, z: 0.0 },
  { x: 0.0, y: -1.65, z: 0.0 },
  { x: 0.0, y: -1.85, z: 0.0 },
  { x: 0.22, y: -0.95, z: 0.0 },
  { x: 0.22, y: -1.3, z: 0.0 },
  { x: 0.22, y: -1.55, z: 0.0 },
  { x: 0.22, y: -1.72, z: 0.0 },
  { x: 0.4, y: -0.9, z: 0.0 },
  { x: 0.4, y: -1.2, z: 0.0 },
  { x: 0.4, y: -1.4, z: 0.0 },
  { x: 0.4, y: -1.55, z: 0.0 },
];

const WATER: Reference = [
  { x: 0.0, y: 0.0, z: 0.0 },
  { x: -0.2, y: -0.2, z: 0.0 },
  { x: -0.1, y: -0.4, z: -0.05 },
  { x: 0.0, y: -0.5, z: -0.1 },
  { x: 0.1, y: -0.6, z: -0.15 },
  { x: -0.22, y: -0.95, z: 0.0 },
  { x: -0.22, y: -1.3, z: 0.0 },
  { x: -0.22, y: -1.55, z: 0.0 },
  { x: -0.22, y: -1.75, z: 0.0 },
  { x: 0.0, y: -1.0, z: 0.0 },
  { x: 0.0, y: -1.4, z: 0.0 },
  { x: 0.0, y: -1.65, z: 0.0 },
  { x: 0.0, y: -1.85, z: 0.0 },
  { x: 0.22, y: -0.95, z: 0.0 },
  { x: 0.22, y: -1.3, z: 0.0 },
  { x: 0.22, y: -1.55, z: 0.0 },
  { x: 0.22, y: -1.72, z: 0.0 },
  { x: 0.4, y: -0.9, z: 0.0 },
  { x: 0.35, y: -0.7, z: -0.1 },
  { x: 0.25, y: -0.55, z: -0.15 },
  { x: 0.15, y: -0.55, z: -0.18 },
];

export const GESTURES: Record<GestureId, Reference> = {
  hello: HELLO,
  water: WATER,
};

export const GESTURE_LIST: { id: GestureId; title: string; hint: string }[] = [
  { id: "hello", title: "hello", hint: "open palm, fingers up, gentle wave." },
  { id: "water", title: "water", hint: "'w' shape — index, middle, ring up; thumb across palm." },
];
