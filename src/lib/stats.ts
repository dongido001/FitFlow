import type { WorkoutSession } from "../types/workout";
export const dayKey = (date: Date) =>
  `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
export function getStats(sessions: WorkoutSession[], now = new Date()) {
  const complete = sessions.filter((s) => s.completed);
  const days = new Set(complete.map((s) => dayKey(new Date(s.date))));
  const cursor = new Date(now);
  if (!days.has(dayKey(cursor))) cursor.setDate(cursor.getDate() - 1);
  let streak = 0;
  while (days.has(dayKey(cursor))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  const week = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(now);
    date.setDate(date.getDate() - 6 + i);
    return {
      key: dayKey(date),
      label: date.toLocaleDateString("en", { weekday: "narrow" }),
      dayNum: date.getDate(),
      done: days.has(dayKey(date)),
      today: i === 6,
    };
  });
  return {
    total: complete.length,
    minutes: Math.floor(
      sessions.reduce((n, s) => n + s.durationSeconds, 0) / 60,
    ),
    streak,
    week,
    weekCount: week.filter((d) => d.done).length,
  };
}
export const formatTime = (seconds: number) =>
  `${Math.floor(seconds / 60)}:${Math.floor(seconds % 60)
    .toString()
    .padStart(2, "0")}`;
export function validProfile(
  value: unknown,
): value is import("../types/workout").UserProfile {
  if (!value || typeof value !== "object") return false;
  const p = value as import("../types/workout").UserProfile;
  return (
    ["general-health", "strength", "cardio", "mobility", "fat-loss"].includes(
      p.goal ?? "",
    ) &&
    ["beginner", "somewhat-fit", "very-fit"].includes(p.fitnessLevel ?? "") &&
    (p.age === undefined ||
      (Number.isInteger(p.age) && p.age >= 13 && p.age <= 120))
  );
}
