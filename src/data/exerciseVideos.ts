/**
 * Exercise demonstration video registry.
 * Clips are bundled as static assets for offline playback on iOS and Android.
 */
export const exerciseVideos: Record<string, number | undefined> = {
  "March in place": require("../../assets/exercises/march-in-place.mp4"),
  "Shoulder circles": require("../../assets/exercises/shoulder-circles.mp4"),
  "Hip circles": require("../../assets/exercises/hip-circles.mp4"),
  "Standing cat-cow": require("../../assets/exercises/standing-cat-cow.mp4"),
  "Side-to-side weight shifts": require("../../assets/exercises/side-to-side-weight-shifts.mp4"),
  "Calf raises": require("../../assets/exercises/calf-raises.mp4"),
  "Bodyweight squats": require("../../assets/exercises/bodyweight-squats.mp4"),
  "Shallow squats": require("../../assets/exercises/shallow-squats.mp4"),
  "Wall push-ups": require("../../assets/exercises/wall-push-ups.mp4"),
  "Standing chest press": require("../../assets/exercises/standing-chest-press.mp4"),
  "Glute bridges": require("../../assets/exercises/glute-bridges.mp4"),
  "Standing hip extensions": require("../../assets/exercises/standing-hip-extensions.mp4"),
  "Dead bugs": require("../../assets/exercises/dead-bugs.mp4"),
  "Standing cross-body march": require("../../assets/exercises/standing-cross-body-march.mp4"),
  "Step jacks": require("../../assets/exercises/step-jacks.mp4"),
  "Slow mountain climbers": require("../../assets/exercises/slow-mountain-climbers.mp4"),
  "Standing knee drives": require("../../assets/exercises/standing-knee-drives.mp4"),
  "Skater steps": require("../../assets/exercises/skater-steps.mp4"),
  "March or light jog": require("../../assets/exercises/march-or-light-jog.mp4"),
  "Plank": require("../../assets/exercises/plank.mp4"),
  "Wall plank": require("../../assets/exercises/wall-plank.mp4"),
  "Easy march": require("../../assets/exercises/easy-march.mp4"),
  "Slow walk & breathe": require("../../assets/exercises/slow-walk-and-breathing.mp4"),
  "Quad stretch": require("../../assets/exercises/quad-stretch.mp4"),
  "Hamstring stretch": require("../../assets/exercises/hamstring-stretch.mp4"),
  "Chest & shoulder stretch": require("../../assets/exercises/chest-and-shoulder-stretch.mp4"),
  // Fallback mappings for variations:
  "Cat-cow": require("../../assets/exercises/standing-cat-cow.mp4"),
  "Reverse lunges": require("../../assets/exercises/side-to-side-weight-shifts.mp4"),
};
