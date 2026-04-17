"use client";

import { useCallback, useRef, useState } from "react";
import type { GestureId } from "@/modules/mirror/gestures";

const STABILITY_MS = 500;

// holds a gesture stable for STABILITY_MS before appending it to the phrase.
// prevents flicker from noisy detection frames.
export function usePhraseBuilder() {
  const [phrase, setPhrase] = useState<GestureId[]>([]);
  const [stableGesture, setStableGesture] = useState<GestureId | null>(null);

  const candidateRef = useRef<GestureId | null>(null);
  const candidateStartRef = useRef(0);
  const lastAppendedRef = useRef<GestureId | null>(null);

  const feed = useCallback((gestureId: GestureId | null, now: number) => {
    if (gestureId === null) {
      candidateRef.current = null;
      candidateStartRef.current = 0;
      setStableGesture(null);
      return;
    }

    if (gestureId !== candidateRef.current) {
      candidateRef.current = gestureId;
      candidateStartRef.current = now;
      setStableGesture(null);
      return;
    }

    const held = now - candidateStartRef.current;
    if (held >= STABILITY_MS) {
      setStableGesture(gestureId);
      // only append if it's different from the last appended gesture (avoid
      // repeats while holding the same sign).
      if (gestureId !== lastAppendedRef.current) {
        lastAppendedRef.current = gestureId;
        setPhrase((prev) => [...prev, gestureId]);
      }
    }
  }, []);

  const clear = useCallback(() => {
    setPhrase([]);
    setStableGesture(null);
    candidateRef.current = null;
    candidateStartRef.current = 0;
    lastAppendedRef.current = null;
  }, []);

  const removeLast = useCallback(() => {
    setPhrase((prev) => {
      const next = prev.slice(0, -1);
      lastAppendedRef.current = next[next.length - 1] ?? null;
      return next;
    });
  }, []);

  return { phrase, stableGesture, feed, clear, removeLast };
}
