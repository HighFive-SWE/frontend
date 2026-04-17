"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/Button";
import { useAppStore } from "@/lib/store";
import {
  createProfile,
  type Profile,
  type ProfileAgeGroup,
  type ProfileAvatarKey,
  type ProfileRole,
} from "@/services/api";
import { AVATAR_BG, AVATAR_KEYS, initialOf } from "./avatar";

type Props = {
  open: boolean;
  onClose: () => void;
  onCreated?: (profile: Profile) => void;
};

const ROLES: { value: ProfileRole; label: string }[] = [
  { value: "child", label: "child" },
  { value: "parent", label: "parent" },
  { value: "educator", label: "educator" },
];

const AGE_GROUPS: { value: ProfileAgeGroup; label: string }[] = [
  { value: "early", label: "4–7" },
  { value: "middle", label: "8–12" },
  { value: "teen", label: "13–17" },
  { value: "adult", label: "adult" },
];

export function CreateProfileModal({ open, onClose, onCreated }: Props) {
  const upsertProfile = useAppStore((s) => s.upsertProfile);
  const switchProfile = useAppStore((s) => s.switchProfile);

  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState<ProfileAvatarKey>("mint");
  const [role, setRole] = useState<ProfileRole>("child");
  const [ageGroup, setAgeGroup] = useState<ProfileAgeGroup>("middle");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open) {
      setName("");
      setAvatar("mint");
      setRole("child");
      setAgeGroup("middle");
      setBusy(false);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const submit = async () => {
    const trimmed = name.trim();
    if (!trimmed || busy) return;
    setBusy(true);

    const created = await createProfile({
      displayName: trimmed,
      avatar,
      role,
      ageGroup,
    });

    // if the backend is down we still create a local-only profile so the
    // ui isn't dead. the id prefix keeps it clearly local until a real api
    // call replaces it.
    const profile: Profile = created ?? {
      id: `profile-local-${Date.now().toString(36)}`,
      user_id: "user-home-1",
      display_name: trimmed,
      avatar,
      role,
      age_group: ageGroup,
      created_at: new Date().toISOString(),
    };

    upsertProfile(profile);
    switchProfile(profile.id);
    onCreated?.(profile);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink/30 backdrop-blur-sm">
      <div
        role="dialog"
        aria-modal="true"
        className="mx-4 w-full max-w-md rounded-2xl border border-ink/5 bg-white p-6 shadow-lifted"
      >
        <header className="mb-4 flex items-baseline justify-between">
          <h2 className="font-display text-xl font-semibold">new profile</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-sm text-ink-faint hover:text-ink"
          >
            close
          </button>
        </header>

        <div className="flex flex-col gap-5">
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium text-ink-soft">display name</span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
              placeholder="e.g. alex"
              className="h-11 rounded-2xl border border-ink/10 bg-surface px-4 text-ink outline-none focus:border-brand-500"
            />
          </label>

          <fieldset className="flex flex-col gap-2">
            <legend className="text-sm font-medium text-ink-soft">avatar</legend>
            <div className="flex gap-3">
              {AVATAR_KEYS.map((key) => {
                const picked = key === avatar;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setAvatar(key)}
                    aria-pressed={picked}
                    className={`grid h-12 w-12 place-items-center rounded-full font-semibold transition ${
                      AVATAR_BG[key]
                    } ${picked ? "ring-2 ring-ink ring-offset-2" : "opacity-80 hover:opacity-100"}`}
                  >
                    {initialOf(name || key)}
                  </button>
                );
              })}
            </div>
          </fieldset>

          <fieldset className="flex flex-col gap-2">
            <legend className="text-sm font-medium text-ink-soft">role</legend>
            <div className="flex flex-wrap gap-2">
              {ROLES.map((r) => (
                <Chip
                  key={r.value}
                  selected={role === r.value}
                  onClick={() => setRole(r.value)}
                >
                  {r.label}
                </Chip>
              ))}
            </div>
          </fieldset>

          <fieldset className="flex flex-col gap-2">
            <legend className="text-sm font-medium text-ink-soft">age group</legend>
            <div className="flex flex-wrap gap-2">
              {AGE_GROUPS.map((g) => (
                <Chip
                  key={g.value}
                  selected={ageGroup === g.value}
                  onClick={() => setAgeGroup(g.value)}
                >
                  {g.label}
                </Chip>
              ))}
            </div>
          </fieldset>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button variant="ghost" onClick={onClose}>
            cancel
          </Button>
          <Button onClick={submit} disabled={!name.trim() || busy}>
            {busy ? "creating…" : "create profile"}
          </Button>
        </div>
      </div>
    </div>
  );
}

function Chip({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`rounded-full border px-3 py-1.5 text-sm transition ${
        selected
          ? "border-brand-500 bg-brand-100 text-brand-700"
          : "border-ink/10 bg-surface-muted text-ink-soft hover:text-ink"
      }`}
    >
      {children}
    </button>
  );
}
