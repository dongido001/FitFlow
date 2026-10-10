import { Platform } from "react-native";
const REMINDER_ID = "fitflow-daily-workout";
const load = () => import("expo-notifications");
function isReminder(n: {
  identifier: string;
  content: { title: string | null; data?: Record<string, unknown> };
}) {
  return (
    n.identifier === REMINDER_ID ||
    n.content.data?.kind === REMINDER_ID ||
    n.content.title === "Workout time"
  );
}
export async function getReminderEnabled() {
  if (Platform.OS === "web") return false;
  try {
    const N = await load();
    const [permissions, scheduled] = await Promise.all([
      N.getPermissionsAsync(),
      N.getAllScheduledNotificationsAsync(),
    ]);
    return permissions.granted && scheduled.some(isReminder);
  } catch {
    return false;
  }
}
export async function setWorkoutReminder(
  enabled: boolean,
  hour = 18,
  minute = 0,
) {
  if (Platform.OS === "web")
    throw new Error("Reminders are available in the iOS and Android app.");
  let N;
  try {
    N = await load();
  } catch {
    throw new Error(
      "Notifications are disabled in Expo Go on Android SDK 53+. They work automatically in standalone APK and release builds.",
    );
  }
  if (enabled) {
    if (Platform.OS === "android")
      await N.setNotificationChannelAsync("workouts", {
        name: "Workout reminders",
        importance: N.AndroidImportance.DEFAULT,
      });
    let permissions = await N.getPermissionsAsync();
    if (!permissions.granted) permissions = await N.requestPermissionsAsync();
    if (!permissions.granted)
      throw new Error(
        "Notifications are off in device settings. Enable them there, then try again.",
      );
  }
  const scheduled = await N.getAllScheduledNotificationsAsync();
  await Promise.all(
    scheduled
      .filter(isReminder)
      .map((n) => N.cancelScheduledNotificationAsync(n.identifier)),
  );
  if (!enabled) return false;
  N.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
  await N.scheduleNotificationAsync({
    identifier: REMINDER_ID,
    content: {
      title: "A little movement, just for you",
      body: "Your 20-minute Fitflow session is ready.",
      data: { kind: REMINDER_ID, hour, minute },
    },
    trigger: {
      type: N.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
      channelId: "workouts",
    },
  });
  return true;
}
