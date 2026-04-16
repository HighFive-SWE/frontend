"use client";

import { useQueries, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/Button";
import { selectCurrentProfile, useAppStore } from "@/lib/store";
import { AVATAR_BG, initialOf } from "@/modules/profile/avatar";
import { CreateProfileModal } from "@/modules/profile/CreateProfileModal";
import {
  fetchProfiles,
  fetchProgress,
  type Profile,
  type ProgressSummary,
} from "@/services/api";

// family dashboard — light-weight parent view. one card per profile showing
// streak / xp / last activity. tapping a card switches into that profile.
export default function FamilyPage() {
  const storeProfiles = useAppStore((s) => s.profiles);
  const current = useAppStore(selectCurrentProfile);
  const switchProfile = useAppStore((s) => s.switchProfile);
  const setProfiles = useAppStore((s) => s.setProfiles);
  const [createOpen, setCreateOpen] = useState(false);

  const profilesQuery = useQuery({
    queryKey: ["profiles"],
    queryFn: async () => {
      const list = await fetchProfiles();
      if (list.length > 0) setProfiles(list);
      return list;
    },
    initialData: storeProfiles,
  });

  const profiles = profilesQuery.data ?? storeProfiles;

  const summaries = useQueries({
    queries: profiles.map((p) => ({
      queryKey: ["progress", p.id],
      queryFn: () => fetchProgress(p.id),
      staleTime: 10_000,
    })),
  });

  return (
    <div className="container-page flex flex-col gap-8 py-12">
      <header className="flex flex-col gap-2">
        <span className="pill w-fit">family</span>
        <h1 className="font-display text-3xl font-semibold md:text-4xl">
          everyone learning under one roof
        </h1>
        <p className="max-w-2xl text-ink-soft">
          each profile keeps its own streak, xp, and badges. tap a card to hop in — the whole
          experience switches to that learner.
        </p>
      </header>

      <div className="flex justify-end">
        <Button onClick={() => setCreateOpen(true)} size="sm">
          + add profile
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {profiles.map((profile, idx) => {
          const summary = summaries[idx]?.data?.summary ?? null;
          return (
            <ProfileCard
              key={profile.id}
              profile={profile}
              summary={summary}
              isActive={profile.id === current?.id}
              onJumpIn={() => switchProfile(profile.id)}
            />
          );
        })}
      </div>

      <CreateProfileModal open={createOpen} onClose={() => setCreateOpen(false)} />
    </div>
  );
}

function ProfileCard({
  profile,
  summary,
  isActive,
  onJumpIn,
}: {
  profile: Profile;
  summary: ProgressSummary | null;
  isActive: boolean;
  onJumpIn: () => void;
}) {
  const streak = summary?.current_streak ?? 0;
  const xp = summary?.total_xp ?? 0;
  const level = summary?.level ?? 0;
  const lastActive = summary?.last_active_date ?? null;

  return (
    <article
      className={`flex flex-col gap-4 rounded-3xl border bg-white p-6 shadow-soft transition ${
        isActive ? "border-brand-500/60 ring-2 ring-brand-500/30" : "border-ink/5"
      }`}
    >
      <header className="flex items-center gap-3">
        <div
          className={`grid h-12 w-12 place-items-center rounded-full font-semibold shadow-soft ${
            AVATAR_BG[profile.avatar]
          }`}
        >
          {initialOf(profile.display_name)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="truncate font-display text-lg font-semibold">
            {profile.display_name}
          </p>
          <p className="text-xs uppercase tracking-widest text-ink-faint">
            {profile.role} · {profile.age_group}
          </p>
        </div>
        {isActive && (
          <span className="pill shrink-0 bg-brand-100 text-brand-700">active</span>
        )}
      </header>

      <dl className="grid grid-cols-3 gap-3 text-left">
        <Stat label="streak" value={`${streak}d`} accent={streak > 0} />
        <Stat label="xp" value={xp.toString()} />
        <Stat label="level" value={level.toString()} />
      </dl>

      <p className="text-xs text-ink-faint">
        last active · {lastActive ? formatRelative(lastActive) : "not yet"}
      </p>

      <div className="mt-auto">
        <Button
          variant={isActive ? "ghost" : "primary"}
          size="sm"
          onClick={onJumpIn}
          disabled={isActive}
        >
          {isActive ? "currently active" : "jump in"}
        </Button>
      </div>
    </article>
  );
}

function Stat({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl px-3 py-2 ${
        accent ? "bg-accent-peach/60" : "bg-surface-muted"
      }`}
    >
      <dt className="text-[10px] uppercase tracking-widest text-ink-faint">{label}</dt>
      <dd className="font-display text-xl font-semibold tabular-nums">{value}</dd>
    </div>
  );
}

function formatRelative(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return iso;
  const diff = Date.now() - then;
  const day = 24 * 60 * 60 * 1000;
  if (diff < day) return "today";
  const days = Math.floor(diff / day);
  if (days === 1) return "yesterday";
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks}w ago`;
  return new Date(iso).toLocaleDateString();
}
