"use client";

import { FilesetResolver, HandLandmarker } from "@mediapipe/tasks-vision";
import { useCallback, useEffect, useRef, useState } from "react";
import { compareGesture, ResultSmoother, type CompareResult } from "./comparator";
import { GESTURES, type GestureId } from "./gestures";
import type { Landmark } from "./landmarks";

type Status = "idle" | "loading" | "ready" | "error";

type Options = {
  videoRef: React.RefObject<HTMLVideoElement>;
  gestureId: GestureId;
  evaluationIntervalMs?: number;
  enabled: boolean;
};

export type TrackerFrame = {
  landmarks: Landmark[] | null;
  result: CompareResult | null;
};

const MODEL_URL =
  "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task";
const WASM_BASE = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.15/wasm";

export function useHandTracker({
  videoRef,
  gestureId,
  evaluationIntervalMs = 220,
  enabled,
}: Options) {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [frame, setFrame] = useState<TrackerFrame>({ landmarks: null, result: null });

  const landmarkerRef = useRef<HandLandmarker | null>(null);
  const rafRef = useRef<number | null>(null);
  const lastEvalRef = useRef(0);
  const cancelledRef = useRef(false);
  // phase 9: per-gesture rolling smoother. resets when the active gesture
  // changes so a previous target's history can't bleed into a new step.
  const smootherRef = useRef(new ResultSmoother(4));

  useEffect(() => {
    smootherRef.current.reset();
  }, [gestureId]);

  // load the model once per mount.
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
        setError(err instanceof Error ? err.message : "failed to load hand tracker.");
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

      const sinceLast = now - lastEvalRef.current;
      if (sinceLast < evaluationIntervalMs) return;
      lastEvalRef.current = now;

      const detection = landmarker.detectForVideo(video, now);
      const hand = detection.landmarks?.[0];
      if (!hand || hand.length === 0) {
        smootherRef.current.reset();
        setFrame({ landmarks: null, result: null });
        return;
      }

      const landmarks: Landmark[] = hand.map((p) => ({ x: p.x, y: p.y, z: p.z }));
      const reference = GESTURES[gestureId];
      const raw = compareGesture(landmarks, reference);
      const result = smootherRef.current.push(raw);
      setFrame({ landmarks, result });
    },
    [videoRef, gestureId, evaluationIntervalMs],
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
