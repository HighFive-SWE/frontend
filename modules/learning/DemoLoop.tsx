"use client";

import { useEffect, useRef, useState } from "react";
import { GESTURES, type GestureId } from "@/modules/mirror/gestures";
import { HAND_CONNECTIONS } from "@/modules/mirror/landmarks";

type Props = {
  gestureId: GestureId;
  title: string;
  cadenceMs: number;
};

// a simple canvas "demo" that pulses between the rest pose and the target pose
// so the user has something to mirror. replace with real video clips once we
// have captures.
export function DemoLoop({ gestureId, title, cadenceMs }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [phase, setPhase] = useState(0); // 0 → 1 → 0 across one cadence.
  const rafRef = useRef<number | null>(null);
  const startedAtRef = useRef<number | null>(null);

  useEffect(() => {
    startedAtRef.current = null;
    const tick = (now: number) => {
      if (startedAtRef.current == null) startedAtRef.current = now;
      const elapsed = (now - startedAtRef.current) % cadenceMs;
      // ease in/out: 0 → 1 → 0.
      const x = elapsed / cadenceMs;
      const eased = 0.5 - 0.5 * Math.cos(x * Math.PI * 2);
      setPhase(eased);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, [cadenceMs, gestureId]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { width, height } = canvas.getBoundingClientRect();
    if (canvas.width !== Math.round(width) || canvas.height !== Math.round(height)) {
      canvas.width = Math.round(width);
      canvas.height = Math.round(height);
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const reference = GESTURES[gestureId];
    // interpolate between "rest" (collapsed toward wrist) and the target pose.
    const anchor = { x: 0.5, y: 0.72 };
    const span = 0.22 * canvas.height;

    const project = (i: number) => {
      const target = reference[i];
      const lerp = (v: number) => v * phase; // 0 → target.
      const localX = lerp(target.x) * (span / canvas.width);
      const localY = lerp(target.y) * (span / canvas.width);
      return {
        x: (1 - (anchor.x + localX)) * canvas.width, // flipped like selfie view.
        y: (anchor.y + localY) * canvas.height,
      };
    };

    ctx.strokeStyle = "rgba(255,255,255,0.92)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    for (const [a, b] of HAND_CONNECTIONS) {
      const pa = project(a);
      const pb = project(b);
      ctx.moveTo(pa.x, pa.y);
      ctx.lineTo(pb.x, pb.y);
    }
    ctx.stroke();

    for (let i = 0; i < reference.length; i += 1) {
      const { x, y } = project(i);
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255,255,255,0.95)";
      ctx.fill();
    }
  }, [phase, gestureId]);

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-gradient-to-br from-brand-500 via-brand-600 to-brand-700">
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
      <div className="absolute left-3 top-3 rounded-full bg-black/25 px-3 py-1 text-xs text-white">
        watch · {title}
      </div>
    </div>
  );
}
