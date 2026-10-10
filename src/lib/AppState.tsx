import React, { createContext, useContext, useEffect, useState } from "react";
import {
  getStoredProfile,
  getStoredSessions,
  saveProfile,
  saveSession,
} from "./storage";
import type { UserProfile, WorkoutSession } from "../types/workout";
type State = {
  profile: UserProfile | null;
  sessions: WorkoutSession[];
  ready: boolean;
  error: string;
  reload: () => Promise<void>;
  updateProfile: (p: Partial<UserProfile> | UserProfile) => Promise<void>;
  recordSession: (s: WorkoutSession) => Promise<void>;
  clearData: () => Promise<void>;
};
const Context = createContext<State | null>(null);
export function AppProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  async function reload() {
    setError("");
    try {
      const [p, s] = await Promise.all([
        getStoredProfile(),
        getStoredSessions(),
      ]);
      setProfile(p);
      setSessions(s);
    } catch {
      setError("We couldn’t load your saved data. Please try again.");
    } finally {
      setReady(true);
    }
  }
  useEffect(() => {
    void reload();
  }, []);
  async function updateProfile(p: Partial<UserProfile> | UserProfile) {
    const next = { ...(profile ?? {}), ...p };
    await saveProfile(next);
    setProfile(next);
  }
  async function recordSession(s: WorkoutSession) {
    await saveSession(s);
    setSessions((previous) => [
      s,
      ...previous.filter((item) => item.id !== s.id),
    ]);
  }
  async function clearData() {
    const { clearStoredData } = await import("./storage");
    await clearStoredData();
    setProfile(null);
    setSessions([]);
  }
  return (
    <Context.Provider
      value={{
        profile,
        sessions,
        ready,
        error,
        reload,
        updateProfile,
        recordSession,
        clearData,
      }}
    >
      {children}
    </Context.Provider>
  );
}
export function useApp() {
  const state = useContext(Context);
  if (!state) throw new Error("AppProvider missing");
  return state;
}
