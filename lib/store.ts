"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import {
  fallbackProfiles,
  type Achievement,
  type Profile,
  type ProfileAvatarKey,
  type ProgressPostResult,
  type ProgressSummary,
} from "@/services/api";

// ---- profile / family (phase 5) -------------------------------------------

type ProfileSlice = {
  profiles: Profile[];
  currentProfileId: string | null;
  profileGreetingId: number; // bumped on switch so mascot/UI can react.
  setProfiles: (profiles: Profile[]) => void;
  upsertProfile: (profile: Profile) => void;
  switchProfile: (profileId: string) => void;
};

// ---- session --------------------------------------------------------------

type SessionSlice = {
  startedAt: number | null;
  beginSession: () => void;
  endSession: () => void;
};

// ---- step machine ---------------------------------------------------------

export type StepStatus = "watching" | "attempting" | "success" | "stuck";

export type StepMachineSlice = {
  routineId: string | null;
  stepIndex: number;
  stepCount: number;
  status: StepStatus;
  attempts: number;
  fails: number;
  bestAccuracy: number;

  startRoutine: (routineId: string, stepCount: number) => void;
  enterAttempt: () => void;
  recordSample: (accuracy: number, succeeded: boolean) => void;
  markStuck: () => void;
  advance: () => void;
  retryStep: () => void;
  exitRoutine: () => void;
};

// ---- progress (local mirror) ----------------------------------------------

type ProgressSlice = {
  completedIds: string[];
  completedRoutineIds: string[];
  accuracyHistory: number[];
  completeLesson: (id: string) => void;
  completeRoutine: (id: string) => void;
  pushAccuracy: (value: number) => void;
  reset: () => void;
};

// ---- gamification ---------------------------------------------------------

export type MascotMood = "idle" | "happy" | "excited" | "encouraging" | "celebrating";

export type GamificationEvent = {
  id: number;
  kind: "xp" | "levelup" | "achievement" | "streak" | "profile";
  message: string;
  achievement?: Achievement;
  xp?: number;
  level?: number;
};

type GamificationSlice = {
  summary: ProgressSummary | null;
  mascotMood: MascotMood;
  confettiBurstId: number; // incremented to retrigger confetti
  eventQueue: GamificationEvent[]; // surfaced as toasts; drained by UI

  applyProgressSummary: (summary: ProgressSummary | null) => void;
  applyProgressResult: (result: ProgressPostResult | null) => void;
  setMascotMood: (mood: MascotMood) => void;
  acknowledgeEvent: (id: number) => void;
  triggerConfetti: () => void;
  pushEvent: (event: Omit<GamificationEvent, "id">) => void;
  resetLearnerState: () => void;
};

type AppState = ProfileSlice &
  SessionSlice &
  StepMachineSlice &
  ProgressSlice &
  GamificationSlice;

const ACCURACY_WINDOW = 50;

let _eventCounter = 0;
const nextEventId = () => {
  _eventCounter += 1;
  return _eventCounter;
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // profile
      profiles: fallbackProfiles,
      currentProfileId: fallbackProfiles[1]?.id ?? fallbackProfiles[0]?.id ?? null,
      profileGreetingId: 0,
      setProfiles: (profiles) =>
        set((state) => {
          const nextCurrent =
            state.currentProfileId && profiles.some((p) => p.id === state.currentProfileId)
              ? state.currentProfileId
              : profiles[0]?.id ?? null;
          return { profiles, currentProfileId: nextCurrent };
        }),
      upsertProfile: (profile) =>
        set((state) => {
          const existing = state.profiles.findIndex((p) => p.id === profile.id);
          const next =
            existing >= 0
              ? state.profiles.map((p, i) => (i === existing ? profile : p))
              : [...state.profiles, profile];
          return { profiles: next };
        }),
      switchProfile: (profileId) => {
        const { profiles, currentProfileId } = get();
        if (!profiles.some((p) => p.id === profileId)) return;
        if (profileId === currentProfileId) return;
        // wipe learner-specific state so the new profile starts clean until
        // its own summary hydrates.
        set((state) => ({
          currentProfileId: profileId,
          profileGreetingId: state.profileGreetingId + 1,
          summary: null,
          mascotMood: "happy",
          accuracyHistory: [],
          completedIds: [],
          completedRoutineIds: [],
          eventQueue: [
            ...state.eventQueue,
            {
              id: nextEventId(),
              kind: "profile",
              message: `hi ${profiles.find((p) => p.id === profileId)?.display_name ?? "there"}!`,
            },
          ].slice(-10),
          routineId: null,
          stepIndex: 0,
          stepCount: 0,
          status: "watching",
          attempts: 0,
          fails: 0,
          bestAccuracy: 0,
        }));
      },

      // session
      startedAt: null,
      beginSession: () => set({ startedAt: Date.now() }),
      endSession: () => set({ startedAt: null }),

      // step machine
      routineId: null,
      stepIndex: 0,
      stepCount: 0,
      status: "watching",
      attempts: 0,
      fails: 0,
      bestAccuracy: 0,
      startRoutine: (routineId, stepCount) =>
        set({
          routineId,
          stepCount,
          stepIndex: 0,
          status: "watching",
          attempts: 0,
          fails: 0,
          bestAccuracy: 0,
        }),
      enterAttempt: () => set({ status: "attempting", attempts: 0, fails: 0, bestAccuracy: 0 }),
      recordSample: (accuracy, succeeded) =>
        set((state) => {
          const attempts = state.attempts + 1;
          const fails = succeeded ? state.fails : state.fails + 1;
          const bestAccuracy = Math.max(state.bestAccuracy, accuracy);
          const status: StepStatus = succeeded ? "success" : state.status;
          const mascotMood: MascotMood = succeeded
            ? "celebrating"
            : fails >= 4
              ? "encouraging"
              : state.mascotMood;
          return { attempts, fails, bestAccuracy, status, mascotMood };
        }),
      markStuck: () => set({ status: "stuck", mascotMood: "encouraging" }),
      advance: () =>
        set((state) => {
          const next = state.stepIndex + 1;
          if (next >= state.stepCount) {
            return { stepIndex: next, status: "success" };
          }
          return {
            stepIndex: next,
            status: "watching",
            attempts: 0,
            fails: 0,
            bestAccuracy: 0,
          };
        }),
      retryStep: () =>
        set({ status: "attempting", attempts: 0, fails: 0, bestAccuracy: 0, mascotMood: "idle" }),
      exitRoutine: () =>
        set({
          routineId: null,
          stepIndex: 0,
          stepCount: 0,
          status: "watching",
          mascotMood: "idle",
        }),

      // progress mirror
      completedIds: [],
      completedRoutineIds: [],
      accuracyHistory: [],
      completeLesson: (id) =>
        set((state) =>
          state.completedIds.includes(id)
            ? state
            : { completedIds: [...state.completedIds, id] },
        ),
      completeRoutine: (id) =>
        set((state) =>
          state.completedRoutineIds.includes(id)
            ? state
            : { completedRoutineIds: [...state.completedRoutineIds, id] },
        ),
      pushAccuracy: (value) =>
        set((state) => ({
          accuracyHistory: [...state.accuracyHistory, value].slice(-ACCURACY_WINDOW),
        })),
      reset: () =>
        set({
          completedIds: [],
          completedRoutineIds: [],
          accuracyHistory: [],
        }),

      // gamification
      summary: null,
      mascotMood: "idle",
      confettiBurstId: 0,
      eventQueue: [],
      applyProgressSummary: (summary) => set({ summary }),
      applyProgressResult: (result) =>
        set((state) => {
          if (!result) return {};
          const events: GamificationEvent[] = [];
          if (result.xp_gained > 0) {
            events.push({
              id: nextEventId(),
              kind: "xp",
              message: `+${result.xp_gained} xp`,
              xp: result.xp_gained,
            });
          }
          if (result.leveled_up) {
            events.push({
              id: nextEventId(),
              kind: "levelup",
              message: `level up — ${result.summary.level}`,
              level: result.summary.level,
            });
          }
          for (const ach of result.new_achievements) {
            events.push({
              id: nextEventId(),
              kind: "achievement",
              message: `unlocked · ${ach.title}`,
              achievement: ach,
            });
          }
          if (
            result.summary.current_streak > (state.summary?.current_streak ?? 0) &&
            result.summary.current_streak >= 2
          ) {
            events.push({
              id: nextEventId(),
              kind: "streak",
              message: `streak · ${result.summary.current_streak} days`,
            });
          }

          return {
            summary: result.summary,
            eventQueue: [...state.eventQueue, ...events].slice(-10),
            confettiBurstId:
              result.leveled_up || result.new_achievements.length > 0
                ? state.confettiBurstId + 1
                : state.confettiBurstId,
          };
        }),
      setMascotMood: (mood) => set({ mascotMood: mood }),
      acknowledgeEvent: (id) =>
        set((state) => ({ eventQueue: state.eventQueue.filter((e) => e.id !== id) })),
      triggerConfetti: () => set((state) => ({ confettiBurstId: state.confettiBurstId + 1 })),
      pushEvent: (event) =>
        set((state) => ({
          eventQueue: [...state.eventQueue, { ...event, id: nextEventId() }].slice(-10),
        })),
      resetLearnerState: () =>
        set({
          summary: null,
          accuracyHistory: [],
          completedIds: [],
          completedRoutineIds: [],
          routineId: null,
          stepIndex: 0,
          stepCount: 0,
          status: "watching",
          mascotMood: "idle",
        }),
    }),
    {
      name: "highfive-profile-state",
      storage: createJSONStorage(() => localStorage),
      // persist only the profile list + active selection. everything else
      // rehydrates from the backend per profile.
      partialize: (state) => ({
        profiles: state.profiles,
        currentProfileId: state.currentProfileId,
      }),
    },
  ),
);

export const useProgress = useAppStore;
export const useStepMachineState = useAppStore;

export const selectStepMachine = (state: AppState) => ({
  status: state.status,
  attempts: state.attempts,
  fails: state.fails,
  stepIndex: state.stepIndex,
  stepCount: state.stepCount,
  bestAccuracy: state.bestAccuracy,
});

export const selectGamification = (state: AppState) => ({
  summary: state.summary,
  mascotMood: state.mascotMood,
  confettiBurstId: state.confettiBurstId,
  eventQueue: state.eventQueue,
});

// --- helpers --------------------------------------------------------------

export function selectCurrentProfile(state: AppState): Profile | null {
  if (!state.currentProfileId) return null;
  return state.profiles.find((p) => p.id === state.currentProfileId) ?? null;
}

export const AVATAR_KEYS: ProfileAvatarKey[] = ["peach", "mint", "lilac", "brand"];

export type { Profile };
