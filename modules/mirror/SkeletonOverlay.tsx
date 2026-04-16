"use client";

import { useEffect, useRef } from "react";
import type { Band } from "./comparator";
import { HAND_CONNECTIONS, type Landmark } from "./landmarks";

type Props = {
  landmarks: Landmark[] | null;
  incorrectPoints: readonly number[];
  band: Band | null;
  mirrored?: boolean; // selfie view flips x on display; overlay must match.
};

const colorForBand: Record<Band, string> = {
  correct: "#7cd6b6",
  partial: "#ffc8a8",
  incorrect: "#ff8fa3",
};

export function SkeletonOverlay({ landmarks, incorrectPoints, band, mirrored = true }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { width, height } = canvas.getBoundingClientRect();
    // keep the drawing buffer matched to display size for crisp lines.
    if (canvas.width !== Math.round(width) || canvas.height !== Math.round(height)) {
      canvas.width = Math.round(width);
      canvas.height = Math.round(height);
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!landmarks || !band) return;

    const project = (p: Landmark) => ({
      x: (mirrored ? 1 - p.x : p.x) * canvas.width,
      y: p.y * canvas.height,
    });

    const stroke = colorForBand[band];
    const drifted = new Set(incorrectPoints);

    ctx.lineWidth = 3;
    ctx.strokeStyle = stroke;
    ctx.beginPath();
    for (const [a, b] of HAND_CONNECTIONS) {
      const pa = project(landmarks[a]);
      const pb = project(landmarks[b]);
      ctx.moveTo(pa.x, pa.y);
      ctx.lineTo(pb.x, pb.y);
    }
    ctx.stroke();

    for (let i = 0; i < landmarks.length; i += 1) {
      const { x, y } = project(landmarks[i]);
      const off = drifted.has(i);
      ctx.beginPath();
      ctx.arc(x, y, off ? 6 : 4, 0, Math.PI * 2);
      ctx.fillStyle = off ? "#ff6b85" : stroke;
      ctx.fill();
      if (off) {
        ctx.beginPath();
        ctx.arc(x, y, 10, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(255,107,133,0.55)";
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    }
  }, [landmarks, incorrectPoints, band, mirrored]);

  return <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 h-full w-full" />;
}
