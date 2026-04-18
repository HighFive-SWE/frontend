"use client";

import { useOnlineStatus } from "@/hooks/useOnlineStatus";

// phase 9: small pill that only renders when the browser is offline or we
// have queued writes waiting to sync. deliberately quiet — no banner, no
// modal, no color-screaming red. the brief says "subtle indicator".
export function NetworkIndicator() {
  const { online, queued } = useOnlineStatus();

  if (online && queued === 0) return null;

  const offline = !online;
  return (
    <span
      role="status"
      aria-live="polite"
      className={[
        "hidden items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest md:inline-flex",
        offline
          ? "border-accent-peach/50 bg-accent-peach/15 text-ink"
          : "border-accent-mint/50 bg-accent-mint/15 text-ink",
      ].join(" ")}
      title={
        offline
          ? "you're offline — progress is saved locally and will sync when you reconnect"
          : `syncing ${queued} queued update${queued === 1 ? "" : "s"}`
      }
    >
      <span className="relative flex h-2 w-2">
        <span
          className={[
            "absolute inline-flex h-full w-full rounded-full",
            offline ? "bg-accent-peach" : "bg-accent-mint animate-pulseRing",
          ].join(" ")}
        />
        <span
          className={[
            "relative inline-flex h-2 w-2 rounded-full",
            offline ? "bg-accent-peach" : "bg-accent-mint",
          ].join(" ")}
        />
      </span>
      {offline ? "offline" : `syncing ${queued}`}
    </span>
  );
}
