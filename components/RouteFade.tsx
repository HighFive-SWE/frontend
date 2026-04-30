"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

// phase 10: re-keys main content on every route change so the css fade-in
// keyframe replays. tiny touch — keeps page swaps from feeling abrupt.
export function RouteFade({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return (
    <div key={pathname} className="route-fade">
      {children}
    </div>
  );
}
