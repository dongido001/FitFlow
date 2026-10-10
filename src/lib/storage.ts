import AsyncStorage from "@react-native-async-storage/async-storage";
import { UserProfile, WorkoutSession } from "../types/workout";
const PROFILE = "fitflow_user_profile";
const SESSIONS = "fitflow_workout_sessions";
let memoryProfile: UserProfile | null = null;
let memorySessions: WorkoutSession[] = [];
export async function getStoredProfile(): Promise<UserProfile | null> {
  let raw: string | null;
  try { raw = await AsyncStorage.getItem(PROFILE); } catch { return memoryProfile; }
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) return parsed;
  } catch { /* Recover from a partial profile write. */ }
  await AsyncStorage.removeItem(PROFILE).catch(() => undefined);
  return memoryProfile;
}
export async function saveProfile(profile: UserProfile) {
  memoryProfile = profile;
  await AsyncStorage.setItem(PROFILE, JSON.stringify(profile)).catch(() => undefined);
}
export async function getStoredSessions(): Promise<WorkoutSession[]> {
  let raw: string | null;
  try { raw = await AsyncStorage.getItem(SESSIONS); } catch { return memorySessions; }
  if (!raw) return memorySessions;
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) throw new Error("invalid history");
    const valid = parsed.filter(
      (s) => typeof s.id === "string" && typeof s.date === "string" &&
        Number.isFinite(Date.parse(s.date)) && typeof s.completed === "boolean" &&
        Number.isFinite(s.durationSeconds) && s.durationSeconds >= 0,
    );
    memorySessions = valid;
    return valid;
  } catch {
    await AsyncStorage.removeItem(SESSIONS).catch(() => undefined);
    return memorySessions;
  }
}
let pending: Promise<unknown> = Promise.resolve();
export function saveSession(session: WorkoutSession): Promise<void> {
  const operation = pending
    .catch(() => undefined)
    .then(async () => {
      const sessions = await getStoredSessions();
      const next = [session, ...sessions.filter((s) => s.id !== session.id)];
      memorySessions = next;
      await AsyncStorage.setItem(SESSIONS, JSON.stringify(next)).catch(() => undefined);
    });
  pending = operation;
  return operation;
}
export async function clearStoredData(): Promise<void> {
  memoryProfile = null;
  memorySessions = [];
  await AsyncStorage.multiRemove([PROFILE, SESSIONS]).catch(() => undefined);
}
