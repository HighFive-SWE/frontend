import type {
  Achievement,
  Profile,
  ProfileAvatarKey,
  ProgressSummary,
} from "@/services/api";

// --- profile / family (phase 5) -------------------------------------------

export type ProfileSlice = {
  profiles: Profile[];
  currentProfileId: string | null;
  profileGreetingId: number;
  setProfiles: (profiles: Profile[]) => void;
  upsertProfile: (profile: Profile) => void;
  switchProfile: (profileId: string) => void;
};

// --- session ---------------------------------------------------------------

export type SessionSlice = {
  startedAt: number | null;
  beginSession: () => void;
  endSession: () => void;
};

// --- step machine ----------------------------------------------------------

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

// --- progress (local mirror) -----------------------------------------------

export type ProgressSlice = {
  completedIds: string[];
  completedRoutineIds: string[];
  accuracyHistory: number[];
  completeLesson: (id: string) => void;
  completeRoutine: (id: string) => void;
  pushAccuracy: (value: number) => void;
  reset: () => void;
};

// --- gamification ----------------------------------------------------------

export type MascotMood = "idle" | "happy" | "excited" | "encouraging" | "celebrating";

export type GamificationEvent = {
  id: number;
  kind: "xp" | "levelup" | "achievement" | "streak" | "profile";
  message: string;
  achievement?: Achievement;
  xp?: number;
  level?: number;
};

export type GamificationSlice = {
  summary: ProgressSummary | null;
  mascotMood: MascotMood;
  confettiBurstId: number;
  eventQueue: GamificationEvent[];
  applyProgressSummary: (summary: ProgressSummary | null) => void;
  applyProgressResult: (result: import("@/services/api").ProgressPostResult | null) => void;
  setMascotMood: (mood: MascotMood) => void;
  acknowledgeEvent: (id: number) => void;
  triggerConfetti: () => void;
  pushEvent: (event: Omit<GamificationEvent, "id">) => void;
  resetLearnerState: () => void;
};

// --- combined --------------------------------------------------------------

export type AppState = ProfileSlice &
  SessionSlice &
  StepMachineSlice &
  ProgressSlice &
  GamificationSlice;
