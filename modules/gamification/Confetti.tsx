"use client";

import { useEffect, useRef } from "react";
import { useAppStore } from "@/lib/store";

// lightweight canvas confetti — 60 frames, no deps. triggers whenever
// `confettiBurstId` increments in the store. intentionally subtle.
type Piece = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rot: number;
  vr: number;
  color: string;
  size: number;
};

const COLORS = ["#7cd6b6", "#ffc8a8", "#c7b8ff", "#4b6eff"];
const PIECE_COUNT = 70;
const DURATION_MS = 1200;

export function Confetti() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number | null>(null);
  const piecesRef = useRef<Piece[]>([]);
  const startedAtRef = useRef<number | null>(null);
  const burstId = useAppStore((s) => s.confettiBurstId);

  useEffect(() => {
    if (burstId === 0) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    piecesRef.current = seedPieces(canvas.width);
    startedAtRef.current = null;

    const tick = (now: number) => {
      if (startedAtRef.current == null) startedAtRef.current = now;
      const elapsed = now - startedAtRef.current;
      const remaining = DURATION_MS - elapsed;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (const p of piecesRef.current) {
        p.vy += 0.25;
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.vr;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, remaining / DURATION_MS);
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.4);
        ctx.restore();
      }

      if (remaining > 0) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        rafRef.current = null;
      }
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, [burstId]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-50"
    />
  );
}

function seedPieces(width: number): Piece[] {
  const pieces: Piece[] = [];
  for (let i = 0; i < PIECE_COUNT; i += 1) {
    pieces.push({
      x: Math.random() * width,
      y: -20 - Math.random() * 60,
      vx: -2 + Math.random() * 4,
      vy: 2 + Math.random() * 3,
      rot: Math.random() * Math.PI,
      vr: -0.15 + Math.random() * 0.3,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      size: 8 + Math.random() * 6,
    });
  }
  return pieces;
}
