"use client";

import { useCallback, useEffect, useState } from "react";
import { flushQueuedProgress } from "@/services/api";
import { queueLength } from "@/services/cache";

// phase 9: tiny hook over navigator.onLine + online/offline events. also
// drains the offline progress queue when we come back online so any writes
// the user made while disconnected land on the server without forcing them
// to re-trigger anything. intentionally passive — no toasts, no banners —
// the ui layer decides how to surface it.
export function useOnlineStatus() {
  const [online, setOnline] = useState<boolean>(() => {
    if (typeof navigator === "undefined") return true;
    return navigator.onLine;
  });
  const [queued, setQueued] = useState<number>(0);

  const refreshQueue = useCallback(() => {
    setQueued(queueLength());
  }, []);

  const drain = useCallback(async () => {
    if (queueLength() === 0) return;
    await flushQueuedProgress();
    refreshQueue();
  }, [refreshQueue]);

  useEffect(() => {
    refreshQueue();
    const handleOnline = () => {
      setOnline(true);
      // fire-and-forget drain; failures stay queued for the next reconnect.
      void drain();
    };
    const handleOffline = () => setOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    // the queue can grow between window events (e.g. a failed post while
    // the tab is still online) — re-check on visibility too.
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        refreshQueue();
        if (navigator.onLine) void drain();
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [drain, refreshQueue]);

  return { online, queued, refreshQueue };
}
