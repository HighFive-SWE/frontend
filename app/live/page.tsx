"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/Button";
import { SkeletonOverlay } from "@/modules/mirror/SkeletonOverlay";
import { useLiveDetector } from "@/modules/live/useLiveDetector";
import { usePhraseBuilder } from "@/modules/live/usePhraseBuilder";

type CameraState = "idle" | "requesting" | "live" | "denied" | "disconnected";

export default function LivePage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [cameraState, setCameraState] = useState<CameraState>("idle");

  const detector = useLiveDetector({
    videoRef,
    enabled: cameraState === "live",
  });

  const builder = usePhraseBuilder();

  // feed each detector frame into the phrase builder.
  useEffect(() => {
    const match = detector.frame.match;
    builder.feed(match?.gestureId ?? null, performance.now());
  }, [detector.frame.match, builder]);

  const startCamera = useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia) return;
    setCameraState("requesting");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = stream;
      // phase 9: catch sudden camera unplug / lid close — without this the
      // detector quietly stops getting frames and the readout just freezes.
      stream.getTracks().forEach((track) => {
        track.addEventListener(
          "ended",
          () => {
            if (streamRef.current === stream) {
              streamRef.current = null;
              setCameraState("disconnected");
            }
          },
          { once: true },
        );
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraState("live");
    } catch {
      setCameraState("denied");
    }
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    return () => {
      // phase 9: release both the MediaStream tracks *and* the srcObject
      // pointer — chromium otherwise hangs on to the decoder until the
      // next GC cycle, which shows up as a red camera-in-use indicator
      // long after the user leaves the page.
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
      if (video) video.srcObject = null;
    };
  }, []);

  const match = detector.frame.match;
  const hasHand = detector.frame.landmarks != null;
  const phraseText = builder.phrase
    .map((g) => g.replace(/_/g, " "))
    .join("  ");

  return (
    <div className="relative flex min-h-[calc(100dvh-4rem)] flex-col bg-ink text-white">
      {/* camera */}
      <div className="relative flex-1">
        <video
          ref={videoRef}
          playsInline
          muted
          className={`absolute inset-0 h-full w-full -scale-x-100 object-cover transition-opacity ${
            cameraState === "live" ? "opacity-60" : "opacity-0"
          }`}
        />

        {cameraState === "live" && (
          <SkeletonOverlay
            landmarks={detector.frame.landmarks}
            incorrectPoints={match?.result.incorrectPoints ?? []}
            band={match?.result.band ?? null}
          />
        )}

        {/* center readout */}
        <div className="relative z-10 flex h-full flex-col items-center justify-center gap-6 px-6">
          {cameraState !== "live" && (
            <div className="flex flex-col items-center gap-4">
              <div className="grid h-14 w-14 place-items-center rounded-xl bg-white/10 font-display text-xl font-bold">
                H
              </div>
              <h1 className="font-display text-3xl font-bold">live mode</h1>
              <p className="max-w-md text-center text-white/60">
                sign freely — HighFive watches your hand and builds a sentence in real time.
              </p>
              <Button
                onClick={startCamera}
                size="lg"
                disabled={cameraState === "requesting"}
              >
                {cameraState === "requesting" ? "requesting…" : "start camera"}
              </Button>
              {cameraState === "denied" && (
                <p className="text-sm text-red-400">camera access was denied.</p>
              )}
              {cameraState === "disconnected" && (
                <p className="text-sm text-accent-peach">
                  camera dropped out — tap start to reconnect.
                </p>
              )}
            </div>
          )}

          {cameraState === "live" && (
            <>
              {/* current gesture */}
              <div className="flex flex-col items-center gap-2">
                <p className="text-xs uppercase tracking-widest text-white/40">
                  {hasHand
                    ? match
                      ? "detected"
                      : "no clear match"
                    : "show your hand"}
                </p>
                <p className="font-display text-5xl font-bold tracking-tight md:text-7xl">
                  {match ? match.gestureId.replace(/_/g, " ") : "—"}
                </p>
                {match && (
                  <p className="text-sm text-white/50">
                    {Math.round(match.accuracy * 100)}% confidence
                  </p>
                )}
                {builder.stableGesture && (
                  <span className="mt-1 rounded-full bg-accent-mint/80 px-3 py-1 text-xs font-medium text-ink">
                    locked
                  </span>
                )}
              </div>

              {/* phrase */}
              <div className="w-full max-w-3xl rounded-2xl bg-white/5 px-6 py-4 backdrop-blur-sm">
                <p className="text-xs uppercase tracking-widest text-white/30">phrase</p>
                <p className="mt-2 min-h-[2rem] font-display text-2xl font-medium md:text-3xl">
                  {phraseText || "start signing to build a sentence…"}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Button variant="ghost" size="sm" onClick={builder.removeLast}>
                  undo last
                </Button>
                <Button variant="ghost" size="sm" onClick={builder.clear}>
                  clear phrase
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
