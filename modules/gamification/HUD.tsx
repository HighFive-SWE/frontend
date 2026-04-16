"use client";

import { selectCurrentProfile, useAppStore } from "@/lib/store";

// always-visible progress strip — streak, xp bar, level. non-intrusive.
// the avatar reflects the active profile; switching profiles re-skins the HUD.
export function HUD() {
  const summary = useAppStore((s) => s.summary);
  const profile = useAppStore(selectCurrentProfile);

  const streak = summary?.current_streak ?? 0;
  const level = summary?.level ?? 0;
  const xpInto = summary?.xp_into_level ?? 0;
  const xpTo = summary?.xp_to_next_level ?? 50;
  const pct = Math.min(100, Math.round((xpInto / Math.max(xpTo, 1)) * 100));

  return (
    <div className="flex items-center gap-3 text-sm">
      <StreakChip streak={streak} />
      <div className="hidden flex-col gap-1 md:flex">
        <div className="flex items-baseline justify-between gap-4 text-xs text-ink-faint">
          <span className="font-medium text-ink">lvl {level}</span>
          <span className="tabular-nums">
            {xpInto} / {xpTo} xp
          </span>
        </div>
        <div className="h-1.5 w-40 overflow-hidden rounded-full bg-surface-muted">
          <div
            className="h-full rounded-full bg-brand-500 transition-[width] duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
      <AvatarChip avatar={profile?.avatar ?? "mint"} name={profile?.display_name ?? null} />
    </div>
  );
}

function StreakChip({ streak }: { streak: number }) {
  const active = streak > 0;
  return (
    <div
      className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 font-medium transition ${
        active ? "bg-accent-peach/70 text-ink" : "bg-surface-muted text-ink-faint"
      }`}
      aria-label={`streak ${streak} days`}
    >
      <span className={active ? "animate-bounceSoft" : ""}>🔥</span>
      <span className="tabular-nums">{streak}</span>
    </div>
  );
}

const avatarBg: Record<string, string> = {
  peach: "bg-accent-peach text-ink",
  mint: "bg-accent-mint text-ink",
  lilac: "bg-accent-lilac text-ink",
  brand: "bg-brand-500 text-white",
};

function AvatarChip({ avatar, name }: { avatar: string; name: string | null }) {
  const initial = (name ?? "you")[0]?.toUpperCase() ?? "?";
  return (
    <div
      className={`grid h-9 w-9 place-items-center rounded-full font-semibold shadow-soft ${
        avatarBg[avatar] ?? avatarBg.mint
      }`}
      title={name ?? "anonymous"}
    >
      {initial}
    </div>
  );
}
