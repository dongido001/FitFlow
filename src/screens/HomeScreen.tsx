import React, { useState } from "react";
import { Platform, Pressable, Text, View } from "react-native";
import type { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import type { Tabs } from "../../App";
import { useApp } from "../lib/AppState";
import { buildRoutine } from "../data/workoutData";
import { formatTime, getStats } from "../lib/stats";
import { getYouTubeUrlForExercise, openYouTubeLink } from "../data/exerciseLinks";
import { goalLabels, goalSummaries, levelLabels } from "../types/workout";
import {
  Button,
  C,
  IconButton,
  Orbit,
  Page,
  Pill,
  S,
  WeekStrip,
} from "../components/ui";

export default function HomeScreen({
  navigation,
}: BottomTabScreenProps<Tabs, "Home">) {
  const { profile, sessions } = useApp();
  const plan = buildRoutine(profile, sessions);
  const stats = getStats(sessions);
  const [expanded, setExpanded] = useState(false);
  const hour = new Date().getHours();
  const greeting =
    hour < 12
      ? "Good morning"
      : hour < 17
        ? "Good afternoon"
        : "Good evening";
  const todayFormatted = new Date().toLocaleDateString("en", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });

  const blocks = [
    "Warm-up",
    "Strength",
    "Cardio",
    "Core",
    "Cool-down",
  ] as const;

  const categoryIcons: Record<string, keyof typeof Ionicons.glyphMap> = {
    "Warm-up": "sunny-outline",
    Strength: "barbell-outline",
    Cardio: "pulse-outline",
    Core: "shield-checkmark-outline",
    "Cool-down": "leaf-outline",
  };

  const categorySummaries: Record<(typeof blocks)[number], string> = {
    "Warm-up": "6 movements · Joint mobility & steady breath",
    Strength: `2 rounds · ${plan.strengthWork}s work / ${30 - plan.strengthWork}s reset`,
    Cardio: `2 rounds · ${plan.cardioWork}s active / ${60 - plan.cardioWork}s easy march`,
    Core: "4 movements · Trunk & posture stability",
    "Cool-down": "4 stretches · Guided decompression",
  };

  const todayDone = stats.week[stats.week.length - 1]?.done ?? false;

  return (
    <Page>
      {/* Top Brand & Profile Bar */}
      <View style={S.row}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <View style={{ flexDirection: "row", alignItems: "baseline", gap: 2 }}>
            <Text
              style={[
                S.heading,
                { fontSize: 24, fontWeight: "800", letterSpacing: -0.8 },
              ]}
            >
              fitflow
            </Text>
            <View
              style={{
                width: 6,
                height: 6,
                borderRadius: 3,
                backgroundColor: C.sky,
              }}
            />
          </View>
          <Text style={[S.small, { color: C.muted }]}>· {todayFormatted}</Text>
        </View>
        <IconButton
          name="options-outline"
          label="Open settings and movement preferences"
          onPress={() => navigation.navigate("Profile")}
        />
      </View>

      {/* Greeting Header (no eyebrow kicker) */}
      <View style={{ gap: 6 }}>
        <Text style={S.title}>
          {todayDone
            ? `${greeting}.\nYou moved today.`
            : `${greeting}.\nReady for your 20?`}
        </Text>
        <Text style={S.body}>
          {todayDone
            ? "Your daily session is logged in your journal. Repeat a flow anytime you want an extra reset."
            : "Twenty mindful minutes of guided movement, paced around your body and space."}
        </Text>
      </View>

      {/* Primary Session Focal Surface */}
      <View
        style={{
          backgroundColor: C.skyDark,
          borderRadius: 16,
          padding: 22,
          gap: 18,
          ...Platform.select({
            ios: {
              shadowColor: "#0E2640",
              shadowOffset: { width: 0, height: 10 },
              shadowOpacity: 0.16,
              shadowRadius: 22,
            },
            android: {
              elevation: 4,
            },
            web: {
              boxShadow: "0 10px 26px rgba(14, 38, 64, 0.16)",
            } as any,
          }),
        }}
      >
        <View style={S.row}>
          <View style={{ flex: 1, gap: 8 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <View
                style={{
                  backgroundColor: "rgba(88, 166, 242, 0.18)",
                  borderColor: "rgba(88, 166, 242, 0.35)",
                  borderWidth: 1,
                  paddingHorizontal: 10,
                  paddingVertical: 4,
                  borderRadius: 99,
                }}
              >
                <Text
                  style={{
                    color: "#99CCFF",
                    fontSize: 11,
                    fontWeight: "700",
                    letterSpacing: 0.3,
                  }}
                >
                  {goalLabels[profile?.goal ?? "general-health"]}
                </Text>
              </View>
              <Text
                style={{
                  color: "#A8C7E5",
                  fontSize: 12,
                  fontWeight: "600",
                  fontVariant: ["tabular-nums"],
                }}
              >
                Week {plan.week} of 4
              </Text>
            </View>

            <Text
              style={{
                color: "#FFFFFF",
                fontSize: 25,
                lineHeight: 31,
                fontWeight: "700",
                letterSpacing: -0.6,
              }}
            >
              {"Daily 20-Minute Flow"}
            </Text>
            <Text
              style={{
                color: "#BDD6EE",
                fontSize: 14,
                lineHeight: 20,
              }}
            >
              {goalSummaries[profile?.goal ?? "general-health"]}
            </Text>
          </View>
          <Orbit small />
        </View>

        {/* Session Metadata Strip */}
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 6,
              backgroundColor: "rgba(255, 255, 255, 0.1)",
              paddingHorizontal: 11,
              paddingVertical: 6,
              borderRadius: 10,
            }}
          >
            <Ionicons name="time-outline" size={14} color="#99CCFF" />
            <Text
              style={{
                color: "#E6F1FA",
                fontSize: 12,
                fontWeight: "600",
                fontVariant: ["tabular-nums"],
              }}
            >
              20:00 total
            </Text>
          </View>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 6,
              backgroundColor: "rgba(255, 255, 255, 0.1)",
              paddingHorizontal: 11,
              paddingVertical: 6,
              borderRadius: 10,
            }}
          >
            <Ionicons name="fitness-outline" size={14} color="#99CCFF" />
            <Text style={{ color: "#E6F1FA", fontSize: 12, fontWeight: "600" }}>
              {levelLabels[profile?.fitnessLevel ?? "beginner"]}
            </Text>
          </View>
          {plan.adaptations.slice(0, 2).map((tag) => (
            <View
              key={tag}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 5,
                backgroundColor: "rgba(255, 255, 255, 0.1)",
                paddingHorizontal: 11,
                paddingVertical: 6,
                borderRadius: 10,
              }}
            >
              <Ionicons name="checkmark-circle-outline" size={14} color="#99CCFF" />
              <Text style={{ color: "#E6F1FA", fontSize: 12, fontWeight: "600" }}>
                {tag}
              </Text>
            </View>
          ))}
        </View>

        {/* Primary Action Button */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Start today's 20-minute movement session"
          onPress={() => navigation.navigate("Workout")}
          style={({ pressed }) => ({
            minHeight: 52,
            backgroundColor: C.skyLight,
            paddingVertical: 14,
            paddingHorizontal: 18,
            borderRadius: 12,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            opacity: pressed ? 0.9 : 1,
            transform: [{ scale: pressed ? 0.99 : 1 }],
          })}
        >
          <Text
            style={{
              color: C.skyDark,
              fontWeight: "800",
              fontSize: 16,
              letterSpacing: -0.2,
            }}
          >
            {todayDone ? "Move again (20 min)" : "Start today’s session"}
          </Text>
          <View
            style={{
              width: 32,
              height: 32,
              borderRadius: 10,
              backgroundColor: C.skyDark,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons name="play" size={15} color="#FFFFFF" />
          </View>
        </Pressable>
      </View>

      {/* Weekly Consistency Card */}
      <View style={S.card}>
        <View style={S.row}>
          <View style={{ flex: 1, gap: 2 }}>
            <Text style={S.heading}>Weekly rhythm</Text>
            <Text style={S.small}>
              {stats.streak > 0
                ? `${stats.streak}-day streak · Consistent daily momentum`
                : "Complete a 20-minute flow to start your streak"}
            </Text>
          </View>
          <Pill tone={stats.streak > 0 ? "recovery" : "default"}>
            {`${stats.weekCount} OF 7 DAYS`}
          </Pill>
        </View>
        <WeekStrip days={stats.week} />
      </View>

      {/* Structured Routine Breakdown */}
      <View style={S.card}>
        <View style={S.row}>
          <View style={{ gap: 2 }}>
            <Text style={S.heading}>Today’s structure</Text>
            <Text style={S.small}>
              {plan.steps.length} guided intervals across 5 phases
            </Text>
          </View>
          <Pill>20:00</Pill>
        </View>

        <View style={{ gap: 2 }}>
          {blocks.map((block, i) => {
            const blockDuration = plan.steps
              .filter((s) => s.category === block)
              .reduce((n, s) => n + s.duration, 0);

            return (
              <View
                key={block}
                style={[
                  S.row,
                  {
                    paddingVertical: 10,
                    borderBottomWidth: i < blocks.length - 1 ? 1 : 0,
                    borderColor: C.line,
                  },
                ]}
              >
                <View
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 10,
                    backgroundColor: C.ice,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Ionicons
                    name={categoryIcons[block] ?? "fitness-outline"}
                    size={18}
                    color={C.sky}
                  />
                </View>
                <View style={{ flex: 1, gap: 2 }}>
                  <Text
                    style={{ color: C.ink, fontSize: 15, fontWeight: "700" }}
                  >
                    {block === "Core" ? "Strength & core" : block}
                  </Text>
                  <Text style={S.small}>{categorySummaries[block]}</Text>
                </View>
                <View
                  style={{
                    backgroundColor: C.cardSubtle,
                    paddingHorizontal: 10,
                    paddingVertical: 5,
                    borderRadius: 8,
                  }}
                >
                  <Text
                    style={{
                      color: C.inkSecondary,
                      fontSize: 12,
                      fontWeight: "700",
                      fontVariant: ["tabular-nums"],
                    }}
                  >
                    {formatTime(blockDuration)}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>

        <Button
          secondary
          title={
            expanded
              ? "Hide interval breakdown"
              : `Inspect all ${plan.steps.length} intervals`
          }
          icon={expanded ? "chevron-up" : "chevron-down"}
          onPress={() => setExpanded(!expanded)}
        />

        {expanded && (
          <View style={{ paddingTop: 4 }}>
            {plan.steps.map((step, i) => (
              <View
                key={step.id}
                style={{
                  paddingVertical: 10,
                  borderTopWidth: 1,
                  borderColor: C.line,
                  gap: 4,
                }}
              >
                <View style={S.row}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 8, flex: 1 }}>
                    <Text
                      style={{
                        color: C.muted,
                        fontSize: 12,
                        fontWeight: "700",
                        width: 24,
                        fontVariant: ["tabular-nums"],
                      }}
                    >
                      {i + 1}.
                    </Text>
                    <Text
                      style={{
                        color: step.recovery ? C.recovery : C.ink,
                        fontWeight: "700",
                        fontSize: 14,
                        flex: 1,
                      }}
                    >
                      {step.label}
                    </Text>
                  </View>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                    {step.alternative && (
                      <Text
                        style={{
                          color: C.muted,
                          fontSize: 11,
                          fontWeight: "600",
                        }}
                      >
                        Alt: {step.alternative.label}
                      </Text>
                    )}
                    <Text
                      style={{
                        color: step.recovery ? C.recovery : C.sky,
                        fontWeight: "700",
                        fontSize: 12,
                        fontVariant: ["tabular-nums"],
                      }}
                    >
                      {step.duration}s
                    </Text>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={`Watch ${step.label} tutorial on YouTube`}
                      onPress={() =>
                        void openYouTubeLink(getYouTubeUrlForExercise(step.label))
                      }
                      hitSlop={8}
                      style={{ paddingLeft: 2 }}
                    >
                      <Ionicons name="logo-youtube" size={16} color="#E02424" />
                    </Pressable>
                  </View>
                </View>
                <Text style={[S.small, { paddingLeft: 32 }]}>{step.detail}</Text>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Active Adaptations Footer Banner */}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Customize your movement adaptations in settings"
        onPress={() => navigation.navigate("Profile")}
        style={({ pressed }) => ({
          flexDirection: "row",
          gap: 12,
          padding: 16,
          borderRadius: 16,
          backgroundColor: C.ice,
          borderWidth: 1,
          borderColor: C.iceBorder,
          alignItems: "center",
          opacity: pressed ? 0.85 : 1,
        })}
      >
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: 10,
            backgroundColor: C.card,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ionicons name="options-outline" size={20} color={C.sky} />
        </View>
        <View style={{ flex: 1, gap: 2 }}>
          <Text style={{ color: C.ink, fontWeight: "700", fontSize: 14 }}>
            {plan.adaptations.length > 0
              ? `Adapted for you: ${plan.adaptations.join(" · ")}`
              : "Standard full-body routine"}
          </Text>
          <Text style={[S.small, { color: C.inkSecondary }]}>
            Pacing adjusts every 3 completed sessions and responds to your recovery feedback.
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={C.sky} />
      </Pressable>
    </Page>
  );
}
