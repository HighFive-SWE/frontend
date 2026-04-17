"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/Button";
import { AccuracyBadge } from "@/modules/mirror/AccuracyBadge";
import { CoachHint } from "@/modules/mirror/CoachHint";
import { SkeletonOverlay } from "@/modules/mirror/SkeletonOverlay";
import { GESTURE_LIST, type GestureId } from "@/modules/mirror/gestures";
import { useHandTracker } from "@/modules/mirror/useHandTracker";

type CameraState = "idle" | "requesting" | "live" | "denied" | "unsupported";

export default function MirrorPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [cameraState, setCameraState] = useState<CameraState>("idle");
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [gestureId, setGestureId] = useState<GestureId>("hello");

  const tracker = useHandTracker({
    videoRef,
    gestureId,
    enabled: cameraState === "live",
  });

  useEffect(() => {
    return () => stopStream();
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
    } catch (err) {
      setCameraState("denied");
      setCameraError(err instanceof Error ? err.message : "camera access was denied.");
    }
  }, []);

  const handleStop = useCallback(() => {
    stopStream();
    setCameraState("idle");
  }, [stopStream]);

  const activeGesture = GESTURE_LIST.find((g) => g.id === gestureId) ?? GESTURE_LIST[0];
  const hasHand = tracker.frame.landmarks != null;

  return (
    <div className="container-page flex flex-col gap-8 py-12">
      <header className="flex flex-col gap-2">
        <p className="font-mono text-xs tracking-wide text-ink-faint">mirror mode</p>
        <h1 className="font-display text-3xl font-bold md:text-4xl">sign, see, adjust</h1>
        <p className="max-w-2xl text-ink-soft">
          your camera stays on-device. we track 21 hand landmarks, compare to the target sign, and
          colour the skeleton so you can see where to tweak.
        </p>
      </header>

      <GesturePicker active={gestureId} onChange={setGestureId} />

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
            <SkeletonOverlay
              landmarks={tracker.frame.landmarks}
              incorrectPoints={tracker.frame.result?.incorrectPoints ?? []}
              band={tracker.frame.result?.band ?? null}
            />
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
              {tracker.status === "loading" && (
                <span className="rounded-full bg-black/40 px-3 py-1 text-xs text-white">
                  loading model…
                </span>
              )}
              {tracker.status === "error" && (
                <span className="rounded-full bg-[#ff8fa3]/90 px-3 py-1 text-xs text-ink">
                  tracker error
                </span>
              )}
            </div>
          )}

          <p className="absolute bottom-3 right-4 rounded-full bg-black/35 px-3 py-1 text-xs text-white/80">
            target · {activeGesture.title}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {cameraState !== "live" ? (
          <Button onClick={startCamera} size="lg" disabled={cameraState === "requesting"}>
            {cameraState === "requesting" ? "requesting…" : "turn on camera"}
          </Button>
        ) : (
          <Button onClick={handleStop} variant="ghost" size="lg">
            stop camera
          </Button>
        )}
        <p className="text-sm text-ink-faint">video never leaves your browser.</p>
      </div>

      {cameraState === "live" && (
        <CoachHint
          result={tracker.frame.result}
          hasHand={hasHand}
          gestureHint={activeGesture.hint}
        />
      )}
    </div>
  );
}

function GesturePicker({
  active,
  onChange,
}: {
  active: GestureId;
  onChange: (id: GestureId) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {GESTURE_LIST.map((g) => {
        const selected = g.id === active;
        return (
          <button
            key={g.id}
            type="button"
            onClick={() => onChange(g.id)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
              selected
                ? "bg-brand-500 text-white"
                : "bg-surface-muted text-ink-soft hover:bg-ink/5"
            }`}
          >
            {g.title}
          </button>
        );
      })}
    </div>
  );
}

function CameraMessage({ state, error }: { state: CameraState; error: string | null }) {
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
      <div className="grid h-12 w-12 place-items-center rounded-xl bg-white/10 font-mono text-sm font-bold">cam</div>
      <p className="font-display text-lg">camera is off</p>
      <p className="text-sm text-white/70">tap the button below to begin.</p>
    </div>
  );
}
