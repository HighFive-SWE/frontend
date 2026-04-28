"use client";

import { useCallback, useRef, useState } from "react";
import type { GestureId } from "@/modules/mirror/gestures";

const STABILITY_MS = 500;
// phase 9: minimum gap between two appends of the *same* gesture. paired with
// the must-release rule below — together they prevent "hello → hello → hello"
// spam from a held pose plus avoid two appends from a brief detection blip.
const REPEAT_COOLDOWN_MS = 400;

// holds a gesture stable for STABILITY_MS before appending it to the phrase.
// prevents flicker from noisy detection frames.
//
// phase 9 hardening:
//   - a gesture must "release" (be replaced by null or a different gestureId)
//     before the same gesture can be appended again.
//   - even after release, a 400ms cooldown gates the second append so a sub-
//     second detection blip can't sneak in a duplicate.
export function usePhraseBuilder() {
  const [phrase, setPhrase] = useState<GestureId[]>([]);
  const [stableGesture, setStableGesture] = useState<GestureId | null>(null);

  const candidateRef = useRef<GestureId | null>(null);
  const candidateStartRef = useRef(0);
  const lastAppendedRef = useRef<GestureId | null>(null);
  const lastAppendedAtRef = useRef(0);
  // true once the most-recently-appended gesture has been released (replaced
  // by null or a different candidate). seeded true so the first append works.
  const releasedRef = useRef(true);

  const feed = useCallback((gestureId: GestureId | null, now: number) => {
    if (gestureId === null) {
      candidateRef.current = null;
      candidateStartRef.current = 0;
      releasedRef.current = true;
      setStableGesture(null);
      return;
    }

    if (gestureId !== candidateRef.current) {
      candidateRef.current = gestureId;
      candidateStartRef.current = now;
      // a different candidate arriving counts as a release of whatever was
      // previously appended — the user has moved on.
      if (gestureId !== lastAppendedRef.current) releasedRef.current = true;
      setStableGesture(null);
      return;
    }

    const held = now - candidateStartRef.current;
    if (held < STABILITY_MS) return;

    setStableGesture(gestureId);
    const isRepeat = gestureId === lastAppendedRef.current;
    if (isRepeat) {
      if (!releasedRef.current) return; // pose still held — ignore.
      if (now - lastAppendedAtRef.current < REPEAT_COOLDOWN_MS) return;
    }

    lastAppendedRef.current = gestureId;
    lastAppendedAtRef.current = now;
    releasedRef.current = false;
    setPhrase((prev) => [...prev, gestureId]);
  }, []);

  const clear = useCallback(() => {
    setPhrase([]);
    setStableGesture(null);
    candidateRef.current = null;
    candidateStartRef.current = 0;
    lastAppendedRef.current = null;
    lastAppendedAtRef.current = 0;
    releasedRef.current = true;
  }, []);

  const removeLast = useCallback(() => {
    setPhrase((prev) => {
      const next = prev.slice(0, -1);
      lastAppendedRef.current = next[next.length - 1] ?? null;
      // undoing should let the user re-sign the same gesture immediately.
      releasedRef.current = true;
      return next;
    });
  }, []);

  return { phrase, stableGesture, feed, clear, removeLast };
}
