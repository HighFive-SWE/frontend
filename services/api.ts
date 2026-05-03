import { devlog } from "@/lib/devlog";
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
  // alphabet primer cards — one per letter, surfaced in the lessons feed so a
  // browsing learner can discover the alphabet section without typing the url.
  { id: "alphabet-a", title: "letter a", description: "closed fist with the thumb resting along the side — keep it flat, not tucked.", difficulty: "starter", tags: ["alphabet", "fingerspelling"], gesture_ids: ["letter_a"], scenario_tag: "alphabet" },
  { id: "alphabet-b", title: "letter b", description: "four fingers up flat; thumb crosses the palm to meet the pinky base.", difficulty: "starter", tags: ["alphabet", "fingerspelling"], gesture_ids: ["letter_b"], scenario_tag: "alphabet" },
  { id: "alphabet-c", title: "letter c", description: "fingers and thumb curve to form a relaxed letter c.", difficulty: "starter", tags: ["alphabet", "fingerspelling"], gesture_ids: ["letter_c"], scenario_tag: "alphabet" },
  { id: "alphabet-d", title: "letter d", description: "index up; the other three curl down so their tips touch the thumb pad.", difficulty: "starter", tags: ["alphabet", "fingerspelling"], gesture_ids: ["letter_d"], scenario_tag: "alphabet" },
  { id: "alphabet-e", title: "letter e", description: "fingers fold flat; thumb tucks horizontally across the fingertips.", difficulty: "growing", tags: ["alphabet", "fingerspelling"], gesture_ids: ["letter_e"], scenario_tag: "alphabet" },
  { id: "alphabet-f", title: "letter f", description: "thumb and index pinch into an 'ok'; middle, ring, and pinky stay tall.", difficulty: "starter", tags: ["alphabet", "fingerspelling"], gesture_ids: ["letter_f"], scenario_tag: "alphabet" },
  { id: "alphabet-g", title: "letter g", description: "fist on its side; thumb and index point forward in parallel.", difficulty: "growing", tags: ["alphabet", "fingerspelling"], gesture_ids: ["letter_g"], scenario_tag: "alphabet" },
  { id: "alphabet-h", title: "letter h", description: "index and middle stacked, pointing sideways; the rest fold down.", difficulty: "growing", tags: ["alphabet", "fingerspelling"], gesture_ids: ["letter_h"], scenario_tag: "alphabet" },
  { id: "alphabet-i", title: "letter i", description: "make a fist with the thumb across, then lift only the pinky.", difficulty: "starter", tags: ["alphabet", "fingerspelling"], gesture_ids: ["letter_i"], scenario_tag: "alphabet" },
  { id: "alphabet-j", title: "letter j", description: "start in 'i'; trace a small j hook in the air with the pinky.", difficulty: "growing", tags: ["alphabet", "fingerspelling"], gesture_ids: ["letter_j"], scenario_tag: "alphabet" },
  { id: "alphabet-k", title: "letter k", description: "index up, middle angled out; thumb rests in the v between them.", difficulty: "growing", tags: ["alphabet", "fingerspelling"], gesture_ids: ["letter_k"], scenario_tag: "alphabet" },
  { id: "alphabet-l", title: "letter l", description: "thumb out sideways and index straight up — a clean 90° angle.", difficulty: "starter", tags: ["alphabet", "fingerspelling"], gesture_ids: ["letter_l"], scenario_tag: "alphabet" },
  { id: "alphabet-m", title: "letter m", description: "fold the first three fingers down over the thumb; pinky stays curled.", difficulty: "growing", tags: ["alphabet", "fingerspelling"], gesture_ids: ["letter_m"], scenario_tag: "alphabet" },
  { id: "alphabet-n", title: "letter n", description: "fold index and middle over the thumb; ring and pinky stay tight.", difficulty: "growing", tags: ["alphabet", "fingerspelling"], gesture_ids: ["letter_n"], scenario_tag: "alphabet" },
  { id: "alphabet-o", title: "letter o", description: "all fingertips touch the thumb pad to form a round 'o'.", difficulty: "starter", tags: ["alphabet", "fingerspelling"], gesture_ids: ["letter_o"], scenario_tag: "alphabet" },
  { id: "alphabet-p", title: "letter p", description: "make a 'k' shape, then tip the whole hand so the index aims at the floor.", difficulty: "growing", tags: ["alphabet", "fingerspelling"], gesture_ids: ["letter_p"], scenario_tag: "alphabet" },
  { id: "alphabet-q", title: "letter q", description: "make a 'g', then tip the knuckles forward so it points downward.", difficulty: "growing", tags: ["alphabet", "fingerspelling"], gesture_ids: ["letter_q"], scenario_tag: "alphabet" },
  { id: "alphabet-r", title: "letter r", description: "twist the index over the middle; the rest curl with thumb across.", difficulty: "growing", tags: ["alphabet", "fingerspelling"], gesture_ids: ["letter_r"], scenario_tag: "alphabet" },
  { id: "alphabet-s", title: "letter s", description: "tight fist with the thumb wrapped over the front of the fingers.", difficulty: "starter", tags: ["alphabet", "fingerspelling"], gesture_ids: ["letter_s"], scenario_tag: "alphabet" },
  { id: "alphabet-t", title: "letter t", description: "fold the fingers; let the thumb peek between index and middle knuckles.", difficulty: "growing", tags: ["alphabet", "fingerspelling"], gesture_ids: ["letter_t"], scenario_tag: "alphabet" },
  { id: "alphabet-u", title: "letter u", description: "two fingers straight up and touching; ring and pinky curl over the thumb.", difficulty: "starter", tags: ["alphabet", "fingerspelling"], gesture_ids: ["letter_u"], scenario_tag: "alphabet" },
  { id: "alphabet-v", title: "letter v", description: "index and middle up but split apart; the others fold tight.", difficulty: "starter", tags: ["alphabet", "fingerspelling"], gesture_ids: ["letter_v"], scenario_tag: "alphabet" },
  { id: "alphabet-w", title: "letter w", description: "three fingers up like a fan; thumb pins the pinky across the palm.", difficulty: "starter", tags: ["alphabet", "fingerspelling"], gesture_ids: ["letter_w"], scenario_tag: "alphabet" },
  { id: "alphabet-x", title: "letter x", description: "fist with the index out and bent at the middle knuckle — a small hook.", difficulty: "growing", tags: ["alphabet", "fingerspelling"], gesture_ids: ["letter_x"], scenario_tag: "alphabet" },
  { id: "alphabet-y", title: "letter y", description: "extend thumb and pinky; the middle three fingers fold to the palm.", difficulty: "starter", tags: ["alphabet", "fingerspelling"], gesture_ids: ["letter_y"], scenario_tag: "alphabet" },
  { id: "alphabet-z", title: "letter z", description: "point with the index and trace a clean z — three quick strokes.", difficulty: "growing", tags: ["alphabet", "fingerspelling"], gesture_ids: ["letter_z"], scenario_tag: "alphabet" },
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
  // expanded library — additional scenario routines.
  {
    id: "morning-routine",
    name: "morning routine",
    description: "wake-up sequence — greet, ask for breakfast, head out.",
    scenario_tag: "home",
    steps: [
      { gesture_id: "hello", prompt: "say 'hello'", hint: "open palm wave." },
      { gesture_id: "eat", prompt: "ask to 'eat'", hint: "flat hand, fingertips tapping toward the mouth." },
      { gesture_id: "drink", prompt: "ask to 'drink'", hint: "c-shape hand tilted back to your lips." },
      { gesture_id: "school", prompt: "sign 'school'", hint: "flat palms clapping twice." },
      { gesture_id: "go", prompt: "sign 'go'", hint: "index finger out, thumb up — off you go." },
    ],
  },
  {
    id: "bedtime-routine",
    name: "bedtime routine",
    description: "wind-down — finish the day, ask for water, head to bed.",
    scenario_tag: "home",
    steps: [
      { gesture_id: "finished", prompt: "sign 'finished'", hint: "open palms flipped outward." },
      { gesture_id: "water", prompt: "ask for 'water'", hint: "'w' shape, thumb across palm." },
      { gesture_id: "tired", prompt: "sign 'tired'", hint: "fingers droop at the second knuckle." },
      { gesture_id: "sleep", prompt: "sign 'sleep'", hint: "soft fingers drift down the face." },
    ],
  },
  {
    id: "feelings-checkin",
    name: "feelings check-in",
    description: "name what you feel — pain, tired, finished, or more.",
    scenario_tag: "feelings",
    steps: [
      { gesture_id: "hello", prompt: "start with 'hello'", hint: "open palm wave." },
      { gesture_id: "tired", prompt: "sign 'tired'", hint: "fingers drooping at the knuckle." },
      { gesture_id: "pain", prompt: "sign 'pain'", hint: "index out — short firm jab." },
      { gesture_id: "help", prompt: "ask for 'help'", hint: "thumb up fist, lifted on the other palm." },
      { gesture_id: "thank_you", prompt: "say 'thank you'", hint: "flat hand from chin outward." },
    ],
  },
  {
    id: "polite-pair",
    name: "polite pair",
    description: "the two-word combo every kid hears — please and thank you.",
    scenario_tag: "manners",
    steps: [
      { gesture_id: "please", prompt: "sign 'please'", hint: "soft hand at the chest, small circle." },
      { gesture_id: "thank_you", prompt: "sign 'thank you'", hint: "flat hand from chin outward." },
    ],
  },
  {
    id: "yes-no-warmup",
    name: "yes / no warmup",
    description: "answer fast — yes, no, wait, finished.",
    scenario_tag: "communication",
    steps: [
      { gesture_id: "yes", prompt: "sign 'yes'", hint: "closed fist, gentle nod motion." },
      { gesture_id: "no", prompt: "sign 'no'", hint: "index and middle out, snap to thumb." },
      { gesture_id: "wait", prompt: "sign 'wait'", hint: "fingers half-curled, small wiggle." },
      { gesture_id: "finished", prompt: "sign 'finished'", hint: "open palms flipped outward." },
    ],
  },
  {
    id: "greeting-tour",
    name: "greeting tour",
    description: "warm-up that touches every introduction sign.",
    scenario_tag: "daily",
    steps: [
      { gesture_id: "hello", prompt: "sign 'hello'", hint: "open palm wave." },
      { gesture_id: "friend", prompt: "sign 'friend'", hint: "hook index fingers, swap which is on top." },
      { gesture_id: "family", prompt: "sign 'family'", hint: "pinch hand sweeping in a circle." },
      { gesture_id: "school", prompt: "sign 'school'", hint: "flat palms clapping twice." },
      { gesture_id: "thank_you", prompt: "sign 'thank you'", hint: "flat hand from chin outward." },
    ],
  },
  {
    id: "snack-time",
    name: "snack time",
    description: "ask for what you want — eat, drink, more, finished.",
    scenario_tag: "mealtime",
    steps: [
      { gesture_id: "please", prompt: "start with 'please'", hint: "soft hand at the chest, small circle." },
      { gesture_id: "eat", prompt: "ask to 'eat'", hint: "fingertips tap toward the mouth." },
      { gesture_id: "drink", prompt: "ask to 'drink'", hint: "c-shape hand tilted to your lips." },
      { gesture_id: "more", prompt: "ask for 'more'", hint: "pinched fingertips tapped together." },
      { gesture_id: "finished", prompt: "sign 'finished'", hint: "open palms flipped outward." },
    ],
  },
  {
    id: "safety-drill",
    name: "safety drill",
    description: "the urgent set — stop, help, pain, doctor.",
    scenario_tag: "safety",
    steps: [
      { gesture_id: "stop", prompt: "sign 'stop'", hint: "flat palm forward, fingers up, held still." },
      { gesture_id: "help", prompt: "sign 'help'", hint: "thumb up fist lifted on the other palm." },
      { gesture_id: "pain", prompt: "sign 'pain'", hint: "index out — short firm jab." },
      { gesture_id: "doctor", prompt: "sign 'doctor'", hint: "'d' hand tapped on the wrist." },
    ],
  },
  {
    id: "house-tour",
    name: "house tour",
    description: "walking signs around the house — home, bathroom, sleep.",
    scenario_tag: "home",
    steps: [
      { gesture_id: "home", prompt: "sign 'home'", hint: "pinched fingertips from cheek to jaw." },
      { gesture_id: "bathroom", prompt: "sign 'bathroom'", hint: "fist with thumb between index and middle, shake." },
      { gesture_id: "sleep", prompt: "sign 'sleep'", hint: "soft fingers drifting down the face." },
      { gesture_id: "finished", prompt: "sign 'finished'", hint: "open palms flipped outward." },
    ],
  },
  {
    id: "come-and-go",
    name: "come and go",
    description: "directions in motion — come, go, wait, more.",
    scenario_tag: "communication",
    steps: [
      { gesture_id: "come", prompt: "sign 'come'", hint: "index finger beckoning, palm up." },
      { gesture_id: "wait", prompt: "sign 'wait'", hint: "fingers half-curled, small wiggle." },
      { gesture_id: "go", prompt: "sign 'go'", hint: "index out, thumb up — off you go." },
      { gesture_id: "more", prompt: "ask for 'more'", hint: "pinched fingertips tapped together." },
    ],
  },
  // alphabet practice routines — small letter clusters that stay under the
  // 6-step backend cap and ladder by hand-shape similarity so each routine
  // feels like a natural drill set.
  {
    id: "alphabet-vowels",
    name: "vowels — a · e · i · o · u",
    description: "the five vowels in a row — same anchor, five different shapes.",
    scenario_tag: "alphabet",
    steps: [
      { gesture_id: "letter_a", prompt: "sign 'a'", hint: "closed fist with the thumb resting along the side." },
      { gesture_id: "letter_e", prompt: "sign 'e'", hint: "fingers fold flat; thumb tucks across the fingertips." },
      { gesture_id: "letter_i", prompt: "sign 'i'", hint: "fist with the thumb across; lift only the pinky." },
      { gesture_id: "letter_o", prompt: "sign 'o'", hint: "all fingertips touch the thumb to form a round o." },
      { gesture_id: "letter_u", prompt: "sign 'u'", hint: "index and middle straight up and touching." },
    ],
  },
  {
    id: "alphabet-easy-five",
    name: "easy five — a · b · c · l · y",
    description: "starter shapes that are visually distinct and easy to hold.",
    scenario_tag: "alphabet",
    steps: [
      { gesture_id: "letter_a", prompt: "sign 'a'", hint: "closed fist, thumb along the side." },
      { gesture_id: "letter_b", prompt: "sign 'b'", hint: "four fingers up flat, thumb across the palm." },
      { gesture_id: "letter_c", prompt: "sign 'c'", hint: "fingers and thumb curve like a c." },
      { gesture_id: "letter_l", prompt: "sign 'l'", hint: "thumb out sideways, index straight up." },
      { gesture_id: "letter_y", prompt: "sign 'y'", hint: "thumb and pinky out, middle three folded." },
    ],
  },
  {
    id: "alphabet-pairs-mn",
    name: "tricky pair — m vs n",
    description: "two letters that share a thumb-tucked shape; nail the difference.",
    scenario_tag: "alphabet",
    steps: [
      { gesture_id: "letter_m", prompt: "sign 'm' (three fingers over thumb)", hint: "fold index, middle, and ring down over the thumb." },
      { gesture_id: "letter_n", prompt: "sign 'n' (two fingers over thumb)", hint: "fold only index and middle over the thumb." },
      { gesture_id: "letter_t", prompt: "now 't' — thumb peeks between fingers", hint: "thumb tip pops up between index and middle knuckles." },
    ],
  },
  {
    id: "alphabet-pairs-kp",
    name: "tricky pair — k vs p",
    description: "same hand shape, different palm direction.",
    scenario_tag: "alphabet",
    steps: [
      { gesture_id: "letter_k", prompt: "sign 'k' — index up, middle out", hint: "v-shape with thumb in the gap; palm faces forward." },
      { gesture_id: "letter_p", prompt: "sign 'p' — same shape, palm down", hint: "tip the whole hand so the index aims at the floor." },
    ],
  },
  {
    id: "alphabet-pairs-gq",
    name: "tricky pair — g vs q",
    description: "another rotation pair — g points forward, q points down.",
    scenario_tag: "alphabet",
    steps: [
      { gesture_id: "letter_g", prompt: "sign 'g'", hint: "fist on its side; thumb and index point forward." },
      { gesture_id: "letter_q", prompt: "sign 'q'", hint: "same shape, but tipped so it points at the floor." },
    ],
  },
  {
    id: "alphabet-pairs-uv",
    name: "tricky pair — u vs v",
    description: "two fingers up — together for u, spread for v.",
    scenario_tag: "alphabet",
    steps: [
      { gesture_id: "letter_u", prompt: "sign 'u'", hint: "index and middle straight up, touching." },
      { gesture_id: "letter_v", prompt: "sign 'v'", hint: "index and middle up, but split apart." },
    ],
  },
  {
    id: "spell-mom",
    name: "spell 'mom'",
    description: "your first family word — three letters, three shapes.",
    scenario_tag: "alphabet",
    steps: [
      { gesture_id: "letter_m", prompt: "1/3 · sign 'm'", hint: "fold three fingers down over the thumb." },
      { gesture_id: "letter_o", prompt: "2/3 · sign 'o'", hint: "fingertips touch the thumb to form an o." },
      { gesture_id: "letter_m", prompt: "3/3 · sign 'm' again", hint: "back to the m shape — pause, hold, breathe." },
    ],
  },
  {
    id: "spell-dad",
    name: "spell 'dad'",
    description: "another family word — d to a and back.",
    scenario_tag: "alphabet",
    steps: [
      { gesture_id: "letter_d", prompt: "1/3 · sign 'd'", hint: "index up; the other three curl to meet the thumb pad." },
      { gesture_id: "letter_a", prompt: "2/3 · sign 'a'", hint: "closed fist, thumb along the side." },
      { gesture_id: "letter_d", prompt: "3/3 · sign 'd' again", hint: "back to the d shape." },
    ],
  },
  {
    id: "spell-yes",
    name: "spell 'yes'",
    description: "fingerspell what you also know as a single sign.",
    scenario_tag: "alphabet",
    steps: [
      { gesture_id: "letter_y", prompt: "1/3 · sign 'y'", hint: "thumb and pinky out, middle three folded." },
      { gesture_id: "letter_e", prompt: "2/3 · sign 'e'", hint: "fingers fold flat; thumb tucks across them." },
      { gesture_id: "letter_s", prompt: "3/3 · sign 's'", hint: "tight fist, thumb wrapped over the front." },
    ],
  },
  {
    id: "spell-cat",
    name: "spell 'cat'",
    description: "starter animal — three crisp letters.",
    scenario_tag: "alphabet",
    steps: [
      { gesture_id: "letter_c", prompt: "1/3 · sign 'c'", hint: "fingers and thumb curve into a c." },
      { gesture_id: "letter_a", prompt: "2/3 · sign 'a'", hint: "closed fist, thumb along the side." },
      { gesture_id: "letter_t", prompt: "3/3 · sign 't'", hint: "thumb peeks between index and middle knuckles." },
    ],
  },
  {
    id: "spell-dog",
    name: "spell 'dog'",
    description: "another animal — d, then o, then g.",
    scenario_tag: "alphabet",
    steps: [
      { gesture_id: "letter_d", prompt: "1/3 · sign 'd'", hint: "index up; others curl to meet the thumb." },
      { gesture_id: "letter_o", prompt: "2/3 · sign 'o'", hint: "round 'o' — fingertips meet the thumb." },
      { gesture_id: "letter_g", prompt: "3/3 · sign 'g'", hint: "fist on its side, thumb and index forward." },
    ],
  },
  {
    id: "spell-fox",
    name: "spell 'fox'",
    description: "shape jump — f, o, x — three very different hands.",
    scenario_tag: "alphabet",
    steps: [
      { gesture_id: "letter_f", prompt: "1/3 · sign 'f'", hint: "thumb and index pinch; middle/ring/pinky stay tall." },
      { gesture_id: "letter_o", prompt: "2/3 · sign 'o'", hint: "round 'o' — fingertips meet the thumb." },
      { gesture_id: "letter_x", prompt: "3/3 · sign 'x'", hint: "fist with the index out and bent at the knuckle." },
    ],
  },
  {
    id: "spell-zoo",
    name: "spell 'zoo'",
    description: "trace a z, then double 'o' — three shapes, two repeated.",
    scenario_tag: "alphabet",
    steps: [
      { gesture_id: "letter_z", prompt: "1/3 · sign 'z'", hint: "point with the index and trace a clean z." },
      { gesture_id: "letter_o", prompt: "2/3 · sign 'o'", hint: "round 'o' — fingertips meet the thumb." },
      { gesture_id: "letter_o", prompt: "3/3 · sign 'o' again", hint: "hold the same 'o' shape — pause for the gap." },
    ],
  },
  {
    id: "spell-hi",
    name: "spell 'hi'",
    description: "your shortest spell-along — just two letters.",
    scenario_tag: "alphabet",
    steps: [
      { gesture_id: "letter_h", prompt: "1/2 · sign 'h'", hint: "index and middle stacked, pointing sideways." },
      { gesture_id: "letter_i", prompt: "2/2 · sign 'i'", hint: "fist with the thumb across; lift only the pinky." },
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
//
// upg-7: every body carries a stable idempotency key generated at build
// time. the same key flows through httpJson's retries AND through the
// queue replay path, because both reuse the body verbatim. the backend
// dedupes on this token within a 24h window, so a server-committed-but-
// response-lost post can't double-credit the learner on the next try.
function newIdempotencyKey(): string {
  // crypto.randomUUID is browser + node 19+ native — no dependency. the
  // fallback is just a defensive belt for older runtimes (none in production
  // today, but cheap to write).
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `idem-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
}

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
    idempotency_key: newIdempotencyKey(),
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
    devlog("progress.queue", { gestureId: payload.gestureId, queued: true });
    return null;
  }
}

// phase 9: flush the queued progress posts one-by-one. exported so the
// online/offline hook (see hooks/useOnlineStatus) can invoke it on reconnect.
// returns the count successfully drained.
//
// dedup: a module-level lock guards against two concurrent flushes (e.g. the
// online event AND the visibility event firing within the same tick). without
// it, both calls would read the same queue snapshot and double-post each entry
// before either had a chance to remove its row. queueRemove(id) on success is
// what guarantees no entry is sent twice across separate flushes.
//
// upg-9: between failed drains we honour an exponential backoff window so a
// flapping server doesn't get hammered every time the browser fires an online
// or visibility event. the window resets the moment a drain fully succeeds.
let _flushInFlight = false;
let _flushFailures = 0;
let _flushNotBefore = 0;

const FLUSH_BACKOFF_BASE_MS = 1000;
const FLUSH_BACKOFF_MAX_MS = 30_000;

function _flushBackoffMs(failures: number): number {
  if (failures <= 0) return 0;
  const exp = FLUSH_BACKOFF_BASE_MS * 2 ** Math.min(failures - 1, 6);
  return Math.min(FLUSH_BACKOFF_MAX_MS, exp);
}

export async function flushQueuedProgress(): Promise<number> {
  if (_flushInFlight) return 0;
  if (Date.now() < _flushNotBefore) return 0;
  _flushInFlight = true;
  try {
    const entries = queueRead();
    if (entries.length === 0) {
      // nothing to drain — clear any stale backoff so the next real failure
      // starts the ladder from 1s rather than continuing from a prior climb.
      _flushFailures = 0;
      _flushNotBefore = 0;
      return 0;
    }
    devlog("queue.flush.start", { pending: entries.length });
    let drained = 0;
    let stalled = false;
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
        stalled = true;
        break;
      }
    }
    if (stalled) {
      _flushFailures += 1;
      const wait = _flushBackoffMs(_flushFailures);
      _flushNotBefore = Date.now() + wait;
      devlog("queue.flush.backoff", { failures: _flushFailures, waitMs: wait });
    } else {
      _flushFailures = 0;
      _flushNotBefore = 0;
    }
    if (drained > 0) devlog("queue.flush.done", { drained });
    return drained;
  } finally {
    _flushInFlight = false;
  }
}

export async function fetchProgress(profileId: string): Promise<{
  summary: ProgressSummary;
  recent: unknown[];
} | null> {
  const cacheKey = `progress:${profileId}`;
  try {
    const data = await httpJson<{ summary: ProgressSummary; recent: unknown[] }>(
      `${API_URL}/progress/${encodeURIComponent(profileId)}`,
    );
    cacheWrite(cacheKey, data);
    return data;
  } catch {
    // phase 9: keep the HUD populated when the server's gone — the learner's
    // last-known summary is still meaningful while they practise offline.
    const cached = cacheRead<{ summary: ProgressSummary; recent: unknown[] }>(cacheKey);
    return cached?.data ?? null;
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
  const cacheKey = `analytics:${profileId}`;
  try {
    const data = await httpJson<{ analytics: AnalyticsSnapshot }>(
      `${API_URL}/analytics/${encodeURIComponent(profileId)}`,
    );
    cacheWrite(cacheKey, data.analytics);
    return data.analytics;
  } catch {
    // phase 9: educator dashboard renders the last-cached snapshot when the
    // backend is unreachable instead of going blank.
    const cached = cacheRead<AnalyticsSnapshot>(cacheKey);
    return cached?.data ?? null;
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
