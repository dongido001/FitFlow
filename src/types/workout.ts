export const goals = [
  "general-health",
  "strength",
  "cardio",
  "mobility",
  "fat-loss",
] as const;
export const levels = ["beginner", "somewhat-fit", "very-fit"] as const;
export type WorkoutGoal = (typeof goals)[number];
export type FitnessLevel = (typeof levels)[number];
export type Feedback = "easy" | "right" | "hard";
export type UserProfile = {
  age?: number;
  goal?: WorkoutGoal;
  fitnessLevel?: FitnessLevel;
  noFloor?: boolean;
  noLunges?: boolean;
  lowImpact?: boolean;
  onboardingComplete?: boolean;
  ambientMusic?: boolean;
  soundBeeps?: boolean;
  hapticsEnabled?: boolean;
  reminderHour?: number;
  reminderMinute?: number;
};
export type WorkoutSession = {
  id: string;
  userId: string;
  date: string;
  durationSeconds: number;
  completed: boolean;
  skippedSteps?: number;
  feedback?: Feedback;
};
export const goalLabels: Record<WorkoutGoal, string> = {
  "general-health": "Everyday fitness",
  strength: "Build strength",
  cardio: "Cardio fitness",
  mobility: "Move more freely",
  "fat-loss": "Build an active habit",
};
export const goalSummaries: Record<WorkoutGoal, string> = {
  "general-health": "Balanced joint mobility, functional strength, and steady cardio.",
  strength: "Controlled bodyweight resistance and core stability.",
  cardio: "Rhythmic, heart-healthy intervals to boost daily stamina.",
  mobility: "Gentle range-of-motion flows to release stiffness and tension.",
  "fat-loss": "Consistent full-body movement to build sustainable energy.",
};
export const levelLabels: Record<FitnessLevel, string> = {
  beginner: "Starting out",
  "somewhat-fit": "Building momentum",
  "very-fit": "Moving regularly",
};
export const reminderPresets = [
  { label: "7:30 AM", period: "Morning", hour: 7, minute: 30 },
  { label: "12:30 PM", period: "Midday", hour: 12, minute: 30 },
  { label: "6:00 PM", period: "Evening", hour: 18, minute: 0 },
  { label: "8:30 PM", period: "Night", hour: 20, minute: 30 },
] as const;
