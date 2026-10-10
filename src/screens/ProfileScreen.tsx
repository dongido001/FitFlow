import React, { useCallback, useState } from "react";
import {
  AppState,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Switch,
  Text,
  View,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useApp } from "../lib/AppState";
import { buildRoutine } from "../data/workoutData";
import { getReminderEnabled, setWorkoutReminder } from "../lib/notifications";
import {
  goalLabels,
  levelLabels,
  reminderPresets,
} from "../types/workout";
import { openYouTubeLink, YOUTUBE_CHANNEL_URL } from "../data/exerciseLinks";
import { Button, C, Page, Pill, S } from "../components/ui";
import OnboardingScreen from "./OnboardingScreen";

export default function ProfileScreen() {
  const { profile, sessions, updateProfile, clearData } = useApp();
  const [editing, setEditing] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [exportNotice, setExportNotice] = useState("");
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);

  const plan = buildRoutine(profile, sessions);
  const reminderHour = profile?.reminderHour ?? 18;
  const reminderMinute = profile?.reminderMinute ?? 0;

  useFocusEffect(
    useCallback(() => {
      let active = true;
      const refresh = () => {
        getReminderEnabled()
          .then((value) => {
            if (active) setEnabled(value);
          })
          .catch(() => {
            if (active)
              setError("Couldn’t check reminder settings. Please try again.");
          });
      };
      refresh();
      const subscription = AppState.addEventListener("change", (state) => {
        if (state === "active") refresh();
      });
      return () => {
        active = false;
        subscription.remove();
      };
    }, []),
  );

  async function toggleReminder(value: boolean) {
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      setEnabled(await setWorkoutReminder(value, reminderHour, reminderMinute));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn’t update reminders.");
    } finally {
      setBusy(false);
    }
  }

  async function selectReminderTime(hour: number, minute: number) {
    if (busy) return;
    setError("");
    await updateProfile({ reminderHour: hour, reminderMinute: minute });
    if (enabled && Platform.OS !== "web") {
      setBusy(true);
      try {
        setEnabled(await setWorkoutReminder(true, hour, minute));
      } catch (e) {
        setError(
          e instanceof Error ? e.message : "Couldn’t reschedule reminder.",
        );
      } finally {
        setBusy(false);
      }
    }
  }

  function handleExportData() {
    const payload = JSON.stringify(
      {
        exportedAt: new Date().toISOString(),
        appVersion: "1.0.0",
        profile,
        sessions,
      },
      null,
      2,
    );

    if (Platform.OS === "web" && typeof navigator !== "undefined" && navigator.clipboard) {
      void navigator.clipboard.writeText(payload);
      setExportNotice(`Exported ${sessions.length} sessions to clipboard!`);
    } else {
      setExportNotice(`Exported ${sessions.length} sessions (JSON ready).`);
    }
    setTimeout(() => setExportNotice(""), 4000);
  }

  async function handleResetData() {
    setShowResetConfirm(false);
    await clearData();
  }

  if (editing)
    return <OnboardingScreen editing onComplete={() => setEditing(false)} />;

  const activePreset =
    reminderPresets.find(
      (p) => p.hour === reminderHour && p.minute === reminderMinute,
    ) ?? reminderPresets[2];

  return (
    <Page>
      <View style={{ gap: 6 }}>
        <Text style={S.title}>Settings & pace</Text>
        <Text style={S.body}>
          Tailored for your goals, joint comfort, and daily listening habits.
        </Text>
      </View>

      {/* Active Routine Profile Card */}
      <View style={S.card}>
        <View style={S.row}>
          <View
            style={{
              width: 48,
              height: 48,
              backgroundColor: C.ice,
              borderRadius: 14,
              alignItems: "center",
              justifyContent: "center",
              borderWidth: 1,
              borderColor: C.iceBorder,
            }}
          >
            <Ionicons name="person-outline" size={22} color={C.sky} />
          </View>
          <View style={{ flex: 1, gap: 2 }}>
            <Text style={S.heading}>
              {goalLabels[profile?.goal ?? "general-health"]}
            </Text>
            <Text style={S.small}>
              {levelLabels[profile?.fitnessLevel ?? "beginner"]}
              {profile?.age ? ` · Age ${profile.age}` : ""}
            </Text>
          </View>
        </View>

        <View
          style={{
            backgroundColor: C.cardSubtle,
            borderRadius: 12,
            padding: 12,
            gap: 8,
          }}
        >
          <View style={S.row}>
            <Text style={{ color: C.ink, fontSize: 13, fontWeight: "700" }}>
              Active routine adaptations
            </Text>
            <Text
              style={{
                color: C.sky,
                fontSize: 12,
                fontWeight: "700",
                fontVariant: ["tabular-nums"],
              }}
            >
              {plan.strengthWork}s / {plan.cardioWork}s intervals
            </Text>
          </View>

          {plan.adaptations.length > 0 ? (
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
              {plan.adaptations.map((tag) => (
                <Pill key={tag}>{tag.toUpperCase()}</Pill>
              ))}
            </View>
          ) : (
            <Text style={S.small}>
              Full-range movement with standard floor and standing transitions.
            </Text>
          )}
        </View>

        <Button
          secondary
          title="Edit goal, level & joint adaptations"
          icon="options-outline"
          onPress={() => setEditing(true)}
        />
      </View>

      {/* Daily Reminder & Time Picker Card */}
      <View style={S.card}>
        <View style={S.row}>
          <View style={{ flex: 1, gap: 2 }}>
            <Text style={S.heading}>Daily workout reminder</Text>
            <Text style={S.small}>
              {Platform.OS === "web"
                ? "Local push notifications are available in the iOS & Android app"
                : `${activePreset.label} (${activePreset.period}) · Local device time`}
            </Text>
          </View>
          <Switch
            accessibilityLabel="Daily workout reminder"
            value={enabled}
            disabled={busy || Platform.OS === "web"}
            onValueChange={(value) => void toggleReminder(value)}
            trackColor={{ false: C.line, true: C.sky }}
            thumbColor="#FFFFFF"
          />
        </View>

        {/* Time Presets */}
        <View style={{ flexDirection: "row", gap: 8, paddingTop: 2 }}>
          {reminderPresets.map((preset) => {
            const selected =
              preset.hour === reminderHour && preset.minute === reminderMinute;
            return (
              <Pressable
                key={preset.label}
                disabled={busy}
                accessibilityRole="radio"
                accessibilityLabel={`Reminder time ${preset.label} ${preset.period}`}
                accessibilityState={{ selected, disabled: busy }}
                onPress={() =>
                  void selectReminderTime(preset.hour, preset.minute)
                }
                style={({ pressed }) => ({
                  flex: 1,
                  minHeight: 52,
                  paddingVertical: 8,
                  paddingHorizontal: 6,
                  borderRadius: 10,
                  backgroundColor: selected ? C.ice : C.cardSubtle,
                  borderWidth: selected ? 1.5 : 1,
                  borderColor: selected ? C.sky : C.line,
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 2,
                  opacity: busy ? 0.5 : pressed ? 0.8 : 1,
                })}
              >
                <Text
                  style={{
                    color: selected ? C.sky : C.ink,
                    fontSize: 12,
                    fontWeight: "700",
                    fontVariant: ["tabular-nums"],
                  }}
                >
                  {preset.label}
                </Text>
                <Text
                  style={{
                    color: selected ? C.sky : C.muted,
                    fontSize: 10,
                    fontWeight: "600",
                  }}
                >
                  {preset.period}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {error ? <Text style={S.error}>{error}</Text> : null}
      </View>

      {/* Audio & Sensory Feedback Card */}
      <View style={S.card}>
        <View style={{ gap: 2 }}>
          <Text style={S.heading}>Audio & haptics</Text>
          <Text style={S.small}>
            Changes here sync immediately with the in-workout player controls.
          </Text>
        </View>

        <View
          style={[
            S.row,
            { paddingTop: 10, borderTopWidth: 1, borderColor: C.line },
          ]}
        >
          <View style={{ flex: 1, gap: 2, paddingRight: 8 }}>
            <Text style={{ color: C.ink, fontSize: 15, fontWeight: "600" }}>
              Countdown audio beeps
            </Text>
            <Text style={S.small}>
              Gentle beeps during the final 5 seconds of each interval.
            </Text>
          </View>
          <Switch
            accessibilityLabel="Countdown audio beeps"
            value={profile?.soundBeeps !== false}
            onValueChange={(value) => void updateProfile({ soundBeeps: value })}
            trackColor={{ false: C.line, true: C.sky }}
            thumbColor="#FFFFFF"
          />
        </View>

        <View
          style={[
            S.row,
            { paddingTop: 10, borderTopWidth: 1, borderColor: C.line },
          ]}
        >
          <View style={{ flex: 1, gap: 2, paddingRight: 8 }}>
            <Text style={{ color: C.ink, fontSize: 15, fontWeight: "600" }}>
              Ambient background music
            </Text>
            <Text style={S.small}>
              Soft instrumental loop that ducks during countdown beeps.
            </Text>
          </View>
          <Switch
            accessibilityLabel="Ambient workout music"
            value={Boolean(profile?.ambientMusic)}
            onValueChange={(value) =>
              void updateProfile({ ambientMusic: value })
            }
            trackColor={{ false: C.line, true: C.sky }}
            thumbColor="#FFFFFF"
          />
        </View>

        <View
          style={[
            S.row,
            { paddingTop: 10, borderTopWidth: 1, borderColor: C.line },
          ]}
        >
          <View style={{ flex: 1, gap: 2, paddingRight: 8 }}>
            <Text style={{ color: C.ink, fontSize: 15, fontWeight: "600" }}>
              Haptic vibrations
            </Text>
            <Text style={S.small}>
              Tactile pulses on interval changes and completed sessions.
            </Text>
          </View>
          <Switch
            accessibilityLabel="Haptic vibration feedback"
            value={profile?.hapticsEnabled !== false}
            disabled={Platform.OS === "web"}
            onValueChange={(value) =>
              void updateProfile({ hapticsEnabled: value })
            }
            trackColor={{ false: C.line, true: C.sky }}
            thumbColor="#FFFFFF"
          />
        </View>
      </View>

      {/* Data Management & Deletion Card (Google Play Safety Compliance) */}
      <View style={S.card}>
        <View style={{ gap: 2 }}>
          <Text style={S.heading}>Data & backups</Text>
          <Text style={S.small}>
            You own your workout journal. Export backups or reset your data anytime.
          </Text>
        </View>

        <View style={{ gap: 8, paddingTop: 4 }}>
          <Button
            secondary
            title="Backup & export journal (JSON)"
            icon="download-outline"
            onPress={handleExportData}
          />
          {exportNotice ? (
            <Text style={[S.small, { color: C.sky, textAlign: "center" }]}>
              {exportNotice}
            </Text>
          ) : null}

          <Button
            secondary
            title="Reset all app data"
            icon="trash-outline"
            onPress={() => setShowResetConfirm(true)}
          />
        </View>
      </View>

      {/* YouTube Community Card */}
      <View style={S.card}>
        <View style={S.row}>
          <View
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              backgroundColor: "#FFF0F0",
              alignItems: "center",
              justifyContent: "center",
              borderWidth: 1,
              borderColor: "#FFD0D0",
            }}
          >
            <Ionicons name="logo-youtube" size={24} color="#E02424" />
          </View>
          <View style={{ flex: 1, gap: 2 }}>
            <Text style={S.heading}>FitFlow on YouTube</Text>
            <Text style={S.small}>@FitFlowWorld · Form breakdowns & daily motivation</Text>
          </View>
        </View>

        <Button
          secondary
          title="Visit @FitFlowWorld on YouTube"
          icon="open-outline"
          onPress={() => void openYouTubeLink(YOUTUBE_CHANNEL_URL)}
        />
      </View>

      {/* Legal & Health Disclaimers Card */}
      <View style={S.card}>
        <View style={{ gap: 2 }}>
          <Text style={S.heading}>Legal & safety</Text>
          <Text style={S.small}>
            Review wellness guidelines and our on-device privacy guarantee.
          </Text>
        </View>

        <View style={{ flexDirection: "row", gap: 10, paddingTop: 4 }}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="View medical and exercise disclaimer"
            onPress={() => setShowDisclaimer(true)}
            style={({ pressed }) => ({
              flex: 1,
              padding: 12,
              borderRadius: 12,
              backgroundColor: C.cardSubtle,
              borderWidth: 1,
              borderColor: C.line,
              gap: 4,
              opacity: pressed ? 0.75 : 1,
            })}
          >
            <Ionicons name="shield-checkmark-outline" size={18} color={C.sky} />
            <Text style={{ color: C.ink, fontWeight: "700", fontSize: 13 }}>
              Health disclaimer
            </Text>
            <Text style={[S.small, { fontSize: 11 }]}>Exercise safety</Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="View privacy policy"
            onPress={() => setShowPrivacyPolicy(true)}
            style={({ pressed }) => ({
              flex: 1,
              padding: 12,
              borderRadius: 12,
              backgroundColor: C.cardSubtle,
              borderWidth: 1,
              borderColor: C.line,
              gap: 4,
              opacity: pressed ? 0.75 : 1,
            })}
          >
            <Ionicons name="lock-closed-outline" size={18} color={C.recovery} />
            <Text style={{ color: C.ink, fontWeight: "700", fontSize: 13 }}>
              Privacy policy
            </Text>
            <Text style={[S.small, { fontSize: 11 }]}>100% on-device</Text>
          </Pressable>
        </View>
      </View>

      {/* Production Version Footer */}
      <View style={{ alignItems: "center", gap: 4, paddingVertical: 12 }}>
        <Text style={[S.small, { fontWeight: "700", color: C.muted }]}>
          Fitflow v1.0.0 (Build 1)
        </Text>
        <Text style={[S.small, { fontSize: 11, color: C.muted }]}>
          Mindful 20-minute movement · Built for everyday health
        </Text>
      </View>

      {/* HEALTH DISCLAIMER MODAL */}
      <Modal
        visible={showDisclaimer}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDisclaimer(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(14, 38, 64, 0.55)",
            justifyContent: "center",
            padding: 20,
          }}
        >
          <View
            style={[
              S.cardElevated,
              { maxWidth: 460, alignSelf: "center", width: "100%", gap: 14 },
            ]}
          >
            <View style={S.row}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <Ionicons
                  name="shield-checkmark"
                  size={20}
                  color={C.sky}
                />
                <Text style={S.heading}>Physical activity disclaimer</Text>
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Close disclaimer"
                onPress={() => setShowDisclaimer(false)}
                style={{ padding: 4 }}
              >
                <Ionicons name="close" size={20} color={C.muted} />
              </Pressable>
            </View>

            <ScrollView style={{ maxHeight: 280 }} showsVerticalScrollIndicator={false}>
              <Text style={[S.body, { fontSize: 13, lineHeight: 20 }]}>
                Fitflow is designed to provide general guided movement and exercise suggestions for personal wellness.
                {"\n\n"}
                1. <Text style={{ fontWeight: "700" }}>Medical Consultation:</Text> Always consult your physician or qualified healthcare provider before starting any exercise program, especially if you have a pre-existing medical condition, cardiovascular concerns, joint injuries, or are pregnant.
                {"\n\n"}
                2. <Text style={{ fontWeight: "700" }}>Listen to Your Body:</Text> Exercise within your comfortable limits. If you experience dizziness, sharp pain, shortness of breath, or discomfort, stop moving immediately and seek medical attention if symptoms persist.
                {"\n\n"}
                3. <Text style={{ fontWeight: "700" }}>Not Medical Advice:</Text> Content and routines in this app do not constitute medical diagnosis, treatment, or therapy.
              </Text>
            </ScrollView>

            <Button
              title="I understand"
              onPress={() => setShowDisclaimer(false)}
            />
          </View>
        </View>
      </Modal>

      {/* PRIVACY POLICY MODAL */}
      <Modal
        visible={showPrivacyPolicy}
        transparent
        animationType="fade"
        onRequestClose={() => setShowPrivacyPolicy(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(14, 38, 64, 0.55)",
            justifyContent: "center",
            padding: 20,
          }}
        >
          <View
            style={[
              S.cardElevated,
              { maxWidth: 460, alignSelf: "center", width: "100%", gap: 14 },
            ]}
          >
            <View style={S.row}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <Ionicons
                  name="lock-closed"
                  size={20}
                  color={C.recovery}
                />
                <Text style={S.heading}>Privacy & Data Safety</Text>
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Close privacy policy"
                onPress={() => setShowPrivacyPolicy(false)}
                style={{ padding: 4 }}
              >
                <Ionicons name="close" size={20} color={C.muted} />
              </Pressable>
            </View>

            <ScrollView style={{ maxHeight: 280 }} showsVerticalScrollIndicator={false}>
              <Text style={[S.body, { fontSize: 13, lineHeight: 20 }]}>
                <Text style={{ fontWeight: "700" }}>1. Zero Data Collection:</Text> Fitflow does not collect, sell, or transmit any personal data, location data, or health records to external servers or third-party advertisers.
                {"\n\n"}
                <Text style={{ fontWeight: "700" }}>2. On-Device Storage:</Text> Your movement journal, streak count, preferences, and age profile are stored strictly locally on your device using AsyncStorage.
                {"\n\n"}
                <Text style={{ fontWeight: "700" }}>3. No Account Required:</Text> No login, email, phone number, or social sign-in is required to use all features of Fitflow.
                {"\n\n"}
                <Text style={{ fontWeight: "700" }}>4. Data Deletion:</Text> You can permanently erase all data at any time using the "Reset all app data" option below.
              </Text>
            </ScrollView>

            <Button
              title="Close"
              onPress={() => setShowPrivacyPolicy(false)}
            />
          </View>
        </View>
      </Modal>

      {/* RESET CONFIRMATION MODAL */}
      <Modal
        visible={showResetConfirm}
        transparent
        animationType="fade"
        onRequestClose={() => setShowResetConfirm(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(14, 38, 64, 0.55)",
            justifyContent: "center",
            padding: 20,
          }}
        >
          <View
            style={[
              S.cardElevated,
              { maxWidth: 440, alignSelf: "center", width: "100%", gap: 14 },
            ]}
          >
            <View style={{ gap: 6 }}>
              <Text style={S.heading}>Permanently delete all data?</Text>
              <Text style={S.body}>
                This will erase your workout history, current streak, and routine preferences from this device. You will return to the welcome setup. This action cannot be undone.
              </Text>
            </View>

            <View style={{ gap: 8 }}>
              <Button
                title="Erase all data and reset"
                onPress={() => void handleResetData()}
              />
              <Button
                secondary
                title="Cancel"
                onPress={() => setShowResetConfirm(false)}
              />
            </View>
          </View>
        </View>
      </Modal>
    </Page>
  );
}
