import React, { useEffect, useRef, useState } from "react";
import { Platform, Pressable, Text, View } from "react-native";
import * as Haptics from "expo-haptics";
import { Ionicons } from "@expo/vector-icons";
import { useApp } from "../lib/AppState";
import { formatTime, getStats } from "../lib/stats";
import type { Feedback, WorkoutSession } from "../types/workout";
import { openYouTubeLink, YOUTUBE_CHANNEL_URL } from "../data/exerciseLinks";
import { Button, C, Orbit, Page, Pill, S } from "../components/ui";

const FEEDBACK_OPTIONS: {
  value: Feedback;
  label: string;
  caption: string;
  icon: keyof typeof Ionicons.glyphMap;
}[] = [
  {
    value: "easy",
    label: "Felt easy",
    caption: "+2s work next time",
    icon: "sunny-outline",
  },
  {
    value: "right",
    label: "Just right",
    caption: "Keep current pace",
    icon: "checkmark-circle-outline",
  },
  {
    value: "hard",
    label: "Challenging",
    caption: "+5s recovery next time",
    icon: "leaf-outline",
  },
];

export default function CompleteWorkoutScreen({
  session,
  onRestart,
  onHome,
}: {
  session: WorkoutSession;
  onRestart: () => void;
  onHome: () => void;
}) {
  const { recordSession, profile, sessions } = useApp();
  const [feedback, setFeedback] = useState<Feedback | undefined>(
    session.feedback,
  );
  const [status, setStatus] = useState<"saving" | "saved" | "error">(
    session.durationSeconds > 0 ? "saving" : "saved",
  );
  const started = useRef(false);
  const stats = getStats(sessions);

  async function persist(value?: Feedback) {
    if (session.durationSeconds === 0) {
      setStatus("saved");
      return;
    }
    setStatus("saving");
    try {
      await recordSession({ ...session, feedback: value });
      setStatus("saved");
    } catch {
      setStatus("error");
    }
  }

  useEffect(() => {
    if (!started.current) {
      started.current = true;
      void persist();
    }
  }, []);

  return (
    <Page>
      {/* Header */}
      <View style={{ alignItems: "center", gap: 14, paddingTop: 8 }}>
        <Pill tone={session.completed ? "recovery" : "default"}>
          {session.completed ? "20-MINUTE FLOW COMPLETE" : "SESSION LOGGED"}
        </Pill>

        <Orbit />

        <View style={{ alignItems: "center", gap: 6 }}>
          <Text style={[S.title, { textAlign: "center" }]}>
            {session.durationSeconds > 0
              ? "You showed up.\nThat’s what counts."
              : "Ready whenever\nyou are."}
          </Text>
          <Text style={[S.body, { textAlign: "center", maxWidth: 360 }]}>
            {session.completed
              ? "Twenty mindful minutes dedicated to your joints, strength, and steady energy."
              : session.durationSeconds > 0
                ? "Every movement interval builds momentum toward your daily rhythm."
                : "No movement time was recorded for this session."}
          </Text>
        </View>
      </View>

      {/* Summary Metrics */}
      <View style={{ flexDirection: "row", gap: 12 }}>
        <View style={[S.card, { flex: 1, gap: 4 }]}>
          <Text style={S.small}>Active time</Text>
          <Text
            style={{
              color: C.sky,
              fontSize: 32,
              lineHeight: 38,
              fontWeight: "700",
              letterSpacing: -0.8,
              fontVariant: ["tabular-nums"],
            }}
          >
            {formatTime(session.durationSeconds)}
          </Text>
          <Text style={S.small}>
            {session.skippedSteps
              ? `${session.skippedSteps} skipped`
              : "All intervals completed"}
          </Text>
        </View>

        <View style={[S.card, { flex: 1, gap: 4 }]}>
          <Text style={S.small}>Current streak</Text>
          <Text
            style={{
              color: C.recovery,
              fontSize: 32,
              lineHeight: 38,
              fontWeight: "700",
              letterSpacing: -0.8,
              fontVariant: ["tabular-nums"],
            }}
          >
            {stats.streak} {stats.streak === 1 ? "day" : "days"}
          </Text>
          <Text style={S.small}>{stats.weekCount} of 7 days this week</Text>
        </View>
      </View>

      {/* RPE Feedback Selector */}
      {session.durationSeconds > 0 && (
        <View style={S.card}>
          <View style={{ gap: 2 }}>
            <Text style={S.heading}>How did today’s pace feel?</Text>
            <Text style={S.small}>
              Your answer adjusts work and recovery intervals in your next session.
            </Text>
          </View>

          <View style={{ flexDirection: "row", gap: 10, paddingTop: 4 }}>
            {FEEDBACK_OPTIONS.map((item) => {
              const selected = feedback === item.value;
              return (
                <Pressable
                  key={item.value}
                  disabled={status === "saving"}
                  accessibilityRole="radio"
                  accessibilityLabel={`${item.label}, ${item.caption}`}
                  accessibilityState={{
                    selected,
                    disabled: status === "saving",
                  }}
                  onPress={() => {
                    if (
                      Platform.OS !== "web" &&
                      profile?.hapticsEnabled !== false
                    ) {
                      void Haptics.selectionAsync().catch(() => undefined);
                    }
                    setFeedback(item.value);
                    void persist(item.value);
                  }}
                  style={({ pressed }) => ({
                    flex: 1,
                    minHeight: 92,
                    paddingVertical: 12,
                    paddingHorizontal: 8,
                    borderRadius: 12,
                    backgroundColor: selected ? C.ice : C.cardSubtle,
                    borderWidth: selected ? 1.5 : 1,
                    borderColor: selected ? C.sky : C.line,
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 4,
                    opacity: status === "saving" ? 0.6 : pressed ? 0.85 : 1,
                    transform: [{ scale: pressed ? 0.98 : 1 }],
                  })}
                >
                  <Ionicons
                    name={item.icon}
                    size={22}
                    color={selected ? C.sky : C.inkSecondary}
                  />
                  <Text
                    style={{
                      color: selected ? C.sky : C.ink,
                      fontSize: 13,
                      fontWeight: "700",
                      textAlign: "center",
                    }}
                  >
                    {item.label}
                  </Text>
                  <Text
                    style={{
                      color: selected ? C.sky : C.muted,
                      fontSize: 11,
                      fontWeight: "500",
                      textAlign: "center",
                    }}
                  >
                    {item.caption}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      )}

      {/* YouTube Channel Support & Community Card */}
      <View
        style={[
          S.card,
          {
            backgroundColor: C.cardSubtle,
            borderColor: C.line,
            gap: 12,
          },
        ]}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
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
            <Text style={{ color: C.ink, fontSize: 15, fontWeight: "700" }}>
              Support FitFlow on YouTube
            </Text>
            <Text style={S.small}>
              Every 20-minute routine is free. Like, comment on today’s pace, or subscribe to @FitFlowWorld!
            </Text>
          </View>
        </View>

        <Button
          secondary
          title="Visit @FitFlowWorld on YouTube"
          icon="open-outline"
          onPress={() => void openYouTubeLink(YOUTUBE_CHANNEL_URL)}
        />
      </View>

      {/* Save Status & Navigation Actions */}
      {status === "error" ? (
        <View style={{ gap: 10 }}>
          <Text style={S.error}>
            Your session couldn’t be saved to local storage. Please retry.
          </Text>
          <Button title="Retry saving" onPress={() => void persist(feedback)} />
        </View>
      ) : (
        <Text style={[S.small, { textAlign: "center" }]}>
          {session.durationSeconds === 0
            ? "Empty sessions aren’t added to your journal."
            : status === "saving"
              ? "Saving to your movement journal…"
              : "Saved to your movement journal on this device."}
        </Text>
      )}

      <View style={{ gap: 10 }}>
        <Button
          title="Back to Today"
          disabled={status !== "saved"}
          onPress={onHome}
          icon="arrow-forward"
        />
        <Button
          secondary
          title="Start another session"
          disabled={status !== "saved"}
          onPress={onRestart}
        />
      </View>
    </Page>
  );
}
