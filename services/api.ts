export type Lesson = {
  id: string;
  title: string;
  description: string;
  difficulty: "starter" | "growing" | "fluent";
  tags: string[];
  gesture_ids?: string[];
  scenario_tag?: string | null;
};

export type RoutineStep = {
  gesture_id: string;
  prompt: string;
  hint: string;
};

export type Routine = {
  id: string;
  name: string;
  description: string;
  scenario_tag: string;
  steps: RoutineStep[];
};

export type EvaluatePayload = {
  gestureId: string;
  landmarks: { x: number; y: number; z: number }[];
  profileId?: string;
};

export type EvaluateResponse = {
  accuracy: number;
  band: "correct" | "partial" | "incorrect";
  incorrect_points: number[];
  suggestion: string | null;
};

export type ProgressPayload = {
  profileId: string;
  routineId: string;
  gestureId: string;
  accuracy: number;
  band: "correct" | "partial" | "incorrect";
  attempts: number;
  succeeded: boolean;
  completedRoutine?: boolean;
};

export type Achievement = {
  code: string;
  title: string;
  description: string;
  unlocked_at: string;
};

export type DailyGoal = {
  target: number;
  progress: number;
  date: string;
};

export type ProgressSummary = {
  profile_id: string;
  total_attempts: number;
  successes: number;
  avg_accuracy: number;
  best_accuracy: number;
  routines_completed: string[];
  current_streak: number;
  longest_streak: number;
  last_active_date: string | null;
  total_xp: number;
  level: number;
  xp_into_level: number;
  xp_to_next_level: number;
  achievements: Achievement[];
  daily_goal: DailyGoal | null;
  streak_days: number;
};

export type ProgressPostResult = {
  summary: ProgressSummary;
  xp_gained: number;
  new_achievements: Achievement[];
  leveled_up: boolean;
};

// --- profiles (phase 5) ----------------------------------------------------

export type ProfileRole = "parent" | "child" | "educator";
export type ProfileAgeGroup = "early" | "middle" | "teen" | "adult";
export type ProfileAvatarKey = "peach" | "mint" | "lilac" | "brand";

export type Profile = {
  id: string;
  user_id: string;
  display_name: string;
  avatar: ProfileAvatarKey;
  age_group: ProfileAgeGroup;
  role: ProfileRole;
  created_at: string;
};

export type ProfileCreatePayload = {
  displayName: string;
  avatar: ProfileAvatarKey;
  role?: ProfileRole;
  ageGroup?: ProfileAgeGroup;
  userId?: string;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

const fallbackLessons: Lesson[] = [
  {
    id: "hello",
    title: "hello",
    description: "wave an open palm beside your temple, then move it outward.",
    difficulty: "starter",
    tags: ["greetings", "daily"],
    gesture_ids: ["hello"],
    scenario_tag: "daily",
  },
  {
    id: "water",
    title: "water",
    description: "form a 'w' with three fingers; tap it against your chin.",
    difficulty: "starter",
    tags: ["mealtime", "needs"],
    gesture_ids: ["water"],
    scenario_tag: "daily",
  },
];

// keep in sync with backend/services/routine_service.py so the UI still runs
// when the api server is offline.
const fallbackRoutines: Routine[] = [
  {
    id: "greet-family",
    name: "greet your family",
    description: "a gentle wave to say hi — one step, warm vibe.",
    scenario_tag: "daily",
    steps: [
      { gesture_id: "hello", prompt: "sign 'hello'", hint: "open palm, fingers up, tip of thumb at temple." },
    ],
  },
  {
    id: "ask-water",
    name: "i need water",
    description: "greet, then ask — two steps, a tiny conversation.",
    scenario_tag: "daily",
    steps: [
      { gesture_id: "hello", prompt: "start with 'hello'", hint: "open palm, fingers up, gentle wave." },
      { gesture_id: "water", prompt: "now ask for 'water'", hint: "'w' shape — index, middle, ring up; thumb across palm." },
    ],
  },
  {
    id: "mealtime-hello-water",
    name: "mealtime warmup",
    description: "say hello, then ask for water — practice the whole sequence.",
    scenario_tag: "mealtime",
    steps: [
      { gesture_id: "hello", prompt: "greet", hint: "open palm — hold for a beat." },
      { gesture_id: "water", prompt: "ask for water", hint: "three fingers up, thumb tucked in." },
      { gesture_id: "hello", prompt: "wave to close", hint: "same hello — friendly and relaxed." },
    ],
  },
];

// fallback profiles mirror the backend seed so the family view renders
// something meaningful even with the api down.
export const fallbackProfiles: Profile[] = [
  {
    id: "profile-parent-1",
    user_id: "user-home-1",
    display_name: "parent",
    avatar: "brand",
    age_group: "adult",
    role: "parent",
    created_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "profile-alex",
    user_id: "user-home-1",
    display_name: "alex",
    avatar: "mint",
    age_group: "early",
    role: "child",
    created_at: "2024-01-01T00:00:01Z",
  },
  {
    id: "profile-sam",
    user_id: "user-home-1",
    display_name: "sam",
    avatar: "peach",
    age_group: "middle",
    role: "child",
    created_at: "2024-01-01T00:00:02Z",
  },
];

export async function fetchLessons(): Promise<Lesson[]> {
  try {
    const res = await fetch(`${API_URL}/lessons`, { cache: "no-store" });
    if (!res.ok) throw new Error(`backend returned ${res.status}`);
    const data = (await res.json()) as { lessons: Lesson[] };
    return data.lessons;
  } catch {
    return fallbackLessons;
  }
}

export async function fetchHealth(): Promise<{ status: string }> {
  const res = await fetch(`${API_URL}/health`, { cache: "no-store" });
  if (!res.ok) throw new Error(`health check failed with ${res.status}`);
  return res.json();
}

export async function fetchRoutines(): Promise<Routine[]> {
  try {
    const res = await fetch(`${API_URL}/routines`, { cache: "no-store" });
    if (!res.ok) throw new Error(`backend returned ${res.status}`);
    const data = (await res.json()) as { routines: Routine[] };
    return data.routines;
  } catch {
    return fallbackRoutines;
  }
}

export async function fetchRoutine(id: string): Promise<Routine> {
  try {
    const res = await fetch(`${API_URL}/routines/${id}`, { cache: "no-store" });
    if (!res.ok) throw new Error(`backend returned ${res.status}`);
    const data = (await res.json()) as { routine: Routine };
    return data.routine;
  } catch {
    const fallback = fallbackRoutines.find((r) => r.id === id);
    if (!fallback) throw new Error(`routine '${id}' not found`);
    return fallback;
  }
}

export async function evaluateGesture(payload: EvaluatePayload): Promise<EvaluateResponse> {
  const res = await fetch(`${API_URL}/cv/evaluate`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      gesture_id: payload.gestureId,
      landmarks: payload.landmarks,
      user_id: payload.profileId,
    }),
  });
  if (!res.ok) throw new Error(`evaluate failed: ${res.status}`);
  return res.json();
}

export async function postProgress(
  payload: ProgressPayload,
): Promise<ProgressPostResult | null> {
  try {
    const res = await fetch(`${API_URL}/progress`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        profile_id: payload.profileId,
        routine_id: payload.routineId,
        gesture_id: payload.gestureId,
        accuracy: payload.accuracy,
        band: payload.band,
        attempts: payload.attempts,
        succeeded: payload.succeeded,
        completed_routine: payload.completedRoutine ?? false,
      }),
    });
    if (!res.ok) return null;
    return (await res.json()) as ProgressPostResult;
  } catch {
    return null;
  }
}

export async function fetchProgress(profileId: string): Promise<{
  summary: ProgressSummary;
  recent: unknown[];
} | null> {
  try {
    const res = await fetch(`${API_URL}/progress/${profileId}`, { cache: "no-store" });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

// --- profile api -----------------------------------------------------------

export async function fetchProfiles(userId?: string): Promise<Profile[]> {
  try {
    const qs = userId ? `?user_id=${encodeURIComponent(userId)}` : "";
    const res = await fetch(`${API_URL}/profiles${qs}`, { cache: "no-store" });
    if (!res.ok) throw new Error(`backend returned ${res.status}`);
    const data = (await res.json()) as { profiles: Profile[] };
    return data.profiles;
  } catch {
    return fallbackProfiles;
  }
}

export async function createProfile(
  payload: ProfileCreatePayload,
): Promise<Profile | null> {
  try {
    const res = await fetch(`${API_URL}/profiles`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        display_name: payload.displayName,
        avatar: payload.avatar,
        role: payload.role ?? "child",
        age_group: payload.ageGroup ?? "middle",
        user_id: payload.userId,
      }),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { profile: Profile };
    return data.profile;
  } catch {
    return null;
  }
}
