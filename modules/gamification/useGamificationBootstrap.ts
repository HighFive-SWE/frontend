"use client";

import { useEffect, useRef } from "react";
import { useAppStore } from "@/lib/store";
import { fetchProfiles, fetchProgress } from "@/services/api";

// phase 5: hydrate the profile list once, then re-hydrate the gamification
// summary every time the active profile changes. backend is optional — on a
// failure we keep the seeded/persisted profiles and render a fresh "level 0".
export function useGamificationBootstrap() {
  const currentProfileId = useAppStore((s) => s.currentProfileId);
  const applyProgressSummary = useAppStore((s) => s.applyProgressSummary);
  const setProfiles = useAppStore((s) => s.setProfiles);
  const didLoadProfiles = useRef(false);

  useEffect(() => {
    if (didLoadProfiles.current) return;
    didLoadProfiles.current = true;

    void fetchProfiles().then((profiles) => {
      if (profiles.length > 0) setProfiles(profiles);
    });
  }, [setProfiles]);

  useEffect(() => {
    if (!currentProfileId) return;
    void fetchProgress(currentProfileId).then((res) => {
      if (res?.summary) applyProgressSummary(res.summary);
    });
  }, [currentProfileId, applyProgressSummary]);
}
