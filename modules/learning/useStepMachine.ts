"use client";

import { useEffect, useRef } from "react";
import { useAppStore, useStepMachineState } from "@/lib/store";
import type { CompareResult } from "@/modules/mirror/comparator";
import { postProgress } from "@/services/api";
import {
  SUCCESS_ACCURACY_FLOOR,
  SUCCESS_CONSECUTIVE,
  difficultyFor,
  qualityFor,
} from "./adaptive";

type Params = {
  enabled: boolean;
  routineId: string | null;
  currentGestureId: string | null;
  result: CompareResult | null;
  isFinalStep: boolean;
};

// wires live CV results into the zustand step machine:
//   - counts consecutive "correct" samples → declares success
//   - persists attempts + accuracy to the backend as progress records
//   - reports no success repeatedly → bumps fail counter → drives adaptive layer
export function useStepMachine({
  enabled,
  routineId,
  currentGestureId,
  result,
  isFinalStep,
}: Params) {
  const status = useStepMachineState((s) => s.status);
  const stepIndex = useStepMachineState((s) => s.stepIndex);
  const attempts = useStepMachineState((s) => s.attempts);
  const fails = useStepMachineState((s) => s.fails);
  const bestAccuracy = useStepMachineState((s) => s.bestAccuracy);

  const recordSample = useAppStore((s) => s.recordSample);
  const pushAccuracy = useAppStore((s) => s.pushAccuracy);
  const profileId = useAppStore((s) => s.currentProfileId);
  const applyProgressResult = useAppStore((s) => s.applyProgressResult);

  const consecutiveRef = useRef(0);
  const lastSampleAtRef = useRef(0);
  const lastPostedStepRef = useRef<number | null>(null);
  const lastIncorrectRef = useRef<number[]>([]);

  // reset the consecutive counter whenever the active step changes.
  useEffect(() => {
    consecutiveRef.current = 0;
    lastSampleAtRef.current = 0;
    lastIncorrectRef.current = [];
  }, [stepIndex, routineId]);

  // feed each new comparator result into the machine.
  useEffect(() => {
    if (!enabled || status !== "attempting") return;
    if (!result) return;

    // debounce — only accept a new sample every ~220 ms (matches tracker cadence).
    const now = performance.now();
    if (now - lastSampleAtRef.current < 200) return;
    lastSampleAtRef.current = now;

    const passed = result.accuracy >= SUCCESS_ACCURACY_FLOOR;
    consecutiveRef.current = passed ? consecutiveRef.current + 1 : 0;
    const cleared = consecutiveRef.current >= SUCCESS_CONSECUTIVE;
    // stash the most recent incorrect_points so the success POST can include
    // finger-heat telemetry for phase 6 analytics.
    lastIncorrectRef.current = result.incorrectPoints;

    recordSample(result.accuracy, cleared);
    pushAccuracy(result.accuracy);
  }, [enabled, status, result, recordSample, pushAccuracy]);

  // once a step succeeds, fire a single POST /progress (fire-and-forget).
  useEffect(() => {
    if (status !== "success") return;
    if (!routineId || !currentGestureId || !profileId) return;
    if (lastPostedStepRef.current === stepIndex) return;
    lastPostedStepRef.current = stepIndex;

    // use latest values at the moment of success. route the response through
    // the gamification slice so HUD, toasts, confetti, and mascot react.
    // phase 5: progress is tied to the active profile, not the account.
    void postProgress({
      profileId,
      routineId,
      gestureId: currentGestureId,
      accuracy: bestAccuracy,
      band: "correct",
      attempts: Math.max(attempts, 1),
      succeeded: true,
      completedRoutine: isFinalStep,
      incorrectPoints: lastIncorrectRef.current,
    })
      .then((res) => {
        if (res) applyProgressResult(res);
      })
      .catch(() => {
        /* backend is optional — ignore network errors. */
      });
  }, [
    status,
    routineId,
    stepIndex,
    currentGestureId,
    bestAccuracy,
    attempts,
    isFinalStep,
    profileId,
    applyProgressResult,
  ]);

  // reset the "last posted" guard when the routine restarts.
  useEffect(() => {
    lastPostedStepRef.current = null;
  }, [routineId]);

  return {
    difficulty: difficultyFor(fails),
    bestAccuracy,
    quality: qualityFor(bestAccuracy),
  };
}
