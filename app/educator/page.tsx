"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/Button";
import { FingerHeatmap } from "@/modules/educator/FingerHeatmap";
import { TrendChart } from "@/modules/educator/TrendChart";
import { AVATAR_BG, initialOf } from "@/modules/profile/avatar";
import { selectCurrentProfile, useAppStore } from "@/lib/store";
import {
  fetchAnalytics,
  fetchProfiles,
  fetchProgress,
  type Profile,
} from "@/services/api";

// educator view — pick a profile, see progress at a glance. reuses the
// profile store so the active learner in the rest of the app is the default.
export default function EducatorPage() {
  const storeProfiles = useAppStore((s) => s.profiles);
  const setProfiles = useAppStore((s) => s.setProfiles);
  const current = useAppStore(selectCurrentProfile);

  const profilesQuery = useQuery({
    queryKey: ["profiles"],
    queryFn: async () => {
      const list = await fetchProfiles();
      if (list.length > 0) setProfiles(list);
      return list;
    },
    initialData: storeProfiles,
    staleTime: 30_000,
  });

  const profiles = profilesQuery.data ?? storeProfiles;
  const [selectedId, setSelectedId] = useState<string | null>(current?.id ?? null);

  // keep the selection valid when the profile list updates.
  useEffect(() => {
    if (profiles.length === 0) {
      setSelectedId(null);
      return;
    }
    if (!selectedId || !profiles.some((p) => p.id === selectedId)) {
      setSelectedId(current?.id ?? profiles[0].id);
    }
  }, [profiles, selectedId, current?.id]);

  const selected = useMemo(
    () => profiles.find((p) => p.id === selectedId) ?? null,
    [profiles, selectedId],
  );

  const progressQuery = useQuery({
    queryKey: ["progress", selectedId],
    queryFn: () => (selectedId ? fetchProgress(selectedId) : Promise.resolve(null)),
    enabled: Boolean(selectedId),
    staleTime: 10_000,
  });

  const analyticsQuery = useQuery({
    queryKey: ["analytics", selectedId],
    queryFn: () => (selectedId ? fetchAnalytics(selectedId) : Promise.resolve(null)),
    enabled: Boolean(selectedId),
    staleTime: 10_000,
  });

  const summary = progressQuery.data?.summary ?? null;
  const analytics = analyticsQuery.data ?? null;

  return (
    <div className="container-page flex flex-col gap-8 py-12">
      <header className="flex flex-col gap-2">
        <p className="font-mono text-xs tracking-wide text-ink-faint">educator</p>
        <h1 className="font-display text-3xl font-bold md:text-4xl">
          coaching view
        </h1>
        <p className="max-w-2xl text-ink-soft">
          pick a learner to see where they shine and where they drift. data comes from recorded
          sessions — the longer they practise, the richer this view gets.
        </p>
      </header>

      <ProfilePicker
        profiles={profiles}
        selectedId={selectedId}
        onSelect={setSelectedId}
      />

      {!selected ? (
        <EmptyState />
      ) : (
        <div className="flex flex-col gap-6">
          <StatsRow
            avgAccuracy={analytics?.avg_accuracy ?? summary?.avg_accuracy ?? 0}
            successRate={analytics?.success_rate ?? null}
            sampleSize={analytics?.sample_size ?? summary?.total_attempts ?? 0}
            streak={summary?.current_streak ?? 0}
            level={summary?.level ?? 0}
            weakest={analytics?.weakest_gesture_id ?? null}
          />

          <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
            <TrendChart trend={analytics?.trend ?? []} />
            <FingerHeatmap heat={analytics?.finger_heat ?? emptyHeat()} />
          </div>

          <WeakGestureTable weak={analytics?.weak_gestures ?? []} />
        </div>
      )}
    </div>
  );
}

function ProfilePicker({
  profiles,
  selectedId,
  onSelect,
}: {
  profiles: Profile[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  if (profiles.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-ink/10 bg-white p-6 text-sm text-ink-faint">
        no profiles yet. add one from the family dashboard to see analytics.
      </div>
    );
  }
  return (
    <div className="flex flex-wrap items-center gap-3">
      <span className="text-xs uppercase tracking-widest text-ink-faint">viewing</span>
      {profiles.map((p) => {
        const active = p.id === selectedId;
        return (
          <button
            key={p.id}
            onClick={() => onSelect(p.id)}
            className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition ${
              active
                ? "border-brand-500 bg-brand-500 text-white shadow-soft"
                : "border-ink/10 bg-white text-ink-soft hover:border-ink/30"
            }`}
          >
            <span
              className={`grid h-6 w-6 place-items-center rounded-full text-xs font-semibold ${
                active ? "bg-white/25 text-white" : AVATAR_BG[p.avatar]
              }`}
            >
              {initialOf(p.display_name)}
            </span>
            <span>{p.display_name}</span>
            <span className={`text-[10px] uppercase ${active ? "text-white/70" : "text-ink-faint"}`}>
              {p.role}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function StatsRow({
  avgAccuracy,
  successRate,
  sampleSize,
  streak,
  level,
  weakest,
}: {
  avgAccuracy: number;
  successRate: number | null;
  sampleSize: number;
  streak: number;
  level: number;
  weakest: string | null;
}) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
      <Stat label="avg accuracy" value={formatPct(avgAccuracy)} />
      <Stat
        label="success rate"
        value={successRate === null ? "—" : formatPct(successRate)}
      />
      <Stat label="samples" value={sampleSize.toString()} />
      <Stat label="streak" value={`${streak}d`} accent={streak > 0} />
      <Stat label="level" value={level.toString()} />
      <div className="col-span-2 md:col-span-5 rounded-3xl border border-ink/5 bg-white p-4 shadow-soft">
        <p className="text-xs uppercase tracking-widest text-ink-faint">weakest gesture</p>
        <p className="mt-1 font-display text-lg">
          {weakest ? weakest.replace(/_/g, " ") : "no focus area yet"}
        </p>
      </div>
    </div>
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
      className={`rounded-3xl p-4 shadow-soft ${
        accent ? "bg-accent-peach/60" : "bg-white border border-ink/5"
      }`}
    >
      <p className="text-xs uppercase tracking-widest text-ink-faint">{label}</p>
      <p className="mt-1 font-display text-2xl font-semibold tabular-nums">{value}</p>
    </div>
  );
}

function WeakGestureTable({
  weak,
}: {
  weak: { gesture_id: string; attempts: number; successes: number; success_rate: number; avg_accuracy: number }[];
}) {
  if (weak.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-ink/10 bg-white p-6 text-center text-sm text-ink-faint">
        no gesture breakdown yet — come back after a few sessions.
      </div>
    );
  }
  return (
    <div className="rounded-3xl border border-ink/5 bg-white p-6 shadow-soft">
      <p className="text-xs uppercase tracking-widest text-ink-faint">weak gestures</p>
      <p className="font-display text-lg">ranked by lowest success rate</p>
      <ul className="mt-4 flex flex-col gap-2">
        {weak.map((w) => (
          <li
            key={w.gesture_id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-ink/5 bg-surface-muted/60 px-4 py-3"
          >
            <div className="flex flex-col">
              <span className="font-medium capitalize">{w.gesture_id.replace(/_/g, " ")}</span>
              <span className="text-xs text-ink-faint">
                {w.attempts} attempts · {w.successes} successes
              </span>
            </div>
            <div className="flex items-center gap-4 text-sm tabular-nums">
              <span>
                <span className="text-ink-faint">rate · </span>
                {formatPct(w.success_rate)}
              </span>
              <span>
                <span className="text-ink-faint">avg · </span>
                {formatPct(w.avg_accuracy)}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-start gap-3 rounded-3xl border border-dashed border-ink/10 bg-white p-8">
      <p className="font-display text-xl">no profile selected.</p>
      <p className="max-w-xl text-sm text-ink-soft">
        pick a learner above to see their recent accuracy trend, the fingers that tend to drift,
        and which gestures deserve a little more practice.
      </p>
      <Button variant="ghost" onClick={() => window.location.assign("/family")}>
        manage profiles
      </Button>
    </div>
  );
}

function emptyHeat() {
  const fingers: ("thumb" | "index" | "middle" | "ring" | "pinky")[] = [
    "thumb",
    "index",
    "middle",
    "ring",
    "pinky",
  ];
  return fingers.map((f) => ({ finger: f, misses: 0, share: 0 }));
}

function formatPct(n: number): string {
  if (!Number.isFinite(n)) return "—";
  return `${Math.round(n * 100)}%`;
}
