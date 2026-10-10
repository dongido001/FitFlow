import type { RoutineStep } from "../data/workoutData";
export type TimerState = {
  index: number;
  remainingMs: number;
  activeMs: number;
  skipped: number;
  running: boolean;
  finished: boolean;
};
export function initialTimer(steps: RoutineStep[]): TimerState {
  return {
    index: 0,
    remainingMs: steps[0].duration * 1000,
    activeMs: 0,
    skipped: 0,
    running: false,
    finished: false,
  };
}
export function advance(
  state: TimerState,
  deltaMs: number,
  steps: RoutineStep[],
): TimerState {
  if (!state.running || state.finished || deltaMs <= 0) return state;
  const next = { ...state };
  let delta = deltaMs;
  while (delta > 0 && !next.finished) {
    const spent = Math.min(delta, next.remainingMs);
    next.activeMs += spent;
    next.remainingMs -= spent;
    delta -= spent;
    if (next.remainingMs <= 0) {
      if (next.index === steps.length - 1) {
        next.finished = true;
        next.running = false;
      } else {
        next.index++;
        next.remainingMs = steps[next.index].duration * 1000;
      }
    }
  }
  return next;
}
export function skip(state: TimerState, steps: RoutineStep[]): TimerState {
  if (state.finished) return state;
  const next = { ...state, skipped: state.skipped + 1 };
  if (next.index === steps.length - 1)
    return { ...next, remainingMs: 0, finished: true, running: false };
  return {
    ...next,
    index: next.index + 1,
    remainingMs: steps[next.index + 1].duration * 1000,
  };
}
export function remainingSeconds(state: TimerState, steps: RoutineStep[]) {
  return (
    Math.ceil(state.remainingMs / 1000) +
    steps.slice(state.index + 1).reduce((n, s) => n + s.duration, 0)
  );
}
