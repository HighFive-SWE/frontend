import { cacheRead, cacheWrite, queueAppend, queueRead, queueRemove, queueTouch } from "./cache";
import { HttpFailure, httpJson } from "./http";

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
  { id: "drink", title: "drink", description: "c-shape hand tilted back — like holding a cup to your lips.", difficulty: "starter", tags: ["mealtime", "needs"], gesture_ids: ["drink"], scenario_tag: "mealtime" },
  { id: "eat", title: "eat", description: "relaxed flat hand, fingertips tapping toward the mouth.", difficulty: "starter", tags: ["mealtime", "needs"], gesture_ids: ["eat"], scenario_tag: "mealtime" },
  { id: "friend", title: "friend", description: "hook index fingers together, swap which is on top.", difficulty: "growing", tags: ["people", "family"], gesture_ids: ["friend"], scenario_tag: "family" },
  { id: "family", title: "family", description: "pinch hand sweeping in a circle — everyone together.", difficulty: "growing", tags: ["people", "family"], gesture_ids: ["family"], scenario_tag: "family" },
  { id: "doctor", title: "doctor", description: "'d' hand tapped on the opposite wrist — taking a pulse.", difficulty: "growing", tags: ["safety", "people"], gesture_ids: ["doctor"], scenario_tag: "safety" },
  { id: "school", title: "school", description: "flat palms clapping twice — calling attention.", difficulty: "growing", tags: ["places", "daily"], gesture_ids: ["school"], scenario_tag: "daily" },
  { id: "home", title: "home", description: "pinched fingertips from cheek to jaw — where you eat and sleep.", difficulty: "starter", tags: ["places", "daily"], gesture_ids: ["home"], scenario_tag: "home" },
  { id: "wait", title: "wait", description: "open hands, fingers half-curled, held up with a small wiggle.", difficulty: "growing", tags: ["daily", "communication"], gesture_ids: ["wait"], scenario_tag: "daily" },
  { id: "come", title: "come", description: "index finger beckoning toward you — palm up.", difficulty: "growing", tags: ["daily", "communication"], gesture_ids: ["come"], scenario_tag: "daily" },
  { id: "go", title: "go", description: "index finger pointing outward, thumb up — off you go.", difficulty: "growing", tags: ["daily", "communication"], gesture_ids: ["go"], scenario_tag: "daily" },
  { id: "more", title: "more", description: "pinched fingertips tapped together twice.", difficulty: "starter", tags: ["mealtime", "requests"], gesture_ids: ["more"], scenario_tag: "mealtime" },
  { id: "finished", title: "finished", description: "open palms flipped outward — all done.", difficulty: "starter", tags: ["daily", "communication"], gesture_ids: ["finished"], scenario_tag: "daily" },
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
  {
    id: "school-day",
    name: "school day",
    description: "signs you might use before, during, or after school.",
    scenario_tag: "daily",
    steps: [
      { gesture_id: "hello", prompt: "greet your teacher", hint: "open palm wave." },
      { gesture_id: "school", prompt: "sign 'school'", hint: "flat palms clapping — calling attention." },
      { gesture_id: "friend", prompt: "sign 'friend'", hint: "hook index fingers and swap." },
      { gesture_id: "finished", prompt: "sign 'finished'", hint: "open palms flipped outward — day's done." },
    ],
  },
  {
    id: "doctor-visit",
    name: "doctor visit",
    description: "practise telling the doctor what you need.",
    scenario_tag: "safety",
    steps: [
      { gesture_id: "hello", prompt: "greet the doctor", hint: "open palm wave." },
      { gesture_id: "doctor", prompt: "sign 'doctor'", hint: "'d' hand tapped on the wrist." },
      { gesture_id: "pain", prompt: "sign 'pain'", hint: "index out — firm jab." },
      { gesture_id: "help", prompt: "ask for 'help'", hint: "thumb up fist, lifted." },
      { gesture_id: "thank_you", prompt: "sign 'thank you'", hint: "flat hand from chin outward." },
    ],
  },
  {
    id: "play-time",
    name: "play time",
    description: "hang out with friends — invite, play, and wrap up.",
    scenario_tag: "family",
    steps: [
      { gesture_id: "come", prompt: "beckon a friend", hint: "index finger beckoning — palm up." },
      { gesture_id: "play", prompt: "sign 'play'", hint: "'y' hand — thumb and pinky out, shake." },
      { gesture_id: "more", prompt: "ask for 'more'", hint: "pinched fingertips tapped together." },
      { gesture_id: "finished", prompt: "sign 'finished'", hint: "open palms flipped outward." },
    ],
  },
];

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

// phase 9: read-through cache pattern for GET endpoints. on success we
// persist to localStorage; on failure we return whatever's cached (or the
// seeded fallback). this is what makes the app boot cleanly from an
// airplane or a flaky coffee-shop wifi.
async function getWithCache<T>(
  cacheKey: string,
  url: string,
  pick: (json: unknown) => T,
  seed: T,
): Promise<T> {
  try {
    const json = await httpJson<unknown>(url);
    const data = pick(json);
    cacheWrite(cacheKey, data);
    return data;
  } catch {
    const cached = cacheRead<T>(cacheKey);
    if (cached) return cached.data;
    return seed;
  }
}

export async function fetchLessons(): Promise<Lesson[]> {
  return getWithCache(
    "lessons",
    `${API_URL}/lessons`,
    (json) => (json as { lessons: Lesson[] }).lessons,
    fallbackLessons,
  );
}

export async function fetchHealth(): Promise<{ status: string }> {
  return httpJson<{ status: string }>(`${API_URL}/health`, {
    retries: 0,
    timeoutMs: 3000,
  });
}

export async function fetchRoutines(): Promise<Routine[]> {
  return getWithCache(
    "routines",
    `${API_URL}/routines`,
    (json) => (json as { routines: Routine[] }).routines,
    fallbackRoutines,
  );
}

export async function fetchRoutine(id: string): Promise<Routine> {
  try {
    const data = await httpJson<{ routine: Routine }>(`${API_URL}/routines/${id}`);
    return data.routine;
  } catch {
    const cachedList = cacheRead<Routine[]>("routines")?.data;
    const found =
      cachedList?.find((r) => r.id === id) ?? fallbackRoutines.find((r) => r.id === id);
    if (!found) throw new Error(`routine '${id}' not found`);
    return found;
  }
}

export async function createRoutine(
  payload: RoutineCreatePayload,
): Promise<Routine | null> {
  try {
    const data = await httpJson<{ routine: Routine }>(`${API_URL}/routines`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
      retries: 1,
    });
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
    const data = await httpJson<{ routine: Routine }>(`${API_URL}/routines/${id}`, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
      retries: 1,
    });
    return data.routine;
  } catch {
    return null;
  }
}

export async function deleteRoutine(id: string): Promise<boolean> {
  try {
    await httpJson<unknown>(`${API_URL}/routines/${id}`, { method: "DELETE", retries: 1 });
    return true;
  } catch {
    return false;
  }
}

export async function evaluateGesture(payload: EvaluatePayload): Promise<EvaluateResponse> {
  return httpJson<EvaluateResponse>(`${API_URL}/cv/evaluate`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      gesture_id: payload.gestureId,
      landmarks: payload.landmarks,
      user_id: payload.profileId,
    }),
    retries: 1,
    timeoutMs: 4000,
  });
}

// phase 9: on post failure we enqueue the payload to localStorage so a
// subsequent reconnect can flush it — the learner's attempt isn't lost even
// if the network was down at the moment of success.
function buildProgressBody(payload: ProgressPayload) {
  return {
    profile_id: payload.profileId,
    routine_id: payload.routineId,
    gesture_id: payload.gestureId,
    accuracy: payload.accuracy,
    band: payload.band,
    attempts: payload.attempts,
    succeeded: payload.succeeded,
    completed_routine: payload.completedRoutine ?? false,
    incorrect_points: payload.incorrectPoints ?? [],
  };
}

export async function postProgress(
  payload: ProgressPayload,
): Promise<ProgressPostResult | null> {
  const body = buildProgressBody(payload);
  try {
    return await httpJson<ProgressPostResult>(`${API_URL}/progress`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
      retries: 2,
    });
  } catch (err) {
    // only queue once we've actually exhausted retries. the HttpFailure type
    // tells us whether we stopped due to a non-retriable http code vs network
    // loss — we queue on any failure so the learner's work isn't lost.
    if (err instanceof HttpFailure) queueAppend(body);
    return null;
  }
}

// phase 9: flush the queued progress posts one-by-one. exported so the
// online/offline hook (see hooks/useOnlineStatus) can invoke it on reconnect.
// returns the count successfully drained.
export async function flushQueuedProgress(): Promise<number> {
  const entries = queueRead();
  let drained = 0;
  for (const entry of entries) {
    queueTouch(entry.id);
    try {
      await httpJson<ProgressPostResult>(`${API_URL}/progress`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(entry.payload),
        retries: 1,
      });
      queueRemove(entry.id);
      drained += 1;
    } catch {
      // if one fails (still offline, server still down), stop here — the
      // rest remain queued for the next reconnect.
      break;
    }
  }
  return drained;
}

export async function fetchProgress(profileId: string): Promise<{
  summary: ProgressSummary;
  recent: unknown[];
} | null> {
  try {
    return await httpJson<{ summary: ProgressSummary; recent: unknown[] }>(
      `${API_URL}/progress/${encodeURIComponent(profileId)}`,
    );
  } catch {
    return null;
  }
}

// --- profile api -----------------------------------------------------------

export async function fetchProfiles(userId?: string): Promise<Profile[]> {
  const qs = userId ? `?user_id=${encodeURIComponent(userId)}` : "";
  return getWithCache(
    `profiles${qs}`,
    `${API_URL}/profiles${qs}`,
    (json) => (json as { profiles: Profile[] }).profiles,
    fallbackProfiles,
  );
}

export async function fetchAnalytics(
  profileId: string,
): Promise<AnalyticsSnapshot | null> {
  try {
    const data = await httpJson<{ analytics: AnalyticsSnapshot }>(
      `${API_URL}/analytics/${encodeURIComponent(profileId)}`,
    );
    return data.analytics;
  } catch {
    return null;
  }
}

export async function createProfile(
  payload: ProfileCreatePayload,
): Promise<Profile | null> {
  try {
    const data = await httpJson<{ profile: Profile }>(`${API_URL}/profiles`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        display_name: payload.displayName,
        avatar: payload.avatar,
        role: payload.role ?? "child",
        age_group: payload.ageGroup ?? "middle",
        user_id: payload.userId,
      }),
      retries: 1,
    });
    return data.profile;
  } catch {
    return null;
  }
}
