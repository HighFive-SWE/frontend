"use client";

import { useEffect, useRef, useState } from "react";
import { selectCurrentProfile, useAppStore } from "@/lib/store";
import type { Profile } from "@/services/api";
import { AVATAR_BG, initialOf } from "./avatar";
import { CreateProfileModal } from "./CreateProfileModal";

// dropdown switcher that lives in the top navbar (right side). each row shows
// the profile's avatar + display name + role; clicking swaps the active
// profile via the zustand store (which also wipes learner state).
export function ProfileSwitcher() {
  const profiles = useAppStore((s) => s.profiles);
  const current = useAppStore(selectCurrentProfile);
  const switchProfile = useAppStore((s) => s.switchProfile);

  const [open, setOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const anchorRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (!anchorRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open]);

  const handleSelect = (profile: Profile) => {
    switchProfile(profile.id);
    setOpen(false);
  };

  return (
    <>
      <div ref={anchorRef} className="relative">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-haspopup="menu"
          aria-expanded={open}
          className="flex items-center gap-2 rounded-full border border-ink/5 bg-surface px-2 py-1.5 pr-3 transition hover:border-ink/10"
        >
          <AvatarDot profile={current} size="sm" />
          <span className="hidden text-sm font-medium text-ink md:inline">
            {current?.display_name ?? "pick profile"}
          </span>
          <span aria-hidden className="text-xs text-ink-faint">▾</span>
        </button>

        {open && (
          <div
            role="menu"
            className="absolute right-0 top-[calc(100%+6px)] z-40 w-64 overflow-hidden rounded-2xl border border-ink/5 bg-white shadow-soft"
          >
            <ul className="max-h-80 overflow-auto py-1">
              {profiles.map((p) => {
                const active = p.id === current?.id;
                return (
                  <li key={p.id}>
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => handleSelect(p)}
                      className={`flex w-full items-center gap-3 px-3 py-2 text-left transition ${
                        active ? "bg-brand-100/60" : "hover:bg-surface-muted"
                      }`}
                    >
                      <AvatarDot profile={p} size="sm" />
                      <div className="flex-1 min-w-0">
                        <p className="truncate text-sm font-medium text-ink">
                          {p.display_name}
                        </p>
                        <p className="truncate text-xs text-ink-faint">
                          {p.role} · {p.age_group}
                        </p>
                      </div>
                      {active && (
                        <span className="text-[10px] uppercase tracking-wide text-brand-700">
                          active
                        </span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
            <div className="border-t border-ink/5 p-2">
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  setCreateOpen(true);
                }}
                className="w-full rounded-xl px-3 py-2 text-left text-sm font-medium text-brand-700 transition hover:bg-brand-100/60"
              >
                + new profile
              </button>
            </div>
          </div>
        )}
      </div>

      <CreateProfileModal open={createOpen} onClose={() => setCreateOpen(false)} />
    </>
  );
}

function AvatarDot({
  profile,
  size = "md",
}: {
  profile: Profile | null;
  size?: "sm" | "md";
}) {
  const dim = size === "sm" ? "h-8 w-8 text-sm" : "h-10 w-10 text-base";
  const cls = profile ? AVATAR_BG[profile.avatar] : "bg-surface-muted text-ink-faint";
  return (
    <div className={`grid ${dim} place-items-center rounded-full font-semibold shadow-soft ${cls}`}>
      {initialOf(profile?.display_name)}
    </div>
  );
}
