"use client";

import { Confetti } from "./Confetti";
import { EventToasts } from "./EventToasts";
import { Mascot } from "./Mascot";
import { useGamificationBootstrap } from "./useGamificationBootstrap";

// single mount point for the ambient gamification layer. lives in RootLayout
// so confetti/mascot/toasts are available on every page.
export function GamificationLayer() {
  useGamificationBootstrap();
  return (
    <>
      <Confetti />
      <EventToasts />
      <Mascot />
    </>
  );
}
