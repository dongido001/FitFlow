import { Linking } from "react-native";

export const YOUTUBE_CHANNEL_URL = "https://www.youtube.com/@FitFlowWorld";

/**
 * Exercise-specific YouTube video registry mapped directly to @FitFlowWorld uploads.
 * If an exercise has not yet been uploaded to YouTube, it falls back to the channel URL.
 */
export const exerciseYouTubeUrls: Record<string, string> = {
  // 1/26
  "March in place": "https://www.youtube.com/watch?v=QxwAmKbKW_8",
  // 2/26
  "Shoulder circles": "https://www.youtube.com/watch?v=MV4ClRhQXFc",
  // 3/26
  "Hip circles": "https://www.youtube.com/watch?v=Yvt00usakrE",
  // 4/26
  "Standing cat-cow": "https://www.youtube.com/watch?v=i2jqNgR7NJk",
  // 5/26
  "Side-to-side weight shifts": "https://www.youtube.com/watch?v=LObceHqB47c",
  // 6/26
  "Calf raises": "https://www.youtube.com/watch?v=-_QvF1XzDfU",
  // 7/26
  "Bodyweight squats": "https://www.youtube.com/watch?v=qtwh-kxcWmE",
  // 8/26
  "Shallow squats": "https://www.youtube.com/watch?v=ESSbYkSYg6Q",
  // 9/26
  "Wall push-ups": "https://www.youtube.com/watch?v=RXDD8hLf6gY",
  // 10/26
  "Standing chest press": "https://www.youtube.com/watch?v=qxaSTcbxdpY",
  // 11/26
  "Glute bridges": "https://www.youtube.com/watch?v=AZyZfyQxDiM",
  // 12/26
  "Standing hip extensions": "https://www.youtube.com/watch?v=7iTTUQ7Wqwo",
  // 13/26
  "Dead bugs": "https://www.youtube.com/watch?v=E6meNB2H2Ms",
  // 14/26
  "Standing cross-body march": "https://www.youtube.com/watch?v=7vDyTmdJh9k",
  // 15/26
  "Step jacks": "https://www.youtube.com/watch?v=ipmnx53nb0E",
  // 16/26
  "Slow mountain climbers": "https://www.youtube.com/watch?v=n-tKPwTLZAA",
  // 17/26
  "Standing knee drives": "https://www.youtube.com/watch?v=a-xn-pjpHW8",
  // 18/26
  "Skater steps": "https://www.youtube.com/@FitFlowWorld",
  // 19/26
  "March or light jog": "https://www.youtube.com/@FitFlowWorld",
  // 20/26
  "Plank": "https://www.youtube.com/@FitFlowWorld",
  // 21/26
  "Wall plank": "https://www.youtube.com/@FitFlowWorld",
  // 22/26
  "Easy march": "https://www.youtube.com/@FitFlowWorld",
  // 23/26
  "Slow walk & breathe": "https://www.youtube.com/@FitFlowWorld",
  // 24/26
  "Quad stretch": "https://www.youtube.com/watch?v=vHgnk98J5C0",
  // 25/26
  "Hamstring stretch": "https://www.youtube.com/@FitFlowWorld",
  // 26/26
  "Chest & shoulder stretch": "https://www.youtube.com/@FitFlowWorld",

  // Alternative aliases:
  "Cat-cow": "https://www.youtube.com/watch?v=i2jqNgR7NJk",
  "Reverse lunges": "https://www.youtube.com/watch?v=LObceHqB47c",
};

/**
 * Resolves the exact YouTube video URL for a given exercise name, falling back to the channel.
 */
export function getYouTubeUrlForExercise(exerciseName?: string): string {
  if (!exerciseName) return YOUTUBE_CHANNEL_URL;
  return exerciseYouTubeUrls[exerciseName] ?? YOUTUBE_CHANNEL_URL;
}

/**
 * Gracefully opens a YouTube URL, opening the native YouTube app if available,
 * or the device web browser as fallback.
 */
export async function openYouTubeLink(url?: string): Promise<boolean> {
  const target = url || YOUTUBE_CHANNEL_URL;
  try {
    const supported = await Linking.canOpenURL(target);
    if (supported) {
      await Linking.openURL(target);
      return true;
    } else {
      await Linking.openURL(YOUTUBE_CHANNEL_URL);
      return true;
    }
  } catch {
    try {
      await Linking.openURL(YOUTUBE_CHANNEL_URL);
      return true;
    } catch {
      return false;
    }
  }
}
