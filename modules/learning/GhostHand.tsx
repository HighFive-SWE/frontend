"use client";

import { useEffect, useRef } from "react";
import { GESTURES, type GestureId } from "@/modules/mirror/gestures";
import { HAND_CONNECTIONS, type Landmark } from "@/modules/mirror/landmarks";

type Props = {
  gestureId: GestureId;
  userLandmarks: Landmark[] | null;
  mirrored?: boolean; // matches the video's selfie flip.
  visible: boolean;
};

// default placement when no user hand is detected — center of the frame.
const DEFAULT_ANCHOR = { x: 0.5, y: 0.62 };
const DEFAULT_PALM_SPAN = 0.18;

export function GhostHand({ gestureId, userLandmarks, mirrored = true, visible }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

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
    if (!visible) return;

    const reference = GESTURES[gestureId];
    // anchor the ghost at the user's wrist if visible, scaled to their palm span.
    let anchor = DEFAULT_ANCHOR;
    let span = DEFAULT_PALM_SPAN;
    if (userLandmarks) {
      anchor = { x: userLandmarks[0].x, y: userLandmarks[0].y };
      const palm = userLandmarks[9];
      const dx = palm.x - userLandmarks[0].x;
      const dy = palm.y - userLandmarks[0].y;
      const dz = (palm.z ?? 0) - (userLandmarks[0].z ?? 0);
      span = Math.hypot(dx, dy, dz) || DEFAULT_PALM_SPAN;
    }

    const project = (p: Landmark) => {
      const nx = anchor.x + p.x * span;
      const ny = anchor.y + p.y * span;
      return {
        x: (mirrored ? 1 - nx : nx) * canvas.width,
        y: ny * canvas.height,
      };
    };

    ctx.save();
    ctx.globalAlpha = 0.55;
    ctx.strokeStyle = "#c7b8ff"; // soft lilac — reads as guidance, not correction.
    ctx.lineWidth = 3;
    ctx.setLineDash([6, 4]);
    ctx.beginPath();
    for (const [a, b] of HAND_CONNECTIONS) {
      const pa = project(reference[a]);
      const pb = project(reference[b]);
      ctx.moveTo(pa.x, pa.y);
      ctx.lineTo(pb.x, pb.y);
    }
    ctx.stroke();

    ctx.setLineDash([]);
    ctx.globalAlpha = 0.8;
    for (const point of reference) {
      const { x, y } = project(point);
      ctx.beginPath();
      ctx.arc(x, y, 3.5, 0, Math.PI * 2);
      ctx.fillStyle = "#c7b8ff";
      ctx.fill();
    }
    ctx.restore();
  }, [gestureId, userLandmarks, mirrored, visible]);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 h-full w-full transition-opacity duration-300"
      style={{ opacity: visible ? 1 : 0 }}
    />
  );
}
