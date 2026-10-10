import type { UserProfile, WorkoutSession } from "../types/workout";
export type RoutineStep = {
  id: string;
  label: string;
  duration: number;
  category: "Warm-up" | "Strength" | "Cardio" | "Core" | "Cool-down";
  detail: string;
  recovery?: boolean;
  alternative?: { label: string; detail: string };
};
type Move = {
  label: string;
  detail: string;
  floor?: boolean;
  lunge?: boolean;
  alternative?: { label: string; detail: string };
};
const march: Move = {
  label: "March in place",
  detail:
    "Stand tall. Swing your arms and land softly. Set a pace that lets you speak.",
};
const squat: Move = {
  label: "Bodyweight squats",
  detail:
    "Feet about hip-width apart. Send hips back and stand through your heels.",
  alternative: {
    label: "Shallow squats",
    detail: "Use a smaller range. Hold a stable chair for balance if needed.",
  },
};
const push: Move = {
  label: "Wall push-ups",
  detail:
    "Hands on a wall at chest height. Bend your elbows, then press away with control.",
  alternative: {
    label: "Standing chest press",
    detail:
      "Press your palms together at chest height, hold briefly, then relax.",
  },
};
const bridge: Move = {
  label: "Glute bridges",
  floor: true,
  detail:
    "Lie on your back, knees bent. Press through heels to lift your hips.",
  alternative: {
    label: "Standing hip extensions",
    detail:
      "Hold a stable support. Extend one leg gently behind you, then switch.",
  },
};
const lunge: Move = {
  label: "Reverse lunges",
  lunge: true,
  detail:
    "Step back gently. Bend both knees within a comfortable range, then switch.",
  alternative: {
    label: "Side-to-side weight shifts",
    detail:
      "Keep both feet planted. Shift your weight gently from side to side.",
  },
};
const deadbug: Move = {
  label: "Dead bugs",
  floor: true,
  detail: "Lie on your back. Slowly extend opposite arm and leg, then switch.",
  alternative: {
    label: "Standing cross-body march",
    detail:
      "Bring one knee toward the opposite hand. Keep your torso tall and alternate.",
  },
};
const calves: Move = {
  label: "Calf raises",
  detail:
    "Hold a stable support. Rise onto your toes slowly, then lower your heels.",
};
const shoulders: Move = {
  label: "Shoulder circles",
  detail: "Relax your neck. Circle your shoulders forward, then back.",
};
const hips: Move = {
  label: "Hip circles",
  detail:
    "Feet planted, knees soft. Make small, comfortable circles in both directions.",
};
const cat: Move = {
  label: "Cat-cow",
  floor: true,
  detail:
    "On hands and knees, gently round and release your back with your breath.",
  alternative: {
    label: "Standing cat-cow",
    detail:
      "Hands on thighs, knees soft. Gently round and release your upper back.",
  },
};
const jacks: Move = {
  label: "Step jacks",
  detail:
    "Step one foot out as your arms rise. Return and switch sides. No jumping needed.",
};
const skater: Move = {
  label: "Skater steps",
  detail: "Step from side to side. Keep each landing gentle and controlled.",
};
const climb: Move = {
  label: "Slow mountain climbers",
  floor: true,
  detail: "From a high plank, slowly bring one knee forward at a time.",
  alternative: {
    label: "Standing knee drives",
    detail: "Drive one knee up, then switch. Keep your feet landing softly.",
  },
};
const plank: Move = {
  label: "Plank",
  floor: true,
  detail: "Elbows under shoulders. Keep your body long and breathe steadily.",
  alternative: {
    label: "Wall plank",
    detail:
      "Forearms against a wall. Step back slightly and hold your body straight.",
  },
};
export function buildRoutine(
  profile: UserProfile | null = null,
  sessions: WorkoutSession[] = [],
) {
  const week = Math.min(
    4,
    Math.floor(sessions.filter((s) => s.completed).length / 3) + 1,
  );
  const latestFeedback = sessions.find((s) => s.feedback)?.feedback;
  const beginner =
    !profile?.fitnessLevel || profile.fitnessLevel === "beginner";
  const age = profile?.age;
  const ageRecoveryBuffer =
    age !== undefined && age >= 65 ? 3 : age !== undefined && age >= 55 ? 2 : 0;
  const feedbackAdjust =
    latestFeedback === "hard" ? -5 : latestFeedback === "easy" ? 2 : 0;

  const baseWork = beginner
    ? 20
    : profile?.fitnessLevel === "very-fit"
      ? 25
      : 22;
  const strengthWork = Math.min(
    25,
    Math.max(12, baseWork + week - 1 + feedbackAdjust - ageRecoveryBuffer),
  );
  const cardioWork = Math.min(
    45,
    Math.max(
      20,
      (beginner ? 30 : 40) + week - 1 + feedbackAdjust - ageRecoveryBuffer,
    ),
  );

  const effectiveNoFloor = Boolean(profile?.noFloor || beginner);
  const effectiveNoLunges = Boolean(
    profile?.noLunges || (age !== undefined && age >= 65),
  );
  const effectiveLowImpact =
    profile?.lowImpact !== undefined
      ? profile.lowImpact
      : beginner || (age !== undefined && age >= 55);

  const adaptations: string[] = [];
  if (effectiveLowImpact) adaptations.push("Low impact");
  if (effectiveNoFloor) adaptations.push("Standing only");
  if (effectiveNoLunges) adaptations.push("Knee-friendly");
  if (ageRecoveryBuffer > 0) adaptations.push(`Age ${age} recovery pacing`);
  if (latestFeedback === "hard") adaptations.push("Extra recovery time");

  const steps: RoutineStep[] = [];
  const adapt = (move: Move): Move => {
    if ((effectiveNoFloor && move.floor) || (effectiveNoLunges && move.lunge))
      return move.alternative ?? march;
    return move;
  };
  const add = (
    move: Move,
    duration: number,
    category: RoutineStep["category"],
    recovery = false,
  ) => {
    const m = adapt(move);
    steps.push({
      id: `step-${steps.length}`,
      label: m.label,
      detail: m.detail,
      alternative: m.alternative,
      duration,
      category,
      recovery,
    });
  };
  [march, shoulders, hips, cat, lunge, calves].forEach((m) =>
    add(m, 30, "Warm-up"),
  );
  const strengthMoves =
    profile?.goal === "mobility"
      ? [hips, shoulders, cat, calves, march]
      : profile?.goal === "cardio"
        ? [squat, jacks, calves, lunge, deadbug]
        : [squat, push, bridge, lunge, deadbug];
  for (let round = 0; round < 2; round++)
    strengthMoves.forEach((m) => {
      add(m, strengthWork, "Strength");
      add(
        {
          label: "Breathe & reset",
          detail: "Relax your shoulders and get into position for the next move.",
        },
        30 - strengthWork,
        "Strength",
        true,
      );
    });
  const cardioMoves =
    profile?.goal === "mobility"
      ? [march, hips, shoulders, calves]
      : [march, jacks, climb, skater];
  for (let round = 0; round < 2; round++)
    cardioMoves.forEach((m) => {
      const move =
        m === march && !effectiveLowImpact && !beginner
          ? {
              ...march,
              label: "March or light jog",
              detail:
                "Choose a brisk march or gentle jog. Keep your landing soft and steady.",
            }
          : m;
      add(move, cardioWork, "Cardio");
      add(
        {
          ...march,
          label: "Easy march",
          detail: "Slow your pace down and let your breathing settle.",
        },
        60 - cardioWork,
        "Cardio",
        true,
      );
    });
  (profile?.goal === "mobility"
    ? [cat, hips, shoulders, calves]
    : profile?.goal === "strength"
      ? [squat, push, bridge, plank]
      : [squat, push, plank, bridge]
  ).forEach((m) => add(m, 30, "Core"));
  [
    {
      label: "Slow walk & breathe",
      detail: "Walk slowly. Take comfortable, unhurried breaths.",
    },
    {
      label: "Quad stretch",
      detail:
        "Hold a support. Gently bring one heel toward your seat. Switch sides halfway.",
    },
    {
      label: "Hamstring stretch",
      detail:
        "Place one heel forward and hinge gently at the hips. Switch sides halfway.",
    },
    {
      label: "Chest & shoulder stretch",
      detail: "Open your arms gently. Relax your shoulders and breathe.",
    },
  ].forEach((m) => add(m, 30, "Cool-down"));
  return {
    steps,
    totalSeconds: steps.reduce((n, s) => n + s.duration, 0),
    week,
    strengthWork,
    cardioWork,
    adaptations,
  };
}
export const workoutRoutine = buildRoutine().steps;
export const totalRoutineSeconds = buildRoutine().totalSeconds;
