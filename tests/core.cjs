const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const Module = require("node:module");
const ts = require("typescript");
require.extensions[".ts"] = (module, filename) => {
  module._compile(
    ts.transpileModule(fs.readFileSync(filename, "utf8"), {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2020,
        esModuleInterop: true,
      },
    }).outputText,
    filename,
  );
};
const { buildRoutine } = require("../src/data/workoutData.ts");
const {
  initialTimer,
  advance,
  skip,
  remainingSeconds,
} = require("../src/lib/timer.ts");
const { getStats, validProfile } = require("../src/lib/stats.ts");
const { goals, levels } = require("../src/types/workout.ts");
const session = (id, date, extra = {}) => ({
  id,
  userId: "local",
  date,
  durationSeconds: 1200,
  completed: true,
  ...extra,
});
test("every goal, level, progression and feedback combination is exactly 20 minutes", () => {
  for (const goal of goals)
    for (const fitnessLevel of levels)
      for (const count of [0, 3, 6, 9, 12])
        for (const feedback of ["easy", "right", "hard"]) {
          const history = Array.from({ length: count }, (_, i) =>
            session(String(i), "2026-09-05", { feedback }),
          );
          const routine = buildRoutine({ goal, fitnessLevel }, history);
          assert.equal(routine.totalSeconds, 1200);
          assert(routine.steps.every((s) => s.duration > 0));
          assert.equal(
            new Set(routine.steps.map((s) => s.id)).size,
            routine.steps.length,
          );
        }
});
test("movement restrictions change actual exercises and challenging feedback adds recovery", () => {
  const profile = {
    fitnessLevel: "very-fit",
    noFloor: true,
    noLunges: true,
    lowImpact: true,
  };
  const plan = buildRoutine(profile);
  assert(
    !plan.steps.some((s) =>
      /dead bugs|glute bridge|^plank$|^cat-cow$|mountain climber|reverse lunge|jog/i.test(
        s.label,
      ),
    ),
  );
  const right = buildRoutine(profile, [
    session("1", "2026-09-05", { feedback: "right" }),
  ]);
  const hard = buildRoutine(profile, [
    session("1", "2026-09-05", { feedback: "hard" }),
  ]);
  const easy = buildRoutine(
    { fitnessLevel: "somewhat-fit" },
    [session("1", "2026-09-05", { feedback: "easy" })],
  );
  const standard = buildRoutine({ fitnessLevel: "somewhat-fit" });
  const senior = buildRoutine({ fitnessLevel: "somewhat-fit", age: 68 });
  assert(hard.strengthWork < right.strengthWork);
  assert(hard.cardioWork < right.cardioWork);
  assert(easy.strengthWork > standard.strengthWork);
  assert(senior.strengthWork < standard.strengthWork);
  assert(senior.cardioWork < standard.cardioWork);
  assert.equal(senior.totalSeconds, 1200);
  assert(senior.adaptations.some((a) => /Age 68/i.test(a)));
  assert(!senior.steps.some((s) => /reverse lunge/i.test(s.label)));
});
test("timer handles variable durations, delayed ticks, pause and restart", () => {
  const steps = buildRoutine().steps;
  let state = { ...initialTimer(steps), running: true };
  state = advance(state, 187500, steps);
  assert.equal(state.index, 6);
  assert.equal(state.remainingMs, 12500);
  assert.equal(state.activeMs, 187500);
  assert.equal(remainingSeconds(state, steps), 1013);
  const paused = { ...state, running: false };
  assert.deepEqual(advance(paused, 60000, steps), paused);
  state = advance(state, 1200000, steps);
  assert.equal(state.finished, true);
  assert.equal(state.activeMs, 1200000);
  assert.equal(state.running, false);
  assert.equal(remainingSeconds(state, steps), 0);
  const restarted = initialTimer(steps);
  assert.equal(restarted.index, 0);
  assert.equal(restarted.finished, false);
  assert.equal(restarted.activeMs, 0);
});
test("skips never inflate active time, including last interval", () => {
  const steps = buildRoutine().steps;
  let state = advance({ ...initialTimer(steps), running: true }, 10000, steps);
  state = skip(state, steps);
  assert.equal(state.activeMs, 10000);
  assert.equal(state.index, 1);
  state = advance(state, 1200000, steps);
  assert.equal(state.activeMs, 1180000);
  assert.equal(state.skipped, 1);
  state = initialTimer(steps);
  for (let i = 0; i < steps.length; i++) state = skip(state, steps);
  assert.equal(state.activeMs, 0);
  assert.equal(state.finished, true);
});
test("streaks use distinct local days and include yesterday but exclude partial sessions", () => {
  const now = new Date(2026, 8, 5, 12);
  const history = [
    session("a", new Date(2026, 8, 4, 18).toISOString()),
    session("b", new Date(2026, 8, 4, 19).toISOString()),
    session("c", new Date(2026, 8, 3, 18).toISOString()),
    session("d", new Date(2026, 8, 5, 10).toISOString(), {
      completed: false,
      durationSeconds: 60,
    }),
  ];
  const stats = getStats(history, now);
  assert.equal(stats.streak, 2);
  assert.equal(stats.weekCount, 2);
  assert.equal(stats.total, 3);
  assert.equal(stats.minutes, 61);
  assert.equal(getStats(history, new Date(2026, 8, 7, 12)).streak, 0);
});
test("invalid age and unsupported profile choices fail validation", () => {
  const p = { goal: "cardio", fitnessLevel: "beginner" };
  assert(validProfile(p));
  assert(!validProfile({ ...p, age: -1 }));
  assert(!validProfile({ ...p, age: 25.5 }));
  assert(!validProfile({ ...p, goal: "unknown" }));
});
const memory = new Map();
let failWrite = false;
let permissionRequests = 0;
let granted = true;
let scheduled = [];
const storageMock = {
  getItem: async (k) => memory.get(k) ?? null,
  setItem: async (k, v) => {
    if (failWrite) throw new Error("disk full");
    memory.set(k, v);
  },
  removeItem: async (k) => {
    memory.delete(k);
  },
  multiRemove: async (keys) => {
    for (const k of keys) memory.delete(k);
  },
};
const notificationsMock = {
  getPermissionsAsync: async () => ({ granted }),
  requestPermissionsAsync: async () => {
    permissionRequests++;
    return { granted };
  },
  getAllScheduledNotificationsAsync: async () => [...scheduled],
  cancelScheduledNotificationAsync: async (id) => {
    scheduled = scheduled.filter((n) => n.identifier !== id);
  },
  scheduleNotificationAsync: async (n) => {
    scheduled.push(n);
    return n.identifier;
  },
  setNotificationHandler: () => {},
  SchedulableTriggerInputTypes: { DAILY: "daily" },
};
const originalLoad = Module._load;
Module._load = function (request, ...args) {
  if (request === "@react-native-async-storage/async-storage")
    return storageMock;
  if (request === "react-native") return { Platform: { OS: "ios" } };
  if (request === "expo-notifications") return notificationsMock;
  return originalLoad.call(this, request, ...args);
};
const storage = require("../src/lib/storage.ts");
const reminders = require("../src/lib/notifications.ts");
test("concurrent saves preserve history, feedback updates are idempotent, failures are surfaced", async () => {
  await Promise.all([
    storage.saveSession(session("a", "2026-09-05")),
    storage.saveSession(session("b", "2026-09-05")),
  ]);
  assert.equal((await storage.getStoredSessions()).length, 2);
  await storage.saveSession(session("a", "2026-09-05", { feedback: "hard" }));
  assert.equal((await storage.getStoredSessions()).length, 2);
  assert.equal((await storage.getStoredSessions())[0].feedback, "hard");
  failWrite = true;
  await storage.saveSession(session("c", "2026-09-05"));
  failWrite = false;
  await storage.saveSession(session("c", "2026-09-05"));
  assert.equal((await storage.getStoredSessions()).length, 3);
});
test("reminder state reflects schedules, does not request permission on read, deduplicates and cancels", async () => {
  assert.equal(await reminders.getReminderEnabled(), false);
  assert.equal(permissionRequests, 0);
  scheduled = [
    { identifier: "legacy", content: { title: "Workout time" } },
    { identifier: "unrelated", content: { title: "Other" } },
  ];
  await reminders.setWorkoutReminder(true);
  await reminders.setWorkoutReminder(true);
  assert.equal(scheduled.length, 2);
  assert.equal(await reminders.getReminderEnabled(), true);
  await reminders.setWorkoutReminder(false);
  assert.equal(scheduled.length, 1);
  assert.equal(scheduled[0].identifier, "unrelated");
  assert.equal(await reminders.getReminderEnabled(), false);
  granted = false;
  await assert.rejects(reminders.setWorkoutReminder(true));
  assert.equal(scheduled.length, 1);
});
test("clearStoredData resets both stored profile and workout sessions", async () => {
  await storage.saveProfile({ goal: "strength", fitnessLevel: "very-fit" });
  await storage.saveSession(session("x", "2026-09-05"));
  assert.equal((await storage.getStoredSessions()).length >= 1, true);
  await storage.clearStoredData();
  assert.equal(await storage.getStoredProfile(), null);
  assert.equal((await storage.getStoredSessions()).length, 0);
});
const { getYouTubeUrlForExercise, YOUTUBE_CHANNEL_URL } = require("../src/data/exerciseLinks.ts");
test("youtube links resolve to valid URLs and fall back to the FitFlow channel", () => {
  assert.equal(getYouTubeUrlForExercise(), YOUTUBE_CHANNEL_URL);
  assert.equal(getYouTubeUrlForExercise("Non-existent move"), YOUTUBE_CHANNEL_URL);
  assert.equal(
    getYouTubeUrlForExercise("Bodyweight squats"),
    "https://www.youtube.com/watch?v=qtwh-kxcWmE",
  );
  assert.equal(
    getYouTubeUrlForExercise("March in place"),
    "https://www.youtube.com/watch?v=QxwAmKbKW_8",
  );
});


