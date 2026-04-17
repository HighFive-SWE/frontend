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
  created_by?: string | null;
  is_custom?: boolean;
  created_at?: string;
};

export type RoutineCreatePayload = {
  name: string;
  description: string;
  steps: RoutineStep[];
  created_by: string;
};

export type RoutineUpdatePayload = {
  name?: string;
  description?: string;
  steps?: RoutineStep[];
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
  incorrectPoints?: number[];
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

// --- analytics (phase 6) ---------------------------------------------------

export type WeakGesture = {
  gesture_id: string;
  attempts: number;
  successes: number;
  success_rate: number;
  avg_accuracy: number;
};

export type TrendPoint = {
  gesture_id: string;
  accuracy: number;
  succeeded: boolean;
  at: string;
};

export type FingerName = "thumb" | "index" | "middle" | "ring" | "pinky";

export type FingerHeat = {
  finger: FingerName;
  misses: number;
  share: number;
};

export type AnalyticsSnapshot = {
  profile_id: string;
  sample_size: number;
  avg_accuracy: number;
  success_rate: number;
  weak_gestures: WeakGesture[];
  trend: TrendPoint[];
  finger_heat: FingerHeat[];
  weakest_gesture_id: string | null;
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
  { id: "hello", title: "hello", description: "wave an open palm beside your temple, then move it outward.", difficulty: "starter", tags: ["greetings", "daily"], gesture_ids: ["hello"], scenario_tag: "daily" },
  { id: "thank-you", title: "thank you", description: "flat hand touches chin and moves forward, like blowing a kiss.", difficulty: "starter", tags: ["manners", "daily"], gesture_ids: ["thank_you"], scenario_tag: "daily" },
  { id: "please", title: "please", description: "soft open hand circling at the chest — gentle and polite.", difficulty: "starter", tags: ["manners", "daily"], gesture_ids: ["please"], scenario_tag: "daily" },
  { id: "sorry", title: "sorry", description: "closed fist on the chest — small circle, eyes soft.", difficulty: "starter", tags: ["manners", "feelings"], gesture_ids: ["sorry"], scenario_tag: "daily" },
  { id: "water", title: "water", description: "form a 'w' with three fingers; tap it against your chin.", difficulty: "starter", tags: ["mealtime", "needs"], gesture_ids: ["water"], scenario_tag: "daily" },
  { id: "food", title: "food", description: "pinch all fingertips together, tap toward the mouth.", difficulty: "starter", tags: ["mealtime", "needs"], gesture_ids: ["food"], scenario_tag: "mealtime" },
  { id: "help", title: "help", description: "thumb-up fist lifted on the other palm, raised together.", difficulty: "growing", tags: ["safety", "needs"], gesture_ids: ["help"], scenario_tag: "safety" },
  { id: "stop", title: "stop", description: "flat palm facing out, fingers straight up — held still.", difficulty: "starter", tags: ["safety", "daily"], gesture_ids: ["stop"], scenario_tag: "safety" },
  { id: "yes", title: "yes", description: "closed fist, gentle nodding motion.", difficulty: "starter", tags: ["daily", "communication"], gesture_ids: ["yes"], scenario_tag: "daily" },
  { id: "no", title: "no", description: "index and middle extended, snap down to meet the thumb.", difficulty: "starter", tags: ["daily", "communication"], gesture_ids: ["no"], scenario_tag: "daily" },
  { id: "bathroom", title: "bathroom", description: "fist with thumb peeking between index and middle — small shake.", difficulty: "growing", tags: ["needs", "daily"], gesture_ids: ["bathroom"], scenario_tag: "home" },
  { id: "pain", title: "pain", description: "index finger points firmly toward where it hurts.", difficulty: "growing", tags: ["safety", "feelings"], gesture_ids: ["pain"], scenario_tag: "safety" },
  { id: "tired", title: "tired", description: "fingers droop at the second knuckle — loose and heavy.", difficulty: "growing", tags: ["feelings", "daily"], gesture_ids: ["tired"], scenario_tag: "home" },
  { id: "play", title: "play", description: "'y' hand — thumb and pinky out, middle fingers curled; gentle shake.", difficulty: "growing", tags: ["family", "fun"], gesture_ids: ["play"], scenario_tag: "family" },
  { id: "sleep", title: "sleep", description: "soft fingers drift down the face, palm turning inward.", difficulty: "growing", tags: ["home", "daily"], gesture_ids: ["sleep"], scenario_tag: "home" },
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
  {
    id: "basic-conversation",
    name: "basic conversation",
    description: "greet, thank, apologise — the politeness loop every learner needs.",
    scenario_tag: "daily",
    steps: [
      { gesture_id: "hello", prompt: "sign 'hello'", hint: "open palm up — say hi." },
      { gesture_id: "thank_you", prompt: "sign 'thank you'", hint: "flat hand from chin outward, palm toward you." },
      { gesture_id: "please", prompt: "sign 'please'", hint: "soft hand at chest, small circle motion." },
      { gesture_id: "sorry", prompt: "sign 'sorry'", hint: "closed fist on chest — small circle." },
    ],
  },
  {
    id: "at-home",
    name: "at home",
    description: "everyday needs around the house — food, water, rest.",
    scenario_tag: "home",
    steps: [
      { gesture_id: "hello", prompt: "start with 'hello'", hint: "open palm wave." },
      { gesture_id: "food", prompt: "ask for 'food'", hint: "pinch fingertips together, tap toward the mouth." },
      { gesture_id: "water", prompt: "ask for 'water'", hint: "'w' shape, thumb across palm." },
      { gesture_id: "sleep", prompt: "sign 'sleep'", hint: "soft fingers drifting down the face." },
    ],
  },
  {
    id: "emergency-help",
    name: "emergency help",
    description: "urgent signs — help, stop, pain. practise them steady.",
    scenario_tag: "safety",
    steps: [
      { gesture_id: "help", prompt: "sign 'help'", hint: "thumb up on a closed fist, lifted on the other palm." },
      { gesture_id: "stop", prompt: "sign 'stop'", hint: "flat palm facing out, fingers straight up." },
      { gesture_id: "pain", prompt: "sign 'pain'", hint: "index out, a short firm jab forward." },
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

export async function createRoutine(
  payload: RoutineCreatePayload,
): Promise<Routine | null> {
  try {
    const res = await fetch(`${API_URL}/routines`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { routine: Routine };
    return data.routine;
  } catch {
    return null;
  }
}

export async function updateRoutine(
  id: string,
  payload: RoutineUpdatePayload,
): Promise<Routine | null> {
  try {
    const res = await fetch(`${API_URL}/routines/${id}`, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { routine: Routine };
    return data.routine;
  } catch {
    return null;
  }
}

export async function deleteRoutine(id: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_URL}/routines/${id}`, { method: "DELETE" });
    return res.ok;
  } catch {
    return false;
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
        incorrect_points: payload.incorrectPoints ?? [],
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

export async function fetchAnalytics(
  profileId: string,
): Promise<AnalyticsSnapshot | null> {
  try {
    const res = await fetch(`${API_URL}/analytics/${profileId}`, { cache: "no-store" });
    if (!res.ok) return null;
    const data = (await res.json()) as { analytics: AnalyticsSnapshot };
    return data.analytics;
  } catch {
    return null;
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
