"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/Button";
import { AccuracyBadge } from "@/modules/mirror/AccuracyBadge";
import { SkeletonOverlay } from "@/modules/mirror/SkeletonOverlay";
import { type GestureId } from "@/modules/mirror/gestures";
import { useHandTracker } from "@/modules/mirror/useHandTracker";
import { useAppStore, useStepMachineState } from "@/lib/store";
import type { Routine, RoutineStep } from "@/services/api";
import {
  GHOST_AT_FAILS,
  HINT_AT_FAILS,
  SLOW_MODE_AT_FAILS,
  difficultyFor,
  loopCadenceFor,
} from "./adaptive";
import { coachFor } from "./feedback";
import { DemoLoop } from "./DemoLoop";
import { GhostHand } from "./GhostHand";
import { useStepMachine } from "./useStepMachine";

type Props = {
  routine: Routine;
  onComplete: (attempts: number, avgAccuracy: number) => void;
  onExit: () => void;
};

type CameraState = "idle" | "requesting" | "live" | "denied" | "unsupported";

export function StepView({ routine, onComplete, onExit }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [cameraState, setCameraState] = useState<CameraState>("idle");
  const [cameraError, setCameraError] = useState<string | null>(null);

  const stepIndex = useStepMachineState((s) => s.stepIndex);
  const status = useStepMachineState((s) => s.status);
  const attempts = useStepMachineState((s) => s.attempts);
  const fails = useStepMachineState((s) => s.fails);

  const startRoutine = useAppStore((s) => s.startRoutine);
  const enterAttempt = useAppStore((s) => s.enterAttempt);
  const retryStep = useAppStore((s) => s.retryStep);
  const advance = useAppStore((s) => s.advance);
  const exitRoutine = useAppStore((s) => s.exitRoutine);

  const totalAttemptsRef = useRef(0);
  const allAccuraciesRef = useRef<number[]>([]);

  const currentStep: RoutineStep | null =
    stepIndex < routine.steps.length ? routine.steps[stepIndex] : null;
  const gestureId = (currentStep?.gesture_id ?? "hello") as GestureId;

  const difficulty = difficultyFor(fails);
  const cadenceMs = loopCadenceFor(difficulty);

  const tracker = useHandTracker({
    videoRef,
    gestureId,
    enabled: cameraState === "live" && status === "attempting",
  });

  // wire live comparator results into the step machine.
  useStepMachine({
    enabled: cameraState === "live",
    routineId: routine.id,
    currentGestureId: gestureId,
    result: tracker.frame.result,
    isFinalStep: stepIndex === routine.steps.length - 1,
  });

  // reset aggregate counters whenever the routine changes.
  useEffect(() => {
    startRoutine(routine.id, routine.steps.length);
    totalAttemptsRef.current = 0;
    allAccuraciesRef.current = [];
  }, [routine.id, routine.steps.length, startRoutine]);

  // accumulate per-step attempts/accuracy for the completion screen.
  useEffect(() => {
    if (status !== "attempting") return;
    if (!tracker.frame.result) return;
    totalAttemptsRef.current += 1;
    allAccuraciesRef.current.push(tracker.frame.result.accuracy);
  }, [status, tracker.frame.result]);

  // auto-advance after success; celebrate for 900 ms so it feels earned.
  useEffect(() => {
    if (status !== "success") return;
    const handle = window.setTimeout(() => {
      if (stepIndex >= routine.steps.length - 1) {
        const attemptsTotal = totalAttemptsRef.current || 1;
        const accs = allAccuraciesRef.current;
        const avg =
          accs.length === 0 ? 0 : accs.reduce((sum, n) => sum + n, 0) / accs.length;
        onComplete(attemptsTotal, avg);
      } else {
        advance();
        // camera is already live; keep the user in flow by entering the next attempt.
        enterAttempt();
      }
    }, 900);
    return () => window.clearTimeout(handle);
  }, [status, stepIndex, routine.steps.length, advance, enterAttempt, onComplete]);

  // release camera on unmount.
  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    };
  }, []);

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
  }, []);

  const startCamera = useCallback(async () => {
    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      setCameraState("unsupported");
      setCameraError("this browser does not support camera access.");
      return;
    }
    setCameraState("requesting");
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraState("live");
      enterAttempt();
    } catch (err) {
      setCameraState("denied");
      setCameraError(err instanceof Error ? err.message : "camera access was denied.");
    }
  }, [enterAttempt]);

  const handleExit = useCallback(() => {
    stopStream();
    exitRoutine();
    onExit();
  }, [stopStream, exitRoutine, onExit]);

  const hasHand = tracker.frame.landmarks != null;
  const coach = useMemo(
    () => coachFor(tracker.frame.result, hasHand, currentStep?.hint ?? ""),
    [tracker.frame.result, hasHand, currentStep?.hint],
  );

  if (!currentStep) return null;

  const showGhost = difficulty === "ghost";
  const detailedHint = fails >= HINT_AT_FAILS;

  return (
    <div className="grid gap-6 md:grid-cols-[1fr_1fr]">
      <div className="flex flex-col gap-4">
        <div className="rounded-3xl border border-ink/5 bg-white p-5 shadow-soft">
          <span className="pill w-fit">target · {currentStep.gesture_id}</span>
          <h3 className="mt-3 font-display text-2xl font-semibold">{currentStep.prompt}</h3>
          <p className="mt-1 text-ink-soft">{currentStep.hint}</p>
        </div>

        <DemoLoop gestureId={gestureId} title={currentStep.gesture_id} cadenceMs={cadenceMs} />

        {(fails >= HINT_AT_FAILS || status === "stuck") && (
          <AdaptiveStrip fails={fails} difficulty={difficulty} />
        )}
      </div>

      <div className="flex flex-col gap-4">
        <div className="relative overflow-hidden rounded-3xl border border-ink/5 bg-ink shadow-soft">
          <div className="relative aspect-video w-full">
            <video
              ref={videoRef}
              playsInline
              muted
              className={`h-full w-full -scale-x-100 object-cover transition-opacity ${
                cameraState === "live" ? "opacity-100" : "opacity-0"
              }`}
            />
            {cameraState === "live" && (
              <>
                <GhostHand
                  gestureId={gestureId}
                  userLandmarks={tracker.frame.landmarks}
                  visible={showGhost}
                />
                <SkeletonOverlay
                  landmarks={tracker.frame.landmarks}
                  incorrectPoints={tracker.frame.result?.incorrectPoints ?? []}
                  band={tracker.frame.result?.band ?? null}
                />
              </>
            )}

            {cameraState !== "live" && (
              <div className="absolute inset-0 grid place-items-center bg-gradient-to-br from-ink via-ink to-brand-700 text-white">
                <CameraMessage state={cameraState} error={cameraError} />
              </div>
            )}

            {cameraState === "live" && (
              <div className="absolute left-4 top-4 flex flex-wrap items-center gap-2">
                <AccuracyBadge
                  result={tracker.frame.result}
                  tracking={tracker.status === "ready" && hasHand}
                />
                {status === "success" && (
                  <span className="rounded-full bg-accent-mint/95 px-3 py-1 text-sm font-medium text-ink shadow-soft">
                    nailed it ✓
                  </span>
                )}
              </div>
            )}
          </div>

          {status === "success" && <SuccessGlow />}
        </div>

        <div className="rounded-3xl border border-ink/5 bg-white p-5 shadow-soft">
          <p className="text-sm uppercase tracking-widest text-ink-faint">coach</p>
          <p className="mt-1 font-display text-lg">{coach.headline}</p>
          {(coach.detail || detailedHint) && (
            <p className="mt-2 text-ink-soft">
              {coach.detail ?? currentStep.hint}
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {cameraState !== "live" ? (
            <Button
              onClick={startCamera}
              size="lg"
              disabled={cameraState === "requesting"}
            >
              {cameraState === "requesting" ? "requesting…" : "start practice"}
            </Button>
          ) : (
            <>
              <Button onClick={retryStep} variant="ghost" size="lg" disabled={status !== "attempting"}>
                retry step
              </Button>
              <Button onClick={handleExit} variant="ghost" size="lg">
                exit routine
              </Button>
            </>
          )}
          <span className="text-sm text-ink-faint">
            attempts · {attempts}
            {fails >= SLOW_MODE_AT_FAILS && " · slow mode"}
            {fails >= GHOST_AT_FAILS && " · ghost guide on"}
          </span>
        </div>
      </div>
    </div>
  );
}

function AdaptiveStrip({
  fails,
  difficulty,
}: {
  fails: number;
  difficulty: "normal" | "hint" | "slow" | "ghost";
}) {
  const items: { label: string; active: boolean }[] = [
    { label: `detailed hint · ${HINT_AT_FAILS} fails`, active: fails >= HINT_AT_FAILS },
    { label: `slow loop · ${SLOW_MODE_AT_FAILS} fails`, active: fails >= SLOW_MODE_AT_FAILS },
    { label: `ghost hand · ${GHOST_AT_FAILS} fails`, active: fails >= GHOST_AT_FAILS },
  ];
  return (
    <div className="rounded-3xl border border-ink/5 bg-surface-muted p-4">
      <p className="text-xs uppercase tracking-widest text-ink-faint">adaptive guidance</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {items.map((item) => (
          <span
            key={item.label}
            className={`rounded-full px-3 py-1 text-xs font-medium transition ${
              item.active ? "bg-brand-500 text-white" : "bg-white text-ink-soft"
            }`}
          >
            {item.label}
          </span>
        ))}
      </div>
      <p className="mt-2 text-xs text-ink-faint">
        staying at <span className="font-medium">{difficulty}</span> mode — take your time.
      </p>
    </div>
  );
}

function SuccessGlow() {
  // soft pulse layered over the whole camera tile on success.
  return (
    <div className="pointer-events-none absolute inset-0 animate-[ping_800ms_ease-out_1] rounded-3xl ring-4 ring-accent-mint/70" />
  );
}

function CameraMessage({
  state,
  error,
}: {
  state: CameraState;
  error: string | null;
}) {
  if (state === "denied") {
    return (
      <div className="max-w-md px-8 text-center">
        <p className="font-display text-lg">camera permission was blocked.</p>
        <p className="mt-2 text-sm text-white/70">{error}</p>
      </div>
    );
  }
  if (state === "unsupported") {
    return (
      <div className="max-w-md px-8 text-center">
        <p className="font-display text-lg">camera not supported here.</p>
        <p className="mt-2 text-sm text-white/70">{error}</p>
      </div>
    );
  }
  if (state === "requesting") {
    return <p className="font-display text-lg">asking your browser for camera access…</p>;
  }
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="grid h-16 w-16 place-items-center rounded-full bg-white/15 text-3xl">📷</div>
      <p className="font-display text-lg">camera is off</p>
      <p className="text-sm text-white/70">tap start practice to begin.</p>
    </div>
  );
}
