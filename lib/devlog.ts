// phase 10: thin dev-only logger. critical user flows (profile switch, queue
// flush, evaluation post) emit a single tagged line each so a developer
// inspecting the console can trace what happened. silenced in production
// builds and gated behind a runtime flag for noisy moments.
//
// usage: devlog("profile.switch", { from, to })
//
// the brief calls for "console logs for critical flows (dev only) — no
// noisy logs". keep call sites few; one tag per meaningful event.

const ENABLED =
  typeof process !== "undefined" && process.env.NODE_ENV !== "production";

export function devlog(tag: string, data?: unknown): void {
  if (!ENABLED) return;
  if (typeof console === "undefined") return;
  if (data === undefined) {
    console.log(`[hf:${tag}]`);
  } else {
    console.log(`[hf:${tag}]`, data);
  }
}
