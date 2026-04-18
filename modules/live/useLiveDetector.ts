"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { FilesetResolver, HandLandmarker } from "@mediapipe/tasks-vision";
import {
  compareNormalized,
  normalizeLandmarks,
  type CompareResult,
} from "@/modules/mirror/comparator";
import { GESTURES, type GestureId } from "@/modules/mirror/gestures";
import type { Landmark } from "@/modules/mirror/landmarks";

const MODEL_URL =
  "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task";
const WASM_BASE = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.15/wasm";

const LIVE_THRESHOLD = 0.65;

// phase 9: frozen once at module load so we don't rebuild the [id, ref]
// array every tick. GESTURES is a module-level constant, so this is safe.
const GESTURE_ENTRIES = Object.entries(GESTURES) as [GestureId, readonly Landmark[]][];

export type LiveMatch = {
  gestureId: GestureId;
  accuracy: number;
  result: CompareResult;
};

export type LiveFrame = {
  landmarks: Landmark[] | null;
  match: LiveMatch | null;
};

type Status = "idle" | "loading" | "ready" | "error";

// compares the user's hand against every registered gesture each tick and
// returns the best match above LIVE_THRESHOLD. phase 9: normalizes the user's
// landmarks once per tick and reuses that vector across all 27 gestures.
export function useLiveDetector({
  videoRef,
  enabled,
  intervalMs = 200,
}: {
  videoRef: React.RefObject<HTMLVideoElement>;
  enabled: boolean;
  intervalMs?: number;
}) {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [frame, setFrame] = useState<LiveFrame>({ landmarks: null, match: null });

  const landmarkerRef = useRef<HandLandmarker | null>(null);
  const rafRef = useRef<number | null>(null);
  const lastEvalRef = useRef(0);
  const cancelledRef = useRef(false);

  useEffect(() => {
    cancelledRef.current = false;
    setStatus("loading");
    (async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(WASM_BASE);
        const landmarker = await HandLandmarker.createFromOptions(vision, {
          baseOptions: { modelAssetPath: MODEL_URL, delegate: "GPU" },
          runningMode: "VIDEO",
          numHands: 1,
          minHandDetectionConfidence: 0.5,
          minHandPresenceConfidence: 0.5,
          minTrackingConfidence: 0.5,
        });
        if (cancelledRef.current) {
          landmarker.close();
          return;
        }
        landmarkerRef.current = landmarker;
        setStatus("ready");
      } catch (err) {
        setStatus("error");
        setError(err instanceof Error ? err.message : "failed to load model.");
      }
    })();
    return () => {
      cancelledRef.current = true;
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      landmarkerRef.current?.close();
      landmarkerRef.current = null;
    };
  }, []);

  const tick = useCallback(
    (now: number) => {
      rafRef.current = requestAnimationFrame(tick);
      const landmarker = landmarkerRef.current;
      const video = videoRef.current;
      if (!landmarker || !video || video.readyState < 2) return;
      if (now - lastEvalRef.current < intervalMs) return;
      lastEvalRef.current = now;

      const detection = landmarker.detectForVideo(video, now);
      const hand = detection.landmarks?.[0];
      if (!hand || hand.length === 0) {
        setFrame({ landmarks: null, match: null });
        return;
      }

      const landmarks: Landmark[] = hand.map((p) => ({ x: p.x, y: p.y, z: p.z }));
      // normalize once per frame, reuse across every gesture.
      const normalized = normalizeLandmarks(landmarks);

      let best: LiveMatch | null = null;
      for (const [gid, ref] of GESTURE_ENTRIES) {
        const result = compareNormalized(normalized, ref);
        if (result.accuracy >= LIVE_THRESHOLD) {
          if (!best || result.accuracy > best.accuracy) {
            best = { gestureId: gid, accuracy: result.accuracy, result };
          }
        }
      }

      setFrame({ landmarks, match: best });
    },
    [videoRef, intervalMs],
  );

  useEffect(() => {
    if (!enabled || status !== "ready") return;
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current != null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [enabled, status, tick]);

  return { status, error, frame };
}
